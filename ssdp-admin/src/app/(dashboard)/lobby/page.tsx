"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

interface TalkingPoint {
  topic: string;
  points: string[];
}

interface LobbyEvent {
  id: string;
  title: string;
  event_date: string | null;
  location: string | null;
  description: string | null;
  schedule: ScheduleItem[] | null;
  talking_points: TalkingPoint[] | null;
  is_active: boolean;
  created_at: string;
}

export default function LobbyPage() {
  const [events, setEvents] = useState<LobbyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LobbyEvent | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSchedule, setFormSchedule] = useState<ScheduleItem[]>([
    { time: "", title: "", description: "" },
  ]);
  const [formTalkingPoints, setFormTalkingPoints] = useState<TalkingPoint[]>([
    { topic: "", points: [""] },
  ]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("lobby_events")
      .select("*")
      .order("event_date", { ascending: false });
    if (data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Schedule helpers
  const addScheduleItem = () => {
    setFormSchedule([...formSchedule, { time: "", title: "", description: "" }]);
  };

  const removeScheduleItem = (index: number) => {
    setFormSchedule(formSchedule.filter((_, i) => i !== index));
  };

  const updateScheduleItem = (
    index: number,
    field: keyof ScheduleItem,
    value: string
  ) => {
    const updated = [...formSchedule];
    updated[index] = { ...updated[index], [field]: value };
    setFormSchedule(updated);
  };

  // Talking points helpers
  const addTalkingPoint = () => {
    setFormTalkingPoints([...formTalkingPoints, { topic: "", points: [""] }]);
  };

  const removeTalkingPoint = (index: number) => {
    setFormTalkingPoints(formTalkingPoints.filter((_, i) => i !== index));
  };

  const updateTalkingPointTopic = (index: number, value: string) => {
    const updated = [...formTalkingPoints];
    updated[index] = { ...updated[index], topic: value };
    setFormTalkingPoints(updated);
  };

  const addBulletPoint = (tpIndex: number) => {
    const updated = [...formTalkingPoints];
    updated[tpIndex] = {
      ...updated[tpIndex],
      points: [...updated[tpIndex].points, ""],
    };
    setFormTalkingPoints(updated);
  };

  const removeBulletPoint = (tpIndex: number, bpIndex: number) => {
    const updated = [...formTalkingPoints];
    updated[tpIndex] = {
      ...updated[tpIndex],
      points: updated[tpIndex].points.filter((_, i) => i !== bpIndex),
    };
    setFormTalkingPoints(updated);
  };

  const updateBulletPoint = (
    tpIndex: number,
    bpIndex: number,
    value: string
  ) => {
    const updated = [...formTalkingPoints];
    const newPoints = [...updated[tpIndex].points];
    newPoints[bpIndex] = value;
    updated[tpIndex] = { ...updated[tpIndex], points: newPoints };
    setFormTalkingPoints(updated);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormTitle("");
    setFormDate("");
    setFormLocation("");
    setFormDescription("");
    setFormSchedule([{ time: "", title: "", description: "" }]);
    setFormTalkingPoints([{ topic: "", points: [""] }]);
  };

  const openEditForm = (event: LobbyEvent) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDate(event.event_date || "");
    setFormLocation(event.location || "");
    setFormDescription(event.description || "");
    setFormSchedule(
      (event.schedule as ScheduleItem[] | null)?.length
        ? (event.schedule as ScheduleItem[])
        : [{ time: "", title: "", description: "" }]
    );
    setFormTalkingPoints(
      (event.talking_points as TalkingPoint[] | null)?.length
        ? (event.talking_points as TalkingPoint[])
        : [{ topic: "", points: [""] }]
    );
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up empty entries
    const cleanSchedule = formSchedule.filter((s) => s.time && s.title);
    const cleanTalkingPoints = formTalkingPoints
      .filter((tp) => tp.topic)
      .map((tp) => ({
        ...tp,
        points: tp.points.filter((p) => p.trim()),
      }));

    const payload = {
      title: formTitle,
      event_date: formDate || null,
      location: formLocation || null,
      description: formDescription || null,
      schedule: cleanSchedule.length > 0 ? cleanSchedule : null,
      talking_points: cleanTalkingPoints.length > 0 ? cleanTalkingPoints : null,
    };

    const { error } = editingEvent
      ? await supabase.from("lobby_events").update(payload).eq("id", editingEvent.id)
      : await supabase.from("lobby_events").insert(payload);

    if (error) {
      alert(`Failed to ${editingEvent ? "update" : "create"}: ` + error.message);
    } else {
      setShowForm(false);
      resetForm();
      fetchEvents();
    }
  };

  const toggleActive = async (id: string, currentlyActive: boolean) => {
    await supabase
      .from("lobby_events")
      .update({ is_active: !currentlyActive })
      .eq("id", id);
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, is_active: !currentlyActive } : e
      )
    );
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this lobby event? This cannot be undone.")) return;
    await supabase.from("lobby_events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ssdp-navy">Lobby Day Events</h1>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="bg-ssdp-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ssdp-blue/90 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Event"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. 2026 SSDP Lobby Day"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Washington, DC"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Overview of the lobby day event..."
                />
              </div>
            </div>

            {/* Schedule builder */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-ssdp-navy">
                  Schedule
                </label>
                <button
                  type="button"
                  onClick={addScheduleItem}
                  className="text-xs text-ssdp-blue font-semibold hover:underline"
                >
                  + Add Time Slot
                </button>
              </div>
              <div className="space-y-3">
                {formSchedule.map((item, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={item.time}
                          onChange={(e) =>
                            updateScheduleItem(i, "time", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                          placeholder="9:00 AM"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            updateScheduleItem(i, "title", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                          placeholder="Session title"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={item.description || ""}
                          onChange={(e) =>
                            updateScheduleItem(i, "description", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                          placeholder="Description (optional)"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        {formSchedule.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScheduleItem(i)}
                            className="text-red-400 hover:text-red-600 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Talking points builder */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-ssdp-navy">
                  Talking Points
                </label>
                <button
                  type="button"
                  onClick={addTalkingPoint}
                  className="text-xs text-ssdp-blue font-semibold hover:underline"
                >
                  + Add Topic
                </button>
              </div>
              <div className="space-y-4">
                {formTalkingPoints.map((tp, tpIndex) => (
                  <div
                    key={tpIndex}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tp.topic}
                        onChange={(e) =>
                          updateTalkingPointTopic(tpIndex, e.target.value)
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-semibold"
                        placeholder="Topic name"
                      />
                      {formTalkingPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTalkingPoint(tpIndex)}
                          className="text-red-400 hover:text-red-600 text-sm px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 ml-3">
                      {tp.points.map((point, bpIndex) => (
                        <div key={bpIndex} className="flex gap-2 items-center">
                          <span className="text-ssdp-gray text-xs">•</span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) =>
                              updateBulletPoint(
                                tpIndex,
                                bpIndex,
                                e.target.value
                              )
                            }
                            className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                            placeholder="Talking point..."
                          />
                          {tp.points.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeBulletPoint(tpIndex, bpIndex)
                              }
                              className="text-red-400 hover:text-red-600 text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addBulletPoint(tpIndex)}
                        className="text-xs text-ssdp-teal hover:underline ml-3"
                      >
                        + Add point
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 bg-ssdp-orange text-ssdp-navy px-6 py-2 rounded-lg text-sm font-bold"
          >
            {editingEvent ? "Save Changes" : "Create Event"}
          </button>
        </form>
      )}

      {/* Events list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Event
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Date
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Location
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ssdp-gray uppercase">
                Schedule
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
            ) : events.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-ssdp-gray text-sm"
                >
                  No lobby events yet. Create one to organize your next lobby
                  day.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="text-sm font-medium text-ssdp-navy">
                      {event.title}
                    </div>
                    {event.description && (
                      <div className="text-xs text-ssdp-gray mt-0.5 truncate max-w-xs">
                        {event.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-ssdp-gray">
                    {event.event_date
                      ? new Date(event.event_date + "T00:00:00").toLocaleDateString()
                      : "TBD"}
                  </td>
                  <td className="px-6 py-3 text-sm text-ssdp-gray">
                    {event.location || "TBD"}
                  </td>
                  <td className="px-6 py-3 text-sm text-ssdp-gray">
                    {(event.schedule as ScheduleItem[] | null)?.length ?? 0} items
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => toggleActive(event.id, event.is_active)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        event.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-ssdp-gray"
                      }`}
                    >
                      {event.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-3 space-x-2">
                    <button
                      onClick={() => openEditForm(event)}
                      className="text-xs text-ssdp-blue hover:text-ssdp-navy"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
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
