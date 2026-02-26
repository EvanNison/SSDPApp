import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch(
      "https://ssdp.org/wp-json/wp/v2/posts?per_page=10&_embed=wp:featuredmedia",
      { next: { revalidate: 0 } }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "WordPress API returned " + response.status },
        { status: 502 }
      );
    }

    const posts = await response.json();
    let synced = 0;
    const errors: string[] = [];

    for (const post of posts) {
      const title = post.title.rendered.replace(/<[^>]*>/g, "");
      const excerpt = post.excerpt.rendered.replace(/<[^>]*>/g, "").trim();
      const imageUrl =
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;

      const { error } = await supabaseAdmin.from("news").upsert(
        {
          title,
          excerpt,
          image_url: imageUrl,
          external_url: post.link,
          source: "wordpress",
          wp_post_id: post.id,
          published_at: post.date,
          is_published: true,
        },
        { onConflict: "wp_post_id" }
      );

      if (error) {
        errors.push(`${post.id}: ${error.message}`);
      } else {
        synced++;
      }
    }

    return NextResponse.json({ synced, total: posts.length, errors: errors.length > 0 ? errors : undefined });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Sync failed" },
      { status: 500 }
    );
  }
}
