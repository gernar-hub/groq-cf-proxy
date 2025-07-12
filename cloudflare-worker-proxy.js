const GROQ_API_BASE = 'https://api.groq.com';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // allow only POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // get path from URL
    const url = new URL(request.url);
    const targetPath = url.pathname;

    // build target URL
    const targetUrl = `${GROQ_API_BASE}${targetPath}${url.search}`;

    // copy headers from original request
    const headers = new Headers(request.headers);

    // add/replace headers to bypass blocking
    headers.set(
      'User-Agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    headers.set('Accept', 'application/json');
    headers.set('Accept-Language', 'en-US,en;q=0.9');
    headers.set('Accept-Encoding', 'gzip, deflate, br');
    headers.set('Referer', 'https://groq.com/');
    headers.set('Origin', 'https://groq.com');

    // remove headers that might cause issues
    headers.delete('cf-ray');
    headers.delete('cf-connecting-ip');
    headers.delete('cf-ipcountry');
    headers.delete('cf-visitor');

    // stream the request body instead of loading it into memory
    const body = request.body;

    // make request to Groq API
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body, // pass the stream directly
    });

    // clone headers from GROQ response
    const responseHeaders = new Headers(response.headers);

    // add/override CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    responseHeaders.set('Access-Control-Max-Age', '86400');

    // return the response with merged headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

    return newResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// handle preflight CORS requests
addEventListener('fetch', (event) => {
  if (event.request.method === 'OPTIONS') {
    event.respondWith(handleOptions());
  }
});

function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
