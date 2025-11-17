
# VCTT-AGI Chat UI - Deployment Guide

## ✅ Successfully Built!

Your Grok-style chat interface is ready for deployment.

## 🎨 Features Delivered

### Three-Panel Layout
- **Left Sidebar**: Session history with timestamps
- **Center Chat**: Beautiful message bubbles (user=blue, AGI=gold)
- **Right Sidebar**: Live VCTT state metrics with animated progress bars

### VCTT Metrics Visualization
- **Voice** (85%) - Logical coherence
- **Choice** (72%) - Emotional balance
- **Transparency** (91%) - Clarity of reasoning
- **Trust τ** (88%) - Overall system confidence
- **Regulation Mode** - Normal/Clarify/Slow Down indicator

### Admin Mode (Password: `vctt2025`)
- Agent execution logs
- Repair loop counter (0-3 iterations)
- Force regulation modes (Normal/Clarify/Slow Down)
- Raw JSON inspector

### Real-Time Features
- Typing animations
- Smooth message transitions
- Auto-scrolling chat
- Auto-resizing text input
- Mock streaming responses

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
cd /home/ubuntu/vctt_agi_ui
vercel

# Follow prompts:
# - Set project name: vctt-agi-chat
# - Framework preset: Vite
# - Build command: yarn build
# - Output directory: dist
```

**Custom Domain:**
```bash
vercel --prod
vercel alias set <deployment-url> chat.vctt-agi.com
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd /home/ubuntu/vctt_agi_ui
netlify deploy --prod

# Build settings:
# - Build command: yarn build
# - Publish directory: dist
```

**Custom Domain:**
In Netlify dashboard: Domain Settings → Add custom domain → chat.vctt-agi.com

### Option 3: Manual Static Hosting

```bash
# Build production files
yarn build

# Deploy the 'dist' folder to any static host:
# - AWS S3 + CloudFront
# - GitHub Pages
# - Cloudflare Pages
# - Firebase Hosting
```

## 📱 Testing Locally

### Development Server
```bash
cd /home/ubuntu/vctt_agi_ui
yarn dev
```
Opens at: http://localhost:3000

### Production Preview
```bash
yarn build
yarn preview
```
Opens at: http://localhost:4173

## 🔌 Connecting Real Backend

When your NestJS backend is ready, update the API calls:

### 1. Create Real API Service

```typescript
// src/services/realApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const realApi = {
  async startSession(userId: string, input: string): Promise<string> {
    const res = await fetch(`${API_URL}/api/v1/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, input })
    });
    const data = await res.json();
    return data.session_id;
  },

  async sendStep(sessionId: string, input: string): Promise<StepResponse> {
    const res = await fetch(`${API_URL}/api/v1/session/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, input })
    });
    return res.json();
  }
};
```

### 2. Update App.tsx

```typescript
// Change line 6:
import { realApi as mockApi } from './services/realApi';
```

### 3. Set Environment Variable

```bash
# .env
VITE_API_URL=https://api.vctt-agi.com
```

## 🧪 Testing the Mock UI

### Test Conversation Flow
1. Open http://localhost:3000
2. Type: "Should we trust AI?"
3. Watch typing indicator
4. See mock response with updated VCTT state
5. Click "New Chat" to start another session

### Test Admin Mode
1. Click lock icon in right sidebar
2. Enter password: `vctt2025`
3. Send a message
4. Admin panel appears showing:
   - Agent logs
   - Repair count
   - Force regulation buttons
   - Raw JSON data

### Test Multiple Sessions
1. Start a conversation
2. Click "New Chat"
3. Start another conversation
4. Click on previous session in left sidebar
5. Verify messages persist

## 📊 Mock Data Behavior

The mock API simulates:
- 1.5 second processing time
- Random VCTT state values (realistic ranges)
- Varied responses from agent pool
- Occasional "clarify" regulation mode (10% chance)
- Repair counts 0-2 (random)

## ✨ What Peter Can Test NOW

✅ **Full UI/UX** - No backend needed
✅ **Three-panel layout** - Exactly like Grok
✅ **Message flow** - User → AGI → State updates
✅ **Admin mode** - Full debugging interface
✅ **Session management** - Multiple conversations
✅ **Responsive design** - Works on all screen sizes
✅ **Dark theme** - Professional Grok-style aesthetics

## 🔄 Next Steps (Phase 2)

1. ✅ **Backend completes** (NestJS with real agents)
2. 🔄 **Swap mockApi → realApi** (5 minute change)
3. 🔄 **Add streaming** (Server-Sent Events for real-time)
4. 🔄 **Deploy both** (Backend + Frontend)
5. 🎉 **Go live** at chat.vctt-agi.com

## 🎯 Success Criteria

✅ Beautiful Grok-style interface
✅ Three-panel layout working
✅ VCTT state visualization
✅ Admin mode with password
✅ Mock backend responses
✅ Real-time animations
✅ Session management
✅ Ready for production deployment

---

**The UI is DONE and READY! 🚀**

Peter can test the full experience right now while the backend builds.

When backend is live → 5 minute swap → Full working system.
