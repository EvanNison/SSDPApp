"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Report {
  id: string;
  user_id: string;
  report_type: string;
  contact_name: string | null;
  summary: string | null;
  points_earned: number;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string;
  };
}

const TYPE_LABELS: Record<string, string> = {
  lobby_meeting: "Lobby Meeting",
  campus_event: "Campus Event",
  community_outreach: "Community Outreach",
  media_engagement: "Media Engagement",
  other: "Other Activity",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const { data } = await supabase
        .from("activity_reports")
        .select(
          "*, profile:profiles!activity_reports_user_id_fkey(full_name, email)"
        )
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setReports(data as Report[]);
    };
    fetchReports();
  }, []);

  const typeColors: Record<string, string> = {
    lobby_meeting: "bg-blue-100 text-blue-700",
    campus_event: "bg-green-100 text-green-700",
    community_outreach: "bg-purple-100 text-purple-700",
    media_engagement: "bg-yellow-100 text-yellow-700",
    other: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ssdp-navy mb-6">
        Activity Reports
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ssdp-navy">
            All Reports
          </h2>
          <span className="text-sm text-ssdp-gray">
            {reports.length} report{reports.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {reports.length === 0 ? (
            <div className="px-6 py-8 text-center text-ssdp-gray text-sm">
              No activity reports submitted yet.
            </div>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="px-6 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-ssdp-navy">
                      {r.profile?.full_name || "Unknown User"}
                    </p>
                    <p className="text-xs text-ssdp-gray">
                      {r.profile?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        typeColors[r.report_type] || typeColors.other
                      }`}
                    >
                      {TYPE_LABELS[r.report_type] || r.report_type}
                    </span>
                    <span className="text-xs text-ssdp-orange font-medium">
                      +{r.points_earned} pts
                    </span>
                  </div>
                </div>
                {r.contact_name && (
                  <p className="text-xs text-ssdp-gray mb-1">
                    Contact: {r.contact_name}
                  </p>
                )}
                {r.summary && (
                  <p className="text-sm text-ssdp-gray">{r.summary}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(r.created_at).toLocaleDateString()} at{" "}
                  {new Date(r.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
