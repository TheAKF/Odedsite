// Cloudflare Pages Function: GET /api/videos (same output as netlify/functions/videos.mjs)
import { parseFeed } from '../../netlify/functions/videos.mjs';

const FEED = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCufkmjBPLurietiKoj9cG3w';

export async function onRequestGet() {
  try {
    const res = await fetch(FEED, { headers: { 'User-Agent': 'Mozilla/5.0 (odedsvr.com)' }, cf: { cacheTtl: 900 } });
    if (!res.ok) throw new Error('feed ' + res.status);
    const videos = parseFeed(await res.text());
    if (!videos.length) throw new Error('empty feed');
    return Response.json({ updated: new Date().toISOString(), videos }, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600' },
    });
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
