import re

def parse_css(css_text):
    css_text = re.sub(r'/\*[\s\S]*?\*/', '', css_text)
    rules = {}
    pos = 0
    media_stack = []
    
    while pos < len(css_text):
        next_open = css_text.find('{', pos)
        next_close = css_text.find('}', pos)
        if next_open == -1:
            break
        if next_close != -1 and next_close < next_open:
            if media_stack:
                media_stack.pop()
            pos = next_close + 1
            continue
            
        header = css_text[pos:next_open].strip()
        pos = next_open + 1
        if header.startswith('@media'):
            media_stack.append(header)
            continue
            
        rule_close = css_text.find('}', pos)
        if rule_close == -1:
            break
        body = css_text[pos:rule_close].strip()
        pos = rule_close + 1
        media_prefix = media_stack[-1] if media_stack else 'ALL'
        selectors = [s.strip() for s in header.split(',') if s.strip()]
        props = {}
        for decl in body.split(';'):
            decl = decl.strip()
            if not decl:
                continue
            if ':' in decl:
                k, v = decl.split(':', 1)
                props[k.strip().lower()] = v.strip().replace('!important', '').strip()
        for sel in selectors:
            key = f"[{media_prefix}] {sel}"
            rules[key] = props
    return rules

ref = parse_css(open('client-reference/assets/css/site.css', encoding='utf-8').read())
my = parse_css(open('src/app/client-site.css', encoding='utf-8').read())

extra = [k for k in my if k not in ref]
print(f'Total extra selectors in my CSS: {len(extra)}')
for e in sorted(extra):
    print(e)
