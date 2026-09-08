# Free Setup Guide — Tajweed Checker

## Step 1: Get Free Hugging Face Token
1. Go to https://huggingface.co/settings/tokens
2. Create token (free, no credit card)
3. Copy the token

## Step 2: Add to Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - Name: `HF_API_KEY`
   - Value: `hf_xxxxxxxxxxxxx`
3. Redeploy

## Step 3: Use in Your App
```tsx
import { TajweedRecorder } from "@/components/reader/TajweedRecorder";

<TajweedRecorder verseKey="1:1" />
```

## How It Works
- Audio recorded in browser → sent to your API route → calls Whisper on HF Inference API → returns transcription + tajweed analysis
- **No server to host**
- **No credit card required**
- **1000 requests/day free**

## Troubleshooting

### "Microphone access denied"
- Click the lock icon in the browser address bar
- Set Microphone to "Allow"
- Refresh the page

### "Model is loading. Please try again in 30 seconds."
- First request after idle takes 20-30s (cold start)
- Try again after 30 seconds
- Subsequent requests are fast

### "Request timed out"
- Model is cold-starting (first request)
- Try again — should work on second attempt

### Score is always low for non-Arabic speakers
- The checker compares your transcription against the reference text
- If you're learning, focus on the "Your Recitation" section to see what Whisper heard
- Score will improve as your pronunciation improves

### "HF_API_KEY not set"
- Make sure you added the env var in Vercel
- Redeploy after adding the variable

## Cost
- Hugging Face Inference API: **Free** (1000 req/day)
- Vercel API Route: **Free** (within limits)
- **Total: $0/month**
