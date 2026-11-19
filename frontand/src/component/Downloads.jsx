import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  BookOpen,
  ExternalLink,
  FileCode,
  FileQuestion,
  FileText,
  Search,
} from "lucide-react";
import { useStudy } from "../StudyContext.jsx";

export const Downloads = () => {
  const { items, studyApi, onToast } = useStudy();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const downloadableItems = items.filter((item) =>
    ["topic", "material", "questions", "exam"].includes(item.kind),
  );

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return downloadableItems.filter((item) => {
      const typeMatches = filter === "All" || item.kind === filter;
      const textMatches =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query);
      return typeMatches && textMatches;
    });
  }, [downloadableItems, filter, search]);

  return (
    <section className="mx-auto max-w-[1100px] page-transition">
      <header className="mb-6">
        <h1 className="font-display text-[23px] font-extrabold tracking-[-0.04em] text-[#172541]">
          Downloads &amp; PDF Library
        </h1>
        <p className="mt-1 text-[12px] text-[#8291a9]">
          Download your saved study guides, practice question sets, and exam reports as PDF files.
        </p>
      </header>

      <section className="rounded-2xl border border-[#e8eef8] bg-white p-5 shadow-panel">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {["All", "topic", "questions", "exam", "material"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filter === option
                  ? "bg-[#5146ed] text-white shadow-sm"
                  : "bg-[#f5f7fc] text-[#75839a] hover:bg-gray-100"
              }`}
            >
              {option === "All"
                ? "All Files"
                : option === "topic"
                ? "Study Guides"
                : option === "questions"
                ? "Question Sets"
                : option === "exam"
                ? "Exams"
                : "Uploaded Materials"}
            </button>
          ))}
          <label className="relative ml-auto block w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a1b6]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search files..."
              className="h-9 w-full rounded-xl border border-[#e8eef8] pl-9 pr-3 text-xs outline-none focus:border-[#5146ed]"
            />
          </label>
        </div>

        {visibleItems.length ? (
          <div className="space-y-3">
            {visibleItems.map((item) => {
              const Icon =
                item.kind === "topic"
                  ? BookOpen
                  : item.kind === "questions"
                  ? FileQuestion
                  : item.kind === "exam"
                  ? FileText
                  : FileCode;

              return (
                <article
                  key={item._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#edf1f7] p-4 hover:border-gray-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 font-bold text-xs">
                      PDF
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-xs font-bold text-[#33415b]">
                        {item.file?.name || item.title}
                      </h2>
                      <p className="mt-0.5 text-[10px] text-[#8291a9]">
                        {item.subject} · {item.kind.toUpperCase()} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Primary PDF Download */}
                    <a
                      href={studyApi.downloadUrl(item._id, "pdf")}
                      download
                      onClick={() => onToast(`Downloading ${item.title} as PDF...`)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
                    >
                      <ArrowDownToLine size={13} /> Download PDF
                    </a>

                    {/* View PDF Inline */}
                    <a
                      href={studyApi.viewPdfUrl(item._id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                      title="Open PDF in new tab"
                    >
                      <ExternalLink size={13} /> View
                    </a>

                    {/* Secondary text formats */}
                    {item.kind === "topic" && (
                      <a
                        href={studyApi.downloadUrl(item._id, "txt")}
                        download
                        onClick={() => onToast(`Downloading ${item.title} (.txt)`)}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
                      >
                        .TXT
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto text-[#93a0b5] mb-2" />
            <p className="text-sm font-bold text-[#33415b]">No downloadable items</p>
            <p className="mt-1 text-xs text-[#8291a9]">
              Generate a topic or complete an exam to save PDF documents.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}

export default Downloads;
