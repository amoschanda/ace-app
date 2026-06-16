import React, { useState, useEffect } from "react";
import { Course } from "../types.js";
import { GraduationCap, Folder, Play, CheckCircle, ChevronDown, ChevronUp, Cpu, Award } from "lucide-react";

export default function FaithAcademy() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<{ moduleTitle: string; lessonIndex: number; title: string, duration: string, videoUrl?: string, content: string } | null>(null);
  const [openModules, setOpenModules] = useState<{ [key: string]: boolean }>({});
  const [completedLessons, setCompletedLessons] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        if (data.length > 0) {
          const firstCourse = data[0];
          setActiveCourse(firstCourse);
          if (firstCourse.modules?.length > 0 && firstCourse.modules[0].lessons?.length > 0) {
            const firstLesson = firstCourse.modules[0].lessons[0];
            setActiveLesson({
              moduleTitle: firstCourse.modules[0].title,
              lessonIndex: 0,
              ...firstLesson
            });
            // Open first module by default
            setOpenModules({ [firstCourse.modules[0].title]: true });
          }
        }
      });
  }, []);

  const toggleModule = (title: string) => {
    setOpenModules(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleCompleted = (lessonTitle: string) => {
    setCompletedLessons(prev => {
      const updated = { ...prev, [lessonTitle]: !prev[lessonTitle] };
      // Show simulated encouragement alert
      if (updated[lessonTitle]) {
        alert(`Amen! Keep up the good work. You have marked "${lessonTitle}" as completed.`);
      }
      return updated;
    });
  };

  const selectCourse = (course: Course) => {
    setActiveCourse(course);
    if (course.modules?.length > 0 && course.modules[0].lessons?.length > 0) {
      setActiveLesson({
        moduleTitle: course.modules[0].title,
        lessonIndex: 0,
        ...course.modules[0].lessons[0]
      });
      setOpenModules({ [course.modules[0].title]: true });
    } else {
      setActiveLesson(null);
    }
  };

  // Calculate course completion progress percentage
  const getCourseProgress = (course: Course) => {
    let total = 0;
    let completed = 0;
    for (const m of course.modules || []) {
      for (const l of m.lessons || []) {
        total++;
        if (completedLessons[l.title]) completed++;
      }
    }
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div id="faith-academy-container" className="space-y-6">
      {/* Course Selection Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-wrap gap-2">
        <div className="flex items-center space-x-2 px-3 py-2 text-amber-800 font-serif font-bold text-sm shrink-0 border-r border-stone-200 mr-2">
          <GraduationCap size={18} />
          <span>Academy Courses:</span>
        </div>
        {courses.map(c => (
          <button
            id={`course-select-${c.id}`}
            key={c.id}
            onClick={() => selectCourse(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-sans transition ${
              activeCourse?.id === c.id
              ? "bg-stone-950 text-white shadow-sm"
              : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {activeCourse ? (
        <div id="academy-course-detail" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Syllabus Navigation */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="relative h-28 bg-stone-900 flex flex-col justify-end p-5">
                <img 
                  src={activeCourse.coverUrl} 
                  alt={activeCourse.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative z-10 text-left">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300">Active Curriculum</span>
                  <p className="text-white font-serif font-bold leading-tight line-clamp-1">{activeCourse.title}</p>
                </div>
              </div>

              {/* Course Progress Indicator */}
              <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award size={16} className="text-amber-600" />
                  <span className="text-xs font-medium text-stone-700">Course Goals Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-stone-900">{getCourseProgress(activeCourse)}%</span>
                  <div className="w-20 bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${getCourseProgress(activeCourse)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Nested Syllabus Modules */}
              <div id="course-syllabus-modules" className="divide-y divide-stone-100">
                {activeCourse.modules && activeCourse.modules.length > 0 ? (
                  activeCourse.modules.map(mod => {
                    const isModuleOpen = openModules[mod.title] !== false;
                    return (
                      <div key={mod.title} className="p-3">
                        <button
                          onClick={() => toggleModule(mod.title)}
                          className="w-full flex items-center justify-between text-left p-2 hover:bg-stone-50/70 rounded-lg transition"
                        >
                          <div className="flex items-center space-x-2">
                            <Folder size={14} className="text-amber-600 shrink-0" />
                            <span className="text-xs font-semibold text-stone-900 leading-tight">
                              {mod.title}
                            </span>
                          </div>
                          {isModuleOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {/* Lessons List in Module */}
                        {isModuleOpen && (
                          <div className="mt-2 pl-3 space-y-1">
                            {mod.lessons.map((lesson, idx) => {
                              const isSelected = activeLesson?.title === lesson.title;
                              const isCompleted = completedLessons[lesson.title] === true;
                              return (
                                <div
                                  id={`lesson-item-${idx}`}
                                  key={lesson.title}
                                  onClick={() => setActiveLesson({
                                    moduleTitle: mod.title,
                                    lessonIndex: idx,
                                    ...lesson
                                  })}
                                  className={`p-2.5 rounded-lg text-left flex items-center justify-between cursor-pointer text-xs font-medium transition ${
                                    isSelected
                                    ? "bg-amber-50 text-amber-900 font-semibold border-l-2 border-amber-600"
                                    : "bg-transparent text-stone-600 hover:bg-stone-50"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 pr-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCompleted(lesson.title);
                                      }}
                                      className={`p-0.5 rounded-full border transition-all ${
                                        isCompleted 
                                        ? "bg-amber-600 text-white border-amber-600" 
                                        : "border-stone-400 text-transparent"
                                      }`}
                                    >
                                      <CheckCircle size={10} />
                                    </button>
                                    <span className="line-clamp-2">{lesson.title}</span>
                                  </div>
                                  <span className="text-[10px] text-stone-400 font-mono shrink-0">{lesson.duration}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-stone-400 text-xs">
                    No studies or classes published in this curriculum.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Columns - Lesson Study Viewer */}
          <div className="lg:col-span-2 space-y-6">
            {activeLesson ? (
              <div id={`active-lesson-viewer-${activeLesson.lessonIndex}`} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6">
                {/* Lesson Header */}
                <div className="border-b border-stone-150 pb-5 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-mono bg-stone-50 border border-stone-200 px-2 py-0.5 rounded text-stone-600 leading-tight">
                      {activeLesson.moduleTitle}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono flex items-center space-x-1">
                      <GraduationCap size={11} />
                      <span>Study Duration: {activeLesson.duration}</span>
                    </span>
                  </div>
                  <h3 className="font-serif font-black text-2xl text-stone-900 tracking-tight leading-snug">
                    {activeLesson.title}
                  </h3>
                </div>

                {/* Lesson Video (if present) */}
                {activeLesson.videoUrl && (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-stone-200 shadow-sm">
                    <video 
                      id="active-lesson-video"
                      src={activeLesson.videoUrl} 
                      controls 
                      className="w-full h-full object-cover animate-fade-in"
                      poster="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=640"
                    />
                  </div>
                )}

                {/* Lesson Scrollable Reading Content */}
                <div className="prose prose-stone max-w-none prose-sm md:prose-base bg-stone-50 p-6 rounded-xl border border-stone-200">
                  <div className="text-stone-800 text-sm leading-relaxed font-sans whitespace-pre-wrap text-left">
                    {activeLesson.content}
                  </div>
                </div>

                {/* Completion Control */}
                <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <div className="text-left">
                    <p className="text-xs font-semibold text-stone-800">Done with this study material?</p>
                    <p className="text-[10px] text-stone-500">Marking it completed updates your course progress indicator!</p>
                  </div>
                  <button
                    id={`complete-lesson-toggle-btn-${activeLesson.lessonIndex}`}
                    onClick={() => toggleCompleted(activeLesson.title)}
                    className={`py-2 px-5 rounded-lg text-xs font-bold transition flex items-center space-x-2 border shrink-0 ${
                      completedLessons[activeLesson.title]
                      ? "bg-amber-100 border-amber-300 text-amber-900"
                      : "bg-amber-600 hover:bg-amber-700 border-amber-600 text-white"
                    }`}
                  >
                    <CheckCircle size={14} />
                    <span>{completedLessons[activeLesson.title] ? "Completed ✅" : "Mark Complete"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-16 text-center text-stone-400">
                Select a class study module to start reading theological outlines.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-16 text-center text-stone-400">
          No courses loaded in system yet.
        </div>
      )}
    </div>
  );
}
