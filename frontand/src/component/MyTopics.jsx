import { useMemo, useState } from "react";
import {
  BookOpen,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileQuestion,
  FileText,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useStudy } from "../StudyContext.jsx";

export const MyTopics = ({ onCreateTopic, onMockExam }) => {
  const { items, deleteItem, updateItem, studyApi, onToast, loading } = useStudy();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const topics = items.filter((item) => item.kind === "topic");

  const visibleTopics = useMemo(() => {
    const query = search.trim().toLowerCase();
    return topics.filter((topic) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Saved" && topic.details?.saved) ||
        (filter === "Created" && !topic.details?.saved);
      return (
        matchesFilter &&
        (!query ||
          topic.title.toLowerCase().includes(query) ||
          topic.subject.toLowerCase().includes(query) ||
          topic.content.toLowerCase().includes(query))
      );
    });
  }, [topics, filter, search]);

  async function toggleSaved(topic) {
    try {
      await updateItem(topic._id, {
        kind: topic.kind,
        title: topic.title,
        subject: topic.subject,
        content: topic.content,
        details: { ...topic.details, saved: !topic.details?.saved },
      });
      onToast(
        topic.details?.saved ? "Topic removed from saved library." : "Topic saved to library."
      );
    } catch (error) {
      onToast(error.message, "error");
    }
  }

  async function removeTopic(topic) {
    if (!window.confirm(`Delete "${topic.title}"? This cannot be undone.`)) return;
    try {
      await deleteItem(topic._id);
      if (selected?._id === topic._id) setSelected(null);
      onToast("Topic deleted.");
    } catch (error) {
      onToast(error.message, "error");
    }
  }

  return (
    <section className="mx-auto max-w-[1200px] page-transition">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[23px] font-extrabold tracking-[-0.04em] text-[#172541]">
            My Topics &amp; PDF Library
          </h1>
          <p className="mt-1 text-[12px] text-[#8291a9]">
            Saved AI-generated topics, study guides, and downloadable PDF documents.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateTopic}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#5146ed] px-4 text-xs font-bold text-white shadow-md hover:bg-[#4035dc] transition"
        >
          <Plus size={15} /> Create Topic with AI
        </button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {["All", "Saved", "Created"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            aria-pressed={filter === option}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              filter === option
                ? "bg-[#5146ed] text-white shadow-sm"
                : "bg-white text-[#75839a] hover:bg-gray-50"
            }`}
          >
            {option} {option === "All" ? `(${topics.length})` : ""}
          </button>
        ))}
        <label className="relative ml-auto block w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a1b6]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your topics..."
            className="h-10 w-full rounded-xl border border-[#e8eef8] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#aebaff]"
          />
        </label>
      </div>

      {loading ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-[#8291a9]">
          Loading your topics…
        </p>
      ) : visibleTopics.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleTopics.map((topic) => (
            <article
              key={topic._id}
              className="rounded-2xl border border-[#e8eef8] bg-white p-5 shadow-panel flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 font-bold text-xs">
                    PDF
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-bold text-[#33415b]">{topic.title}</h2>
                    <p className="mt-0.5 text-[10px] text-[#8291a9]">
                      {topic.subject} · {new Date(topic.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {topic.details?.saved && (
                    <span title="Bookmarked">
                      <Star size={16} fill="#f59e0b" className="text-amber-500" />
                    </span>
                  )}
                </div>
                <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-[#677792]">
                  {topic.content}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eff2f8] pt-3">
                <button
                  type="button"
                  onClick={() => setSelected(topic)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#f1f3ff] px-2.5 py-1.5 text-xs font-bold text-[#5368df] hover:bg-[#e4e8ff] transition"
                >
                  <Eye size={13} /> Read
                </button>

                <button
                  type="button"
                  onClick={() => void toggleSaved(topic)}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 transition"
                >
                  <Star size={13} fill={topic.details?.saved ? "currentColor" : "none"} />
                  {topic.details?.saved ? "Saved" : "Save"}
                </button>

                {onMockExam && (
                  <button
                    type="button"
                    onClick={() => onMockExam(topic)}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                    title="Generate Mock Test from this topic"
                  >
                    <FileQuestion size={13} /> Test
                  </button>
                )}

                {/* Direct PDF Download */}
                <a
                  href={studyApi.downloadUrl(topic._id, "pdf")}
                  download
                  onClick={() => onToast(`Downloading ${topic.title} as PDF...`)}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  title="Download Formatted PDF"
                >
                  <Download size={13} /> Download PDF
                </a>

                <a
                  href={studyApi.viewPdfUrl(topic._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                  title="View PDF"
                >
                  <ExternalLink size={12} />
                </a>

                <button
                  type="button"
                  onClick={() => void removeTopic(topic)}
                  aria-label={`Delete ${topic.title}`}
                  className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#d9e1f1] bg-white p-12 text-center">
          <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
          <h2 className="text-sm font-bold text-[#33415b]">No topics found</h2>
          <p className="mt-1 text-xs text-[#8291a9]">
            Generate a new topic with AI to save study guides to your PDF library.
          </p>
        </div>
      )}

      {/* Full Topic Reader Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <article
            role="dialog"
            aria-modal="true"
            aria-labelledby="topic-dialog-title"
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8291a9]">
                  {selected.subject} · {selected.details?.difficulty || "Medium"}
                </p>
                <h2
                  id="topic-dialog-title"
                  className="mt-1 font-display text-xl font-bold text-[#263550]"
                >
                  {selected.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={studyApi.downloadUrl(selected._id, "pdf")}
                  download
                  onClick={() => onToast("Downloading PDF...")}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
                >
                  <Download size={13} /> Download PDF
                </a>
                <a
                  href={studyApi.viewPdfUrl(selected._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  <ExternalLink size={13} /> View PDF
                </a>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close topic"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
            </header>
            <div className="mt-6 whitespace-pre-wrap text-xs sm:text-sm leading-7 text-[#43526d]">
              {selected.content}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

export default MyTopics;
