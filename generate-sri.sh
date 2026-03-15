#!/usr/bin/env bash
# Generate SRI (Subresource Integrity) hashes for pinned CDN scripts.
# Run this after any dependency version bump and copy the hashes into index.html.
#
# Usage: chmod +x generate-sri.sh && ./generate-sri.sh
#
# Note: Tailwind CSS is now built locally (tailwind.css) — no CDN, no hash needed.
#       The compiled JS block in index.html is also local — no CDN, no hash needed.
#       Only the remaining UMD CDN scripts need SRI hashes.

set -euo pipefail

URLS=(
  "https://unpkg.com/react@18.2.0/umd/react.production.min.js"
  "https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"
  "https://unpkg.com/lucide@0.358.0/dist/umd/lucide.min.js"
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.99.1/dist/umd/supabase.js"
)

echo "Generating SRI hashes..."
echo ""
for url in "${URLS[@]}"; do
  hash=$(curl -sfL "$url" | openssl dgst -sha384 -binary | openssl base64 -A)
  echo "URL: $url"
  echo "integrity=\"sha384-${hash}\""
  echo ""
done
echo "Done. Verify these match the hashes already in index.html."
echo "If they differ, update index.html and re-test in a browser."
