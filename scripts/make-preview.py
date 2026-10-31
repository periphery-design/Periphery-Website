"""Make a self-contained preview copy of the built site for hosting under a sub-path
(e.g. a claude.ai artifact): relative links, explicit index.html, and no "_"-prefixed names.
Usage: npm run build && python3 scripts/make-preview.py dist previews/site
"""
import os, re, shutil, sys
src, out = sys.argv[1], sys.argv[2]
shutil.rmtree(out, ignore_errors=True); shutil.copytree(src, out)
def fix(path, prefix):
    frag = ''
    if '#' in path: path, frag = path.split('#', 1); frag = '#' + frag
    if path == '/': p = 'index.html'
    else:
        p = path.lstrip('/')
        if p.endswith('/'): p += 'index.html'
        elif '.' not in p.split('/')[-1]: p += '/index.html'
    return prefix + p + frag
for root, _, files in os.walk(out):
    for f in files:
        if not f.endswith('.html'): continue
        fp = os.path.join(root, f)
        depth = os.path.relpath(root, out).count(os.sep) + (0 if os.path.relpath(root, out) == '.' else 1)
        prefix = '../' * depth
        s = open(fp, encoding='utf-8').read()
        s = re.sub(r'(href|src)="(/(?!/)[^"]*)"', lambda m: f'{m.group(1)}="{fix(m.group(2), prefix)}"', s)
        s = re.sub(r'srcset="([^"]*)"', lambda m: 'srcset="' + ', '.join(
            (fix(part.strip().split(' ')[0], prefix) + (' ' + part.strip().split(' ', 1)[1] if ' ' in part.strip() else '')) if part.strip().startswith('/') else part.strip()
            for part in m.group(1).split(',')) + '"', s)
        open(fp, 'w', encoding='utf-8').write(s)
# The artifact host reserves names starting with "_": rename _astro/ and any _file.
os.rename(os.path.join(out, '_astro'), os.path.join(out, 'assets'))
renames = {f: f.lstrip('_') for f in os.listdir(os.path.join(out, 'assets')) if f.startswith('_')}
for old, new in renames.items():
    os.rename(os.path.join(out, 'assets', old), os.path.join(out, 'assets', new))
for root, _, files in os.walk(out):
    for f in files:
        if f.endswith(('.html', '.js', '.css')):
            fp = os.path.join(root, f); s = open(fp, encoding='utf-8').read()
            s = s.replace('_astro/', 'assets/')
            if f.endswith('.css'):  # CSS lives in assets/, so its own references are siblings
                s = s.replace('url(/assets/', 'url(./')
            for old, new in renames.items(): s = s.replace(old, new)
            open(fp, 'w', encoding='utf-8').write(s)
print('preview ready:', out)
