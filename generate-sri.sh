#!/usr/bin/env bash
# Run this script to generate SRI (Subresource Integrity) hashes for all pinned CDN scripts.
# After running it, copy the integrity="sha384-..." attribute into the matching <script> tag in index.html.
#
# Usage: chmod +x generate-sri.sh && ./generate-sri.sh

set -euo pipefail

URLS=(
  "https://unpkg.com/react@18.2.0/umd/react.production.min.js"
  "https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"
  "https://unpkg.com/@babel/standalone@7.23.10/babel.min.js"
  "https://unpkg.com/lucide@0.358.0/dist/umd/lucide.min.js"
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/dist/umd/supabase.min.js"
)

echo "Generating SRI hashes..."
echo ""
for url in "${URLS[@]}"; do
  hash=$(curl -sfL "$url" | openssl dgst -sha384 -binary | openssl base64 -A)
  echo "URL: $url"
  echo "integrity=\"sha384-${hash}\""
  echo ""
done
echo "Done. Add each integrity attribute to its matching <script> tag in index.html."
