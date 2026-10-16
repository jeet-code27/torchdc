import re

with open('src/app/client-site.css', 'r', encoding='utf-8') as f:
    mine = f.read()

with open('client-reference/assets/css/site.css', 'r', encoding='utf-8') as f:
    ref = f.read()

# Let's see what rules in mine have selectors not appearing at all in ref
from find_extra import parse_css
mine_rules = parse_css(mine)
ref_rules = parse_css(ref)

custom_selectors = {}
for sel, props in mine_rules.items():
    pure_sel = sel.split('] ')[1] if '] ' in sel else sel
    # Check if pure_sel is in ref_rules
    matches = [k for k in ref_rules if k.endswith('] ' + pure_sel) or k == pure_sel]
    if not matches:
        custom_selectors[sel] = props

print(f"Found {len(custom_selectors)} custom selectors in mine:")
for sel in sorted(custom_selectors.keys()):
    print(sel)
