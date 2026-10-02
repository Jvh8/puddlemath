#!/usr/bin/env python3
"""Builds apps-script/index.html: the whole site in one file, for Google Apps Script."""
import re, pathlib
root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text()
css = (root / "css/style.css").read_text()
html = html.replace('<link rel="stylesheet" href="css/style.css">', "<style>\n" + css + "</style>")
def inline(m):
    return "<script>\n" + (root / m.group(1)).read_text() + "</script>"
html = re.sub(r'<script src="(js/[^"]+)"></script>', inline, html)
(root / "apps-script").mkdir(exist_ok=True)
(root / "apps-script/index.html").write_text(html)
print("Wrote apps-script/index.html", len(html), "bytes")
