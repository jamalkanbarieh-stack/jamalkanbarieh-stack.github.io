"""Generates the SYNTHETIC illustrative dataset for the correspondent-channel demand model.
Nothing here is real bank data: every figure is produced by the seeded random generator below.
Outputs: data.json (inlined into index.html by ../../build.py), synthetic_history.csv, survey_inputs.csv
Run:  python make_data.py
"""
import json, random, csv, math, pathlib
random.seed(20260712)
here = pathlib.Path(__file__).parent
MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
HIST = [f"{m} Y{y}" for y in (1, 2) for m in MON]          # 24 months of pre-launch activity
FCST = [f"{m} Y3" for m in MON]                           # 12-month forecast horizon
SEASON = [0.94, 0.92, 1.06, 1.00, 0.98, 1.03, 1.01, 0.90, 1.02, 1.05, 1.04, 1.05]   # generator only; the model re-estimates it
TREND = 0.006                                             # monthly organic growth in transfer counts

CPS = [  # id, synthetic profile, survey confidence rating
 ("A", "Trade payments, large tickets", .90), ("B", "Inward remittances, small tickets", .70),
 ("C", "Corporate flows, EUR-led", .70),      ("D", "Mixed commercial", .50),
 ("E", "Small, early-stage", .40),            ("F", "GBP corridor", .70),
 ("G", "Export receipts", .90),               ("H", "New relationship, high stated demand", .50)]
ROWS = [  # cp, currency, direction, hist transfers/month, hist avg ticket (USD eq.), survey transfers/month, survey avg ticket, first active hist month
 ("A","USD","Outward",60,85000,85,90000,0), ("A","USD","Inward",40,70000,60,75000,0), ("A","EUR","Outward",12,60000,20,65000,0),
 ("B","USD","Inward",260,2800,420,3000,0),  ("B","EUR","Inward",90,2200,150,2400,0),  ("B","USD","Outward",30,4000,45,4500,0),
 ("C","EUR","Outward",35,110000,55,120000,0),("C","EUR","Inward",25,95000,40,100000,0),("C","USD","Outward",15,50000,25,55000,0),
 ("D","USD","Outward",45,30000,80,35000,0), ("D","USD","Inward",50,22000,85,25000,0), ("D","GBP","Outward",6,40000,12,45000,0),
 ("E","USD","Inward",20,9000,60,12000,0),   ("E","USD","Outward",10,15000,35,20000,0),
 ("F","GBP","Inward",30,18000,45,20000,0),  ("F","GBP","Outward",14,35000,22,38000,0), ("F","USD","Inward",12,15000,18,16000,0),
 ("G","USD","Inward",28,140000,50,150000,0),("G","EUR","Inward",10,120000,16,125000,0),("G","USD","Outward",8,60000,12,60000,0),
 ("H","USD","Outward",6,45000,40,60000,12), ("H","USD","Inward",5,30000,30,40000,12)]

rows, hist_csv = [], []
for cp, cur, d, hn, ht, sn, st, start in ROWS:
    n_series, v_series = [], []
    for i in range(24):
        if i < start: n_series.append(0); v_series.append(0); continue
        mu = hn * SEASON[i % 12] * (1 + TREND) ** (i - 23)
        n = max(0, round(random.gauss(mu, math.sqrt(max(mu, 1)) * 0.9)))
        ticket = ht * math.exp(random.gauss(0, 0.08)) * (1 + 0.001 * (i - 23))
        v = round(n * ticket, -2)
        n_series.append(n); v_series.append(v)
        hist_csv.append([HIST[i], f"Counterparty {cp}", cur, d, n, round(v / n) if n else 0, int(v), "Synthetic (simulated history)"])
    rows.append({"cp": cp, "cur": cur, "dir": d, "sn": sn, "st": st, "hn": n_series, "hv": v_series})

A = {  # every assumption is illustrative
 "adoption": {"cons": [.20,.20,.30,.35,.45,.55,.60,.65,.70,.75,.80,.85], "base": [.30,.30,.40,.50,.60,.70,.75,.80,.85,.90,.95,1.0], "opt": [.35,.40,.50,.60,.70,.80,.90,.95,1.0,1.0,1.0,1.0]},
 "scen": {"cons": {"label": "Conservative", "confMult": .85, "growth": .00, "ticketMult": .95, "retention": .50},
          "base": {"label": "Base", "confMult": 1.0, "growth": .06, "ticketMult": 1.0, "retention": .60},
          "opt":  {"label": "Optimistic", "confMult": 1.10, "growth": .12, "ticketMult": 1.05, "retention": .70}},
 "feeTiers": [{"upTo": 25000, "out": .0035, "in": .0012}, {"upTo": 100000, "out": .0025, "in": .0008}, {"upTo": None, "out": .0015, "in": .0005}],
 "minFee": {"out": 20, "in": 8},
 "corrCharge": {"out": 12, "in": 5}, "clearingCharge": {"out": 8, "in": 0}, "swift": 1.0, "opsCost": 6.0,
 "fxShare": {"USD": .15, "EUR": .40, "GBP": .45}, "fxSpread": .0020,
 "wakalaRate": .0425, "agencyFee": .05, "fundingRate": .055,
 "openingBalance": 1000000, "minBalanceFloor": 500000, "coverDays": 3, "businessDays": 22, "settleLagDays": 1,
 "days": [31,28,31,30,31,30,31,31,30,31,30,31]}

data = {"meta": {"synthetic": True, "note": "All figures are simulated for illustration. No real bank, counterparty or transaction data is included."},
        "hist": HIST, "fcst": FCST, "cps": [{"id": c, "profile": p, "conf": k} for c, p, k in CPS], "rows": rows, "A": A}
(here / "data.json").write_text(json.dumps(data, separators=(",", ":")))
with open(here / "synthetic_history.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["month", "counterparty", "currency", "direction", "transfers", "avg_ticket_usd_eq", "value_usd_eq", "data_class"]); w.writerows(hist_csv)
with open(here / "survey_inputs.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["counterparty", "profile", "currency", "direction", "expected_transfers_per_month", "avg_amount_usd_eq", "steady_state_monthly_volume", "confidence_rating", "expected_demand", "data_class"])
    conf = {c: k for c, _, k in CPS}; prof = {c: p for c, p, _ in CPS}
    for cp, cur, d, hn, ht, sn, st, start in ROWS:
        w.writerow([f"Counterparty {cp}", prof[cp], cur, d, sn, st, sn * st, conf[cp], round(sn * st * conf[cp]), "Synthetic (illustrative survey input)"])
print("rows", len(rows), "hist records", len(hist_csv))
