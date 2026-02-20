"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const SECTIONS = ["account", "ssdp", "support"];
const LINK_TYPES = ["screen", "external", "webview"];
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

interface MenuItem {
  id: string;
  label: string;
  icon: string | null;
  link_type: string;
  link_value: string | null;
  required_role: string;
  section: string;
  sort_order: number;
  is_visible: boolean;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formLabel, setFormLabel] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formLinkType, setFormLinkType] = useState("external");
  const [formLinkValue, setFormLinkValue] = useState("");
  const [formRole, setFormRole] = useState("guest");
  const [formSection, setFormSection] = useState("ssdp");

  const fetchItems = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .order("section")
      .order("sort_order");
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const sectionItems = items.filter((i) => i.section === formSection);
    const maxOrder =
      sectionItems.length > 0
        ? Math.max(...sectionItems.map((i) => i.sort_order))
        : 0;

    const { error } = await supabase.from("menu_items").insert({
      label: formLabel,
      icon: formIcon || null,
      link_type: formLinkType,
      link_value: formLinkValue || null,
      required_role: formRole,
      section: formSection,
      sort_order: maxOrder + 1,
    });

    if (error) {
      alert("Failed to create: " + error.message);
    } else {
      setShowForm(false);
      setFormLabel("");
      setFormIcon("");
      setFormLinkValue("");
      fetchItems();
    }
  };

  const toggleVisibility = async (id: string, currentlyVisible: boolean) => {
    await supabase
      .from("menu_items")
      .update({ is_visible: !currentlyVisible })
      .eq("id", id);

    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, is_visible: !currentlyVisible } : i
      )
    );
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const sectionItems = items
      .filter((i) => i.section === item.section)
      .sort((a, b) => a.sort_order - b.sort_order);

    const currentIndex = sectionItems.findIndex((i) => i.id === id);
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sectionItems.length) return;

    const target = sectionItems[targetIndex];

    // Swap sort orders
    await Promise.all([
      supabase
        .from("menu_items")
        .update({ sort_order: target.sort_order })
        .eq("id", id),
      supabase
        .from("menu_items")
        .update({ sort_order: item.sort_order })
        .eq("id", target.id),
    ]);

    fetchItems();
  };

  const sectionLabels: Record<string, string> = {
    account: "Account",
    ssdp: "SSDP",
    support: "Support",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ssdp-navy">Menu Editor</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-ssdp-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ssdp-blue/90 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Item"}
        </button>
      </div>

      {/* New item form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Label
              </label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Icon (FontAwesome name)
              </label>
              <input
                type="text"
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="globe, heart, book..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Link Type
              </label>
              <select
                value={formLinkType}
                onChange={(e) => setFormLinkType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {LINK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Link Value
              </label>
              <input
                type="text"
                value={formLinkValue}
                onChange={(e) => setFormLinkValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="https://... or /screen-name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Section
              </label>
              <select
                value={formSection}
                onChange={(e) => setFormSection(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {sectionLabels[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Required Role
              </label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-ssdp-orange text-ssdp-navy px-6 py-2 rounded-lg text-sm font-bold"
          >
            Add Item
          </button>
        </form>
      )}

      {/* Menu items grouped by section */}
      {loading ? (
        <div className="text-center text-ssdp-gray py-8">Loading...</div>
      ) : (
        SECTIONS.map((section) => {
          const sectionItems = items
            .filter((i) => i.section === section)
            .sort((a, b) => a.sort_order - b.sort_order);

          if (sectionItems.length === 0) return null;

          return (
            <div key={section} className="mb-8">
              <h2 className="text-sm font-bold text-ssdp-navy uppercase mb-3">
                {sectionLabels[section]}
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {sectionItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`px-6 py-3 flex items-center justify-between ${
                      !item.is_visible ? "opacity-50" : ""
                    } ${idx > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Reorder buttons */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveItem(item.id, "up")}
                          className="text-xs text-ssdp-gray hover:text-ssdp-navy"
                          disabled={idx === 0}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveItem(item.id, "down")}
                          className="text-xs text-ssdp-gray hover:text-ssdp-navy"
                          disabled={idx === sectionItems.length - 1}
                        >
                          ▼
                        </button>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-ssdp-navy">
                          {item.icon ? `${item.icon} ` : ""}
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-ssdp-gray mt-0.5">
                          <span>{item.link_type}</span>
                          <span className="text-gray-300">|</span>
                          <span>{item.required_role.replace("_", " ")}</span>
                          {item.link_value && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="truncate max-w-xs">
                                {item.link_value}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toggleVisibility(item.id, item.is_visible)
                        }
                        className={`text-xs px-2 py-1 rounded ${
                          item.is_visible
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-ssdp-gray"
                        }`}
                      >
                        {item.is_visible ? "Visible" : "Hidden"}
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
