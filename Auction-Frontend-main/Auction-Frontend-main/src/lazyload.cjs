const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'App.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

if (!content.includes('lazy') || !content.includes('Suspense')) {
    content = content.replace('import { useEffect, useState } from "react";', 'import React, { useEffect, useState, lazy, Suspense } from "react";');
}

const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+[\'\"](\.\/(?:pages|components|admin|auth)[^\'\"]+)[\'\"];/g;

let match;
const importsToReplace = [];

while ((match = importRegex.exec(content)) !== null) {
    const component = match[1];
    const importPath = match[2];
    if (!['Header', 'Footer', 'SEO', 'ScrollToTop'].includes(component)) {
        importsToReplace.push({ component, importPath, fullMatch: match[0] });
    }
}

for (const { component, importPath, fullMatch } of importsToReplace) {
    const newImport = `const ${component} = lazy(() => import("${importPath}"));`;
    content = content.replace(fullMatch, newImport);
}

// Wrap routes
content = content.replace('<Routes>', '<Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>}>\n            <Routes>');
content = content.replace('</Routes>', '</Routes>\n            </Suspense>');

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Done");
