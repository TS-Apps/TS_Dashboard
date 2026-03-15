#!/usr/bin/env node
/**
 * Build script for TS Dashboard
 *
 * 1. Extracts the <script type="text/babel"> block from index.html
 * 2. Compiles the JSX to plain JS via @babel/core + preset-react
 * 3. Writes the compiled output to dashboard.js (external file)
 * 4. Ensures index.html references <script src="dashboard.js">
 *
 * To rebuild after editing JSX:
 *   git checkout index.html   # restore the JSX source
 *   npm run build             # compile JSX + regenerate tailwind.css
 *
 * Note: dashboard.js is a build artefact committed to the repo so that
 * Cloudflare Pages can serve it without a CI build step.
 */

const fs   = require('fs');
const path = require('path');
const babel = require('@babel/core');

const SRC   = path.join(__dirname, 'index.html');
const OUT   = path.join(__dirname, 'dashboard.js');
const html  = fs.readFileSync(SRC, 'utf8');

// ── 1. Extract JSX block ──────────────────────────────────────────────────────
const OPEN_TAG  = '<script type="text/babel">';
const CLOSE_TAG = '</script>';

const startIdx = html.indexOf(OPEN_TAG);
if (startIdx === -1) {
    console.error('ERROR: Could not find <script type="text/babel"> in index.html');
    console.error('       Run: git checkout index.html  to restore the JSX source.');
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
        presets: [['@babel/preset-react', { runtime: 'classic' }]],
        // No preset-env: target modern browsers that support ES2020+ natively
        filename: 'dashboard.jsx',
        sourceMaps: false,
        compact: false,
    });
    compiled = result.code;
    console.log(`Compiled to ${compiled.length.toLocaleString()} chars of JS`);
} catch (err) {
    console.error('Babel compilation failed:', err.message);
    process.exit(1);
}

// ── 3. Write compiled JS to dashboard.js (IIFE-wrapped) ──────────────────────
// Wrapping in an IIFE isolates all declarations (e.g. `const supabase`) from
// the global scope, preventing conflicts with UMD CDN globals like
// `var supabase` exported by @supabase/supabase-js.
const output = `(function () {\n"use strict";\n${compiled}\n})();\n`;
fs.writeFileSync(OUT, output, 'utf8');
console.log('dashboard.js written (IIFE-wrapped)');

// ── 4. Patch index.html to reference dashboard.js (external) ─────────────────
// Replace:  <script type="text/babel"> ... </script>
// With:     <script src="dashboard.js"></script>
const before = html.slice(0, startIdx);
const after  = html.slice(jsxEnd + CLOSE_TAG.length);
const newHtml = before + '<script src="dashboard.js"></script>' + after;

fs.writeFileSync(SRC, newHtml, 'utf8');
console.log('index.html updated — babel block replaced with <script src="dashboard.js">');
