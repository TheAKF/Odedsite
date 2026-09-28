// GET /api/videos -> the channel's 10 latest regular uploads (no Shorts), read from YouTube's public RSS feed.
// No API key needed. Response is cached at the edge for 15 minutes.
const CHANNEL_ID = 'UCufkmjBPLurietiKoj9cG3w';
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const LIMIT = 10;

const decode = s => s
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const pick = (xml, re) => (xml.match(re) || [])[1] || '';

export function parseFeed(xml) {
  return xml.split('<entry>').slice(1).map(e => ({
    id: pick(e, /<yt:videoId>([\w-]{11})<\/yt:videoId>/),
    title: decode(pick(e, /<title>([\s\S]*?)<\/title>/)),
    published: pick(e, /<published>([^<]+)<\/published>/),
    views: Number(pick(e, /<media:statistics views="(\d+)"/)) || 0,
    short: /<link rel="alternate" href="https:\/\/www\.youtube\.com\/shorts\//.test(e),
  }))
    .filter(v => v.id && v.title && !v.short)
    .slice(0, LIMIT)
    .map(({ short, ...v }) => v);
}

export default async () => {
  try {
    const res = await fetch(FEED, { headers: { 'User-Agent': 'Mozilla/5.0 (odedsvr.com)' } });
    if (!res.ok) throw new Error('feed ' + res.status);
    const videos = parseFeed(await res.text());
    if (!videos.length) throw new Error('empty feed');
    return Response.json({ updated: new Date().toISOString(), videos }, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600' },
    });
  } catch (err) {
    return Response.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
};

export const config = { path: '/api/videos' };
