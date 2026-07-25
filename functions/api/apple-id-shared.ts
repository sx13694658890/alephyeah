const UPSTREAM = 'https://fanqiangnan.com/data_sync.php';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestGet = async () => {
  try {
    const upstream = await fetch(UPSTREAM, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'alephyeah-apple-id-proxy/1.0',
      },
    });

    if (!upstream.ok) {
      return Response.json(
        {
          success: false,
          error: `Upstream HTTP ${upstream.status}`,
        },
        { status: 502, headers: corsHeaders },
      );
    }

    const payload = await upstream.json();
    return Response.json(payload, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=30',
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
