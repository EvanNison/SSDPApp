"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type NotificationType = "urgent" | "course" | "event" | "points" | "system";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<NotificationType>("system");
  const [targetRole, setTargetRole] = useState("all");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const fetchRecent = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const [pushResult, setPushResult] = useState("");

  const handleSend = async () => {
    if (!title.trim()) return;
    setSending(true);
    setSent(false);
    setPushResult("");

    try {
      // Send via push API (also creates in-app notifications)
      const res = await fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim() || null,
          type,
          targetRole,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setPushResult(
        `Sent to ${result.inApp ?? 0} users in-app, ${result.pushed ?? 0} push notifications`
      );
      setTitle("");
      setBody("");
      setSent(true);
      fetchRecent();
    } catch (err: any) {
      alert("Failed to send: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const typeColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-700",
    course: "bg-blue-100 text-blue-700",
    event: "bg-teal-100 text-teal-700",
    points: "bg-yellow-100 text-yellow-700",
    system: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ssdp-navy mb-6">Notifications</h1>

      {/* Compose form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-ssdp-navy mb-4">
          Send Notification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-ssdp-navy mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ssdp-blue focus:border-transparent"
              placeholder="Notification title..."
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="system">System</option>
                <option value="urgent">Urgent</option>
                <option value="event">Event</option>
                <option value="course">Course</option>
                <option value="points">Points</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Send to
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Users</option>
                <option value="registered">Registered</option>
                <option value="ambassador">Ambassadors</option>
                <option value="staff">Staff</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-ssdp-navy mb-1">
            Body (optional)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ssdp-blue focus:border-transparent"
            placeholder="Additional details..."
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSend}
            disabled={sending || !title.trim()}
            className="px-6 py-2 bg-ssdp-blue text-white rounded-lg text-sm font-medium hover:bg-ssdp-navy transition-colors disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Notification"}
          </button>
          {sent && (
            <span className="text-green-600 text-sm">
              {pushResult || "Sent successfully!"}
            </span>
          )}
        </div>
      </div>

      {/* Recent notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-ssdp-navy">
            Recent Notifications
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <div className="px-6 py-8 text-center text-ssdp-gray text-sm">
              No notifications sent yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="px-6 py-3 flex items-center gap-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    typeColors[n.type] || typeColors.system
                  }`}
                >
                  {n.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ssdp-navy truncate">
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-ssdp-gray truncate">{n.body}</p>
                  )}
                </div>
                <span className="text-xs text-ssdp-gray whitespace-nowrap">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
