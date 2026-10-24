# Jamal Kanbarieh · Financial Analysis Portfolio

A static website (plain HTML/CSS/JS, no frameworks, no build server) with five interactive projects. It runs on any static host and opens directly in a browser.

```
index.html                     ← home page (content comes from assets/projects.js)
assets/
  projects.js                  ← EDIT ME: name, headline, bio, contact links, project list
  site.css · common.js         ← shared design and chart helpers
  thumbs/*.jpg                 ← 720×405 project preview images
projects/
  budget-variance/             ← Budget vs actual (fictional data)
  banking-sector/              ← Syrian banking peer benchmark (public SCFMS data)
  thesis/                      ← Master's research dashboard
  stock-technicals/            ← BBSF price/trend/momentum
  credit-scoring/              ← Credit scoring model + Bank_Credit_Scoring_Model.xlsx
build.py                       ← re-inlines each project's JSON data into its index.html
```

## Publish free on GitHub Pages (about 10 minutes, once)

1. Create a free account at github.com. Your username becomes your web address: `https://<username>.github.io`.
2. Click **New repository** and name it exactly `<username>.github.io`. Set it to **Public**, then click **Create**.
3. On the new repository page, click **uploading an existing file**. Drag in **everything inside** this folder (index.html, assets, projects, README.md, build.py), then click **Commit changes**.
4. Go to **Settings → Pages** and set *Source* = **Deploy from a branch**, *Branch* = **main / (root)**, then **Save**.
5. Wait 1–2 minutes, then open `https://<username>.github.io`. That is the link for your CV, LinkedIn and applications.

The repository must be public for free Pages hosting. Every file in this folder has been checked for confidential content.

## Everyday updates

- **Contact details, bio, CV:** edit `assets/projects.js` on github.com (pencil icon → edit → Commit). For a CV, upload the PDF to `assets/` and set `cv: "assets/YourFile.pdf"`.
- **Add a project:** add a folder under `projects/`, a thumbnail in `assets/thumbs/`, and one entry in the `PROJECTS` list in `assets/projects.js`.
- **New data for a dashboard:** replace that project's `.json` file, run `python build.py`, and upload the regenerated `index.html`.

## Optional extras

- **Custom domain** (about US$10–15/year), e.g. `jamalkanbarieh.com`: buy it from any registrar, add it under Settings → Pages → Custom domain, and follow GitHub's DNS instructions.
- **Live Power BI embeds** (free 60-day Pro trial): publish a report with *Publish to web* and send the embed link. It can be added above the web version of that dashboard.
