"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Chapter {
  id: string;
  name: string;
  university: string | null;
  city: string | null;
  state: string | null;
  total_points: number;
  is_active: boolean;
}

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [members, setMembers] = useState<{ id: string; full_name: string | null; email: string; role: string; points: number }[]>([]);

  const [formName, setFormName] = useState("");
  const [formUniversity, setFormUniversity] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");

  const fetchChapters = async () => {
    const { data } = await supabase
      .from("chapters")
      .select("id, name, university, city, state, total_points, is_active")
      .order("name");
    if (data) setChapters(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("chapters").insert({
      name: formName,
      university: formUniversity || null,
      city: formCity || null,
      state: formState || null,
    });

    if (error) {
      alert("Failed to create: " + error.message);
    } else {
      setShowForm(false);
      setFormName("");
      setFormUniversity("");
      setFormCity("");
      setFormState("");
      fetchChapters();
    }
  };

  const toggleActive = async (id: string, currentlyActive: boolean) => {
    await supabase
      .from("chapters")
      .update({ is_active: !currentlyActive })
      .eq("id", id);
    setChapters((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, is_active: !currentlyActive } : c
      )
    );
  };

  const viewChapterDetail = async (chapter: Chapter) => {
    setSelectedChapter(chapter);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, points")
      .eq("chapter_id", chapter.id)
      .order("points", { ascending: false });
    setMembers(data ?? []);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ssdp-navy">Chapters</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-ssdp-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ssdp-blue/90 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Chapter"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Chapter Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                University
              </label>
              <input
                type="text"
                value={formUniversity}
                onChange={(e) => setFormUniversity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                City
              </label>
              <input
                type="text"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                State
              </label>
              <input
                type="text"
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-ssdp-orange text-ssdp-navy px-6 py-2 rounded-lg text-sm font-bold"
          >
            Create Chapter
          </button>
        </form>
      )}

      <div className="flex gap-6">
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${selectedChapter ? 'flex-1' : 'w-full'}`}>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                University
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Location
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Points
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-ssdp-gray text-sm"
                >
                  Loading...
                </td>
              </tr>
            ) : chapters.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-ssdp-gray text-sm"
                >
                  No chapters yet.
                </td>
              </tr>
            ) : (
              chapters.map((ch) => (
                <tr key={ch.id} className={`hover:bg-gray-50 cursor-pointer ${selectedChapter?.id === ch.id ? 'bg-blue-50' : ''}`} onClick={() => viewChapterDetail(ch)}>
                  <td className="px-6 py-3 text-sm font-medium text-ssdp-navy">
                    {ch.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-ssdp-gray">
                    {ch.university || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-ssdp-gray">
                    {[ch.city, ch.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-ssdp-navy">
                    {ch.total_points}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(ch.id, ch.is_active); }}
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        ch.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-ssdp-gray"
                      }`}
                    >
                      {ch.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedChapter && (
        <div className="w-96 space-y-4">
          {/* Chapter info card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ssdp-navy">{selectedChapter.name}</h2>
              <button onClick={() => setSelectedChapter(null)} className="text-ssdp-gray hover:text-ssdp-navy text-sm">&#x2715;</button>
            </div>
            <div className="space-y-2 text-sm">
              {selectedChapter.university && (
                <div className="flex justify-between">
                  <span className="text-ssdp-gray">University</span>
                  <span className="text-ssdp-navy">{selectedChapter.university}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ssdp-gray">Location</span>
                <span className="text-ssdp-navy">{[selectedChapter.city, selectedChapter.state].filter(Boolean).join(', ') || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ssdp-gray">Total Points</span>
                <span className="text-ssdp-navy font-semibold">{selectedChapter.total_points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ssdp-gray">Members</span>
                <span className="text-ssdp-navy font-semibold">{members.length}</span>
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-ssdp-navy mb-3">Members</h3>
            {members.length === 0 ? (
              <p className="text-xs text-ssdp-gray">No members in this chapter.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm py-1">
                    <div>
                      <p className="text-ssdp-navy font-medium text-sm">{m.full_name || 'Unnamed'}</p>
                      <p className="text-ssdp-gray text-xs">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-ssdp-gray px-2 py-0.5 rounded-full capitalize">{m.role.replace('_', ' ')}</span>
                      <span className="text-xs font-semibold text-ssdp-navy">{m.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
