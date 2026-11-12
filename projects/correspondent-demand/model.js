/* Correspondent-channel demand & financial model: pure calculation logic (no DOM).
   Flow: historical activity -> demand estimation -> utilisation forecast -> balance projection
         -> revenue estimation -> net financial contribution.
   Used by index.html; can also be run in Node for testing. All inputs are synthetic. */
(function (g) {
  const sum = a => a.reduce((t, x) => t + x, 0);

  /* Seasonal indices from history: ratio of each month to a log-linear trend, averaged by calendar month, normalised to 1. */
  function seasonality(data) {
    const tot = data.hist.map((_, i) => sum(data.rows.map(r => r.hv[i])));
    const n = tot.length, xs = tot.map((_, i) => i), ly = tot.map(Math.log);
    const mx = sum(xs) / n, my = sum(ly) / n;
    const b = sum(xs.map((x, i) => (x - mx) * (ly[i] - my))) / sum(xs.map(x => (x - mx) ** 2)), a = my - b * mx;
    const ratio = tot.map((v, i) => v / Math.exp(a + b * i)), idx = Array(12).fill(0), cnt = Array(12).fill(0);
    ratio.forEach((r, i) => { idx[i % 12] += r; cnt[i % 12]++; });
    const raw = idx.map((v, i) => v / cnt[i]), m = sum(raw) / 12;
    return { index: raw.map(v => v / m), trendMonthly: Math.exp(b) - 1 };
  }

  function feeRate(A, ticket, dir) { const t = A.feeTiers.find(x => x.upTo == null || ticket < x.upTo); return dir === "Outward" ? t.out : t.in; }

  /* o: {scenario, confMult, growth, ticketMult, retention, wakalaRate, adoptShift, cps:Set|null, cur:string|null,
         seasonal:boolean, k:{fee,charge,ops,fx,adopt,ticket,conf}} (k = sensitivity multipliers, default 1) */
  function run(data, o) {
    const A = data.A, S = A.scen[o.scenario], k = Object.assign({ fee: 1, charge: 1, ops: 1, fx: 1, adopt: 1, ticket: 1, conf: 1, wakala: 1, retention: 1 }, o.k || {});
    const confMult = (o.confMult ?? S.confMult) * k.conf, growth = o.growth ?? S.growth, ticketMult = (o.ticketMult ?? S.ticketMult) * k.ticket;
    const retention = Math.min(1, (o.retention ?? S.retention) * k.retention), wak = (o.wakalaRate ?? A.wakalaRate) * k.wakala;
    const season = o.seasonal === false ? Array(12).fill(1) : seasonality(data).index;
    const conf = Object.fromEntries(data.cps.map(c => [c.id, Math.min(1, c.conf * confMult)]));
    const all = data.rows, rows = all.filter(r => (!o.cps || o.cps.has(r.cp)) && (!o.cur || r.cur === o.cur));
    const exp = r => r.sn * r.st * ticketMult * conf[r.cp];                       // confidence-weighted steady-state monthly demand
    const share = sum(all.map(exp)) ? sum(rows.map(exp)) / sum(all.map(exp)) : 0; // scales channel-level balances to the filtered subset
    const adopt = A.adoption[o.scenario].map(a => Math.min(1, a * k.adopt));
    const months = []; let open = A.openingBalance * share, cum = 0;
    for (let t = 0; t < 12; t++) {
      const f = adopt[t] * season[t] * Math.pow(1 + growth, (t + 1) / 12), M = { t, label: data.fcst[t], adopt: adopt[t], season: season[t], rows: [] };
      const z = () => ({ vol: 0, n: 0, inV: 0, outV: 0, inN: 0, outN: 0, feeOut: 0, feeIn: 0, fx: 0, corr: 0, clearing: 0, swift: 0, ops: 0 });
      Object.assign(M, z()); M.byCp = {}; M.byCur = {};
      for (const r of rows) {
        const ticket = r.st * ticketMult, n = r.sn * conf[r.cp] * f, vol = n * ticket, out = r.dir === "Outward";
        const feePer = Math.max(out ? A.minFee.out : A.minFee.in, feeRate(A, ticket, r.dir) * ticket) * k.fee;
        const x = { vol, n, inV: out ? 0 : vol, outV: out ? vol : 0, inN: out ? 0 : n, outN: out ? n : 0,
          feeOut: out ? feePer * n : 0, feeIn: out ? 0 : feePer * n, fx: vol * A.fxShare[r.cur] * A.fxSpread * k.fx,
          corr: n * (out ? A.corrCharge.out : A.corrCharge.in) * k.charge, clearing: n * (out ? A.clearingCharge.out : A.clearingCharge.in) * k.charge,
          swift: n * A.swift * k.charge, ops: n * A.opsCost * k.ops };
        for (const key in x) { M[key] += x[key]; (M.byCp[r.cp] ||= z())[key] += x[key]; (M.byCur[r.cur] ||= z())[key] += x[key]; }
        M.rows.push(Object.assign({ cp: r.cp, cur: r.cur, dir: r.dir, ticket }, x));
      }
      M.grossFee = M.feeOut + M.feeIn; M.charges = M.corr + M.clearing + M.swift;
      M.netFee = M.grossFee + M.fx - M.charges - M.ops;
      // balance sheet: nostro with the correspondent
      const net = M.inV - M.outV; M.open = open; M.netFlow = net;
      M.close = Math.max(0, open + (net > 0 ? net * retention : net));
      M.float = M.inV * A.settleLagDays / A.days[t];
      M.avgBal = Math.max(0, (M.open + M.close) / 2 - M.float);
      M.minBal = Math.max(A.minBalanceFloor * share, A.coverDays * M.outV / A.businessDays);
      M.surplus = Math.max(0, M.avgBal - M.minBal); M.fundReq = Math.max(0, M.minBal - M.avgBal);
      M.invIncome = M.surplus * wak * A.days[t] / 365; M.agency = M.invIncome * A.agencyFee; M.netInv = M.invIncome - M.agency;
      M.fundCost = M.fundReq * A.fundingRate * A.days[t] / 365; M.carry = M.netInv - M.fundCost;
      M.net = M.netFee + M.carry; cum += M.net; M.cumNet = cum; open = M.close; months.push(M);
    }
    const T = {}; for (const key of ["vol", "n", "inV", "outV", "inN", "outN", "feeOut", "feeIn", "fx", "corr", "clearing", "swift", "ops", "grossFee", "charges", "netFee", "invIncome", "agency", "netInv", "fundCost", "carry", "net"]) T[key] = sum(months.map(m => m[key]));
    T.avgSurplus = sum(months.map(m => m.surplus)) / 12; T.avgBal = sum(months.map(m => m.avgBal)) / 12; T.peakBal = Math.max(...months.map(m => m.avgBal));
    T.ros = T.avgSurplus > 0 ? T.net / T.avgSurplus : null; T.breakeven = months.findIndex(m => m.cumNet > 0);
    T.steady = sum(rows.map(exp)); T.stated = sum(rows.map(r => r.sn * r.st * ticketMult)); T.steadyN = sum(rows.map(r => r.sn * conf[r.cp]));
    return { months, T, rows, conf, season, adopt, share, P: { confMult, growth, ticketMult, retention, wak } };
  }
  g.CorrModel = { run, seasonality, feeRate };
})(typeof window !== "undefined" ? window : globalThis);
