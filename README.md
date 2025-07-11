# Cloudflare Worker Setup for Groq API Proxy

## Step 1: Create a Worker

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com)
2. Sign in to your Cloudflare account (or create a new one)
3. Click "Create a Worker"
4. Give your Worker a name (e.g., `groq-proxy`)

## Step 2: Deploy the Code

1. Copy the code from `cloudflare-worker-proxy.js` file
2. Paste it into the Worker editor
3. Click "Save and Deploy"

## Step 3: Get the URL

After deployment, you'll get a URL like:

```
https://groq-proxy.your-subdomain.workers.dev
```

## Implementation Features

### Supported Methods

- ✅ **POST** - for all Groq API requests
- ❌ **GET, PUT, DELETE** - blocked for security

### Headers for Bypassing Restrictions

Worker automatically adds headers that mimic browser requests:

- `User-Agent` - Chrome on Windows
- `Referer` and `Origin` - groq.com
- `Accept-*` headers for proper content type

### CORS Support

- Preflight OPTIONS request support
- Headers configured for any domain access
- Maximum CORS cache time: 24 hours

### Error Handling

- Detailed error logging to Cloudflare console
- Structured JSON error responses
- Preserves HTTP status codes from Groq API

## Cloudflare Worker Benefits:

✅ **Geo-blocking bypass** - Worker runs from Cloudflare data centers worldwide
✅ **Fast performance** - Low latency thanks to Edge Computing
✅ **Free tier** - Up to 100,000 requests per day for free
✅ **Reliability** - Cloudflare infrastructure
✅ **CORS support** - Configured for browser compatibility
✅ **Transparent proxying** - Preserves all request and response parameters

## Security

- Worker accepts only POST requests
- Requires Authorization header with Groq API key
- Automatically removes Cloudflare service headers
- Proxies only requests to api.groq.com

## Limits

- **Free plan**: 100,000 requests/day
- **Execution time**: up to 10 seconds per request
- **Response size**: up to 128 MB
- **Supported paths**: any Groq API paths

## Usage

After deployment, use the Worker URL instead of direct Groq API calls:

### Regular fetch request

```javascript
// Instead of: https://api.groq.com/v1/chat/completions
// Use: https://your-worker.workers.dev/v1/chat/completions

const response = await fetch(
  "https://your-worker.workers.dev/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer your-groq-api-key",
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: "Hello!" }],
    }),
  }
);
```

### Using with groq-sdk

```typescript
import Groq from "groq-sdk";

// Create client with baseURL pointing to your Worker
const groq = new Groq({
  apiKey: "your-groq-api-key",
  baseURL: "https://your-worker.workers.dev", // instead of default API
});

// Use as usual
const chatCompletion = await groq.chat.completions.create({
  messages: [{ role: "user", content: "Hello, how are you?" }],
  model: "mixtral-8x7b-32768",
});

console.log(chatCompletion.choices[0]?.message?.content);
```

### Node.js example

```typescript
// npm install groq-sdk
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://groq-proxy.your-subdomain.workers.dev",
});

async function main() {
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: "Explain quantum computing" }],
    model: "llama-3.1-70b-versatile",
    temperature: 0.7,
    max_tokens: 1000,
  });

  console.log(completion.choices[0]?.message?.content);
}

main().catch(console.error);
```
