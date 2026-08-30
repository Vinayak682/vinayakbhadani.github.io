# Vinayak Bhadani — vinayakbhadani.com

Demand planning and supply chain operator in Dubai who also builds and deploys agentic AI
systems. Source for [vinayakbhadani.com](https://vinayakbhadani.com), served from GitHub Pages.

## What's here

Every tool and article on the site is built from scratch and committed here — no CMS, no
build step, no framework. Each page is a self-contained HTML file with its own inline CSS
and vanilla JS, which keeps them fast, individually cacheable, and readable in one file.

**Planning tools** — interactive, client-side, free, no signup:

- [Supply chain calculators](https://vinayakbhadani.com/supply-chain-calculators.html) — safety stock, EOQ, reorder point, MAPE
- [MRP & BOM planner](https://vinayakbhadani.com/mrp-bom-planner.html) — forecast → MPS → BOM explosion → capacity check, CSV in and out
- [Multi-echelon inventory optimizer](https://vinayakbhadani.com/multi-echelon-inventory-optimizer.html)
- [ML demand forecasting](https://vinayakbhadani.com/ml-demand-forecasting.html) and [forecasting model](https://vinayakbhadani.com/demand-forecasting-model.html)
- [Supply chain scorecard](https://vinayakbhadani.com/supply-chain-scorecard.html) and [KPI dashboard](https://vinayakbhadani.com/supply-chain-kpi-dashboard.html)
- [GCC Nexus control tower](https://vinayakbhadani.com/gcc-nexus-control-tower.html) — event simulation on synthetic data
- [Perfume supply chain simulator](https://vinayakbhadani.com/perfume-supply-chain-simulator.html)

**AI systems**

- [AlphaOS](https://vinayakbhadani.com/alphaos/) — agentic multi-market trading platform. Four
  research agents on Supabase Edge Functions, an AI signal pipeline, a client-side backtesting
  engine and a portfolio backtester.

  It publishes its own negative result: [walk-forward validation](https://vinayakbhadani.com/walk-forward-validation-trading-strategies.html)
  showed the strategies do **not** beat buy-and-hold out-of-sample — in-sample +0.27 Sharpe
  against out-of-sample −0.10, replicated on crypto at +0.09 → −0.21. Drawdown reduction of
  roughly half did hold across every variant and both asset classes.
- [AI supply chain copilot](https://vinayakbhadani.com/ai-supply-chain-copilot.html)
- [ERP → Shopify ETL pipeline](https://vinayakbhadani.com/erp-shopify-etl-pipeline.html)

**Field notes** — [insights.html](https://vinayakbhadani.com/insights.html) collects the
written work: lunar-calendar seasonality drift in the GCC, Red Sea rerouting math, why ABC
classification traps C-class items, what weak supply chains cost in cash.

**The Corridor** — [a weekly newsletter](https://vinayakbhadani.com/the-corridor.html) on the
Asia → Jebel Ali → World corridor. One decision a week.

## Domain

`vinayakbhadani.com` is canonical, bound to this repo via the `CNAME` file on `main`.
`www` 301s to the apex, and the legacy `vinayak682.github.io` project-page URLs 301 here.
`migrate-domain.py` and `build-sitemap.py` maintain the redirects and `sitemap.xml`.

## Stack

Static HTML, CSS and vanilla JS on GitHub Pages. GA4 for analytics, MailerLite for the
newsletter, Formspree for the contact form. `llms.txt` describes the site for AI crawlers.

## Contact

- Email — vinayakbhadani@zohomail.in
- LinkedIn — [/in/vinayakbhadani](https://www.linkedin.com/in/vinayakbhadani/)
- CV — [Demand Planning & AI Supply Chain](https://vinayakbhadani.com/Vinayak-Bhadani-Resume-Demand-Planning-AI-Supply-Chain.pdf)
