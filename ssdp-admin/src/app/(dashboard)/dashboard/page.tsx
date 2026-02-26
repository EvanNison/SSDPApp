"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalUsers: number;
  ambassadors: number;
  coursesCompleted: number;
  pointsAwarded: number;
  pendingAgreements: number;
  recentReports: number;
  activeAlerts: number;
}

interface ActiveAlert {
  id: string;
  title: string;
  bill_number: string | null;
  points_reward: number;
  created_at: string;
  response_count?: number;
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
    pendingAgreements: 0,
    recentReports: 0,
    activeAlerts: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, ambassadorsRes, completionsRes, pointsRes, pendingRes, reportsRes, recentRes, activeAlertsRes] =
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
            .from("points_log")
            .select("points"),
          supabase
            .from("ambassador_agreements")
            .select("id", { count: "exact", head: true })
            .eq("status", "submitted"),
          supabase
            .from("activity_reports")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("profiles")
            .select("id, full_name, email, role, created_at")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("action_alerts")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),
        ]);

      const totalPoints = (pointsRes.data ?? []).reduce(
        (sum: number, row: { points: number }) => sum + row.points,
        0
      );

      setStats({
        totalUsers: usersRes.count ?? 0,
        ambassadors: ambassadorsRes.count ?? 0,
        coursesCompleted: completionsRes.count ?? 0,
        pointsAwarded: totalPoints,
        pendingAgreements: pendingRes.count ?? 0,
        recentReports: reportsRes.count ?? 0,
        activeAlerts: activeAlertsRes.count ?? 0,
      });

      // Fetch active alerts with response counts
      const { data: alertsData } = await supabase
        .from("action_alerts")
        .select("id, title, bill_number, points_reward, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (alertsData) {
        const alertsWithCounts = await Promise.all(
          alertsData.map(async (alert) => {
            const { count } = await supabase
              .from("alert_responses")
              .select("*", { count: "exact", head: true })
              .eq("alert_id", alert.id);
            return { ...alert, response_count: count ?? 0 };
          })
        );
        setActiveAlerts(alertsWithCounts);
      }

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
    {
      label: "Points Awarded",
      value: stats.pointsAwarded.toLocaleString(),
      color: "bg-ssdp-navy",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ssdp-navy mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

      {/* Action items */}
      {stats.pendingAgreements > 0 && (
        <Link
          href="/ambassadors"
          className="block bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 hover:bg-yellow-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎖️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800">
                {stats.pendingAgreements} pending ambassador agreement{stats.pendingAgreements !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-yellow-600">
                Click to review and approve
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-ssdp-gray uppercase tracking-wide mb-1">Activity Reports</p>
          <p className="text-2xl font-bold text-ssdp-navy">{stats.recentReports}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-ssdp-gray uppercase tracking-wide mb-1">Pending Approvals</p>
          <p className="text-2xl font-bold text-ssdp-navy">{stats.pendingAgreements}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-ssdp-gray uppercase tracking-wide mb-1">Active Alerts</p>
          <p className="text-2xl font-bold text-ssdp-navy">{stats.activeAlerts}</p>
        </div>
      </div>

      {/* Active action alerts */}
      {activeAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ssdp-navy">Active Action Alerts</h2>
            <Link href="/alerts" className="text-sm text-ssdp-blue hover:underline">Manage →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ssdp-navy">{alert.title}</p>
                  {alert.bill_number && (
                    <p className="text-xs text-ssdp-gray mt-0.5">{alert.bill_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-ssdp-blue">{alert.response_count}</p>
                    <p className="text-xs text-ssdp-gray">responses</p>
                  </div>
                  <span className="text-xs text-ssdp-orange font-medium">+{alert.points_reward} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
