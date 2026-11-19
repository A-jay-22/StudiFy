import { useRef, useState } from "react";
import {
  ArrowDownToLine,
  BadgeCheck,
  BrainCircuit,
  FileCode,
  FileImage,
  FileQuestion,
  FileText,
  LoaderCircle,
  MessageCircle,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useStudy } from "../StudyContext.jsx";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [".pdf", ".jpg", ".jpeg", ".png", ".txt", ".md"];

export const UploadMaterial = ({ onAskAi, onMockExam }) => {
  const { items, uploadItem, deleteItem, studyApi, onToast, loading } = useStudy();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [subject, setSubject] = useState("General");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const files = items.filter((item) => item.kind === "material");

  async function addFiles(fileList) {
    const selectedFiles = Array.from(fileList);
    const errors = [];

    for (const file of selectedFiles) {
      const extension = `.${file.name.split(".").pop().toLowerCase()}`;
      if (!ACCEPTED_FILE_TYPES.includes(extension)) {
        errors.push(`${file.name}: please choose a PDF, TXT, MD, JPG, or PNG file.`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: file must be 15 MB or smaller.`);
      } else {
        setUploading(true);
        try {
          await uploadItem(file, subject);
          onToast(`${file.name} uploaded successfully.`);
        } catch (uploadError) {
          errors.push(`${file.name}: ${uploadError.message}`);
        } finally {
          setUploading(false);
        }
      }
    }
    setError(errors.join(" "));
  }

  function handleFileChange(event) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  return (
    <section className="mx-auto max-w-[950px] page-transition">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[23px] font-extrabold tracking-[-0.04em] text-[#172541]">
            Upload Study Material
          </h1>
          <p className="mt-1 text-xs text-[#8291a9]">
            Upload textbooks, lecture notes, or problem sheets to chat with AI or generate tests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600">Assign Subject:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-blue-500"
          >
            {["General", "Physics", "Mathematics", "Chemistry", "Biology", "Computer Science", "History", "English", "Other"].map(
              (sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              )
            )}
          </select>
        </div>
      </header>

      {/* Drag & Drop Upload Box */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        className={`flex min-h-[250px] flex-col items-center justify-center rounded-3xl border-2 border-dashed px-5 py-8 text-center transition ${
          isDragging ? "border-[#5146ed] bg-[#f0f3ff]" : "border-[#cbd3ff] bg-white/80 shadow-sm"
        }`}
      >
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#eff1ff] text-[#4c5df0]">
          <Upload size={28} strokeWidth={2.1} />
        </div>
        <p className="text-sm font-bold text-[#34415d]">
          Drag &amp; drop your study documents here
        </p>
        <p className="my-2 text-xs text-[#9aa7bb]">or</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl bg-[#5146ed] px-7 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#4035dc]"
        >
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.txt,.md"
          multiple
          onChange={handleFileChange}
          className="hidden"
          aria-label="Choose study materials"
        />
        <p className="mt-4 text-[11px] text-[#91a0b6]">
          Supports PDF, TXT, Markdown, JPG, PNG (Max 15MB)
        </p>
      </div>

      {uploading && (
        <p role="status" className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#5368df]">
          <LoaderCircle size={15} className="animate-spin" /> Uploading and preparing your document for Gemini AI…
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-[#fff0f1] px-4 py-3 text-xs font-medium text-[#c83f4b]">
          {error}
        </p>
      )}

      {/* Uploaded Materials List */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold text-[#1b2945]">
            Your Uploaded Documents ({files.length})
          </h2>
          <span className="text-xs text-gray-400">
            Click Ask AI or Mock Exam to learn from any file
          </span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="rounded-xl bg-white p-5 text-center text-xs text-[#8291a9]">Loading materials…</p>
          ) : files.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
              <FileText size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-bold text-gray-600">No documents uploaded yet</p>
              <p className="text-[11px] text-gray-400 mt-1">Upload a PDF or notes to begin questioning the AI.</p>
            </div>
          ) : (
            files.map((file) => {
              const fileName = file.file?.name || file.title;
              const isImage = /\.(jpe?g|png)$/i.test(fileName);
              const isPdf = /\.pdf$/i.test(fileName);
              const FileIcon = isImage ? FileImage : isPdf ? FileText : FileCode;

              return (
                <article
                  key={file._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8eef8] bg-white p-4 shadow-panel transition hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                        isImage
                          ? "bg-blue-50 text-blue-600"
                          : isPdf
                          ? "bg-rose-50 text-rose-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      <FileIcon size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#293855]">{fileName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Subject: <strong className="text-gray-600">{file.subject}</strong> · Uploaded {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this document */}
                  <div className="flex items-center gap-2">
                    {onAskAi && (
                      <button
                        type="button"
                        onClick={() => onAskAi(file)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                        title="Chat with AI about this document"
                      >
                        <MessageCircle size={14} />
                        <span>Ask AI</span>
                      </button>
                    )}

                    {onMockExam && (
                      <button
                        type="button"
                        onClick={() => onMockExam(file)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
                        title="Generate mock test from this file"
                      >
                        <Sparkles size={14} />
                        <span>Mock Test</span>
                      </button>
                    )}

                    <a
                      href={studyApi.downloadUrl(file._id)}
                      download
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                      title="Download file"
                    >
                      <ArrowDownToLine size={14} />
                    </a>

                    <button
                      type="button"
                      aria-label={`Delete ${fileName}`}
                      onClick={async () => {
                        if (window.confirm(`Delete ${fileName}?`)) {
                          try {
                            await deleteItem(file._id);
                            onToast("Document deleted.");
                          } catch (err) {
                            onToast(err.message, "error");
                          }
                        }
                      }}
                      className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 transition"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </section>
  );
}

export default UploadMaterial;
