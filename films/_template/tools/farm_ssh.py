#!/usr/bin/env python3
"""Render the film on ANY GPU machines you can reach by SSH: AWS, Azure, Google Cloud, RunPod, Lambda, Vast, a spare PC.

    python3 tools/farm_ssh.py check                     can every machine be reached? its GPU, its Blender, its disk
    python3 tools/farm_ssh.py setup                     install Blender 5.2.1 (and the libraries it needs) on every machine
    python3 tools/farm_ssh.py render <tag> [--sets a,b] [--shots S01,S02] [--pct 100] [--samples 0] [--chunk 8] [--redo]
    python3 tools/farm_ssh.py cost                      machine time and money this film has used on the SSH farm

The machines are listed in farm_hosts.json in the film's folder (NOT in git: it holds addresses and key paths). Copy
farm_hosts.example.json and fill it in:

    {"hosts": [{"name": "aws-1", "ssh": "ubuntu@203.0.113.10", "key": "~/.ssh/film.pem", "rate": 1.01},
               {"name": "pc",    "ssh": "me@192.168.1.20"}],
     "budget": {"max_cost": 40, "max_hours": 30},
     "after": "aws ec2 stop-instances --instance-ids i-0abc i-0def"}

  name   any label; ssh: user@address (port: 22 by default; key: a private key file, or leave it out to use your
         ssh agent / ~/.ssh/config); rate: what the machine costs an hour, in dollars (from your provider's price
         page; 0 for your own machines); blender: a Blender 5.2 already installed there (default: the one setup puts
         in the work folder); workdir: where the film's files go on it (default ~/film-render/<film>).
  {"name": "here", "local": true} renders on THIS computer through the same machinery (for a test, or a Linux
         workstation you are sitting at).

How it works: every machine gets the film's code and built sets (rsync: only what changed), then takes chunks of
frames from one shared queue (a fast machine simply takes more), renders them with Blender, and sends the frames back
into frames/<tag>/<set>/ (the same place and names as the Modal farm and the local renderer, so tools/finish.py and
post/compose.py take them as they are). Frames already here are skipped, so a run that stopped is simply run again.
A chunk that fails goes back in the queue; a machine that fails three times running is left out.

The budget: the SSH farm cannot see your provider's bill, so it counts machine time instead. Every machine costs its
`rate` for as long as this run is using it; the film's total (out/farm_ssh_ledger.json) may not pass budget.max_cost
dollars or budget.max_hours machine-hours: no new chunk is started that would. YOUR MACHINES KEEP COSTING MONEY WHILE
THEY ARE ON, rendering or not: put the command that stops them in "after" (it runs when the render ends), or stop
them in your provider's console. Needs ssh and rsync here and on the machines (setup installs rsync there).
"""
import json
import os
import queue
import shlex
import subprocess
import sys
import threading
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import timeline as tl  # noqa: E402

FILM = os.path.basename(ROOT)
BLENDER_VERSION = "5.2.1"
BLENDER_DIR = "blender-%s-linux-x64" % BLENDER_VERSION
BLENDER_URL = "https://download.blender.org/release/Blender5.2/%s.tar.xz" % BLENDER_DIR
HOSTS_FILE = os.path.join(ROOT, "farm_hosts.json")
LEDGER = os.path.join(ROOT, "out", "farm_ssh_ledger.json")
CODE = ["./timeline.py", "./blender", "./tools/render_blend.py"]          # what a machine needs besides the built sets
LOCAL_BLENDER = os.environ.get("BLENDER", "/Applications/Blender.app/Contents/MacOS/Blender")
PRINT = threading.Lock()


def opt(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def say(*a):
    with PRINT:
        print(time.strftime("%H:%M:%S"), *a, flush=True)


class Host:
    def __init__(self, h):
        self.name = h["name"]
        self.local = bool(h.get("local"))
        self.ssh, self.key, self.port = h.get("ssh"), h.get("key"), int(h.get("port", 22))
        self.rate = float(h.get("rate", 0.0))
        if self.local:
            self.workdir = os.path.abspath(os.path.expanduser(h.get("workdir") or os.path.join(ROOT, "out", "farm_local", self.name)))
            self.blender = h.get("blender") or LOCAL_BLENDER
        else:
            if not self.ssh:
                sys.exit("host %s: no \"ssh\" (user@address)" % self.name)
            self.workdir = h.get("workdir") or "film-render/%s" % FILM          # relative to the remote user's home
            self.blender = h.get("blender") or "./%s/blender" % BLENDER_DIR     # (every command runs inside the workdir)
        self.t0 = self.t1 = None
        self.frames = 0
        self.seconds = 0.0
        self.fails = 0

    # ── transport ──
    def ssh_opts(self):
        o = ["-o", "BatchMode=yes", "-o", "ConnectTimeout=20", "-o", "ServerAliveInterval=30", "-o", "StrictHostKeyChecking=accept-new", "-p", str(self.port)]
        return o + (["-i", os.path.expanduser(self.key)] if self.key else [])

    def popen(self, cmd):
        """Run a shell command on the machine; its output (stdout + stderr) is streamed back."""
        argv = ["bash", "-lc", cmd] if self.local else ["ssh"] + self.ssh_opts() + [self.ssh, "bash -lc %s" % shlex.quote(cmd)]
        return subprocess.Popen(argv, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)

    def run(self, cmd, timeout=None):
        p = self.popen(cmd)
        try:
            out, _ = p.communicate(timeout=timeout)
        except subprocess.TimeoutExpired:
            p.kill()
            return 124, "timed out"
        return p.returncode, out

    def rsync(self, args):
        cmd = ["rsync", "-az", "--exclude", "__pycache__", "--exclude", "*.blend1"]
        if not self.local:
            cmd += ["-e", " ".join(["ssh"] + [shlex.quote(x) for x in self.ssh_opts()])]
        return subprocess.run(cmd + args, cwd=ROOT, capture_output=True, text=True)

    def remote(self, path):
        return path if self.local else "%s:%s" % (self.ssh, path)

    def upload(self, sets):
        """The film's code and the built sets this run needs (rsync sends only what changed)."""
        rc, out = self.run("mkdir -p %s" % shlex.quote(self.workdir), timeout=60)
        if rc != 0:
            return "cannot reach it (%s)" % out.strip()[-200:]
        missing = [s for s in sets if not os.path.exists(os.path.join(ROOT, "build", s, s + ".blend"))]
        if missing:
            sys.exit("not built: %s (python3 tools/film.py build <set>)" % ", ".join(missing))
        r = self.rsync(["--relative"] + CODE + ["./build/%s" % s for s in sets] + [self.remote(self.workdir + "/")])
        return None if r.returncode == 0 else "upload failed: " + (r.stderr or r.stdout).strip()[-300:]

    def fetch(self, tag, set_name):
        dest = os.path.join(ROOT, "frames", tag, set_name)
        os.makedirs(dest, exist_ok=True)
        r = self.rsync(["--ignore-existing", self.remote("%s/frames/%s/%s/" % (self.workdir, tag, set_name)), dest + "/"])
        return r.returncode == 0

    def render(self, tag, set_name, frames, pct, samples, on_frame):
        """Render a chunk; on_frame(seconds) is called for every frame it finishes. -> True when every frame came back."""
        out = "frames/%s/%s" % (tag, set_name)
        cmd = "cd %s && mkdir -p %s && %s -b build/%s/%s.blend -P tools/render_blend.py -- --frames %s --out %s --pct %d%s" % (
            shlex.quote(self.workdir), out, shlex.quote(self.blender), set_name, set_name, ",".join(map(str, frames)), out, pct,
            " --samples %d" % samples if samples else "")
        p = self.popen(cmd)
        got, tail = 0, []
        for line in p.stdout:
            tail = (tail + [line.rstrip()])[-12:]
            if line.startswith("FRAME "):
                parts = line.split()
                got += 1
                on_frame(float(parts[-1].rstrip("s")) if parts[-1].endswith("s") else 0.0)
            elif line.startswith("RENDER device"):
                self.device = line.split()[2]
        p.wait()
        if p.returncode != 0 or got < len(frames):
            say("  %s: chunk of %d frames failed (exit %s): %s" % (self.name, len(frames), p.returncode, " | ".join(tail[-4:])))
            return False
        return self.fetch(tag, set_name)


def load():
    if not os.path.exists(HOSTS_FILE):
        sys.exit("no farm_hosts.json in %s: copy farm_hosts.example.json and list your machines (see the top of this file)" % ROOT)
    cfg = json.load(open(HOSTS_FILE))
    hosts = [Host(h) for h in cfg.get("hosts", [])]
    if not hosts:
        sys.exit("farm_hosts.json lists no hosts")
    return cfg, hosts


def ledger():
    try:
        return json.load(open(LEDGER))
    except Exception:
        return {"runs": []}


def spent(led):
    return sum(r.get("cost", 0.0) for r in led["runs"]), sum(r.get("hours", 0.0) for r in led["runs"])


def each(hosts, fn):
    """fn(host) on every machine at once."""
    th = [threading.Thread(target=fn, args=(h,)) for h in hosts]
    for t in th:
        t.start()
    for t in th:
        t.join()


def check(hosts):
    def one(h):
        rc, out = h.run("mkdir -p %s && cd %s && { nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>/dev/null || echo 'no NVIDIA GPU (nvidia-smi missing)'; }; "
                        "if [ -x %s ]; then %s --version 2>/dev/null | head -1; else echo 'Blender: not installed (run setup)'; fi; "
                        "df -h . | tail -1 | awk '{print \"disk free: \" $4}'; command -v rsync >/dev/null || echo 'rsync: missing (run setup)'"
                        % (shlex.quote(h.workdir), shlex.quote(h.workdir), shlex.quote(h.blender), shlex.quote(h.blender)), timeout=60)
        say("%-14s %s" % (h.name, "UNREACHABLE: " + out.strip()[-200:] if rc != 0 and not out.strip() else " | ".join(l for l in out.strip().splitlines() if l)))
    each(hosts, one)


def setup(hosts):
    def one(h):
        if h.local:
            say("%-14s local: uses %s" % (h.name, h.blender))
            return
        script = """set -e
mkdir -p {wd} && cd {wd}
if command -v apt-get >/dev/null 2>&1; then
  sudo -n apt-get update -qq >/dev/null 2>&1 && sudo -n env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \\
    libxi6 libxkbcommon0 libgl1 libegl1 libsm6 libxrender1 libxfixes3 libxxf86vm1 xz-utils rsync wget >/dev/null 2>&1 \\
    || echo "WARN could not install libraries with sudo: install libxi6 libxkbcommon0 libgl1 libegl1 libsm6 xz-utils rsync yourself"
elif command -v dnf >/dev/null 2>&1; then
  sudo -n dnf install -y -q libXi libxkbcommon mesa-libGL mesa-libEGL libSM xz rsync wget >/dev/null 2>&1 || echo "WARN could not install libraries with sudo"
fi
if [ ! -x {bd}/blender ]; then
  (wget -q {url} -O blender.tar.xz || curl -fsSL {url} -o blender.tar.xz) && tar -xf blender.tar.xz && rm -f blender.tar.xz
fi
{bd}/blender -b --factory-startup --python-expr "import bpy; p = bpy.context.preferences.addons['cycles'].preferences
for b in ('OPTIX', 'CUDA', 'HIP'):
    try:
        p.compute_device_type = b; p.refresh_devices()
    except Exception:
        continue
    g = [d.name for d in p.devices if d.type == b]
    if g:
        print('GPU', b, g); break
else:
    print('GPU none: Blender will render on the CPU (very slow)')" 2>/dev/null | grep '^GPU'
""".format(wd=shlex.quote(h.workdir), bd=BLENDER_DIR, url=BLENDER_URL)
        rc, out = h.run(script, timeout=1800)
        say("%-14s %s" % (h.name, ("ready: " if rc == 0 else "FAILED: ") + " | ".join(l for l in out.strip().splitlines()[-4:] if l)))
    each(hosts, one)


def render(cfg, hosts):
    tag = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("--") else sys.exit("render <tag>")
    sets = opt("--sets")
    sets = sets.split(",") if sets else list(tl.SETS)
    shots = opt("--shots")
    shots = set(shots.split(",")) if shots else None
    pct, samples, size = int(opt("--pct", "100")), int(opt("--samples", "0")), int(opt("--chunk", "8"))
    redo = "--redo" in sys.argv
    budget = cfg.get("budget", {})
    max_cost, max_hours = float(budget.get("max_cost", 1e9)), float(budget.get("max_hours", 1e9))
    led = ledger()
    cost0, hours0 = spent(led)
    # the work: chunks of one set's frames (only the frames the edit shows, minus those already here)
    q, total = queue.Queue(), 0
    for s in sets:
        fr = [tl.bframe(sid, i) for sid in tl.shots_of(s) if not shots or sid in shots for i in tl.cut(sid)]
        if not redo:
            fr = [f for f in fr if not os.path.exists(os.path.join(ROOT, "frames", tag, s, "%06d.jpg" % f))]
        for a in range(0, len(fr), size):
            q.put((s, fr[a:a + size], 0))
        total += len(fr)
    if not total:
        say("nothing to render: every frame of tag '%s' is already in frames/%s/" % (tag, tag))
        return 0
    say("%d frames in %d chunks on %d machines; this film has used $%.2f / %.1f machine-hours of its budget ($%s / %s h)"
        % (total, q.qsize(), len(hosts), cost0, hours0, budget.get("max_cost", "none"), budget.get("max_hours", "none")))
    state = dict(done=0, stopped=False)
    lock = threading.Lock()

    def running_cost():
        now = time.time()
        c = h_ = 0.0
        for h in hosts:
            if h.t0:
                dt = ((h.t1 or now) - h.t0) / 3600.0
                c += dt * h.rate
                h_ += dt
        return c, h_

    def worker(h):
        h.t0 = time.time()
        err = h.upload(sets)
        if err:
            say("  %s: %s (left out)" % (h.name, err))
            h.t1 = time.time()
            return
        say("  %s: ready" % h.name)
        while True:
            try:
                s, frames, tries = q.get_nowait()
            except queue.Empty:
                break
            with lock:
                c, hr = running_cost()
                # the next chunk's cost, from the speed measured so far (the first chunk only checks what is already spent)
                per = (sum(x.seconds for x in hosts) / sum(x.frames for x in hosts)) if any(x.frames for x in hosts) else 0.0
                nxt = len(frames) * per / 3600.0
                if cost0 + c + nxt * h.rate > max_cost or hours0 + hr + nxt > max_hours:
                    state["stopped"] = True
                    q.put((s, frames, tries))
                    say("  %s: STOPPED by the budget (the film's total would pass $%.2f or %.1f machine-hours)" % (h.name, max_cost, max_hours))
                    break

            def on_frame(sec):
                with lock:
                    h.frames += 1
                    h.seconds += sec
                    state["done"] += 1

            t = time.time()
            ok = h.render(tag, s, frames, pct, samples, on_frame)
            if ok:
                h.fails = 0
                c, hr = running_cost()
                say("[%4d/%d] %-10s %-6s +%d frames  %.1f s/frame  (this run: %.2f machine-hours, $%.2f)" % (
                    state["done"], total, h.name, s, len(frames), (time.time() - t) / len(frames), hr, c))
            else:
                h.fails += 1
                if tries < 2:
                    q.put((s, frames, tries + 1))
                else:
                    say("  GAVE UP on %s frames %d-%d after 3 tries" % (s, frames[0], frames[-1]))
                if h.fails >= 3:
                    say("  %s: failed 3 times running: left out" % h.name)
                    break
        h.t1 = time.time()

    t_start = time.time()
    each(hosts, worker)
    c, hr = running_cost()
    led["runs"].append(dict(tag=tag, when=time.strftime("%Y-%m-%d %H:%M"), frames=state["done"], hours=round(hr, 3), cost=round(c, 2),
                            hosts={h.name: dict(frames=h.frames, hours=round(((h.t1 or time.time()) - (h.t0 or time.time())) / 3600, 3)) for h in hosts}))
    os.makedirs(os.path.dirname(LEDGER), exist_ok=True)
    json.dump(led, open(LEDGER, "w"), indent=1)
    left = sum(len(f) for _, f, _ in list(q.queue))
    say("FARM DONE: %d frames rendered in %.1f min, %.2f machine-hours, about $%.2f (film total $%.2f)%s" % (
        state["done"], (time.time() - t_start) / 60, hr, c, cost0 + c, ("; %d frames NOT rendered" % left) if left else ""))
    if cfg.get("after"):
        say("after: %s" % cfg["after"])
        r = subprocess.run(cfg["after"], shell=True, cwd=ROOT, capture_output=True, text=True)
        say("  exit %d %s" % (r.returncode, (r.stdout + r.stderr).strip()[-300:]))
    elif any(not h.local and h.rate > 0 for h in hosts):
        say("REMEMBER: your machines are still on and still cost money. Stop them in your provider's console (or set \"after\").")
    if state["stopped"]:
        say("STOPPED BY THE BUDGET: raise budget.max_cost / max_hours in farm_hosts.json to go on (frames already here are kept)")
    return 0 if not left else 1


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "cost":
        led = ledger()
        for r in led["runs"]:
            print("%s  %-8s %5d frames  %6.2f machine-hours  $%.2f" % (r["when"], r["tag"], r["frames"], r["hours"], r["cost"]))
        c, h = spent(led)
        print("film total: %.2f machine-hours, $%.2f" % (h, c))
        return 0
    cfg, hosts = load()
    if cmd == "check":
        check(hosts)
    elif cmd == "setup":
        setup(hosts)
    elif cmd == "render":
        return render(cfg, hosts)
    else:
        sys.exit(__doc__)
    return 0


sys.exit(main())
