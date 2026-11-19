import { useEffect, useRef, useState } from "react";
import {
  Bot,
  FileText,
  LoaderCircle,
  MessageCircle,
  Paperclip,
  Send,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useStudy } from "../StudyContext.jsx";

const GENERAL_SUGGESTIONS = [
  "Explain this topic in simple language with an example",
  "What are the most critical formulas for exams?",
  "Give me a step-by-step problem-solving strategy",
];

const DOCUMENT_SUGGESTIONS = [
  "Summarize the key concepts of this document",
  "List the core definitions and formulas explained here",
  "What questions are likely to appear on an exam from this?",
  "Explain the hardest concept in this file in simple words",
];

export const AskAI = ({ preselectedMaterial = null }) => {
  const { items, uploadItem, studyApi, onToast } = useStudy();
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(preselectedMaterial?._id || "");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const materials = items.filter((item) => item.kind === "material");
  const selectedMaterial = materials.find((m) => m._id === selectedMaterialId);

  useEffect(() => {
    if (preselectedMaterial?._id) {
      setSelectedMaterialId(preselectedMaterial._id);
      setMessages([
        {
          role: "assistant",
          text: `Hello! I've loaded your document **"${preselectedMaterial.file?.name || preselectedMaterial.title}"**. What would you like to know or learn from it?`,
        },
      ]);
    }
  }, [preselectedMaterial]);

  async function handleDirectFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const created = await uploadItem(file, "General");
      setSelectedMaterialId(created._id);
      onToast(`Document "${file.name}" uploaded and attached to AI chat!`);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `📄 Attached document **"${file.name}"**! You can now ask questions, request summaries, or test your knowledge on this file.`,
        },
      ]);
    } catch (err) {
      onToast(err.message || "File upload failed.", "error");
    } finally {
      setUploadingDoc(false);
      e.target.value = "";
    }
  }

  async function sendQuestion(value = question) {
    const text = value.trim();
    if (!text || asking) return;

    const newHistory = [...messages, { role: "user", text }];
    setMessages(newHistory);
    setQuestion("");
    setAsking(true);

    try {
      const payload = {
        action: selectedMaterialId ? "chat-document" : "answer",
        prompt: text,
        history: newHistory.slice(-6),
      };

      if (selectedMaterialId) {
        payload.materialId = selectedMaterialId;
      }

      const result = await studyApi.generate(payload);
      setMessages((prev) => [...prev, { role: "assistant", text: result.answer }]);

      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (error) {
      onToast(error.message, "error");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `I couldn't answer that just now. ${error.message}`,
        },
      ]);
    } finally {
      setAsking(false);
    }
  }

  const activeSuggestions = selectedMaterial ? DOCUMENT_SUGGESTIONS : GENERAL_SUGGESTIONS;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-180px)] max-w-[1100px] flex-col">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#eaf0ff] text-[#4965ec]">
            <MessageCircle size={20} />
          </span>
          <div>
            <h1 className="font-display text-[22px] font-extrabold tracking-tight text-[#172541]">
              Ask AI Study Assistant
            </h1>
            <p className="text-xs text-[#8291a9]">
              Ask questions freely or chat directly with your uploaded documents.
            </p>
          </div>
        </div>

        {/* Document selector & Upload shortcut */}
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="material-select">
            Select Document
          </label>
          <select
            id="material-select"
            value={selectedMaterialId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedMaterialId(id);
              if (id) {
                const mat = materials.find((m) => m._id === id);
                if (mat) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      text: `Switched context to document **"${mat.file?.name || mat.title}"**. What would you like to explore?`,
                    },
                  ]);
                }
              }
            }}
            className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-blue-500"
          >
            <option value="">🌐 General Study AI (No file attached)</option>
            {materials.map((m) => (
              <option key={m._id} value={m._id}>
                📄 {m.file?.name || m.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingDoc}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/60 px-3 text-xs font-bold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
          >
            {uploadingDoc ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Paperclip size={14} />
            )}
            <span>Attach File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
            onChange={handleDirectFileUpload}
            className="hidden"
          />
        </div>
      </header>

      {/* Active Document Indicator Banner */}
      {selectedMaterial && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-blue-50/70 border border-blue-200 px-3.5 py-2 text-xs text-blue-900">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={16} className="text-blue-600 shrink-0" />
            <span className="truncate">
              <strong>Active Document:</strong> {selectedMaterial.file?.name || selectedMaterial.title}{" "}
              ({selectedMaterial.subject})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedMaterialId("")}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold shrink-0 ml-2 flex items-center gap-1"
          >
            <X size={13} /> Clear Document Context
          </button>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex min-h-[500px] flex-1 flex-col rounded-2xl border border-[#e8eef8] bg-white p-4 shadow-panel sm:p-6">
        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {!messages.length && (
            <div className="grid min-h-64 place-items-center text-center">
              <div className="max-w-sm">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eef1ff] text-[#5368df]">
                  <Bot size={24} />
                </span>
                <p className="mt-3 text-sm font-bold text-[#33415b]">
                  {selectedMaterial
                    ? `Ready to analyze "${selectedMaterial.title}"`
                    : "What would you like to study?"}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#8291a9]">
                  {selectedMaterial
                    ? "Ask questions, generate summaries, or extract key formulas from this file."
                    : "Ask for explanations, exam tips, concept breakdowns, or attach a document."}
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex items-start gap-2.5 ${
                message.role === "user" ? "justify-end" : ""
              }`}
            >
              {message.role === "assistant" && (
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#edf3ff] text-[#397cef]">
                  <Bot size={18} />
                </span>
              )}
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-xs leading-6 shadow-sm ${
                  message.role === "user"
                    ? "rounded-tr-md bg-[#5146ed] text-white"
                    : "rounded-tl-md bg-[#f7f9fc] border border-gray-100 text-[#334460]"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {asking && (
            <div className="flex items-center gap-2 text-xs text-[#62779a]">
              <LoaderCircle size={15} className="animate-spin text-blue-600" />
              <span>Studify AI is analyzing and generating response…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer controls & prompt input */}
        <div className="border-t border-[#eff2f8] pt-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {activeSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendQuestion(suggestion)}
                className="rounded-full border border-[#e3ebf7] bg-white px-3.5 py-1.5 text-[11px] font-semibold text-[#5876ba] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-[#f7f9ff] hover:shadow-sm active:scale-95"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendQuestion();
            }}
            className="flex items-center gap-2 rounded-2xl border border-[#e8eef8] bg-white p-2 shadow-sm focus-within:border-[#7c8ef4] focus-within:ring-4 focus-within:ring-[#f0f2ff]"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                selectedMaterial
                  ? `Ask anything about "${selectedMaterial.title}"...`
                  : "Ask any question, formula, or concept..."
              }
              aria-label="Ask a question"
              maxLength={8000}
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-xs text-[#33415b] outline-none"
            />
            <button
              type="submit"
              disabled={!question.trim() || asking}
              aria-label="Send question"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#5146ed] text-white transition hover:bg-[#4035dc] disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[#a0acc0]">
            <Sparkles size={11} /> Gemini 3.5 Multimodal Engine · Real-time reasoning
          </p>
        </div>
      </div>
    </section>
  );
}

export default AskAI;
