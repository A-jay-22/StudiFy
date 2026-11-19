import { useState } from "react";
import { Download, ExternalLink, LoaderCircle, Sparkles } from "lucide-react";
import { useStudy } from "../StudyContext.jsx";

export const GenerateQuestions = () => {
  const { studyApi, saveCreatedItem, onToast } = useStudy();
  const [subject, setSubject] = useState("Physics");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState(null);
  const [generating, setGenerating] = useState(false);

  async function generateQuestions(event) {
    event.preventDefault();
    if (!chapter.trim()) {
      onToast("Enter a topic or chapter first.", "error");
      return;
    }
    setGenerating(true);
    try {
      const result = await studyApi.generate({
        action: "questions",
        prompt: chapter.trim(),
        subject,
        difficulty,
      });
      setQuestions(result.item);
      await saveCreatedItem(result.item);
      onToast("Practice questions generated and saved as PDF!");
    } catch (error) {
      onToast(error.message, "error");
    } finally {
      setGenerating(false);
    }
  }

  function downloadText() {
    if (!questions) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([questions.content], { type: "text/plain;charset=utf-8" }),
    );
    link.download = `${questions.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-questions.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    onToast("Question set downloaded as .txt.");
  }

  return (
    <section className="mx-auto max-w-[1100px] page-transition">
      <header className="mb-6">
        <h1 className="font-display text-[23px] font-extrabold tracking-[-0.04em] text-[#172541]">
          Generate Practice Questions
        </h1>
        <p className="mt-1 text-[12px] text-[#8291a9]">
          Build, save, and download AI-generated practice questions as a PDF.
        </p>
      </header>
      <form onSubmit={generateQuestions} className="rounded-2xl border border-[#e8eef8] bg-white p-5 shadow-panel">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold text-[#77869f]">Subject</span>
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#e5ecf7] bg-white px-3 text-xs"
            >
              {[
                "Physics",
                "Mathematics",
                "Chemistry",
                "Biology",
                "Computer Science",
                "Geography",
                "History",
                "English",
                "General",
                "Other",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold text-[#77869f]">Topic or chapter</span>
            <input
              value={chapter}
              onChange={(event) => setChapter(event.target.value)}
              placeholder="e.g. Newton's laws of motion"
              maxLength={500}
              required
              className="h-11 w-full rounded-xl border border-[#e5ecf7] px-3 text-xs outline-none focus:border-[#aebaff]"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-[11px] font-bold text-[#77869f]">Difficulty</span>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#e5ecf7] bg-white px-3 text-xs sm:max-w-xs"
            >
              {["Easy", "Medium", "Hard"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={generating}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5146ed] px-6 text-xs font-bold text-white shadow-md hover:bg-[#4035dc] disabled:opacity-60 transition"
        >
          {generating ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {generating ? "Generating questions and creating PDF…" : "Generate and Save as PDF"}
        </button>
      </form>

      {questions && (
        <article className="mt-6 rounded-2xl border border-[#e8eef8] bg-white p-5 shadow-panel sm:p-7">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8291a9]">
                {subject} · {difficulty}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-[#263550]">
                {questions.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={studyApi.downloadUrl(questions._id, "pdf")}
                download
                onClick={() => onToast("Downloading practice questions as PDF...")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
              >
                <Download size={13} /> Download PDF
              </a>
              <a
                href={studyApi.viewPdfUrl(questions._id)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                <ExternalLink size={13} /> View PDF
              </a>
              <button
                type="button"
                onClick={downloadText}
                className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                .TXT
              </button>
            </div>
          </header>
          <div className="mt-5 whitespace-pre-wrap text-[12px] leading-7 text-[#52627d]">
            {questions.content}
          </div>
        </article>
      )}
    </section>
  );
}

export default GenerateQuestions;
