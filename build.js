#!/usr/bin/env node
/**
 * Build script for TS Dashboard
 *
 * 1. Extracts the <script type="text/babel"> block from index.html
 * 2. Compiles the JSX to plain JS using @babel/core + preset-react
 * 3. Writes the result back into index.html as a regular <script>
 *    (removing the @babel/standalone CDN dependency)
 */

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const SRC = path.join(__dirname, 'index.html');
const html = fs.readFileSync(SRC, 'utf8');

// ── 1. Extract JSX block ──────────────────────────────────────────────────────
const OPEN_TAG  = '<script type="text/babel">';
const CLOSE_TAG = '</script>';

const startIdx = html.indexOf(OPEN_TAG);
if (startIdx === -1) {
    console.error('ERROR: Could not find <script type="text/babel"> in index.html');
    process.exit(1);
}
const jsxStart = startIdx + OPEN_TAG.length;
const jsxEnd   = html.indexOf(CLOSE_TAG, jsxStart);
if (jsxEnd === -1) {
    console.error('ERROR: Could not find closing </script> after the babel block');
    process.exit(1);
}

const jsxSource = html.slice(jsxStart, jsxEnd);
console.log(`Extracted ${jsxSource.length.toLocaleString()} chars of JSX`);

// ── 2. Compile JSX → JS ───────────────────────────────────────────────────────
let compiled;
try {
    const result = babel.transformSync(jsxSource, {
        presets: [
            ['@babel/preset-react', { runtime: 'classic' }]
        ],
        // No preset-env: we target modern browsers that understand ES2020+
        filename: 'dashboard.jsx',
        sourceMaps: false,
        compact: false,
        retainLines: false,
    });
    compiled = result.code;
    console.log(`Compiled to ${compiled.length.toLocaleString()} chars of JS`);
} catch (err) {
    console.error('Babel compilation failed:', err.message);
    process.exit(1);
}

// ── 3. Splice back into HTML ──────────────────────────────────────────────────
// Replace:  <script type="text/babel"> ... </script>
// With:     <script> ... </script>
const before = html.slice(0, startIdx);
const after  = html.slice(jsxEnd + CLOSE_TAG.length);
const newHtml = before + '<script>\n' + compiled + '\n' + CLOSE_TAG + after;

fs.writeFileSync(SRC, newHtml, 'utf8');
console.log('index.html updated — babel script block replaced with compiled JS');
