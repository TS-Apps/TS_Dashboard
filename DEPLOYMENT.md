# Deployment Guide

## Quick Deploy (5 minutes)

### Prerequisites
- Node.js 18+ installed
- Access to your web server

### Steps

```bash
# 1. Extract the project
unzip scc-dashboard-bundled.zip
cd scc-dashboard-bundled

# 2. Install dependencies
npm install

# 3. Build for production
npm run build

# 4. Deploy the dist/ folder
scp -r dist/* username@your-server.com:/var/www/dashboard/
```

Done! Visit your website.

---

## Deployment Methods

### Method 1: Simple File Server (Apache/Nginx)

**For Apache**:
```bash
# Copy files
cp -r dist/* /var/www/html/dashboard/

# Restart Apache
sudo systemctl restart apache2
```

**For Nginx**:
```bash
# Copy files
cp -r dist/* /usr/share/nginx/html/dashboard/

# Restart Nginx
sudo systemctl restart nginx
```

**Access**: http://yourserver.com/dashboard/

---

### Method 2: GitHub Pages (Free)

```bash
# 1. Build
npm run build

# 2. Initialize Git (if not already)
git init
git add .
git commit -m "Initial commit"

# 3. Create gh-pages branch with dist/ contents
git subtree push --prefix dist origin gh-pages

# 4. Enable GitHub Pages in repo settings
# Settings → Pages → Source: gh-pages branch
```

**Access**: https://yourusername.github.io/repo-name/

---

### Method 3: Netlify (Free, Automatic Builds)

**Option A: Drag and Drop**
1. Run `npm run build`
2. Visit netlify.com
3. Drag `dist/` folder to deploy

**Option B: CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**Access**: https://your-site.netlify.app

---

### Method 4: Vercel (Free, Automatic Builds)

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
```

**Access**: https://your-site.vercel.app

---

### Method 5: Docker

**Dockerfile** (already included):
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Deploy**:
```bash
# Build image
docker build -t scc-dashboard .

# Run container
docker run -d -p 80:80 scc-dashboard

# Or with docker-compose
docker-compose up -d
```

**Access**: http://localhost

---

### Method 6: AWS S3 + CloudFront

```bash
# 1. Build
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id YOUR_DIST_ID \
    --paths "/*"
```

**Access**: https://your-cloudfront-url.cloudfront.net

---

## Configuration for Subdirectory

If deploying to a subdirectory (e.g., yoursite.com/dashboard/):

**Edit `vite.config.js`**:
```js
export default defineConfig({
  plugins: [react()],
  base: '/dashboard/', // Change this
  // ... rest of config
})
```

Then rebuild:
```bash
npm run build
```

---

## Server Configuration

### Apache (.htaccess)

Create `dist/.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Nginx

Add to your nginx config:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## Environment-Specific Builds

### Production
```bash
npm run build
```

### Development
```bash
npm run dev
```

### Preview Production Build
```bash
npm run build
npm run preview
```

---

## Updating the Dashboard

```bash
# 1. Get new version
# 2. Extract and copy src/ files to existing project
# 3. Rebuild
npm run build

# 4. Deploy
# Upload dist/ folder to server
```

---

## Monitoring

### Check if site is running

```bash
# Simple check
curl -I https://your-site.com

# With response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-site.com
```

### Set up monitoring
- UptimeRobot (free)
- Pingdom
- StatusCake
- AWS CloudWatch (if using AWS)

---

## Troubleshooting

### Blank page after deployment
- Check browser console for errors
- Verify `base` in vite.config.js matches deployment path
- Check server logs

### 404 errors
- Verify server routing configuration
- Add .htaccess (Apache) or update nginx config

### Assets not loading
- Check `base` path in vite.config.js
- Verify files in dist/assets/ exist
- Check file permissions (should be 644)

### Slow loading
- Enable gzip compression on server
- Use CDN (CloudFlare, etc.)
- Optimize images

---

## Security Checklist

- [ ] HTTPS enabled (Let's Encrypt free)
- [ ] Security headers configured
- [ ] Regular updates (rebuild with latest dependencies)
- [ ] Backup system in place
- [ ] Monitor for errors

---

## Performance Optimization

### Enable Compression

**Apache**:
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

**Nginx**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### Cache Headers

**Apache**:
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 1 hour"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/* "access plus 1 year"
</IfModule>
```

---

## Rollback Plan

1. Keep previous `dist/` folder backed up
2. If issues occur, replace with backup:
   ```bash
   cp -r dist-backup/* dist/
   ```
3. Clear browser cache and test

---

## Support

Issues? Contact James Harbidge: jharbidge@mhseacadets.org
