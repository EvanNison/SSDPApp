"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Agreement {
  id: string;
  user_id: string;
  commitments: string[] | null;
  status: "submitted" | "approved" | "rejected";
  signed_at: string;
  reviewed_at: string | null;
  profile?: {
    full_name: string | null;
    email: string;
    role: string;
  };
}

export default function AmbassadorsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [filter, setFilter] = useState<"submitted" | "approved" | "rejected" | "all">("submitted");

  const fetchAgreements = async () => {
    let query = supabase
      .from("ambassador_agreements")
      .select("*, profile:profiles!ambassador_agreements_user_id_fkey(full_name, email, role)")
      .order("signed_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    if (data) setAgreements(data as Agreement[]);
  };

  useEffect(() => {
    fetchAgreements();
  }, [filter]);

  const handleApprove = async (agreement: Agreement) => {
    // Update agreement status
    await supabase
      .from("ambassador_agreements")
      .update({
        status: "approved",
        reviewer_id: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", agreement.id);

    // Upgrade user role to ambassador
    await supabase
      .from("profiles")
      .update({ role: "ambassador", updated_at: new Date().toISOString() })
      .eq("id", agreement.user_id);

    // Send notification to user
    await supabase.from("notifications").insert({
      user_id: agreement.user_id,
      title: "Ambassador Status Approved!",
      body: "Congratulations! Your ambassador application has been approved. You now have access to ambassador-only features.",
      type: "system",
    });

    fetchAgreements();
  };

  const handleReject = async (agreement: Agreement) => {
    await supabase
      .from("ambassador_agreements")
      .update({
        status: "rejected",
        reviewer_id: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", agreement.id);

    await supabase.from("notifications").insert({
      user_id: agreement.user_id,
      title: "Ambassador Application Update",
      body: "Your ambassador application needs revision. Please review the requirements and reapply.",
      type: "system",
    });

    fetchAgreements();
  };

  const statusColors: Record<string, string> = {
    submitted: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ssdp-navy mb-6">
        Ambassador Agreements
      </h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["submitted", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-ssdp-blue text-white"
                : "bg-gray-100 text-ssdp-gray hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Agreements list */}
      {agreements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-ssdp-gray">
          No {filter === "all" ? "" : filter} agreements found.
        </div>
      ) : (
        <div className="space-y-4">
          {agreements.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-ssdp-navy">
                    {a.profile?.full_name || "Unnamed User"}
                  </h3>
                  <p className="text-sm text-ssdp-gray">{a.profile?.email}</p>
                  <p className="text-xs text-ssdp-gray mt-1">
                    Current role:{" "}
                    <span className="capitalize font-medium">
                      {a.profile?.role}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      statusColors[a.status]
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              </div>

              {/* Commitments */}
              {a.commitments && a.commitments.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-ssdp-navy mb-2">
                    Commitments agreed to:
                  </p>
                  <ul className="text-sm text-ssdp-gray space-y-1">
                    {a.commitments.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-ssdp-gray">
                <span>
                  Signed: {new Date(a.signed_at).toLocaleDateString()}
                </span>
                {a.reviewed_at && (
                  <span>
                    Reviewed: {new Date(a.reviewed_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Action buttons for pending agreements */}
              {a.status === "submitted" && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleApprove(a)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Approve & Promote to Ambassador
                  </button>
                  <button
                    onClick={() => handleReject(a)}
                    className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
