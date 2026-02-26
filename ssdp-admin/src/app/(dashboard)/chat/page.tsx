"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ChatChannel {
  id: string;
  name: string;
  description: string | null;
  required_role: string;
  is_chapter_channel: boolean;
  chapter_id: string | null;
  sort_order: number;
  created_at: string;
}

const ROLES = [
  "guest",
  "registered",
  "ambassador",
  "committee_member",
  "committee_chair",
  "board",
  "staff",
  "admin",
];

export default function ChatChannelsPage() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ChatChannel | null>(
    null
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requiredRole, setRequiredRole] = useState("registered");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchChannels = async () => {
    const { data } = await supabase
      .from("chat_channels")
      .select("*")
      .order("sort_order");
    if (data) setChannels(data);
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setRequiredRole("registered");
    setSortOrder(channels.length + 1);
    setEditingChannel(null);
    setShowForm(false);
  };

  const openEditForm = (channel: ChatChannel) => {
    setName(channel.name);
    setDescription(channel.description ?? "");
    setRequiredRole(channel.required_role);
    setSortOrder(channel.sort_order);
    setEditingChannel(channel);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      required_role: requiredRole,
      sort_order: sortOrder,
    };

    if (editingChannel) {
      await supabase
        .from("chat_channels")
        .update(payload)
        .eq("id", editingChannel.id);
    } else {
      await supabase.from("chat_channels").insert(payload);
    }

    setSaving(false);
    resetForm();
    fetchChannels();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this channel? All messages in it will be lost."))
      return;
    await supabase.from("chat_channels").delete().eq("id", id);
    fetchChannels();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ssdp-navy">Chat Channels</h1>
        <button
          onClick={() => {
            resetForm();
            setSortOrder(channels.length + 1);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-ssdp-blue text-white rounded-lg text-sm font-medium hover:bg-ssdp-navy transition-colors"
        >
          + New Channel
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-ssdp-navy mb-4">
            {editingChannel ? "Edit Channel" : "Create Channel"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ssdp-blue focus:border-transparent"
                placeholder="Channel name..."
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-ssdp-navy mb-1">
                  Required Role
                </label>
                <select
                  value={requiredRole}
                  onChange={(e) => setRequiredRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-ssdp-navy mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-ssdp-navy mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ssdp-blue focus:border-transparent"
              placeholder="Brief description..."
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving || !name.trim()}
              className="px-6 py-2 bg-ssdp-blue text-white rounded-lg text-sm font-medium hover:bg-ssdp-navy transition-colors disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingChannel
                  ? "Save Changes"
                  : "Create Channel"}
            </button>
            <button
              onClick={resetForm}
              className="text-ssdp-gray text-sm hover:text-ssdp-navy"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Channels table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-medium text-ssdp-gray uppercase">
                Channel
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-ssdp-gray uppercase">
                Required Role
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-ssdp-gray uppercase">
                Order
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-ssdp-gray uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {channels.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-ssdp-gray"
                >
                  No chat channels yet. Create one to enable the Chat tab.
                </td>
              </tr>
            ) : (
              channels.map((ch) => (
                <tr key={ch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <p className="font-medium text-ssdp-navy">{ch.name}</p>
                    {ch.description && (
                      <p className="text-xs text-ssdp-gray mt-0.5">
                        {ch.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">
                      {ch.required_role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-ssdp-gray">{ch.sort_order}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(ch)}
                        className="text-ssdp-blue hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ch.id)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
