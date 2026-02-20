"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalUsers: number;
  ambassadors: number;
  coursesCompleted: number;
  pointsAwarded: number;
}

interface RecentUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    ambassadors: 0,
    coursesCompleted: 0,
    pointsAwarded: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, ambassadorsRes, completionsRes, recentRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "ambassador"),
          supabase
            .from("user_progress")
            .select("id", { count: "exact", head: true })
            .not("completed_at", "is", null),
          supabase
            .from("profiles")
            .select("id, full_name, email, role, created_at")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

      setStats({
        totalUsers: usersRes.count ?? 0,
        ambassadors: ambassadorsRes.count ?? 0,
        coursesCompleted: completionsRes.count ?? 0,
        pointsAwarded: 0,
      });

      if (recentRes.data) setRecentUsers(recentRes.data);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      color: "bg-ssdp-blue",
    },
    {
      label: "Ambassadors",
      value: stats.ambassadors,
      color: "bg-ssdp-teal",
    },
    {
      label: "Courses Completed",
      value: stats.coursesCompleted,
      color: "bg-ssdp-orange",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ssdp-navy mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} rounded-xl p-6 text-white`}
          >
            <p className="text-sm opacity-80 uppercase tracking-wide">
              {card.label}
            </p>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent signups */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-ssdp-navy">
            Recent Signups
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-ssdp-gray text-sm">
              No users yet.
            </div>
          ) : (
            recentUsers.map((user) => (
              <div
                key={user.id}
                className="px-6 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-ssdp-navy">
                    {user.full_name || "Unnamed"}
                  </p>
                  <p className="text-xs text-ssdp-gray">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-gray-100 text-ssdp-gray px-2 py-1 rounded-full capitalize">
                    {user.role}
                  </span>
                  <span className="text-xs text-ssdp-gray">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
