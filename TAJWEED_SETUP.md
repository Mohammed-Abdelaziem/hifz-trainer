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

## Cost
- Hugging Face Inference API: **Free** (1000 req/day)
- Vercel API Route: **Free** (within limits)
- **Total: $0/month**
