#!/usr/bin/env node
/**
 * Build script for TS Dashboard
 *
 * 1. Extracts the <script type="text/babel"> block from index.html
 * 2. Compiles the JSX to plain JS via @babel/core + preset-react
 * 3. Writes the compiled output to dashboard.js (external file)
 * 4. Ensures index.html references <script src="dashboard.js">
 * 5. Repeats steps 1-4 for staff/index.html → staff/staff.js
 *
 * To rebuild after editing JSX:
 *   git checkout index.html   # restore the JSX source
 *   npm run build             # compile JSX + regenerate tailwind.css
 *
 * Note: dashboard.js and staff/staff.js are build artefacts committed to the
 * repo so that Cloudflare Pages can serve them without a CI build step.
 */

const fs   = require('fs');
const path = require('path');
const babel = require('@babel/core');

const OPEN_TAG  = '<script type="text/babel">';
const CLOSE_TAG = '</script>';

function compilePage(srcPath, outPath, label) {
    if (!fs.existsSync(srcPath)) {
        console.log(`${label}: source file not found, skipping.`);
        return;
    }
    const html = fs.readFileSync(srcPath, 'utf8');
    const startIdx = html.indexOf(OPEN_TAG);
    if (startIdx === -1) {
        console.warn(`${label}: no <script type="text/babel"> found — already compiled, skipping.`);
        return;
    }
    const jsxStart = startIdx + OPEN_TAG.length;
    const jsxEnd   = html.indexOf(CLOSE_TAG, jsxStart);
    if (jsxEnd === -1) {
        console.error(`${label}: ERROR — could not find closing </script>`);
        process.exit(1);
    }

    const jsxSource = html.slice(jsxStart, jsxEnd);
    console.log(`${label}: extracted ${jsxSource.length.toLocaleString()} chars of JSX`);

    let compiled;
    try {
        const result = babel.transformSync(jsxSource, {
            presets: [['@babel/preset-react', { runtime: 'classic' }]],
            filename: path.basename(outPath, '.js') + '.jsx',
            sourceMaps: false,
            compact: false,
        });
        compiled = result.code;
        console.log(`${label}: compiled to ${compiled.length.toLocaleString()} chars`);
    } catch (err) {
        console.error(`${label}: Babel compilation failed — ${err.message}`);
        process.exit(1);
    }

    const output = `(function () {\n"use strict";\n${compiled}\n})();\n`;
    fs.writeFileSync(outPath, output, 'utf8');
    console.log(`${label}: ${path.basename(outPath)} written`);

    // Patch source HTML to reference the compiled script
    const scriptTag = `<script src="${path.basename(outPath)}"></script>`;
    const before  = html.slice(0, startIdx);
    const after   = html.slice(jsxEnd + CLOSE_TAG.length);
    fs.writeFileSync(srcPath, before + scriptTag + after, 'utf8');
    console.log(`${label}: ${path.basename(srcPath)} updated`);
}

// ── Main dashboard ─────────────────────────────────────────────────────────
compilePage(
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'dashboard.js'),
    'index.html'
);

// ── Staff page ─────────────────────────────────────────────────────────────
compilePage(
    path.join(__dirname, 'staff', 'index.html'),
    path.join(__dirname, 'staff', 'staff.js'),
    'staff/index.html'
);
