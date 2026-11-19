import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  BookOpen,
  Check,
  Clock3,
  Download,
  ExternalLink,
  FileQuestion,
  Search,
  Trophy,
} from "lucide-react";
import { useStudy } from "../StudyContext.jsx";

export const MyExams = ({ onStartExam }) => {
  const { items, studyApi, onToast, loading } = useStudy();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const exams = items.filter((item) => item.kind === "exam");
  const completed = exams.filter((exam) => exam.details?.completed);

  const average = completed.length
    ? Math.round(
        completed.reduce(
          (total, exam) =>
            total +
            ((Number(exam.details?.score) || 0) /
              Math.max(1, Number(exam.details?.totalQuestions) || 1)) *
              100,
          0,
        ) / completed.length,
      )
    : 0;

  const visibleExams = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exams.filter((exam) => {
      const isCompleted = Boolean(exam.details?.completed);
      return (
        (filter === "All" ||
          (filter === "Completed" && isCompleted) ||
          (filter === "In progress" && !isCompleted)) &&
        (!query ||
          exam.title.toLowerCase().includes(query) ||
          exam.subject.toLowerCase().includes(query))
      );
    });
  }, [exams, filter, search]);

  return (
    <section className="mx-auto max-w-[1100px] page-transition">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[23px] font-extrabold tracking-[-0.04em] text-[#172541]">
            My Mock Exams &amp; Reports
          </h1>
          <p className="mt-1 text-[12px] text-[#8291a9]">
            Review your test scores and download full exam reports as PDF documents.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartExam}
          className="inline-flex items-center gap-2 rounded-xl bg-[#5146ed] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#4035dc] transition"
        >
          <FileQuestion size={14} /> Start AI Mock Exam
        </button>
      </header>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Total Exams", exams.length, BookOpen],
          ["Completed", completed.length, Check],
          ["Average Score", `${average}%`, Trophy],
        ].map(([label, value, Icon]) => (
          <article
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-[#e8eef8] bg-white p-4 shadow-panel"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf2ff] text-[#5368e9]">
              <Icon size={18} />
            </span>
            <div>
              <p className="text-[10px] font-semibold text-[#8795ad]">{label}</p>
              <p className="mt-1 text-xl font-extrabold text-[#263550]">{value}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-[#e8eef8] bg-white p-4 shadow-panel sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {["All", "Completed", "In progress"].map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold transition ${
                filter === option
                  ? "bg-[#5146ed] text-white shadow-sm"
                  : "bg-[#f5f7fc] text-[#75839a] hover:bg-gray-100"
              }`}
            >
              {option}
            </button>
          ))}
          <label className="relative ml-auto block w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a1b6]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exams..."
              className="h-9 w-full rounded-xl border border-[#e8eef8] pl-9 pr-3 text-[11px] outline-none focus:border-[#5146ed]"
            />
          </label>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-[#8291a9]">Loading your exam history…</p>
        ) : visibleExams.length ? (
          <div className="space-y-3">
            {visibleExams.map((exam) => {
              const score = Number(exam.details?.score) || 0;
              const total = Number(exam.details?.totalQuestions) || 0;
              const isCompleted = Boolean(exam.details?.completed);

              return (
                <article
                  key={exam._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#edf1f7] p-4 hover:border-gray-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f2edff] text-[#8d5ce7]">
                      <FileQuestion size={18} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-xs font-bold text-[#33415b]">{exam.title}</h2>
                      <p className="mt-0.5 text-[10px] text-[#8291a9]">
                        {exam.subject} · {new Date(exam.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold ${
                        isCompleted
                          ? "bg-[#eaf8f2] text-[#269d74]"
                          : "bg-[#fff6e8] text-[#bb842b]"
                      }`}
                    >
                      {isCompleted ? <Check size={12} /> : <Clock3 size={12} />}
                      {isCompleted ? "Completed" : "In progress"}
                    </span>

                    {isCompleted && (
                      <>
                        <span className="font-display text-xs font-extrabold text-[#5368df]">
                          {score}/{total}
                        </span>

                        <a
                          href={studyApi.downloadUrl(exam._id, "pdf")}
                          download
                          onClick={() => onToast(`Downloading ${exam.title} report as PDF...`)}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                          title="Download Exam PDF Report"
                        >
                          <Download size={13} /> PDF Report
                        </a>

                        <a
                          href={studyApi.viewPdfUrl(exam._id)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                          title="View PDF"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <FileQuestion size={28} className="mx-auto text-[#93a0b5] mb-2" />
            <p className="text-sm font-bold text-[#33415b]">No exams yet</p>
            <p className="mt-1 text-xs text-[#8291a9]">Take a mock exam to see your results and PDF reports here.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default MyExams;
