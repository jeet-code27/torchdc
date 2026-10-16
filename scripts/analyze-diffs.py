import json

with open('scripts/css-diff-report.json', 'r', encoding='utf-8') as f:
    diffs = json.load(f)

typo_diffs = []
spacing_diffs = []
other_diffs = []
missing_rules = []

for d in diffs:
    if d['type'] == 'MISSING_RULE':
        missing_rules.append(d['selector'])
    elif d['type'] == 'PROPERTY_MISMATCH':
        sel = d['selector']
        for prop, vals in d['diffs'].items():
            if 'font' in prop or 'line-height' in prop or 'letter-spacing' in prop:
                typo_diffs.append((sel, prop, vals))
            elif 'margin' in prop or 'padding' in prop or 'gap' in prop:
                spacing_diffs.append((sel, prop, vals))
            else:
                other_diffs.append((sel, prop, vals))

print(f"=== TYPOGRAPHY MISMATCHES ({len(typo_diffs)}) ===")
for sel, p, v in typo_diffs:
    print(f"{sel} -> {p}: ref='{v['ref']}' vs mine='{v['mine']}'")

print(f"\n=== SPACING MISMATCHES ({len(spacing_diffs)}) ===")
for sel, p, v in spacing_diffs:
    print(f"{sel} -> {p}: ref='{v['ref']}' vs mine='{v['mine']}'")

print(f"\n=== MISSING RULES ({len(missing_rules)}) ===")
for s in missing_rules:
    print(s)
