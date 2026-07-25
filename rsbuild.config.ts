import { mergeRsbuildConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import rsConfig from './config';

const ADDRESS_GENERATE_ALLOWED = new Set([
  'us', 'ca', 'mx', 'jp', 'kr', 'hk', 'cn', 'sg', 'ph', 'in', 'pk', 'kz', 'ae', 'tr',
  'uk', 'de', 'fr', 'nl', 'it', 'es', 'pl', 'ru', 'br', 'ar', 'au', 'ng',
]);

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36';

/** http-proxy 会被 Appark 的 CF 拦截；开发态用 Node fetch 对齐浏览器请求头 */
async function handleAddressGenerateDev(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
) {
  const url = req.url ?? '';
  const match = url.match(/^\/api\/address-generate\/([^/?#]+)/);
  if (!match || (req.method && req.method !== 'GET' && req.method !== 'HEAD')) {
    next();
    return;
  }

  const slug = match[1].replace(/\.json$/i, '').toLowerCase();
  if (!ADDRESS_GENERATE_ALLOWED.has(slug)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ success: false, error: `Unsupported country: ${slug}` }));
    return;
  }

  try {
    const upstream = await fetch(`https://appark.ai/address-generate/${slug}.json`, {
      headers: {
        Accept: '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Referer: `https://appark.ai/cn/address-generator/${slug}-address`,
        'User-Agent': BROWSER_UA,
        'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    });

    if (!upstream.ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, error: `Upstream HTTP ${upstream.status}` }));
      return;
    }

    const body = await upstream.text();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy fetch failed';
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ success: false, error: message }));
  }
}

export default async () =>
  mergeRsbuildConfig(
    await rsConfig({
      framework: 'react',
      plugins: [pluginReact()],
      appName: 'AlephYeah',
      port: 3076,
      proxy: {
        '/api/apple-id-shared': {
          target: 'https://fanqiangnan.com',
          changeOrigin: true,
          pathRewrite: {
            '^/api/apple-id-shared': '/data_sync.php',
          },
        },
        '/api': {
          target: 'http://localhost:3000',
        },
      },
    }),
    {
      source: {
        entry: {
          index: './src/index.tsx',
        },
      },
      dev: {
        setupMiddlewares: [
          (middlewares) => {
            middlewares.unshift(handleAddressGenerateDev);
          },
        ],
      },
      tools: {
        rspack: {
          module: {
            rules: [
              {
                test: /\.md$/,
                type: 'asset/source',
              },
              {
                test: /\.glsl$/,
                type: 'asset/source',
              },
            ],
          },
        },
      },
      html: {
        tags: [
          {
            tag: 'link',
            attrs: {
              rel: 'preconnect',
              href: 'https://fonts.googleapis.com',
            },
          },
          {
            tag: 'link',
            attrs: {
              rel: 'preconnect',
              href: 'https://fonts.gstatic.com',
              crossorigin: '',
            },
          },
          {
            tag: 'link',
            attrs: {
              rel: 'stylesheet',
              href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
            },
          },
        ],
      },
    },
  );
