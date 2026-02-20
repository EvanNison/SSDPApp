import { config } from '@/constants/config';

interface WPPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

export interface ParsedPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  link: string;
  imageUrl: string | null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

export async function fetchLatestPosts(count = 10): Promise<ParsedPost[]> {
  const url = `${config.wpApiBase}/posts?per_page=${count}&_embed=wp:featuredmedia`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status}`);
  }

  const posts: WPPost[] = await response.json();

  return posts.map((post) => ({
    id: post.id,
    title: stripHtml(post.title.rendered),
    excerpt: stripHtml(post.excerpt.rendered),
    date: post.date,
    link: post.link,
    imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
  }));
}
