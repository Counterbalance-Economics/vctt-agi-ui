
# VCTT-AGI Chat UI

Beautiful Grok-style chat interface for the VCTT-AGI Coherence Kernel.

## Features

✅ **Three-Panel Layout**
- Left: Session history with timestamps
- Center: Real-time chat interface
- Right: Live VCTT state metrics

✅ **Real-Time Features**
- Typing animations
- Smooth message transitions
- Auto-scrolling chat
- Streaming responses (mock)

✅ **VCTT State Visualization**
- Voice (logical coherence)
- Choice (emotional balance)
- Transparency (reasoning clarity)
- Trust τ (system confidence)
- Regulation mode indicator

✅ **Admin Mode** (Password: `vctt2025`)
- Agent execution logs
- Repair loop counter
- Force regulation modes
- Raw JSON inspector

## Quick Start

### Development
```bash
yarn dev
```
Opens at http://localhost:3000

### Build for Production
```bash
yarn build
```

### Preview Production Build
```bash
yarn preview
```

## Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/
│   ├── LeftSidebar.tsx      # Session history
│   ├── ChatPanel.tsx         # Main chat interface
│   ├── RightSidebar.tsx      # VCTT state display
│   └── AdminPanel.tsx        # Admin overlay
├── services/
│   └── mockApi.ts            # Mock backend (replace with real API)
├── types.ts                  # TypeScript interfaces
├── App.tsx                   # Main app component
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## Connecting to Real Backend

Replace `src/services/mockApi.ts` with real API calls:

```typescript
// src/services/realApi.ts
const API_URL = process.env.VITE_API_URL || 'http://localhost:8000';

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

Then update `src/App.tsx`:
```typescript
import { realApi } from './services/realApi';
// Replace mockApi with realApi
```

## Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:8000
```

## Phase 1 vs Phase 2

**Phase 1 (Current):**
- ✅ Mock backend responses
- ✅ Full UI functionality
- ✅ Admin mode
- ✅ State visualization

**Phase 2 (After backend is live):**
- 🔄 Real API integration
- 🔄 Server-sent events for streaming
- 🔄 Persistent sessions
- 🔄 Error handling & retries

## License

MIT © 2025 VCTT-AGI
# Phase 2 Deployment - Tue Nov 18 02:24:22 UTC 2025
