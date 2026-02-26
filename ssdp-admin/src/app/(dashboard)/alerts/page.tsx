"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ActionAlert {
  id: string;
  title: string;
  description: string | null;
  bill_number: string | null;
  call_to_action: string | null;
  target_contact: string | null;
  points_reward: number;
  is_active: boolean;
  created_at: string;
  response_count?: number;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ActionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBillNumber, setFormBillNumber] = useState("");
  const [formCallToAction, setFormCallToAction] = useState("");
  const [formTargetContact, setFormTargetContact] = useState("");
  const [formPointsReward, setFormPointsReward] = useState("25");

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from("action_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch response counts
      const alertsWithCounts = await Promise.all(
        data.map(async (alert) => {
          const { count } = await supabase
            .from("alert_responses")
            .select("*", { count: "exact", head: true })
            .eq("alert_id", alert.id);
          return { ...alert, response_count: count ?? 0 };
        })
      );
      setAlerts(alertsWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("action_alerts").insert({
      title: formTitle,
      description: formDescription || null,
      bill_number: formBillNumber || null,
      call_to_action: formCallToAction || null,
      target_contact: formTargetContact || null,
      points_reward: parseInt(formPointsReward) || 25,
    });

    if (error) {
      alert("Failed to create: " + error.message);
    } else {
      setShowForm(false);
      setFormTitle("");
      setFormDescription("");
      setFormBillNumber("");
      setFormCallToAction("");
      setFormTargetContact("");
      setFormPointsReward("25");
      fetchAlerts();
    }
  };

  const toggleActive = async (id: string, currentlyActive: boolean) => {
    await supabase
      .from("action_alerts")
      .update({ is_active: !currentlyActive })
      .eq("id", id);
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, is_active: !currentlyActive } : a
      )
    );
  };

  const deleteAlert = async (id: string) => {
    if (!confirm("Delete this alert? This cannot be undone.")) return;
    await supabase.from("action_alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ssdp-navy">Action Alerts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-ssdp-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ssdp-blue/90 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Alert"}
        </button>
      </div>

      {/* Create form */}
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
                placeholder="e.g. Contact Your Senator About HR 1234"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
                placeholder="Explain why this action matters..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                  Bill Number (optional)
                </label>
                <input
                  type="text"
                  value={formBillNumber}
                  onChange={(e) => setFormBillNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. HR 1234 / S. 567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                  Points Reward
                </label>
                <input
                  type="number"
                  value={formPointsReward}
                  onChange={(e) => setFormPointsReward(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Call to Action
              </label>
              <textarea
                value={formCallToAction}
                onChange={(e) => setFormCallToAction(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={2}
                placeholder="What should users do? e.g. Call your representative and ask them to support..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Target Contact (optional)
              </label>
              <input
                type="text"
                value={formTargetContact}
                onChange={(e) => setFormTargetContact(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Your local senator, Rep. Jane Doe (202-555-0100)"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-ssdp-orange text-ssdp-navy px-6 py-2 rounded-lg text-sm font-bold"
          >
            Create Alert
          </button>
        </form>
      )}

      {/* Alerts list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Alert
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Bill
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Points
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Responses
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-ssdp-gray text-sm"
                >
                  Loading...
                </td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-ssdp-gray text-sm"
                >
                  No action alerts yet. Create one to mobilize your members.
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="text-sm font-medium text-ssdp-navy">
                      {alert.title}
                    </div>
                    {alert.description && (
                      <div className="text-xs text-ssdp-gray mt-0.5 truncate max-w-xs">
                        {alert.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-ssdp-gray">
                    {alert.bill_number || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-ssdp-navy">
                    +{alert.points_reward}
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm font-semibold text-ssdp-blue">
                      {alert.response_count ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => toggleActive(alert.id, alert.is_active)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        alert.is_active
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-ssdp-gray"
                      }`}
                    >
                      {alert.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
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
