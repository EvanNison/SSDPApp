"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const TAGS = ["event", "urgent", "policy", "win", "course"];

interface NewsItem {
  id: string;
  title: string;
  excerpt: string | null;
  tag: string | null;
  source: string;
  is_published: boolean;
  published_at: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formExternalUrl, setFormExternalUrl] = useState("");

  const fetchNews = async () => {
    const { data } = await supabase
      .from("news")
      .select("id, title, excerpt, tag, source, is_published, published_at")
      .order("published_at", { ascending: false })
      .limit(50);
    if (data) setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("news").insert({
      title: formTitle,
      body: formBody,
      excerpt: formBody.substring(0, 200),
      tag: formTag || null,
      external_url: formExternalUrl || null,
      source: "admin",
    });

    if (error) {
      alert("Failed to create: " + error.message);
    } else {
      setShowForm(false);
      setFormTitle("");
      setFormBody("");
      setFormTag("");
      setFormExternalUrl("");
      fetchNews();
    }
  };

  const handleWPSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync-news", { method: "POST" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Sync failed");
      fetchNews();
    } catch (err) {
      alert("WordPress sync failed. Check console for details.");
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const togglePublish = async (id: string, currentlyPublished: boolean) => {
    await supabase
      .from("news")
      .update({ is_published: !currentlyPublished })
      .eq("id", id);

    setNews((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_published: !currentlyPublished } : n
      )
    );
  };

  const tagColors: Record<string, string> = {
    event: "bg-teal-100 text-teal-700",
    urgent: "bg-red-100 text-red-700",
    policy: "bg-blue-100 text-blue-700",
    win: "bg-green-100 text-green-700",
    course: "bg-orange-100 text-orange-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ssdp-navy">News</h1>
        <div className="flex gap-3">
          <button
            onClick={handleWPSync}
            disabled={syncing}
            className="border border-ssdp-blue text-ssdp-blue px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ssdp-blue/5 disabled:opacity-50 transition-colors"
          >
            {syncing ? "Syncing..." : "Sync from WordPress"}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-ssdp-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ssdp-blue/90 transition-colors"
          >
            {showForm ? "Cancel" : "+ New Post"}
          </button>
        </div>
      </div>

      {/* New post form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Body
              </label>
              <textarea
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                  Tag
                </label>
                <select
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">No tag</option>
                  {TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                  External URL (optional)
                </label>
                <input
                  type="url"
                  value={formExternalUrl}
                  onChange={(e) => setFormExternalUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-ssdp-orange text-ssdp-navy px-6 py-2 rounded-lg text-sm font-bold"
          >
            Publish
          </button>
        </form>
      )}

      {/* News list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-6 py-8 text-center text-ssdp-gray text-sm">
              Loading...
            </div>
          ) : news.length === 0 ? (
            <div className="px-6 py-8 text-center text-ssdp-gray text-sm">
              No news yet. Create a post or sync from WordPress.
            </div>
          ) : (
            news.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-ssdp-navy">
                      {item.title}
                    </h3>
                    {item.tag && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${tagColors[item.tag] ?? "bg-gray-100 text-ssdp-gray"}`}
                      >
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ssdp-gray">
                    <span className="capitalize">{item.source}</span>
                    <span>
                      {new Date(item.published_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => togglePublish(item.id, item.is_published)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    item.is_published
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-ssdp-gray"
                  }`}
                >
                  {item.is_published ? "Published" : "Draft"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
