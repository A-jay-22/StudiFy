import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock3,
  FileQuestion,
  HelpCircle,
  LoaderCircle,
  Download,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useStudy } from "../StudyContext.jsx";

const DEFAULT_SUBJECTS = [
  "Physics",
  "Mathematics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "English",
  "General",
  "Other"
];

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

export const MockExam = ({ onBack, preselectedMaterial = null }) => {
  const { items, createItem, studyApi, onToast } = useStudy();

  // Mode: "setup" | "taking" | "result"
  const [view, setView] = useState("setup");

  // Setup options
  const [subject, setSubject] = useState("Physics");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [sourceType, setSourceType] = useState(preselectedMaterial ? "material" : "topic");
  const [selectedMaterialId, setSelectedMaterialId] = useState(preselectedMaterial?._id || "");
  const [generating, setGenerating] = useState(false);

  // Active exam state
  const [examMeta, setExamMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedExamId, setSavedExamId] = useState('');
  const submittedRef = useRef(false);

  // Materials available for source
  const materials = useMemo(
    () => items.filter((item) => item.kind === "material"),
    [items]
  );

  useEffect(() => {
    if (preselectedMaterial) {
      setSourceType("material");
      setSelectedMaterialId(preselectedMaterial._id);
      setSubject(preselectedMaterial.subject || "General");
      setTopic(preselectedMaterial.title || "");
    }
  }, [preselectedMaterial]);

  async function handleGenerateExam(e) {
    if (e) e.preventDefault();

    if (sourceType === "topic" && !topic.trim()) {
      onToast("Please enter a topic or chapter name.", "error");
      return;
    }

    if (sourceType === "material" && !selectedMaterialId) {
      onToast("Please select an uploaded study material.", "error");
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        action: "mock-exam",
        subject,
        prompt: topic.trim() || subject,
        difficulty,
        count: Number(questionCount) || 10,
      };

      if (sourceType === "material" && selectedMaterialId) {
        payload.materialId = selectedMaterialId;
      }

      const res = await studyApi.generate(payload);

      if (!res.questions || res.questions.length === 0) {
        throw new Error("No questions were generated. Please try a different topic.");
      }

      const generatedQuestions = res.questions;
      const calculatedDuration = generatedQuestions.length * 90; // 1.5 minutes per question

      setQuestions(generatedQuestions);
      setExamMeta({
        title: `${subject}: ${topic.trim() || "Mock Test"}`,
        subject,
        topic: topic.trim(),
        difficulty,
        totalQuestions: generatedQuestions.length,
      });

      setCurrentQuestion(0);
      setAnswers({});
      setTimeLeft(calculatedDuration);
      setTotalTime(calculatedDuration);
      submittedRef.current = false;
      setView("taking");
      onToast(`Mock exam ready with ${generatedQuestions.length} questions!`);
    } catch (err) {
      onToast(err.message || "Failed to generate mock exam. Please try again.", "error");
    } finally {
      setGenerating(false);
    }
  }

  // Timer countdown
  useEffect(() => {
    if (view !== "taking" || timeLeft <= 0) return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [view, timeLeft]);

  // Auto-submit when time expires
  useEffect(() => {
    if (view === "taking" && timeLeft === 0 && questions.length > 0) {
      handleFinishExam();
    }
  }, [view, timeLeft, questions]);

  function chooseAnswer(optionIndex) {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
  }

  async function handleFinishExam() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSaving(true);

    const answeredCount = Object.keys(answers).length;
    let correctCount = 0;

    const questionsWithReview = questions.map((q, idx) => {
      const userAns = answers[idx];
      const isCorrect = userAns !== undefined && userAns === q.answer;
      if (isCorrect) correctCount += 1;
      return {
        ...q,
        userAnswer: userAns !== undefined ? userAns : -1,
        isCorrect,
      };
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    const durationSpent = Math.max(1, totalTime - timeLeft);

    try {
      const savedItem = await createItem({
        kind: "exam",
        title: examMeta?.title || `${subject} Mock Exam`,
        subject: examMeta?.subject || subject,
        content: `Score: ${correctCount}/${questions.length} (${percentage}%) - Difficulty: ${difficulty}`,
        details: {
          completed: true,
          score: correctCount,
          totalQuestions: questions.length,
          answered: answeredCount,
          percentage,
          durationSeconds: durationSpent,
          difficulty,
          topic: examMeta?.topic || topic,
          questions: questionsWithReview,
        },
      });

      if (savedItem?._id) setSavedExamId(savedItem._id);
      onToast(`Exam submitted! You scored ${correctCount}/${questions.length} (${percentage}%).`);
    } catch (error) {
      onToast(`Result recorded locally, but sync failed: ${error.message}`, "error");
    } finally {
      setSaving(false);
      setView("result");
    }
  }

  const answeredCount = Object.keys(answers).length;
  const current = questions[currentQuestion];

  // Calculate score for result view
  const finalScore = useMemo(() => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) correct += 1;
    });
    return correct;
  }, [questions, answers]);

  const percentage = questions.length ? Math.round((finalScore / questions.length) * 100) : 0;

  // 1. SETUP VIEW
  if (view === "setup") {
    return (
      <section className="mx-auto max-w-[900px] page-transition">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to dashboard"
              className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#172541]">
                AI Mock Exam Generator
              </h1>
              <p className="mt-0.5 text-xs text-[#8291a9]">
                Generate tailored practice tests powered by Gemini AI.
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleGenerateExam}
          className="rounded-2xl border border-[#e8eef8] bg-white p-6 shadow-panel space-y-6"
        >
          {/* Source Selection */}
          <div>
            <label className="block text-xs font-bold text-[#455571] mb-2">
              Generate Questions From
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType("topic")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  sourceType === "topic"
                    ? "border-[#5146ed] bg-[#f5f4ff] text-[#5146ed] ring-2 ring-[#e5e3ff]"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Sparkles size={16} />
                Any Topic or Chapter
              </button>
              <button
                type="button"
                onClick={() => setSourceType("material")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  sourceType === "material"
                    ? "border-[#5146ed] bg-[#f5f4ff] text-[#5146ed] ring-2 ring-[#e5e3ff]"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileQuestion size={16} />
                Uploaded Document ({materials.length})
              </button>
            </div>
          </div>

          {sourceType === "material" ? (
            <div>
              <label className="block text-xs font-bold text-[#455571] mb-1.5">
                Select Uploaded Document
              </label>
              {materials.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center">
                  <p className="text-xs text-gray-500">No documents uploaded yet.</p>
                  <p className="text-[11px] text-[#5146ed] mt-1 font-semibold">
                    Upload a PDF or notes in "Upload Material" first.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedMaterialId}
                  onChange={(e) => {
                    setSelectedMaterialId(e.target.value);
                    const mat = materials.find((m) => m._id === e.target.value);
                    if (mat) {
                      setSubject(mat.subject || "General");
                      setTopic(mat.title || "");
                    }
                  }}
                  required
                  className="h-11 w-full rounded-xl border border-[#dce5f1] bg-white px-3 text-xs outline-none focus:border-[#75a5ff]"
                >
                  <option value="">-- Choose an uploaded document --</option>
                  {materials.map((mat) => (
                    <option key={mat._id} value={mat._id}>
                      {mat.file?.name || mat.title} ({mat.subject})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#455571] mb-1.5">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#dce5f1] bg-white px-3 text-xs outline-none focus:border-[#75a5ff]"
                >
                  {DEFAULT_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#455571] mb-1.5">
                  Topic or Syllabus Focus
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Newton's laws of motion, Cell division, Calculus"
                  className="h-11 w-full rounded-xl border border-[#dce5f1] px-3.5 text-xs outline-none focus:border-[#75a5ff]"
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#455571] mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#dce5f1] bg-white px-3 text-xs outline-none focus:border-[#75a5ff]"
              >
                <option value="Easy">Easy (Fundamental concepts)</option>
                <option value="Medium">Medium (Standard exam level)</option>
                <option value="Hard">Hard (Advanced analytical)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#455571] mb-1.5">
                Number of Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-[#dce5f1] bg-white px-3 text-xs outline-none focus:border-[#75a5ff]"
              >
                <option value={5}>5 Questions (Fast practice ~ 7 min)</option>
                <option value={10}>10 Questions (Standard test ~ 15 min)</option>
                <option value={15}>15 Questions (Thorough quiz ~ 22 min)</option>
                <option value={20}>20 Questions (Full exam ~ 30 min)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={generating || (sourceType === "material" && !selectedMaterialId)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#249cf7] via-[#3d78f7] to-[#7853f1] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-105 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Generating Exam Questions with Gemini AI…
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Start AI Mock Exam
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-gray-400">
              Gemini will generate fresh multiple-choice questions with full explanations.
            </p>
          </div>
        </form>
      </section>
    );
  }

  // 2. RESULT VIEW
  if (view === "result") {
    const isPass = percentage >= 60;
    return (
      <section className="mx-auto max-w-[900px] space-y-6 page-transition">
        <div className="rounded-3xl border border-[#e8eef8] bg-white p-7 text-center shadow-panel sm:p-10 animate-scale-in">
          <span
            className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl shadow-sm animate-pop ${
              isPass ? "bg-[#eaf8f2] text-[#27a77b]" : "bg-[#fff2f2] text-[#e64757]"
            }`}
          >
            {isPass ? <Award size={32} /> : <FileQuestion size={32} />}
          </span>

          <h1 className="mt-4 font-display text-2xl font-black text-[#172541]">
            {isPass ? "Congratulations! Exam Passed" : "Good Effort! Keep Practicing"}
          </h1>
          <p className="mt-1 text-xs text-[#8291a9]">
            {examMeta?.title || `${subject} Mock Exam`} · {difficulty} Difficulty
          </p>

          <div className="my-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#f6f8ff] p-5">
            <div>
              <p className="font-display text-3xl font-black text-[#384fe8]">
                {finalScore}/{questions.length}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-[#8291a9]">Correct Answers</p>
            </div>
            <div>
              <p className="font-display text-3xl font-black text-[#384fe8]">
                {percentage}%
              </p>
              <p className="mt-1 text-[11px] font-semibold text-[#8291a9]">Overall Score</p>
            </div>
            <div>
              <p className="font-display text-3xl font-black text-[#384fe8]">
                {formatTime(totalTime - timeLeft)}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-[#8291a9]">Time Spent</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setTimeLeft(totalTime);
                submittedRef.current = false;
                setView("taking");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
            >
              <RotateCcw size={14} />
              Retake This Exam
            </button>
            {savedExamId && (
              <a
                href={studyApi.downloadUrl(savedExamId, "pdf")}
                download
                onClick={() => onToast("Downloading Exam Report as PDF...")}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
              >
                <Download size={14} />
                Download Exam PDF
              </a>
            )}
            <button
              type="button"
              onClick={() => setView("setup")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5146ed] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#4035dc] transition"
            >
              <Sparkles size={14} />
              Generate New Exam
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="rounded-2xl border border-[#e8eef8] bg-white p-6 shadow-panel">
          <h2 className="font-display text-lg font-bold text-[#1a2b49] mb-4">
            Detailed Review &amp; Explanations
          </h2>

          <div className="space-y-5">
            {questions.map((q, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === q.answer;

              return (
                <article
                  key={idx}
                  className={`rounded-2xl border p-5 transition ${
                    isCorrect
                      ? "border-emerald-200 bg-emerald-50/20"
                      : "border-rose-200 bg-rose-50/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex items-center gap-2 font-bold text-xs text-[#2b3c58]">
                      {isCorrect ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <XCircle size={16} className="text-rose-500" />
                      )}
                      Question {idx + 1}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isCorrect ? "Correct (+1)" : "Incorrect (0)"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[#1f2f4a] leading-relaxed">
                    {q.question}
                  </p>

                  <div className="mt-3 space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = userAns === optIdx;
                      const isCorrectChoice = q.answer === optIdx;

                      let rowStyle = "border-gray-200 bg-white text-gray-700";
                      if (isCorrectChoice) {
                        rowStyle = "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold";
                      } else if (isUserChoice) {
                        rowStyle = "border-rose-300 bg-rose-50 text-rose-900";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center justify-between rounded-xl border px-3.5 py-2 text-xs ${rowStyle}`}
                        >
                          <span>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                          {isCorrectChoice && (
                            <span className="text-[10px] font-bold text-emerald-600">
                              ✓ Correct Answer
                            </span>
                          )}
                          {isUserChoice && !isCorrectChoice && (
                            <span className="text-[10px] font-bold text-rose-500">
                              ✗ Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-xs leading-relaxed text-[#244275]">
                      <span className="font-bold flex items-center gap-1.5 text-blue-700 mb-1">
                        <Sparkles size={13} /> AI Explanation:
                      </span>
                      {q.explanation}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // 3. TAKING EXAM VIEW
  return (
    <section className="mx-auto max-w-[1100px] page-transition">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back to setup"
            onClick={() => {
              if (window.confirm("Exit this exam? Your progress will not be saved.")) {
                setView("setup");
              }
            }}
            className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight text-[#172541]">
              {examMeta?.title || `${subject} Mock Test`}
            </h1>
            <p className="text-[11px] text-[#8291a9]">
              {questions.length} Questions · {difficulty} Difficulty · AI-Evaluated
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${
            timeLeft <= 60
              ? "border-red-200 bg-red-50 text-red-600 animate-pulse"
              : "border-blue-100 bg-blue-50/60 text-[#334fd0]"
          }`}
        >
          <Clock3 size={15} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      <div className="grid overflow-hidden rounded-2xl border border-[#e8eef8] bg-white shadow-panel lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Main Question Panel */}
        <section className="p-5 sm:p-7">
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#72819a]">
              <span>
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span>{answeredCount} answered</span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
            >
              <div
                className="h-full rounded-full bg-[#4e5eef] transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <article key={currentQuestion} className="rounded-2xl border border-[#edf1f7] bg-white p-5 min-h-[380px] flex flex-col justify-between animate-fade-in-up">
            <div>
              <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase mb-3">
                Question {currentQuestion + 1}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-[#233554] leading-relaxed mb-6">
                {current?.question}
              </h2>

              <fieldset className="space-y-2.5">
                <legend className="sr-only">Choose an answer</legend>
                {current?.options?.map((option, optIdx) => {
                  const isSelected = answers[currentQuestion] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] ${
                        isSelected
                          ? "border-[#4d5ef0] bg-[#f0f3ff] text-[#2c3ea8] shadow-md shadow-blue-500/10 scale-[1.01]"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/70 hover:shadow-sm"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQuestion}`}
                        value={optIdx}
                        checked={isSelected}
                        onChange={() => chooseAnswer(optIdx)}
                        className="h-4 w-4 accent-[#4d5ef0]"
                      />
                      <span>
                        <strong className="mr-1.5">{String.fromCharCode(65 + optIdx)}.</strong>
                        {option}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            </div>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion((q) => q - 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                <ArrowLeft size={14} />
                Previous
              </button>

              {currentQuestion < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestion((q) => q + 1)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#5146ed] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#4035dc] transition"
                >
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleFinishExam}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  {saving ? "Submitting…" : "Submit Exam"} <Check size={14} />
                </button>
              )}
            </div>
          </article>
        </section>

        {/* Sidebar Question Navigator */}
        <aside className="border-t border-[#edf1f7] bg-[#fbfcff] p-5 lg:border-l lg:border-t-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-[#263550]">Question Grid</h2>
              <span className="text-[10px] font-semibold text-gray-400">
                {answeredCount}/{questions.length} Answered
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const isCurrent = currentQuestion === idx;
                const isAnswered = answers[idx] !== undefined;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestion(idx)}
                    className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold transition ${
                      isCurrent
                        ? "bg-[#4d5ef0] text-white shadow"
                        : isAnswered
                        ? "bg-emerald-500 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-2 border-t border-gray-100 pt-4 text-[10px] text-gray-500">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4d5ef0]" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full border border-gray-300 bg-white" />
                <span>Unattempted</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleFinishExam}
            className="mt-6 w-full rounded-xl bg-gray-900 py-2.5 text-xs font-bold text-white shadow hover:bg-black transition"
          >
            {saving ? "Submitting…" : "Finish &amp; Grade Exam"}
          </button>
        </aside>
      </div>
    </section>
  );
}

export default MockExam;
