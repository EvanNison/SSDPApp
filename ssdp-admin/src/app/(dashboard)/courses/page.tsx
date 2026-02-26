"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MarkdownEditor from "@/components/MarkdownEditor";

interface Course {
  id: string;
  title: string;
  description: string | null;
  track: string | null;
  duration_minutes: number | null;
  module_count: number;
  is_published: boolean;
  sort_order: number;
  points_bonus: number;
  required_role: string;
  is_ambassador_course: boolean;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  content_markdown: string | null;
  video_url: string | null;
  sort_order: number;
  points_reward: number;
}

interface Quiz {
  id: string;
  module_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  points_reward: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz[]>>({});
  const [loading, setLoading] = useState(true);

  // Course form
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    track: "drug_education",
    duration_minutes: "",
    points_bonus: "20",
    required_role: "registered",
    is_ambassador_course: false,
  });

  // Module form
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({
    title: "",
    content_markdown: "",
    video_url: "",
    points_reward: "10",
  });

  // Quiz form
  const [showQuizForm, setShowQuizForm] = useState<string | null>(null); // module_id
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizForm, setQuizForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_index: 0,
    explanation: "",
    points_reward: "5",
  });

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order");
    if (data) setCourses(data);
    setLoading(false);
  };

  const fetchModules = async (courseId: string) => {
    const { data } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order");
    if (data) {
      setModules(data);
      // Fetch quizzes for all modules
      const moduleIds = data.map((m) => m.id);
      if (moduleIds.length > 0) {
        const { data: quizData } = await supabase
          .from("quizzes")
          .select("*")
          .in("module_id", moduleIds);
        if (quizData) {
          const grouped: Record<string, Quiz[]> = {};
          quizData.forEach((q) => {
            // Parse options if it's a string
            const quiz = {
              ...q,
              options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
            };
            if (!grouped[quiz.module_id]) grouped[quiz.module_id] = [];
            grouped[quiz.module_id].push(quiz);
          });
          setQuizzes(grouped);
        }
      }
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseClick = (courseId: string) => {
    if (selectedCourse === courseId) {
      setSelectedCourse(null);
      setModules([]);
      setQuizzes({});
    } else {
      setSelectedCourse(courseId);
      fetchModules(courseId);
    }
  };

  const togglePublish = async (courseId: string, currentlyPublished: boolean) => {
    await supabase
      .from("courses")
      .update({ is_published: !currentlyPublished })
      .eq("id", courseId);
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, is_published: !currentlyPublished } : c
      )
    );
  };

  // === COURSE CRUD ===
  const openCourseForm = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        title: course.title,
        description: course.description || "",
        track: course.track || "drug_education",
        duration_minutes: course.duration_minutes?.toString() || "",
        points_bonus: course.points_bonus.toString(),
        required_role: course.required_role,
        is_ambassador_course: course.is_ambassador_course ?? false,
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        title: "",
        description: "",
        track: "drug_education",
        duration_minutes: "",
        points_bonus: "20",
        required_role: "registered",
        is_ambassador_course: false,
      });
    }
    setShowCourseForm(true);
  };

  const saveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: courseForm.title,
      description: courseForm.description || null,
      track: courseForm.track,
      duration_minutes: courseForm.duration_minutes
        ? parseInt(courseForm.duration_minutes)
        : null,
      points_bonus: parseInt(courseForm.points_bonus) || 20,
      required_role: courseForm.required_role,
      is_ambassador_course: courseForm.is_ambassador_course,
    };

    if (editingCourse) {
      await supabase.from("courses").update(payload).eq("id", editingCourse.id);
    } else {
      await supabase
        .from("courses")
        .insert({ ...payload, sort_order: courses.length + 1 });
    }
    setShowCourseForm(false);
    fetchCourses();
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm("Delete this course and all its modules/quizzes?")) return;
    await supabase.from("courses").delete().eq("id", courseId);
    setSelectedCourse(null);
    fetchCourses();
  };

  // === MODULE CRUD ===
  const openModuleForm = (mod?: Module) => {
    if (mod) {
      setEditingModule(mod);
      setModuleForm({
        title: mod.title,
        content_markdown: mod.content_markdown || "",
        video_url: mod.video_url || "",
        points_reward: mod.points_reward.toString(),
      });
    } else {
      setEditingModule(null);
      setModuleForm({
        title: "",
        content_markdown: "",
        video_url: "",
        points_reward: "10",
      });
    }
    setShowModuleForm(true);
  };

  const saveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const payload = {
      title: moduleForm.title,
      content_markdown: moduleForm.content_markdown || null,
      video_url: moduleForm.video_url || null,
      points_reward: parseInt(moduleForm.points_reward) || 10,
    };

    if (editingModule) {
      await supabase.from("modules").update(payload).eq("id", editingModule.id);
    } else {
      await supabase.from("modules").insert({
        ...payload,
        course_id: selectedCourse,
        sort_order: modules.length + 1,
      });
      // Update course module_count
      await supabase
        .from("courses")
        .update({ module_count: modules.length + 1 })
        .eq("id", selectedCourse);
    }
    setShowModuleForm(false);
    fetchModules(selectedCourse);
    fetchCourses();
  };

  const deleteModule = async (moduleId: string) => {
    if (!selectedCourse || !confirm("Delete this module and its quizzes?")) return;
    await supabase.from("modules").delete().eq("id", moduleId);
    // Update count
    await supabase
      .from("courses")
      .update({ module_count: Math.max(0, modules.length - 1) })
      .eq("id", selectedCourse);
    fetchModules(selectedCourse);
    fetchCourses();
  };

  // === QUIZ CRUD ===
  const openQuizForm = (moduleId: string, quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizForm({
        question: quiz.question,
        options: [...quiz.options],
        correct_index: quiz.correct_index,
        explanation: quiz.explanation || "",
        points_reward: quiz.points_reward.toString(),
      });
    } else {
      setEditingQuiz(null);
      setQuizForm({
        question: "",
        options: ["", "", "", ""],
        correct_index: 0,
        explanation: "",
        points_reward: "5",
      });
    }
    setShowQuizForm(moduleId);
  };

  const saveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showQuizForm) return;

    const payload = {
      question: quizForm.question,
      options: quizForm.options,
      correct_index: quizForm.correct_index,
      explanation: quizForm.explanation || null,
      points_reward: parseInt(quizForm.points_reward) || 5,
    };

    if (editingQuiz) {
      await supabase.from("quizzes").update(payload).eq("id", editingQuiz.id);
    } else {
      await supabase
        .from("quizzes")
        .insert({ ...payload, module_id: showQuizForm });
    }
    setShowQuizForm(null);
    if (selectedCourse) fetchModules(selectedCourse);
  };

  const deleteQuiz = async (quizId: string) => {
    if (!confirm("Delete this quiz question?")) return;
    await supabase.from("quizzes").delete().eq("id", quizId);
    if (selectedCourse) fetchModules(selectedCourse);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ssdp-navy">Courses</h1>
        <button
          onClick={() => openCourseForm()}
          className="bg-ssdp-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ssdp-navy transition-colors"
        >
          + New Course
        </button>
      </div>

      {/* Course form modal */}
      {showCourseForm && (
        <form
          onSubmit={saveCourse}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-ssdp-navy mb-4">
            {editingCourse ? "Edit Course" : "New Course"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Title *
              </label>
              <input
                type="text"
                value={courseForm.title}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, title: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Track
              </label>
              <select
                value={courseForm.track}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, track: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="drug_education">Drug Education</option>
                <option value="internal_onboarding">Internal Onboarding</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Description
              </label>
              <textarea
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={courseForm.duration_minutes}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    duration_minutes: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Bonus Points
              </label>
              <input
                type="number"
                value={courseForm.points_bonus}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, points_bonus: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Required Role
              </label>
              <select
                value={courseForm.required_role}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, required_role: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="guest">Guest</option>
                <option value="registered">Registered</option>
                <option value="ambassador">Ambassador</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="is_ambassador_course"
                checked={courseForm.is_ambassador_course}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, is_ambassador_course: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <label htmlFor="is_ambassador_course" className="text-sm font-medium text-ssdp-navy">
                Ambassador Training Course
              </label>
              <span className="text-xs text-ssdp-gray">
                (completing this course unlocks the Ambassador Agreement)
              </span>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="bg-ssdp-orange text-ssdp-navy px-6 py-2 rounded-lg text-sm font-bold hover:bg-ssdp-orange/90"
            >
              {editingCourse ? "Save Changes" : "Create Course"}
            </button>
            <button
              type="button"
              onClick={() => setShowCourseForm(false)}
              className="text-ssdp-gray px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Module form modal */}
      {showModuleForm && (
        <form
          onSubmit={saveModule}
          className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-ssdp-navy mb-4">
            {editingModule ? "Edit Module" : "New Module"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Title *
              </label>
              <input
                type="text"
                value={moduleForm.title}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, title: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-ssdp-navy mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={moduleForm.points_reward}
                  onChange={(e) =>
                    setModuleForm({
                      ...moduleForm,
                      points_reward: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-ssdp-navy mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  value={moduleForm.video_url}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, video_url: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Content
              </label>
              <MarkdownEditor
                value={moduleForm.content_markdown}
                onChange={(markdown) =>
                  setModuleForm({
                    ...moduleForm,
                    content_markdown: markdown,
                  })
                }
                placeholder="Write module content..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="bg-ssdp-teal text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-ssdp-teal/90"
            >
              {editingModule ? "Save Module" : "Add Module"}
            </button>
            <button
              type="button"
              onClick={() => setShowModuleForm(false)}
              className="text-ssdp-gray px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Quiz form modal */}
      {showQuizForm && (
        <form
          onSubmit={saveQuiz}
          className="bg-purple-50 rounded-xl border border-purple-200 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-ssdp-navy mb-4">
            {editingQuiz ? "Edit Quiz Question" : "New Quiz Question"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Question *
              </label>
              <textarea
                value={quizForm.question}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, question: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={2}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ssdp-navy mb-2">
                Answer Options (select the correct one)
              </label>
              {quizForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={quizForm.correct_index === i}
                    onChange={() =>
                      setQuizForm({ ...quizForm, correct_index: i })
                    }
                    className="text-ssdp-teal"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...quizForm.options];
                      newOpts[i] = e.target.value;
                      setQuizForm({ ...quizForm, options: newOpts });
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    required
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Explanation (shown after answering)
              </label>
              <textarea
                value={quizForm.explanation}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, explanation: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-ssdp-navy mb-1">
                Points
              </label>
              <input
                type="number"
                value={quizForm.points_reward}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, points_reward: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-purple-700"
            >
              {editingQuiz ? "Save Quiz" : "Add Quiz"}
            </button>
            <button
              type="button"
              onClick={() => setShowQuizForm(null)}
              className="text-ssdp-gray px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
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
                      <span className="capitalize">
                        Requires: {course.required_role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCourseForm(course);
                      }}
                      className="text-xs px-2 py-1 text-ssdp-blue hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCourse(course.id);
                      }}
                      className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                    <span className="text-ssdp-gray ml-2">
                      {selectedCourse === course.id ? "▼" : "▶"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modules list */}
              {selectedCourse === course.id && (
                <div className="ml-6 mt-2 space-y-2">
                  {modules.map((mod, idx) => (
                    <div
                      key={mod.id}
                      className="bg-white rounded-lg border border-gray-100 p-4"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-ssdp-teal/10 text-ssdp-teal font-semibold px-2 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-medium text-ssdp-navy">
                            {mod.title}
                          </span>
                          <span className="text-xs text-ssdp-gray">
                            +{mod.points_reward} pts
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModuleForm(mod)}
                            className="text-xs text-ssdp-blue hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteModule(mod.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {mod.content_markdown && (
                        <p className="text-xs text-ssdp-gray line-clamp-2 mb-2">
                          {mod.content_markdown.substring(0, 200)}...
                        </p>
                      )}

                      {/* Quizzes for this module */}
                      {quizzes[mod.id]?.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="bg-purple-50 rounded-lg p-3 mt-2 text-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-ssdp-navy text-xs">
                                Quiz: {quiz.question}
                              </p>
                              <div className="mt-1 space-y-0.5">
                                {quiz.options.map((opt, oi) => (
                                  <p
                                    key={oi}
                                    className={`text-xs ${
                                      oi === quiz.correct_index
                                        ? "text-green-700 font-semibold"
                                        : "text-ssdp-gray"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oi)}. {opt}{" "}
                                    {oi === quiz.correct_index && "✓"}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <button
                                onClick={() => openQuizForm(mod.id, quiz)}
                                className="text-xs text-ssdp-blue hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteQuiz(quiz.id)}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => openQuizForm(mod.id)}
                        className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        + Add Quiz Question
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => openModuleForm()}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-ssdp-gray hover:border-ssdp-teal hover:text-ssdp-teal transition-colors"
                  >
                    + Add Module
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
