# AI Assistant Setup Guide

## Current Issue: Gemini API Rate Limit

The AI chatbot is showing an error because the Gemini API key has a quota of 0 requests per minute. This needs to be fixed in Google AI Studio.

## How to Fix

### Option 1: Get a New Free API Key (Recommended)

1. **Visit Google AI Studio**
   - Go to: https://aistudio.google.com/app/apikey

2. **Create a New API Key**
   - Click "Get API Key" or "Create API Key"
   - Select "Create API key in new project" (or use existing project)
   - Copy the new API key

3. **Update Your Environment File**
   - Open `.env.local` in your project
   - Replace the current `GEMINI_API_KEY` value with your new key:
   ```bash
   GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   ```

4. **Restart the Development Server**
   ```bash
   npm run dev
   ```

### Option 2: Enable the API in Google Cloud Console

If you want to use the existing key:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (ID: 75445399141)

2. **Enable Generative Language API**
   - Go to "APIs & Services" → "Library"
   - Search for "Generative Language API"
   - Click "Enable"

3. **Check Quotas**
   - Go to "APIs & Services" → "Quotas"
   - Search for "Generative Language API"
   - Check if quotas are enabled (should show requests per minute > 0)

4. **Restart the Development Server**
   ```bash
   npm run dev
   ```

## Testing the AI Assistant

Once fixed, you should be able to:

1. Click the floating chat button (bottom-right corner)
2. Ask questions like:
   - "What's trending in the market?"
   - "Tell me about AAPL stock"
   - "Should I invest in tech stocks?"
   - "Explain my dashboard"

## Features

- **Context-Aware**: The AI knows about your dashboard widgets
- **Real-time Responses**: Fast answers powered by Gemini 1.5 Flash
- **Smart Conversations**: Maintains chat history for context
- **Financial Expertise**: Specializes in stock market and investment questions

## Current Implementation

- **Model**: `gemini-1.5-flash` (faster, more cost-effective than gemini-pro)
- **Error Handling**: Shows user-friendly messages for rate limits and API errors
- **Safety**: Content filtering enabled to prevent harmful responses
- **Context**: Sends your dashboard widget list for personalized insights

## Error Messages You Might See

- **⚠️ The AI service is currently at capacity**: API rate limit reached (wait 60 seconds)
- **⚠️ API key configuration issue**: The API key needs to be activated
- **⚠️ Quota exceeded**: Your free tier quota is exhausted (get a new key or upgrade)

## Troubleshooting

**If the chatbot still doesn't work after fixing the API key:**

1. Check browser console (F12) for JavaScript errors
2. Check server terminal for API errors
3. Verify the API key is correctly set in `.env.local`
4. Make sure the key has no extra spaces or quotes
5. Restart the dev server completely

## Alternative: Remove AI Assistant

If you prefer not to use the AI feature:

1. Open `src/app/layout.tsx`
2. Remove or comment out the `<AIAssistant />` component
3. The floating chat button will disappear

## Cost Information

- **Free Tier**: Google Gemini offers generous free quotas
- **Paid Tier**: Very affordable if you need more requests
- **Current Model**: `gemini-1.5-flash` is optimized for cost-efficiency

## Need Help?

If you continue to have issues:
1. Check the terminal output for detailed error messages
2. Visit Google AI Studio docs: https://ai.google.dev/docs
3. Ensure your Google Cloud project has billing enabled (if required)
