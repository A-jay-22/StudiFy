import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useStudy } from "../StudyContext.jsx";

function formatStudyTime(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
}

function ProgressReport() {
  const { progress, loading, items } = useStudy();

  const weeklyStudy = new Map(
    (progress?.weeklyStudy || []).map((entry) => [entry._id, entry.seconds]),
  );

  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      seconds: weeklyStudy.get(key) || 0,
    };
  });

  const maximum = Math.max(...days.map((day) => day.seconds), 1);
  const savedCount = items.filter((item) => item.kind === "topic" && item.details?.saved).length;

  const cards = [
    {
      label: "Total Study Time",
      value: formatStudyTime(progress?.studySeconds),
      icon: Clock3,
      tone: "bg-[#edf2ff] text-[#5368e9]",
    },
    {
      label: "Exams Completed",
      value: progress?.completedExams ?? 0,
      icon: FileQuestion,
      tone: "bg-[#fff6e8] text-[#e6a23b]",
    },
    {
      label: "Average Exam Score",
      value: `${progress?.averageScore ?? 0}%`,
      icon: Trophy,
      tone: "bg-[#eaf8f2] text-[#27a77b]",
    },
    {
      label: "Topics Created (AI)",
      value: progress?.topics ?? 0,
      icon: BookOpen,
      tone: "bg-[#f2edff] text-[#8d5ce7]",
    },
  ];

  return (
    <section className="mx-auto max-w-[1200px]">
      <header className="mb-6">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#8795ad]">
          Your Learning Performance
        </p>
        <h1 className="font-display text-[23px] font-extrabold tracking-[-0.04em] text-[#172541]">
          Progress &amp; Performance Report
        </h1>
        <p className="mt-1 text-[12px] text-[#8291a9]">
          Real-time tracking of your study sessions, AI topics, and mock exam scores.
        </p>
      </header>

      {loading || !progress ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-[#8291a9]">
          Loading your progress data…
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, tone }) => (
              <article
                key={label}
                className="rounded-2xl border border-[#e8eef8] bg-white p-4 shadow-panel transition hover:shadow-md"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
                  <Icon size={18} />
                </span>
                <p className="mt-4 text-[11px] font-semibold text-[#8795ad]">{label}</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-[#263550]">{value}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            {/* Weekly Study Time Chart */}
            <section className="rounded-2xl border border-[#e8eef8] bg-white p-5 shadow-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-[15px] font-bold text-[#263550]">
                    Study Time This Week
                  </h2>
                  <p className="mt-1 text-[10px] text-[#8b99af]">
                    Active study time spent on topics, exams, and AI queries.
                  </p>
                </div>
                <Clock3 size={17} className="text-[#5368ec]" />
              </div>
              <div className="mt-6 flex h-44 items-end justify-between gap-2">
                {days.map((day) => {
                  const percent = Math.max((day.seconds / maximum) * 100, day.seconds ? 8 : 3);
                  return (
                    <div
                      key={day.key}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-[9px] font-semibold text-[#8291a9]">
                        {day.seconds ? formatStudyTime(day.seconds) : ""}
                      </span>
                      <div
                        className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-[#5368ec] to-[#9ca8ff] transition-all duration-300"
                        style={{ height: `${percent}%` }}
                        title={`${day.label}: ${formatStudyTime(day.seconds)}`}
                      />
                      <span className="text-[10px] text-[#8291a9]">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Learning Milestones */}
            <section className="rounded-2xl border border-[#e8eef8] bg-white p-5 shadow-panel">
              <h2 className="font-display text-[15px] font-bold text-[#263550]">
                Learning Milestones
              </h2>
              <p className="mt-1 text-[10px] text-[#8b99af]">
                Your progress benchmarks across Studify.
              </p>
              <div className="mt-5 space-y-4">
                {[
                  ["Average Exam Score", progress.averageScore ?? 0, "%", Trophy, "bg-amber-500"],
                  ["Highest Exam Score", progress.highestScore ?? 0, "%", Award, "bg-emerald-500"],
                  ["Topics Saved to Library", savedCount, "", Target, "bg-blue-500"],
                  ["Documents Uploaded", progress.materials ?? 0, "", BookOpen, "bg-purple-500"],
                ].map(([label, value, suffix, Icon, barColor]) => (
                  <div key={label}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                      <span className="inline-flex items-center gap-2 font-semibold text-[#52627d]">
                        <Icon size={14} />
                        {label}
                      </span>
                      <strong className="text-[#33415b]">
                        {value}
                        {suffix}
                      </strong>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#eef1f7]">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${Math.min(Number(value) || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Recent Mock Exams Table */}
          <section className="mt-5 rounded-2xl border border-[#e8eef8] bg-white p-5 shadow-panel">
            <h2 className="font-display text-[15px] font-bold text-[#263550]">
              Recent Mock Exam Records
            </h2>
            <p className="text-[11px] text-[#8b99af] mt-0.5">
              Comprehensive test history evaluated by Gemini AI.
            </p>

            {!progress.recentExams?.length ? (
              <p className="mt-4 text-xs text-[#8291a9] text-center py-6">
                No mock exams completed yet. Start your first AI mock exam from the sidebar!
              </p>
            ) : (
              <div className="mt-4 divide-y divide-[#eff2f8]">
                {progress.recentExams.map((exam) => {
                  const score = Number(exam.details?.score) || 0;
                  const total = Number(exam.details?.totalQuestions) || 1;
                  const pct =
                    exam.details?.percentage ?? Math.round((score / Math.max(1, total)) * 100);
                  const isPass = pct >= 60;

                  return (
                    <div
                      key={exam._id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-[#344463] truncate">
                          {exam.title}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {exam.subject} · {new Date(exam.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-display text-xs font-bold text-gray-700">
                          {score}/{total} ({pct}%)
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isPass
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {isPass ? "Passed" : "Needs Review"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

export default ProgressReport;
