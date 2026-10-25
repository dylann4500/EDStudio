"""Turn cached TRIBE v2 predictions (results/*.npy) into per-video metrics + figures.

Usage (from tribe-experiment/):  .venv/bin/python analyze.py
Writes results/summary.csv, results/stats.json, results/timecourses.png, results/scatter.png.

Networks are HCP-MMP1 (Glasser 2016) areas on fsaverage5, selected the same way as the repo's own ROI helper
(tribev2.utils.get_hcp_roi_indices). Predictions are already shifted 5 s for hemodynamic lag, one row per second (TR = 1 s).
"""
import json
from itertools import combinations
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
RES = HERE / "results"
N5 = 10242  # fsaverage5 vertices per hemisphere (= the first 10242 fsaverage vertices)


def get_hcp_roi_indices(rois, hemi="both"):
    """Same result as tribev2.utils.get_hcp_roi_indices, read straight from the HCP-MMP1 .annot files
    (atlas/, fetched with mne.datasets.fetch_hcp_mmp_parcellation) instead of the 1.6 GB MNE sample dataset."""
    import nibabel as nib

    out = []
    for h, off in (("lh", 0), ("rh", N5)):
        if hemi == ("right" if h == "lh" else "left"):
            continue
        lab, _, names = nib.freesurfer.read_annot(HERE / f"atlas/fsaverage/label/{h}.HCPMMP1.annot")
        names = [n.decode()[2:].replace("_ROI", "") for n in names]
        for roi in rois:
            ids = [i for i, n in enumerate(names) if n == roi]
            if not ids:
                raise ValueError(f"ROI {roi} not found in HCP labels")
            v = np.flatnonzero(np.isin(lab, ids))
            out.append(v[v < N5] + off)
    return np.concatenate(out)

NETWORKS = {
    "visual": (["V1", "V2", "V3", "V4", "V3A", "V3B", "V3CD", "V6", "V6A", "V7", "V8", "LO1", "LO2", "LO3",
                "PIT", "FFC", "VVC", "VMV1", "VMV2", "VMV3"], "both"),
    "motion": (["MT", "MST", "FST", "V4t"], "both"),  # MT+ complex
    "auditory": (["A1", "LBelt", "MBelt", "PBelt", "RI", "A4", "A5"], "both"),
    "language": (["44", "45", "47l", "55b", "IFJa", "SFL", "PSL", "STSdp", "STSda", "STSvp", "STSva", "TPOJ1",
                  "STGa"], "left"),  # left-lateralized
    "dmn": (["PCV", "7m", "31pd", "31pv", "31a", "d23ab", "v23ab", "RSC", "10r", "10v", "10d", "9m", "p32",
             "a24", "d32", "s32", "PGi", "PGs", "TE1a"], "both"),
}
HOOK_S = 3  # seconds 0-3


def load():
    out = {}
    for f in sorted(RES.glob("*.npy")):
        if f.stem.startswith("clip"):
            continue
        out[f.stem] = np.load(f)
    return out


def main():
    preds = load()
    masks = {k: get_hcp_roi_indices(rois, hemi=h) for k, (rois, h) in NETWORKS.items()}
    pooled = np.concatenate([p.ravel() for p in preds.values()])
    THRESH = float(np.percentile(pooled, 90))  # one fixed threshold for every video
    wc_all = np.concatenate([p.mean(1) for p in preds.values()])
    WC_MED = float(np.median(wc_all))  # pooled reference for the fixed-reference sustain metric

    rows = []
    for slug, p in preds.items():
        wc = p.mean(1)  # whole-cortex mean per second
        n = len(wc)
        third = max(1, n // 3)
        r = {
            "slug": slug, "seconds": n,
            "wc_mean": wc.mean(), "wc_auc": wc.sum(), "wc_abs_mean": np.abs(p).mean(),
            "wc_mean_first60": wc[:60].mean(),  # same window for every video (biographies run 109-119 s)
            "pct_above_thresh": 100 * (p > THRESH).mean(),
            "hook_mean": wc[:HOOK_S].mean(), "rest_mean": wc[HOOK_S:].mean(),
            "sustain_own_median": 100 * (wc > np.median(wc)).mean(),
            "sustain_pooled_median": 100 * (wc > WC_MED).mean(),
            "late_minus_early": wc[-third:].mean() - wc[:third].mean(),
        }
        r["hook_minus_rest"] = r["hook_mean"] - r["rest_mean"]
        for k, idx in masks.items():
            ts = p[:, idx].mean(1)
            r[f"{k}_mean"], r[f"{k}_peak"] = ts.mean(), ts.max()
        rows.append(r)
    df = pd.DataFrame(rows)

    # one row per video: its ORIGINAL upload. Later copies of the same file on other accounts always ranked in upload
    # order (TikTok holds back re-uploads), so they measure the duplicate penalty, not the video.
    perf = pd.read_csv(HERE / "perf.csv")
    orig = perf[perf.first_upload == 1].set_index("slug")
    df["views"] = df.slug.map(orig.views)
    df["account"] = df.slug.map(orig.account)
    df["posted_utc"] = df.slug.map(orig.posted_utc)
    df["views_main_acct"] = df.views.where(df.account == "@ed._.studios")
    df = df.sort_values("views", ascending=False)
    df.to_csv(RES / "summary.csv", index=False, float_format="%.5g")

    metrics = ["wc_mean", "wc_mean_first60", "wc_auc", "wc_abs_mean", "pct_above_thresh", "hook_minus_rest", "sustain_pooled_median",
               "late_minus_early"] + [f"{k}_{s}" for k in NETWORKS for s in ("mean", "peak")]
    out = {"threshold_p90": THRESH, "wc_pooled_median": WC_MED, "n_videos": len(df), "spearman_all": {},
           "spearman_main_acct": {}, "top3_vs_bottom3": {}}
    main = df.dropna(subset=["views_main_acct"])
    top, bot = df.head(3), df.tail(3)
    for m in metrics:
        rho, pv = stats.spearmanr(np.log10(df.views), df[m])
        out["spearman_all"][m] = {"rho": round(float(rho), 3), "p": round(float(pv), 3)}
        rho, pv = stats.spearmanr(np.log10(main.views_main_acct), main[m])
        out["spearman_main_acct"][m] = {"rho": round(float(rho), 3), "p": round(float(pv), 3), "n": len(main)}
        # exact permutation test: every way to pick 3 "top" from the 6 videos in the two groups
        six = pd.concat([top, bot])[m].to_numpy()
        obs = six[:3].mean() - six[3:].mean()
        diffs = [six[list(c)].mean() - np.delete(six, list(c)).mean() for c in combinations(range(6), 3)]
        p_perm = float(np.mean(np.abs(diffs) >= abs(obs) - 1e-12))
        out["top3_vs_bottom3"][m] = {"top3": float(six[:3].mean()), "bottom3": float(six[3:].mean()),
                                     "p_perm": round(p_perm, 3)}
    out["top3"], out["bottom3"] = list(top.slug), list(bot.slug)
    # posting order: earlier posts had more hours to collect views, and on the main account they came first
    order = df.posted_utc.rank()
    out["posting_order"] = {
        "views_vs_order_all": round(float(stats.spearmanr(order, df.views)[0]), 3),
        "wc_mean_vs_order_all": round(float(stats.spearmanr(order, df.wc_mean)[0]), 3),
        "views_vs_order_main": round(float(stats.spearmanr(main.posted_utc.rank(), main.views)[0]), 3),
        "wc_mean_vs_order_main": round(float(stats.spearmanr(main.posted_utc.rank(), main.wc_mean)[0]), 3),
    }
    # brain score vs views with posting order partialled out (rank-based partial correlation)
    r = lambda a, b: stats.spearmanr(a, b)[0]  # noqa: E731
    for name, d in (("all", df), ("main", main)):
        o, v, w = d.posted_utc.rank(), np.log10(d.views), d.wc_mean
        rvw, rvo, rwo = r(v, w), r(v, o), r(w, o)
        out["posting_order"][f"wc_mean_vs_views_partial_{name}"] = round(
            float((rvw - rvo * rwo) / np.sqrt((1 - rvo ** 2) * (1 - rwo ** 2))), 3)
    # confound check: does the predicted response just track low-level motion / brightness / loudness?
    ll_path = RES / "lowlevel.csv"
    if ll_path.exists():
        ll = df.merge(pd.read_csv(ll_path), on="slug")
        lows = ["motion_energy", "cuts_per_min", "brightness", "audio_rms_db", "audio_dynamics_db"]
        out["confounds"] = {
            m: {lo: round(float(stats.spearmanr(ll[m], ll[lo])[0]), 3) for lo in lows}
            for m in ["wc_mean", "visual_mean", "motion_mean", "auditory_mean", "hook_minus_rest"]}
        out["lowlevel_vs_views"] = {lo: round(float(stats.spearmanr(np.log10(ll.views), ll[lo])[0]), 3)
                                    for lo in lows}
    ts_path = RES / "lowlevel_ts.npz"
    if ts_path.exists():
        # within-video: does the second-by-second response follow brightness / motion / loudness of that second?
        ts = np.load(ts_path)
        within = {name: [] for name in ("brightness", "motion", "loudness")}
        for slug, p in preds.items():
            wc = p.mean(1)
            for k, name in enumerate(within):
                x = ts[slug][k]
                n = min(len(x), len(wc))
                within[name].append(stats.spearmanr(wc[:n], x[:n])[0])
        out["within_video_rho"] = {k: {"median": round(float(np.median(v)), 3), "min": round(float(np.min(v)), 3),
                                       "max": round(float(np.max(v)), 3)} for k, v in within.items()}
    # reliability: do videos rank the same on the first half and the second half of their own timecourse?
    h1 = [p.mean(1)[: len(p) // 2].mean() for p in preds.values()]
    h2 = [p.mean(1)[len(p) // 2:].mean() for p in preds.values()]
    out["split_half_rho_wc_mean"] = round(float(stats.spearmanr(h1, h2)[0]), 3)
    # how much of the views link survives without the two outliers (lowest whole-cortex means)?
    rest = df.nsmallest(len(df), "wc_mean").iloc[2:]
    out["spearman_wc_mean_without_2_lowest"] = round(float(stats.spearmanr(np.log10(rest.views), rest.wc_mean)[0]), 3)
    (RES / "stats.json").write_text(json.dumps(out, indent=1))
    plots(preds, df, masks)
    brain_maps(preds, list(top.slug), list(bot.slug))
    print(df[["slug", "views", "wc_mean", "pct_above_thresh", "hook_minus_rest", "sustain_pooled_median"]]
          .to_string(index=False))
    print(f"threshold(p90)={THRESH:.4f}")


def plots(preds, df, masks):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    order = list(df.slug)
    cmap = plt.get_cmap("viridis")
    fig, axes = plt.subplots(3, 1, figsize=(11, 10), sharex=True)
    for i, slug in enumerate(order):
        p = preds[slug]
        c = cmap(i / max(1, len(order) - 1))
        lab = f"{slug} ({int(df.set_index('slug').views[slug]):,} views)"
        axes[0].plot(p.mean(1), color=c, lw=1.6, label=lab)
        axes[1].plot(p[:, masks["visual"]].mean(1), color=c, lw=1.2)
        axes[2].plot(p[:, masks["auditory"]].mean(1), color=c, lw=1.2)
    for ax, t in zip(axes, ["Whole cortex", "Visual network", "Auditory network"]):
        ax.set_title(t, loc="left", fontsize=11)
        ax.axvspan(0, HOOK_S, color="0.9", zorder=0)
        ax.grid(alpha=0.25)
    axes[0].legend(fontsize=8, ncol=2, frameon=False)
    axes[2].set_xlabel("seconds (lag-corrected)")
    fig.tight_layout()
    fig.savefig(RES / "timecourses.png", dpi=120)

    fig, axes = plt.subplots(1, 3, figsize=(13, 4))
    for ax, m in zip(axes, ["wc_mean", "hook_minus_rest", "sustain_pooled_median"]):
        ax.scatter(df.views, df[m], color="#3b6ea5")
        for _, r in df.iterrows():
            ax.annotate(r.slug.split("-", 1)[0], (r.views, r[m]), fontsize=8, xytext=(3, 3),
                        textcoords="offset points")
        ax.set_xscale("log")
        ax.set_xlabel("views (original upload)")
        ax.set_title(m, fontsize=10)
        ax.grid(alpha=0.25)
    fig.tight_layout()
    fig.savefig(RES / "scatter.png", dpi=120)


def brain_maps(preds, top, bot):
    """Mean predicted map over all videos, and top-3 minus bottom-3, on the fsaverage5 surface (nilearn bundles it)."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from nilearn import datasets, plotting

    fs = datasets.fetch_surf_fsaverage("fsaverage5")
    mean = {s: p.mean(0) for s, p in preds.items()}
    maps = {"Mean predicted response, all videos": np.mean(list(mean.values()), 0),
            "Top 3 minus bottom 3 (by views)": np.mean([mean[s] for s in top], 0) - np.mean([mean[s] for s in bot], 0)}
    views = [("left", "lateral"), ("right", "lateral"), ("left", "medial"), ("right", "medial")]
    fig, axes = plt.subplots(2, 4, figsize=(14, 6.4), subplot_kw={"projection": "3d"})
    for r, (title, m) in enumerate(maps.items()):
        vmax = float(np.percentile(np.abs(m), 99))
        for c, (hemi, view) in enumerate(views):
            data = m[:N5] if hemi == "left" else m[N5:]
            plotting.plot_surf_stat_map(fs[f"infl_{hemi}"], data, hemi=hemi, view=view, bg_map=fs[f"sulc_{hemi}"],
                                        axes=axes[r, c], colorbar=c == 3, vmax=vmax, cmap="cold_hot",
                                        engine="matplotlib")
        axes[r, 0].set_title(title, loc="left", fontsize=11)
    fig.savefig(RES / "brain_maps.png", dpi=110, bbox_inches="tight")


if __name__ == "__main__":
    main()
