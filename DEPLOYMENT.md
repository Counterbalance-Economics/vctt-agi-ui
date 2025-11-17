
# VCTT-AGI UI - Deployment Guide

**Version**: 2.0.0-phase2  
**Status**: Ready for Production ✅

---

## 🚀 Quick Deploy to Vercel

### Option 1: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `yarn build`
   - **Output Directory**: `dist`
   - **Install Command**: `yarn install`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
6. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Deploy
cd /home/ubuntu/vctt_agi_ui
vercel --prod
```

---

## 🔧 Environment Variables

### Required
```bash
VITE_API_URL=https://your-backend-url.com
```

**Important**: 
- Use your actual backend URL after backend deployment
- Do NOT include trailing slash
- Example: `https://vctt-agi-backend.onrender.com`

---

## 📦 Build Process

```bash
# Install dependencies
yarn install

# Build for production
yarn build

# Preview build locally
yarn preview
```

**Output**: Static files in `dist/` directory

---

## ✅ Post-Deployment Checks

### 1. Verify UI Loads
- Open production URL
- Should see VCTT-AGI interface
- Left sidebar should show "New Chat" and "Analytics" buttons

### 2. Test Backend Connection
- Click "New Chat"
- Send a message
- Verify response appears
- Check trust indicator shows in header

### 3. Test Analytics
- Click "Analytics" button (blue)
- Dashboard should load
- Should show:
  - Total sessions
  - Trust metrics charts
  - Regulation distribution

### 4. Test Session History
- Previous sessions should appear in left sidebar
- Each session should show:
  - Preview text
  - Timestamp (e.g., "2h ago")
  - Message count
  - Trust score badge (color-coded)

---

## 🐛 Troubleshooting

### Issue: "Failed to connect to backend"

**Cause**: Backend URL not configured or incorrect

**Solution**:
1. Check `VITE_API_URL` environment variable
2. Verify backend is deployed and accessible
3. Test backend directly: `curl https://your-backend-url.com/health`
4. Redeploy UI with correct URL

---

### Issue: Analytics dashboard is empty

**Cause**: No sessions in database yet

**Solution**:
1. Create a few test sessions first
2. Refresh analytics dashboard
3. Verify backend has data: `curl https://your-backend-url.com/analytics/sessions`

---

### Issue: Trust indicator not showing

**Cause**: Backend not returning trust_tau

**Solution**:
1. Check browser console for errors
2. Verify backend response includes `internal_state.trust_tau`
3. Test endpoint: `curl https://your-backend-url.com/api/v1/session/step`

---

### Issue: Sessions not loading on page refresh

**Cause**: Backend session history endpoint not working

**Solution**:
1. Check network tab in browser DevTools
2. Verify `/analytics/sessions` returns data
3. Check backend logs for errors

---

## 🎨 Customization

### Update API URL After Deployment
```bash
# In Vercel dashboard
Settings → Environment Variables → Edit VITE_API_URL
# Then redeploy
```

### Custom Domain
```bash
# In Vercel dashboard
Settings → Domains → Add Domain
```

---

## 📊 Performance

### Expected Metrics
- **Load Time**: < 2s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90

### Optimization Tips
- Assets are automatically minified
- Code splitting enabled
- Images optimized via Vite
- Gzip compression automatic (Vercel)

---

## 🔒 Security

- ✅ HTTPS enabled automatically (Vercel)
- ✅ API keys in environment variables only
- ✅ No sensitive data in client code
- ✅ CORS handled by backend

---

## 🔄 Continuous Deployment

### Automatic Deploys (Recommended)

1. Connect GitHub repository to Vercel
2. Every push to `master` auto-deploys
3. Preview URLs for pull requests
4. Automatic rollbacks on error

### Manual Deploys

```bash
# Deploy specific branch
vercel --prod --branch feature-branch

# Deploy with custom name
vercel --prod --name vctt-agi-ui-staging
```

---

## 📱 Mobile Support

UI is fully responsive:
- ✅ Mobile phones (320px+)
- ✅ Tablets (768px+)
- ✅ Desktops (1024px+)

Test on different devices after deployment!

---

## 🎯 Success Criteria

Deployment is successful when:

- ✅ UI accessible at public URL
- ✅ Backend connection works
- ✅ Sessions can be created
- ✅ Analytics dashboard displays
- ✅ Session history loads
- ✅ Trust indicators show
- ✅ No console errors
- ✅ Mobile responsive

---

## 📈 Monitoring

### Vercel Analytics

Enable in dashboard:
- Settings → Analytics → Enable

Metrics tracked:
- Page views
- Unique visitors
- Load times
- Core Web Vitals

---

## 🎉 Post-Deployment

1. Share production URL with team
2. Monitor first 24 hours
3. Collect user feedback
4. Plan Phase 3 enhancements

---

**Current Production URL**: https://vcttagiui.vercel.app  
**Backend URL**: (Set your deployed backend URL)  
**Last Updated**: November 17, 2025
