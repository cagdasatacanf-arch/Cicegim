# Çiçeğim - Netlify Deployment Guide

Complete guide to deploy your Çiçeğim app to Netlify.

---

## 🚀 Method 1: Deploy via Netlify UI (Easiest)

### Step 1: Prepare Your Repository

Your code is already pushed to GitHub on branch `claude/review-repo-plan-app-m5eKN`.

### Step 2: Connect to Netlify

1. Go to **https://app.netlify.com**
2. Sign up or log in with your GitHub account
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **"GitHub"** as your Git provider
5. Authorize Netlify to access your repositories
6. Select your repository: **`cagdasatacanf-arch/Cicegim`**
7. Choose branch: **`claude/review-repo-plan-app-m5eKN`**

### Step 3: Configure Build Settings

Netlify should auto-detect these settings (verify they match):

```
Base directory: flora-app
Build command: npm run build
Publish directory: flora-app/dist
```

### Step 4: Add Environment Variables

**CRITICAL**: Add your Gemini API key as an environment variable.

1. In Netlify site settings, go to **"Site configuration"** → **"Environment variables"**
2. Click **"Add a variable"**
3. Add:
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: `AIzaSyBU3v0APu-fZkMXHLnkHyLlslPUlZeBvTo`
   - **Scopes**: Check all (Builds, Functions, Post processing)
4. Click **"Save"**

### Step 5: Deploy

1. Click **"Deploy site"**
2. Wait 1-2 minutes for build to complete
3. Your app will be live at: `https://your-site-name.netlify.app`

### Step 6: Custom Domain (Optional)

1. Go to **"Site configuration"** → **"Domain management"**
2. Click **"Add custom domain"**
3. Follow instructions to add your domain (e.g., `cicegim.com`)

---

## 🖥️ Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

This opens a browser to authenticate.

### Step 3: Initialize Netlify

```bash
cd /home/user/Cicegim/flora-app
netlify init
```

Follow the prompts:
- Create & configure a new site
- Choose your team
- Site name: `cicegim` (or your preferred name)
- Build command: `npm run build`
- Publish directory: `dist`

### Step 4: Add Environment Variables

```bash
netlify env:set VITE_GEMINI_API_KEY "AIzaSyBU3v0APu-fZkMXHLnkHyLlslPUlZeBvTo"
```

### Step 5: Deploy

```bash
# Deploy to production
netlify deploy --prod

# Or deploy to preview first
netlify deploy
```

---

## 📋 Build Configuration

The `netlify.toml` file is already configured with:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## ✅ Verify Deployment

### 1. Check Build Log

In Netlify dashboard:
- Go to **"Deploys"** tab
- Click on latest deploy
- Verify build succeeded

### 2. Test the Live Site

Visit your Netlify URL and test:
- ✅ App loads correctly
- ✅ Logo appears
- ✅ Camera/upload works
- ✅ Gemini AI identifies plants
- ✅ Plants save to localStorage
- ✅ Watering tracker works

### 3. Check Environment Variables

In browser console:
```javascript
// Should NOT see your actual API key (it's bundled)
console.log('API configured:', !!import.meta.env.VITE_GEMINI_API_KEY)
```

---

## 🔧 Troubleshooting

### Build Fails

**Error**: `npm ERR! Missing script: "build"`
- **Solution**: Verify you're deploying from `flora-app` directory

**Error**: `Environment variable not found`
- **Solution**: Add `VITE_GEMINI_API_KEY` in Netlify UI

### App Shows Blank Screen

- Check browser console for errors
- Verify base path is correct
- Check if API key is set in Netlify

### API Not Working

- Verify environment variable name: `VITE_GEMINI_API_KEY`
- Rebuild and redeploy after adding env vars
- Check Gemini API key is valid

---

## 🔄 Continuous Deployment

Once connected, Netlify auto-deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin claude/review-repo-plan-app-m5eKN

# Netlify automatically rebuilds and deploys!
```

---

## 🎯 Post-Deployment Checklist

- [ ] Site is live and accessible
- [ ] Gemini API key is configured
- [ ] Plant identification works
- [ ] Logo displays correctly
- [ ] Mobile responsive
- [ ] HTTPS enabled (automatic)
- [ ] Custom domain added (optional)
- [ ] Analytics setup (optional)

---

## 📊 Performance Tips

### Enable Asset Optimization

In Netlify UI:
1. Go to **"Site configuration"** → **"Build & deploy"**
2. Enable **"Asset optimization"**
3. Check: Minify CSS, Bundle CSS, Minify JS

### Add Caching Headers

Already configured in `netlify.toml`:
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 🌐 Example Live URL

After deployment, your app will be available at:
```
https://cicegim.netlify.app
```

Or with custom domain:
```
https://cicegim.com
```

---

## 🔒 Security Notes

- ✅ `.env` is gitignored (local only)
- ✅ API key stored in Netlify environment variables
- ✅ HTTPS enabled by default
- ✅ Security headers configured
- ⚠️ API key is bundled in client code (visible to users)
  - Consider backend proxy for production

---

## 📱 Share Your App

Once deployed, share your app:
- Direct link: `https://your-site.netlify.app`
- QR code from Netlify dashboard
- Add to phone home screen (PWA)

---

## Need Help?

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Support**: https://answers.netlify.com
- **Build Issues**: Check deploy logs in Netlify dashboard

Good luck! Your Çiçeğim app will be live in minutes! 🌱🚀
