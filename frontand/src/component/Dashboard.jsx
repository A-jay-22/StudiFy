import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  CloudUpload,
  FileQuestion,
  FileText,
  Flame,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import Sidebar, { navigation } from "./Sidebar";
import UploadMaterial from "./UploadMaterial";
import AskAI from "./AskAI";
import GenerateQuestions from "./GenerateQuestions";
import MockExam from "./MockExam";
import MyExams from "./MyExams";
import CreateTopic from "./CreateTopic";
import MyTopics from "./MyTopics";
import ProgressReport from "./ProgressReport";
import Downloads from "./Downloads";
import { useStudy } from "../StudyContext.jsx";

const stats = [
  {
    label: "Total Topics",
    note: "AI study guides",
    icon: BookOpen,
    tone: "mint",
  },
  {
    label: "Saved Topics",
    note: "In your library",
    icon: Target,
    tone: "blue",
  },
  {
    label: "Study Files",
    note: "Ready to download",
    icon: ArrowDownToLine,
    tone: "sky",
  },
  {
    label: "Mock Exams",
    note: "Your test history",
    icon: BrainCircuit,
    tone: "violet",
  },
];

function formatStudyTime(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

const actions = [
  {
    title: "Upload Study Material",
    description: "PDF, DOC / PPT, image",
    icon: CloudUpload,
    tone: "violet",
    message: "Your study material is ready to upload.",
    page: "Upload Material",
  },
  {
    title: "Ask AI",
    description: "Get instant answers",
    icon: BrainCircuit,
    tone: "blue",
    message: "Ask a question about any of your study topics.",
    page: "Ask AI",
  },
  {
    title: "Generate Questions",
    description: "Create practice questions",
    icon: CircleHelp,
    tone: "sky",
    message: "Choose a topic to generate practice questions.",
    page: "Generate Questions",
  },
  {
    title: "Create Topic (AI)",
    description: "Personalized topics",
    icon: Sparkles,
    tone: "purple",
    message: "Tell StudiFy what you want to learn next.",
    page: "Create Topic (AI)",
  },
  {
    title: "Take Mock Exam",
    description: "Test your knowledge",
    icon: FileText,
    tone: "indigo",
    message: "Pick a subject and start a timed mock exam.",
    page: "Mock Exam",
  },
  {
    title: "View Progress",
    description: "Track your performance",
    icon: Activity,
    tone: "pink",
    message: "Your learning progress is looking great!",
    page: "Progress Report",
  },
];

export const Dashboard = ({ user, onLogout, onUpdateUser }) => {
  const [activePage, setActivePage] = useState("Dashboard");
  const [activeMaterial, setActiveMaterial] = useState(null);

  function handleAskAi(material) {
    setActiveMaterial(material);
    selectPage("Ask AI");
  }

  function handleMockExam(materialOrTopic) {
    setActiveMaterial(materialOrTopic);
    selectPage("Mock Exam");
  }

  function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdateUser((currentUser) => ({
        ...currentUser,
        avatar: typeof reader.result === "string" ? reader.result : currentUser?.avatar || "",
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { items, progress, setActivePage: trackActivePage } = useStudy();

  const recentItems = useMemo(
    () =>
      items.slice(0, 6).map((item) => ({
        title: item.title,
        detail: `${item.kind} · ${new Date(item.updatedAt).toLocaleDateString()}`,
        action: "View",
        icon:
          item.kind === "topic"
            ? BookOpen
            : item.kind === "exam"
              ? FileQuestion
              : FileText,
        tone: item.kind === "topic" ? "green" : item.kind === "exam" ? "orange" : "red",
        page:
          item.kind === "topic"
            ? "My Topics"
            : item.kind === "exam"
              ? "My Exams"
              : "Downloads",
      })),
    [items],
  );
  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return recentItems;
    return recentItems.filter(
      (activity) =>
        activity.title.toLowerCase().includes(query) ||
        activity.detail.toLowerCase().includes(query),
    );
  }, [recentItems, search]);
  const weeklyStudySeconds =
    progress?.weeklyStudy?.reduce((total, entry) => total + entry.seconds, 0) || 0;

  function selectPage(label) {
    setActivePage(label);
    trackActivePage(label);
    setMenuOpen(false);
    if (label !== "Dashboard") {
      setNotice(`${label} is ready for you.`);
    } else {
      setNotice("");
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Sidebar
        activePage={activePage}
        menuOpen={menuOpen}
        onSelectPage={selectPage}
        onMenuClose={() => setMenuOpen(false)}
        onLogout={onLogout}
      />

      <main className="min-h-screen lg:ml-[250px]">
        <header className="sticky top-0 z-10 border-b border-[#e8eef8] bg-white/90 px-5 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-4">
            <button
              type="button"
              aria-label="Open navigation"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <label className="relative block w-full max-w-[410px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a1b6]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search anything..."
                aria-label="Search dashboard"
                className="h-10 w-full rounded-xl border border-[#e8eef8] bg-[#f8faff] pl-10 pr-10 text-[12px] text-ink outline-none transition placeholder:text-[#9aa8bd] focus:border-[#9cafff] focus:bg-white focus:ring-4 focus:ring-[#eef1ff]"
              />
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9ab2] hover:text-brand ${
                  search ? "block" : "hidden"
                }`}
              >
                <X size={14} />
              </button>
            </label>

            <div className="ml-auto flex items-center gap-3 sm:gap-5">
              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileOpen(false);
                  }}
                  className="relative grid h-9 w-9 place-items-center rounded-full text-[#53627b] transition hover:bg-[#f1f4fb]"
                >
                  <Bell size={17} />
                  <span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#f26d75] ring-2 ring-white" />
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-12 w-64 rounded-2xl border border-[#e9eef7] bg-white p-4 shadow-panel">
                    <p className="text-sm font-bold text-ink">You’re all caught up</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      New updates about your study topics will show up here.
                    </p>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={profileOpen}
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition hover:bg-[#f6f8fc]"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#ffc08b] via-[#e98b68] to-[#be6265] text-[11px] font-bold text-white ring-2 ring-white">
                      {user.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                  <span className="hidden text-left sm:block">
                    <span className="block text-[12px] font-bold leading-4 text-[#293752]">
                      {user.name}
                    </span>
                    <span className="block text-[10px] leading-4 text-muted">
                      Student
                    </span>
                  </span>
                  <ChevronDown size={14} className="hidden text-[#7e8ba1] sm:block" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 w-48 rounded-2xl border border-[#e9eef7] bg-white p-2 shadow-panel">
                    <button
                      type="button"
                      onClick={() => selectPage("Settings")}
                      className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#42506a] hover:bg-[#f5f7ff]"
                    >
                      Account settings
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#42506a] hover:bg-[#f5f7ff]"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-7 sm:px-8 sm:pt-8">
          {activePage === "Mock Exam" ? (
            <MockExam onBack={() => selectPage("Dashboard")} preselectedMaterial={activeMaterial} />
          ) : activePage === "My Exams" ? (
            <MyExams onStartExam={() => selectPage("Mock Exam")} />
          ) : activePage === "My Topics" ? (
            <MyTopics onCreateTopic={() => selectPage("Create Topic (AI)")} onMockExam={handleMockExam} />
          ) : activePage === "Progress Report" ? (
            <ProgressReport />
          ) : activePage === "Downloads" ? (
            <Downloads />
          ) : activePage === "Create Topic (AI)" ? (
            <CreateTopic onMockExam={handleMockExam} />
          ) : activePage === "Generate Questions" ? (
            <GenerateQuestions />
          ) : activePage === "Ask AI" ? (
            <AskAI preselectedMaterial={activeMaterial} />
          ) : activePage === "Upload Material" ? (
            <UploadMaterial onAskAi={handleAskAi} onMockExam={handleMockExam} />
          ) : activePage === "Settings" ? (
            <section className="mx-auto max-w-[900px]">
              <header className="mb-6">
                <h1 className="font-display text-[23px] font-extrabold tracking-[-0.04em] text-[#172541]">
                  Account Settings
                </h1>
                <p className="mt-1 text-[12px] text-[#8291a9]">
                  Review your account and sign out securely.
                </p>
              </header>
              <article className="rounded-2xl border border-[#e8eef8] bg-white p-5 shadow-panel sm:p-7">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-[#edf2ff]"
                      />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#edf2ff] font-bold text-[#5368ec]">
                        {user.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white bg-[#e9eeff] text-[#2d52d3] shadow-sm transition hover:bg-[#dfe7ff]" title="Upload profile picture">
                      <CloudUpload size={14} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#33415b]">{user.name}</h2>
                    <p className="mt-1 text-xs text-[#8291a9]">{user.email}</p>
                  </div>
                </div>
                <dl className="mt-6 grid gap-4 border-t border-[#eff2f8] pt-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#98a5b9]">Account type</dt>
                    <dd className="mt-1 text-xs font-semibold capitalize text-[#42516c]">{user.role}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#98a5b9]">Study time tracked</dt>
                    <dd className="mt-1 text-xs font-semibold text-[#42516c]">
                      {Math.floor((progress?.studySeconds || 0) / 3600)}h {Math.floor(((progress?.studySeconds || 0) % 3600) / 60)}m
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="mt-6 rounded-xl border border-[#ffd4d7] px-4 py-2.5 text-xs font-bold text-[#b93c48] transition hover:bg-[#fff0f1]"
                >
                  Sign out
                </button>
              </article>
            </section>
          ) : activePage === "Dashboard" ? (
            <>
              <section className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#8795ad]">
                    {new Date().toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h1 className="font-display text-[24px] font-extrabold tracking-[-0.04em] text-[#172541] sm:text-[27px]">
                    Hello, {user.name} <span className="text-[23px]">👋</span>
                  </h1>
                  <p className="mt-1 text-[13px] text-[#77869f]">
                    Continue your learning journey!
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[#f2e8c8] bg-[#fffaf0] px-3 py-1.5 text-[11px] font-semibold text-[#9e782a]">
                  <Flame size={14} className="text-[#f5a33c]" />
                  {progress?.visits ?? 0} study sessions
                </div>
              </section>

              {notice && (
                <div className="mb-5 flex items-center justify-between rounded-xl border border-[#dce5ff] bg-white px-4 py-3 text-sm text-[#4856ba] shadow-sm">
                  <span>{notice}</span>
                  <button
                    type="button"
                    onClick={() => setNotice("")}
                    aria-label="Dismiss message"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <section
                aria-label="Study statistics"
                className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4"
              >
                {stats.map(({ label, note, icon: Icon, tone }) => {
                  const liveValue =
                    label === "Total Topics"
                      ? progress?.topics ?? 0
                      : label === "Saved Topics"
                        ? items.filter((item) => item.kind === "topic" && item.details?.saved).length
                        : label === "Downloads"
                          ? items.filter((item) => ["material", "topic", "questions"].includes(item.kind)).length
                          : progress?.exams ?? 0;
                  return (
                  <article
                    key={label}
                    className="rounded-2xl border border-[#e9eff8] bg-white p-4 shadow-panel transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(45,74,124,.1)] sm:p-[18px]"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-[#8795ad]">
                        {label}
                      </p>
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-[11px] ${
                          tone === "mint"
                            ? "bg-[#eaf8f3] text-[#31a77f]"
                            : tone === "blue"
                              ? "bg-[#edf4ff] text-[#5689f7]"
                              : tone === "sky"
                                ? "bg-[#eaf5ff] text-[#388cf3]"
                                : "bg-[#f3edff] text-[#9660ef]"
                        }`}
                      >
                        <Icon size={16} strokeWidth={2.3} />
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="font-display text-[25px] font-extrabold leading-none tracking-[-0.05em] text-[#192743]">
                        {liveValue}
                      </p>
                      <span className="text-right text-[9px] font-semibold text-[#7f8da5]">
                        {note}
                      </span>
                    </div>
                  </article>
                  );
                })}
              </section>

              <section className="mb-7">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#1b2945]">
                      Quick Actions
                    </h2>
                    <p className="mt-0.5 text-[11px] text-[#8b99af]">
                      Pick up where you left off
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectPage("My Topics")}
                    className="hidden items-center gap-1 text-[11px] font-bold text-brand hover:text-[#273ac6] sm:flex"
                  >
                    View all <ArrowRight size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {actions.map(({ title, description, icon: Icon, tone, page }) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => selectPage(page)}
                      className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-[#e8eef8] bg-white px-4 py-3 text-left shadow-panel transition hover:-translate-y-0.5 hover:border-[#ccd7ff] hover:shadow-[0_12px_28px_rgba(45,74,124,.1)]"
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-[13px] transition group-hover:scale-105 ${
                          tone === "violet"
                            ? "bg-[#f0edff] text-[#7558ef]"
                            : tone === "blue"
                              ? "bg-[#eaf2ff] text-[#3979ef]"
                              : tone === "sky"
                                ? "bg-[#e7f5ff] text-[#368cf2]"
                                : tone === "purple"
                                  ? "bg-[#f5eaff] text-[#9d58e8]"
                                  : tone === "indigo"
                                    ? "bg-[#eaf0ff] text-[#4d6cee]"
                                    : "bg-[#f2eaff] text-[#9a5fe8]"
                        }`}
                      >
                        <Icon size={18} strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-bold text-[#273550]">
                          {title}
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-[#91a0b7]">
                          {description}
                        </span>
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-[#bcc6d7] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <article className="rounded-2xl border border-[#e9eff8] bg-white p-4 shadow-panel sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-[15px] font-bold tracking-[-0.03em] text-[#1b2945]">
                        Your Recent Activity
                      </h2>
                      <p className="mt-0.5 text-[10px] text-[#8b99af]">
                        Here’s what you’ve been working on
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="More activity options"
                      className="grid h-8 w-8 place-items-center rounded-lg text-[#8391a8] hover:bg-[#f5f7fb]"
                      onClick={() => setNotice("Showing your latest study activity.")}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  <div className="divide-y divide-[#f0f3f8]">
                    {filteredActivities.length ? (
                      filteredActivities.map(
                        ({ title, detail, action, icon: Icon, tone }) => (
                          <div
                            key={title}
                            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                          >
                            <span
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                                tone === "red"
                                  ? "bg-[#fff0f1] text-[#ed5964]"
                                  : tone === "green"
                                    ? "bg-[#eaf8f2] text-[#26aa7d]"
                                    : "bg-[#fff4e8] text-[#ee9a3f]"
                              }`}
                            >
                              <Icon size={16} strokeWidth={2.2} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-bold text-[#33415b]">
                                {title}
                              </p>
                              <p className="mt-1 text-[10px] text-[#98a5b9]">
                                {detail}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => selectPage(
                                recentItems.find((item) => item.title === title)?.page || "My Topics",
                              )}
                              className="rounded-lg px-2 py-1 text-[10px] font-bold text-[#4e68df] hover:bg-[#f1f3ff]"
                            >
                              {action}
                            </button>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="py-8 text-center">
                        <Search size={18} className="mx-auto text-[#aab5c6]" />
                        <p className="mt-2 text-xs font-semibold text-[#6e7d95]">
                          No activity found
                        </p>
                        <p className="mt-1 text-[10px] text-[#98a5b9]">
                          Try a different search.
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => selectPage("My Topics")}
                    className="mt-4 flex w-full items-center justify-center gap-1 border-t border-[#f0f3f8] pt-3 text-[10px] font-bold text-[#5a6edc] hover:text-[#3149d2]"
                  >
                    View all activity <ArrowRight size={12} />
                  </button>
                </article>

                <article className="rounded-2xl border border-[#e9eff8] bg-white p-4 shadow-panel sm:p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h2 className="font-display text-[15px] font-bold tracking-[-0.03em] text-[#1b2945]">
                        Performance Overview
                      </h2>
                      <p className="mt-0.5 text-[10px] text-[#8b99af]">
                        Your progress across subjects
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotice("Showing your performance for this week.")}
                      className="rounded-lg border border-[#edf0f6] px-2.5 py-1.5 text-[10px] font-semibold text-[#75839a] hover:bg-[#f8faff]"
                    >
                      This week
                      <ChevronDown size={12} className="ml-1 inline" />
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-5 py-1 sm:flex-row sm:gap-6">
                    <div className="relative grid h-[126px] w-[126px] shrink-0 place-items-center">
                      <svg
                        viewBox="0 0 120 120"
                        className="h-full w-full -rotate-90"
                        role="img"
                        aria-label={`Overall score: ${progress?.averageScore || 0} percent`}
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="49"
                          fill="none"
                          stroke="#e9eef7"
                          strokeWidth="9"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="49"
                          fill="none"
                          stroke="#22b585"
                          strokeWidth="9"
                          strokeLinecap="round"
                          strokeDasharray={`${(progress?.averageScore || 0) * 3.08} 308`}
                        />
                      </svg>
                      <div className="absolute text-center">
                        <p className="font-display text-[22px] font-extrabold tracking-[-0.06em] text-[#263655]">
                          {progress?.averageScore || 0}%
                        </p>
                        <p className="mt-0.5 text-[9px] font-semibold text-[#8b99af]">
                          Overall Score
                        </p>
                      </div>
                    </div>
                    <div className="w-full flex-1 space-y-3">
                      {[
                        ["Exam average", progress?.averageScore || 0, "%"],
                        ["Topics created", progress?.topics || 0, ""],
                        ["Completed exams", progress?.completedExams || 0, ""],
                      ].map(([label, value, suffix]) => (
                        <div key={label}>
                          <div className="mb-1.5 flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-[#7d8ba3]">{label}</span>
                            <span className="font-bold text-[#495873]">{value}{suffix}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-[#eff2f8]">
                            <div
                              className="h-full rounded-full bg-[#5368ec]"
                              style={{ width: `${Math.min(Number(value) || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f7f9ff] px-3 py-2.5">
                    <span className="flex items-center gap-2 text-[10px] font-semibold text-[#71809a]">
                      <Clock3 size={13} className="text-[#7184db]" />
                      Study time this week
                    </span>
                    <span className="text-[11px] font-bold text-[#3c4c68]">{formatStudyTime(weeklyStudySeconds)}</span>
                  </div>
                </article>
              </section>
            </>
          ) : (
            <section className="grid min-h-[60vh] place-items-center">
              <div className="max-w-sm text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e9edff] text-[#5368ea]">
                  {(() => {
                    const page = navigation.find((item) => item.label === activePage);
                    const Icon = page?.icon ?? Settings;
                    return <Icon size={24} />;
                  })()}
                </span>
                <h1 className="mt-5 font-display text-2xl font-extrabold tracking-[-0.04em] text-[#172541]">
                  {activePage}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#7d8ba5]">
                  This space is ready for your next step. Use the dashboard to
                  explore your study tools and keep learning.
                </p>
                <button
                  type="button"
                  onClick={() => selectPage("Dashboard")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4658ee] px-4 py-2.5 text-xs font-bold text-white shadow-[0_7px_16px_rgba(70,88,238,.22)] transition hover:bg-[#3849d7]"
                >
                  Back to dashboard <ArrowRight size={14} />
                </button>
              </div>
            </section>
          )}
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[#e7edf7] pt-4 text-[10px] text-[#9aa7ba]">
            <span>© 2026 StudiFy. Keep learning, one step at a time.</span>
            <span className="flex items-center gap-1">
              Made for curious minds <Check size={12} className="text-[#2cae80]" />
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
