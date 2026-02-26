"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  points: number;
  chapter_id: string | null;
  bio: string | null;
  created_at: string;
}

interface UserProgress {
  id: string;
  course_id: string;
  current_module: number;
  completed_at: string | null;
  points_earned: number;
  course?: { title: string } | { title: string }[];
}

interface PointsEntry {
  id: string;
  points: number;
  reason: string;
  created_at: string;
}

interface Chapter {
  id: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [pointsLog, setPointsLog] = useState<PointsEntry[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const fetchUsers = async () => {
    let query = supabase
      .from("profiles")
      .select("id, email, full_name, role, points, chapter_id, bio, created_at")
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data } = await query.limit(100);
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    supabase
      .from("chapters")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data) setChapters(data);
      });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      alert("Failed to update role: " + error.message);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, role: newRole } : null);
      }
    }
  };

  const handleChapterChange = async (userId: string, chapterId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        chapter_id: chapterId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      alert("Failed to update chapter: " + error.message);
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, chapter_id: chapterId || null } : u
        )
      );
    }
  };

  const viewUserDetail = async (user: User) => {
    setSelectedUser(user);

    // Fetch progress
    const { data: progress } = await supabase
      .from("user_progress")
      .select("id, course_id, current_module, completed_at, points_earned, course:courses!user_progress_course_id_fkey(title)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });
    setUserProgress((progress as UserProgress[]) ?? []);

    // Fetch points
    const { data: points } = await supabase
      .from("points_log")
      .select("id, points, reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setPointsLog(points ?? []);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ssdp-navy">Users</h1>
        <span className="text-sm text-ssdp-gray">
          {users.length} user{users.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ssdp-blue focus:border-transparent"
        />
      </div>

      <div className="flex gap-6">
        {/* Users table */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${selectedUser ? "flex-1" : "w-full"}`}>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                  Pts
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-ssdp-gray text-sm"
                  >
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-ssdp-gray text-sm"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedUser?.id === user.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => viewUserDetail(user)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-ssdp-navy">
                      {user.full_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-ssdp-gray">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRoleChange(user.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ssdp-blue"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-ssdp-navy font-semibold">
                      {user.points}
                    </td>
                    <td className="px-4 py-3 text-xs text-ssdp-gray">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* User detail panel */}
        {selectedUser && (
          <div className="w-96 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-ssdp-navy">
                  {selectedUser.full_name || "Unnamed"}
                </h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-ssdp-gray hover:text-ssdp-navy text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ssdp-gray">Email</span>
                  <span className="text-ssdp-navy">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ssdp-gray">Role</span>
                  <span className="text-ssdp-navy capitalize">
                    {selectedUser.role.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ssdp-gray">Points</span>
                  <span className="text-ssdp-navy font-semibold">
                    {selectedUser.points}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ssdp-gray">Chapter</span>
                  <select
                    value={selectedUser.chapter_id || ""}
                    onChange={(e) =>
                      handleChapterChange(selectedUser.id, e.target.value)
                    }
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">None</option>
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between">
                  <span className="text-ssdp-gray">Joined</span>
                  <span className="text-ssdp-navy">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </span>
                </div>
                {selectedUser.bio && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-ssdp-gray text-xs">Bio</span>
                    <p className="text-ssdp-navy text-sm mt-1">
                      {selectedUser.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-ssdp-navy mb-3">
                Course Progress
              </h3>
              {userProgress.length === 0 ? (
                <p className="text-xs text-ssdp-gray">No courses started.</p>
              ) : (
                <div className="space-y-2">
                  {userProgress.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-ssdp-navy font-medium truncate flex-1 mr-2">
                        {Array.isArray(p.course)
                          ? p.course[0]?.title ?? "Unknown"
                          : p.course?.title ?? "Unknown"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium ${
                          p.completed_at
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.completed_at ? "Completed" : `Module ${p.current_module}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Points History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-ssdp-navy mb-3">
                Points History
              </h3>
              {pointsLog.length === 0 ? (
                <p className="text-xs text-ssdp-gray">No points earned yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pointsLog.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-2 text-xs">
                      <span className="text-ssdp-orange font-semibold whitespace-nowrap">
                        +{entry.points}
                      </span>
                      <span className="text-ssdp-gray flex-1">
                        {entry.reason}
                      </span>
                      <span className="text-gray-400 whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
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
