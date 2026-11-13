import re

file_path = 'App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Ensure Suspense and lazy are imported
if 'lazy' not in content or 'Suspense' not in content:
    content = content.replace('import { useEffect, useState } from "react";', 'import React, { useEffect, useState, lazy, Suspense } from "react";')

# Find all relative imports for pages, components, admin, seo, auth
imports = re.findall(r'import\s+([A-Za-z0-9_]+)\s+from\s+[\'\"](\.\/(?:pages|components|admin|auth)[^\'\"]+)[\'\"];', content)

for component, path in imports:
    if component not in ['Header', 'Footer', 'SEO', 'ScrollToTop']:
        original_import = f'import {component} from "{path}";'
        new_import = f'const {component} = lazy(() => import("{path}"));'
        content = content.replace(original_import, new_import)

# Find <Routes> and wrap with Suspense
content = content.replace('<Routes>', '<Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>}>\n            <Routes>')
content = content.replace('</Routes>', '</Routes>\n            </Suspense>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
