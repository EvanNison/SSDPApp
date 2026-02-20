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
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    let query = supabase
      .from("profiles")
      .select("id, email, full_name, role, points, created_at")
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
    }
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

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Email
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Role
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Points
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-ssdp-gray text-sm">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-ssdp-gray text-sm">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-ssdp-navy">
                    {user.full_name || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-ssdp-gray">
                    {user.email}
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ssdp-blue"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3 text-sm text-ssdp-navy font-semibold">
                    {user.points}
                  </td>
                  <td className="px-6 py-3 text-sm text-ssdp-gray">
                    {new Date(user.created_at).toLocaleDateString()}
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
