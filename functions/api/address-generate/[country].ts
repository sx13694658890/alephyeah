const UPSTREAM_BASE = 'https://appark.ai/address-generate';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const ALLOWED = new Set([
  'us', 'ca', 'mx', 'jp', 'kr', 'hk', 'cn', 'sg', 'ph', 'in', 'pk', 'kz', 'ae', 'tr',
  'uk', 'de', 'fr', 'nl', 'it', 'es', 'pl', 'ru', 'br', 'ar', 'au', 'ng',
]);

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestGet = async (context: { params: { country?: string } }) => {
  const raw = String(context.params.country ?? '')
    .trim()
    .toLowerCase()
    .replace(/\.json$/i, '');

  if (!ALLOWED.has(raw)) {
    return Response.json(
      { success: false, error: `Unsupported country: ${raw}` },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const upstream = await fetch(`${UPSTREAM_BASE}/${raw}.json`, {
      headers: {
        Accept: '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
        Referer: `https://appark.ai/cn/address-generator/${raw}-address`,
        'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    });

    if (!upstream.ok) {
      return Response.json(
        { success: false, error: `Upstream HTTP ${upstream.status}` },
        { status: 502, headers: corsHeaders },
      );
    }

    const payload = await upstream.json();
    return Response.json(payload, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy fetch failed';
    return Response.json(
      { success: false, error: message },
      { status: 502, headers: corsHeaders },
    );
  }
};
