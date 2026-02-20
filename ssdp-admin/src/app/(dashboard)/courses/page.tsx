"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Course {
  id: string;
  title: string;
  track: string | null;
  module_count: number;
  is_published: boolean;
  sort_order: number;
  points_bonus: number;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  content_markdown: string | null;
  sort_order: number;
  points_reward: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  // New course form
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTrack, setFormTrack] = useState("drug_education");
  const [formDuration, setFormDuration] = useState("");

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title, track, module_count, is_published, sort_order, points_bonus")
      .order("sort_order");
    if (data) setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchModules = async (courseId: string) => {
    const { data } = await supabase
      .from("modules")
      .select("id, course_id, title, content_markdown, sort_order, points_reward")
      .eq("course_id", courseId)
      .order("sort_order");
    if (data) setModules(data);
  };

  const handleCourseClick = (courseId: string) => {
    if (selectedCourse === courseId) {
      setSelectedCourse(null);
      setModules([]);
    } else {
      setSelectedCourse(courseId);
      fetchModules(courseId);
    }
  };

  const togglePublish = async (courseId: string, currentlyPublished: boolean) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !currentlyPublished })
      .eq("id", courseId);

    if (error) {
      alert("Failed to update: " + error.message);
    } else {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, is_published: !currentlyPublished } : c
        )
      );
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("courses").insert({
      title: formTitle,
      description: formDescription,
      track: formTrack,
      duration_minutes: formDuration ? parseInt(formDuration) : null,
      sort_order: courses.length + 1,
    });

    if (error) {
      alert("Failed to create course: " + error.message);
    } else {
      setShowForm(false);
      setFormTitle("");
      setFormDescription("");
      setFormDuration("");
      fetchCourses();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ssdp-navy">Courses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-ssdp-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ssdp-blue/90 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Course"}
        </button>
      </div>

      {/* New course form */}
      {showForm && (
        <form
          onSubmit={handleCreateCourse}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Track
              </label>
              <select
                value={formTrack}
                onChange={(e) => setFormTrack(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="drug_education">Drug Education</option>
                <option value="internal_onboarding">Internal Onboarding</option>
              </select>
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
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ssdp-navy mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-ssdp-orange text-ssdp-navy px-6 py-2 rounded-lg text-sm font-bold hover:bg-ssdp-orange/90 transition-colors"
          >
            Create Course
          </button>
        </form>
      )}

      {/* Course list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-ssdp-gray py-8">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="text-center text-ssdp-gray py-8">
            No courses yet. Create one to get started.
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id}>
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-ssdp-navy">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-ssdp-gray">
                      <span className="capitalize">
                        {course.track?.replace("_", " ")}
                      </span>
                      <span>{course.module_count} modules</span>
                      <span>+{course.points_bonus} pts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePublish(course.id, course.is_published);
                      }}
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        course.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-ssdp-gray"
                      }`}
                    >
                      {course.is_published ? "Published" : "Draft"}
                    </button>
                    <span className="text-ssdp-gray">
                      {selectedCourse === course.id ? "▼" : "▶"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modules list */}
              {selectedCourse === course.id && (
                <div className="ml-8 mt-2 space-y-2">
                  {modules.length === 0 ? (
                    <div className="text-sm text-ssdp-gray py-4">
                      No modules yet.
                    </div>
                  ) : (
                    modules.map((mod, idx) => (
                      <div
                        key={mod.id}
                        className="bg-white rounded-lg border border-gray-100 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-ssdp-teal font-semibold mr-2">
                              #{idx + 1}
                            </span>
                            <span className="text-sm font-medium text-ssdp-navy">
                              {mod.title}
                            </span>
                          </div>
                          <span className="text-xs text-ssdp-gray">
                            +{mod.points_reward} pts
                          </span>
                        </div>
                        {mod.content_markdown && (
                          <p className="text-xs text-ssdp-gray mt-1 line-clamp-2">
                            {mod.content_markdown.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
