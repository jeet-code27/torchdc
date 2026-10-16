import re
import json

def parse_css(css_text):
    # Remove comments
    css_text = re.sub(r'/\*[\s\S]*?\*/', '', css_text)
    
    # We want to extract (media_query, selector, properties_dict)
    rules = {}
    
    # Find all top-level blocks or media blocks
    # Simple state machine
    pos = 0
    media_stack = []
    
    while pos < len(css_text):
        # find next '{' or '}'
        next_open = css_text.find('{', pos)
        next_close = css_text.find('}', pos)
        
        if next_open == -1:
            break
            
        if next_close != -1 and next_close < next_open:
            # closing a block
            if media_stack:
                media_stack.pop()
            pos = next_close + 1
            continue
            
        # We found '{'
        header = css_text[pos:next_open].strip()
        pos = next_open + 1
        
        if header.startswith('@media'):
            media_stack.append(header)
            continue
            
        # It is a normal rule block
        # Find matching '}'
        rule_close = css_text.find('}', pos)
        if rule_close == -1:
            break
        body = css_text[pos:rule_close].strip()
        pos = rule_close + 1
        
        media_prefix = media_stack[-1] if media_stack else 'ALL'
        
        # normalize selector
        selectors = [s.strip() for s in header.split(',') if s.strip()]
        
        props = {}
        for decl in body.split(';'):
            decl = decl.strip()
            if not decl:
                continue
            if ':' in decl:
                k, v = decl.split(':', 1)
                k = k.strip().lower()
                v = v.strip().replace('!important', '').strip()
                props[k] = v
                
        for sel in selectors:
            key = f"[{media_prefix}] {sel}"
            if key in rules:
                rules[key].update(props)
            else:
                rules[key] = props.copy()

    return rules

with open('client-reference/assets/css/site.css', 'r', encoding='utf-8') as f:
    ref_css = f.read()

with open('src/app/client-site.css', 'r', encoding='utf-8') as f:
    my_css = f.read()

ref_rules = parse_css(ref_css)
my_rules = parse_css(my_css)

print(f"Ref rules: {len(ref_rules)}, My rules: {len(my_rules)}")

diffs = []
for key, r_props in ref_rules.items():
    if key not in my_rules:
        # Check without media prefix just in case
        pure_sel = key.split('] ')[1]
        matches = [k for k in my_rules if k.endswith('] ' + pure_sel)]
        if not matches:
            diffs.append({"type": "MISSING_RULE", "selector": key, "ref_props": r_props})
        continue
        
    m_props = my_rules[key]
    prop_diffs = {}
    for p, r_val in r_props.items():
        if p not in m_props:
            prop_diffs[p] = {"ref": r_val, "mine": "MISSING"}
        elif m_props[p] != r_val:
            prop_diffs[p] = {"ref": r_val, "mine": m_props[p]}
            
    if prop_diffs:
        diffs.append({"type": "PROPERTY_MISMATCH", "selector": key, "diffs": prop_diffs})

with open('scripts/css-diff-report.json', 'w', encoding='utf-8') as f:
    json.dump(diffs, f, indent=2)

print(f"Found {len(diffs)} total rule differences. Saved to scripts/css-diff-report.json")
