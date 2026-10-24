/* =====================================================================
   PORTFOLIO CONTENT: edit this file to update the home page.
   - SITE: your name, headline, contact links (leave "" to hide a button)
   - PROJECTS: one entry per project; order here = order on the page
   To add a project: copy an entry, change the fields, add its folder
   under /projects/<slug>/ and a 720×405 thumbnail in /assets/thumbs/.
   ===================================================================== */
const SITE = {
  name: "Jamal Kanbarieh",
  headline: "Financial Analyst · Financial Institutions & Credit Analysis · FP&A & Financial Control",
  intro: "I turn bank financial statements, budgets and market data into decisions: variance analysis, peer benchmarking, counterparty credit scoring and research-grade analytics, delivered as interactive Power BI and Excel tools.",
  bio: [
    "I'm a Financial Analyst with nearly three years of banking experience across financial institutions analysis, budgeting and financial control, investment analysis, economic research and financial data analysis. I hold an MBA in Financial Management and I'm based in Dubai.",
    "Most recently, as a Financial Institutions Analyst in the Treasury & Investment Department of Al Baraka Bank Syria, I co-developed the bank's counterparty credit rating model with the Risk Management Department. It converts published financial statements into a ratio scorecard, an S&P-equivalent grade and a probability of default used in expected-credit-loss calculations. I assessed prospective local and international banks during a roughly 80% expansion of the correspondent network after international sanctions were lifted, produced close to half of the counterparty ratings in the bulk limit renewal, and monitored Nostro/Vostro exposures and credit-limit utilisation.",
    "I also built the bank's Correspondent Banking Channel Utilization Dashboards end to end in Power BI: data extracted from the core banking system, ECB exchange rates integrated through Power Query and multi-currency transactions consolidated. Quarterly updates are now largely automated.",
    "Before that, as a Budget & Financial Control Analyst at Bank Al Sharq, I helped prepare the annual budget, ran monthly budget-versus-actual analysis with performance commentary for department heads, prepared management and Board reporting packs and 16 ALCO packages, and wrote the financial sections of the Annual Report. I also established the bank's financial e-newsletter for Senior Management. I began my career at Banque Bemo Saudi Fransi.",
    "I'm looking for financial analyst, FP&A, budgeting & planning, and credit or financial-institutions analyst roles."
  ],
  email: "jamalkanbarieh@gmail.com",
  linkedin: "https://www.linkedin.com/in/jamal-kanbarieh-b7a078381",
  cv: "assets/Jamal_Kanbarieh_CV.pdf",
  location: "Dubai, United Arab Emirates"
};

const PROJECTS = [
  {
    slug: "banking-sector",
    title: "Syrian Banking Sector Peer Analysis",
    summary: "15 private banks benchmarked on size, profitability, efficiency, asset quality, liquidity and capital. Pick any focus bank to see its rank on 20 metrics, compare Islamic and conventional peers, and map risk against return.",
    roles: ["credit", "analysis"],
    tags: ["Power BI", "DAX · 100+ measures", "Peer benchmarking", "FI credit analysis"],
    highlights: ["24-page Power BI report rebuilt as one interactive view", "FX-adjusted earnings methodology"],
    excel: false, featured: true
  },
  {
    slug: "credit-scoring",
    title: "Bank Counterparty Credit Scoring Model",
    summary: "A public, independent version of the counterparty rating approach I co-developed with Risk Management: a scorecard turning a bank's statements into an internal rating and indicative PD, with stress tests, a sovereign ceiling and peer ranking. Comes with a fully formula-driven Excel model to download.",
    roles: ["credit"],
    tags: ["Excel model", "Credit risk", "Probability of default", "Stress testing"],
    highlights: ["Live in-browser model", "390+ formula Excel workbook"],
    excel: "projects/credit-scoring/Bank_Credit_Scoring_Model.xlsx", featured: true
  },
  {
    slug: "budget-variance",
    title: "Treasury Revenues: Budget vs Actual & Variance Analysis",
    summary: "Monthly and year-to-date budget tracking for three treasury revenue streams in USD and SYP, with a variance bridge, stream drill-down, a variance heat map and automatic findings.",
    roles: ["fpa"],
    tags: ["Power BI", "Budgeting", "Variance analysis", "YTD time intelligence"],
    highlights: ["Fictional data (confidentiality)", "Data-quality check built in"],
    excel: false, featured: true
  },
  {
    slug: "thesis",
    title: "Investment Portfolio Management & Profitability (MBA Research)",
    summary: "Does diversification pay? Empirical MBA study of Syrian Islamic banks on 36 bank-years: four HHI diversification indices, cost efficiency and asset quality regressed on adjusted ROAA, ROAE and financing margin. Explore coefficients, hypotheses and every variable.",
    roles: ["research", "analysis"],
    tags: ["Econometrics", "Pooled OLS", "HHI indices", "Power BI"],
    highlights: ["Hypothesis scorecard", "Relationship explorer"],
    excel: false, featured: false
  },
  {
    slug: "stock-technicals",
    title: "Financial Instruments RSI Tracker: BBSF",
    summary: "Built for the Investment Analysis course (MBA). Technical and risk analysis of a Damascus-listed bank stock through currency collapse, exchange closure and reopening: SMAs, RSI, volatility, drawdown and the return distribution.",
    roles: ["analysis"],
    tags: ["Market analysis", "Technical indicators", "Risk metrics", "Power BI"],
    highlights: ["Candlesticks & crossovers", "Corporate-action handling"],
    excel: false, featured: false
  }
];

const ROLES = { fpa: "Budgeting & FP&A", credit: "Credit analysis", analysis: "Financial analysis", research: "Research & econometrics" };
