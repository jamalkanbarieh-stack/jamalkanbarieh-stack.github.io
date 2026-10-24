# Inlines data JSON into dashboard templates -> index.html (keeps pages working from file:// and any static host)
import json, pathlib
root = pathlib.Path(__file__).parent
for tpl, data in [("projects/banking-sector/template.html", "projects/banking-sector/sector.json"), ("projects/thesis/template.html", "projects/thesis/thesis.json"), ("projects/stock-technicals/template.html", "projects/stock-technicals/prices.json"), ("projects/credit-scoring/template.html", "projects/credit-scoring/banks.json")]:
    t = (root/tpl).read_text(); d = (root/data).read_text().strip()
    (root/tpl).with_name("index.html").write_text(t.replace("__DATA__", d))
    print("built", tpl)
