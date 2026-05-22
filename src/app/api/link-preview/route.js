// app/api/link-preview/route.js  (App Router)
import { NextResponse } from "next/server";
 
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
 
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
 
  try {
    const res  = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
 
    const get = (pattern) => {
      const m = html.match(pattern);
      return m ? m[1].replace(/&amp;/g,"&").replace(/&quot;/g,'"').trim() : null;
    };
 
    const title       = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
                     ?? get(/<title[^>]*>([^<]+)<\/title>/i);
    const description = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
                     ?? get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const image       = get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
 
    return NextResponse.json({ title, description, image, url });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}