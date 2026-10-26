"""Running result of the posting study: does the pre-registered brain score predict views, per account?

Usage (from tribe-experiment/):  .venv/bin/python study.py
Reads ../ops/ledger.csv (one row per video, scored BEFORE posting; the manager fills views_24h/views_48h at those ages).
Pre-registered test (fixed before any results): Spearman rank correlation between wc_mean_first60 and log10(views_48h)
over every video posted at the fixed slots (1 PM / 6 PM Pacific), run **separately per account** — pooling accounts is
what inflated the first result to 0.93 (account size swamped the brain score). Also reported with the account's growth
trend removed (rank of posting time partialled out), because later posts get a lift from new followers.
~20 videos per account before the number means much.
"""
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
LEDGER = HERE.parent / "ops" / "ledger.csv"


def test(done):
    v, s = np.log10(done.views_48h.astype(float) + 1), done.wc_mean_first60.astype(float)
    order = pd.to_datetime(done.slot_pt).rank()
    rho, p = stats.spearmanr(s, v)
    r = lambda a, b: stats.spearmanr(a, b)[0]  # noqa: E731
    rvs, rvo, rso = r(v, s), r(v, order), r(s, order)
    partial = (rvs - rvo * rso) / np.sqrt(max(1e-9, (1 - rvo ** 2) * (1 - rso ** 2)))
    print(f"  brain score (first 60 s) vs 48 h views: rho = {rho:+.2f} (p = {p:.3f}, n = {len(done)})")
    print(f"  same, with the growth trend removed:     rho = {partial:+.2f}")
    print(f"  views vs posting order (growth trend):   rho = {rvo:+.2f}")


def main():
    d = pd.read_csv(LEDGER)
    print(f"videos in ledger: {len(d)}")
    for account, g in d.groupby("account"):
        done = g.dropna(subset=["views_48h", "wc_mean_first60", "slot_pt"]).copy()
        print(f"{account}: {len(g)} videos · with 48 h views: {len(done)}")
        if len(done) < 4:
            print("  not enough data yet (need ≥ 4 posted videos with 48 h views; ~20 for a real answer)")
            continue
        test(done)
        print(done[["slug", "slot_pt", "wc_mean_first60", "views_48h"]].sort_values("views_48h", ascending=False)
              .to_string(index=False))


if __name__ == "__main__":
    main()
