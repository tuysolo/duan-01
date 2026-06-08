"use client";

import { useState } from "react";

type Creator = "Hien" | "Loc" | "Nhi" | "Trang";

interface HistoryItem {
  id: string;
  creator: Creator;
  title: string;
  topic: string;
  script: string;
  createdAt: Date;
}

interface KeywordResult {
  mainKeywords: { keyword: string; notes: string }[];
  subKeywords: string[];
  titleOptions: { title: string; charCount: number; notes: string }[];
}

interface TimelineItem {
  part: number;
  title: string;
  duration: string;
  keyPoints: string[];
  hasKeyword: boolean;
}

interface TimelineResult {
  timeline: TimelineItem[];
  totalDuration: string;
}

const CREATORS: { id: Creator; name: string; emoji: string; desc: string }[] = [
  { id: "Hien", name: "Hien", emoji: "📊", desc: "Chuyên gia phân tích vĩ mô, số liệu, nghiêm túc" },
  { id: "Loc", name: "Loc", emoji: "🤝", desc: "Người bạn đồng hành, thân thiện, dễ gần" },
  { id: "Nhi", name: "Nhi", emoji: "🧠", desc: "Thận trọng đa chiều, cảm xúc có chủ ý" },
  { id: "Trang", name: "Trang", emoji: "🎬", desc: "Storytelling, visual mạnh, bóc tách sự thật" },
];

const STEPS = ["API Key", "Chọn Creator", "Chủ đề & Input", "Keyword & Tiêu đề", "Timeline", "Kịch bản"];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            i < current ? "bg-green-900 text-green-300" :
            i === current ? "bg-blue-600 text-white" :
            "bg-gray-800 text-gray-500"
          }`}>
            <span>{i < current ? "✓" : i + 1}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < total - 1 && <div className={`h-px w-4 sm:w-8 ${i < current ? "bg-green-700" : "bg-gray-700"}`} />}
        </div>
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-3 text-blue-400 py-4">
      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      <span>Đang generate...</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [topic, setTopic] = useState("");
  const [referenceVideos, setReferenceVideos] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [keywordResult, setKeywordResult] = useState<KeywordResult | null>(null);
  const [selectedMainKw, setSelectedMainKw] = useState<string[]>([]);
  const [selectedSubKw, setSelectedSubKw] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [keywordRaw, setKeywordRaw] = useState("");

  const [timelineResult, setTimelineResult] = useState<TimelineResult | null>(null);
  const [timelineRaw, setTimelineRaw] = useState("");

  const [scriptResult, setScriptResult] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const call = async (payload: object) => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, apiKey }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Lỗi API");
    }
    return res.json();
  };

  const generateKeywords = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await call({ step: "keywords", creator, topic, referenceVideos, additionalContext });
      if (data.result && typeof data.result === "object") {
        setKeywordResult(data.result);
        setSelectedMainKw(data.result.mainKeywords?.map((k: { keyword: string }) => k.keyword) || []);
        setSelectedSubKw(data.result.subKeywords?.slice(0, 10) || []);
      } else {
        setKeywordRaw(data.raw || data.result);
      }
      setStep(3);
    } catch {
      setError("Lỗi generate keyword. Kiểm tra API key.");
    }
    setLoading(false);
  };

  const generateTimeline = async () => {
    setLoading(true);
    setError("");
    try {
      const finalTitle = customTitle || selectedTitle;
      const data = await call({
        step: "timeline", creator, topic, title: finalTitle,
        keywords: { main: selectedMainKw, sub: selectedSubKw },
        referenceVideos, additionalContext,
      });
      if (data.result && typeof data.result === "object") {
        setTimelineResult(data.result);
      } else {
        setTimelineRaw(data.raw || data.result);
      }
      setStep(4);
    } catch {
      setError("Lỗi generate timeline.");
    }
    setLoading(false);
  };

  const generateScript = async () => {
    setLoading(true);
    setError("");
    try {
      const finalTitle = customTitle || selectedTitle;
      const data = await call({
        step: "script", creator, topic, title: finalTitle,
        keywords: { main: selectedMainKw, sub: selectedSubKw },
        timeline: timelineResult?.timeline || [],
        referenceVideos, additionalContext,
      });
      const script = typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2);
      setScriptResult(script);
      setHistory(prev => [{
        id: Date.now().toString(),
        creator: creator as Creator,
        title: finalTitle,
        topic,
        script,
        createdAt: new Date(),
      }, ...prev]);
      setStep(5);
    } catch {
      setError("Lỗi generate kịch bản.");
    }
    setLoading(false);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const slugify = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9À-ỹ]+/gi, "-").replace(/^-|-$/g, "").substring(0, 50);

  return (
    <div className="min-h-screen bg-[#0f0f13] text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">FAM Trading Content Tool</h1>
            <p className="text-gray-400 text-sm">Tạo kịch bản YouTube Crypto theo phong cách từng creator</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(h => !h)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
              <span>📋</span>
              <span>Lịch sử ({history.length})</span>
            </button>
          )}
        </div>

        {/* History panel */}
        {showHistory && history.length > 0 && (
          <div className="mb-6 bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Lịch sử kịch bản đã tạo</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.creator} · {item.createdAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => { setScriptResult(item.script); setShowHistory(false); setStep(5); }}
                      className="text-xs px-2 py-1 bg-blue-800 hover:bg-blue-700 text-blue-200 rounded transition-colors"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => downloadFile(item.script, `kich-ban-${slugify(item.title)}.md`, "text/markdown")}
                      className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                    >
                      .md
                    </button>
                    <button
                      onClick={() => downloadFile(item.script, `kich-ban-${slugify(item.title)}.txt`, "text/plain")}
                      className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                    >
                      .txt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <StepIndicator current={step} total={STEPS.length} />

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Step 0: API Key */}
        {step === 0 && (
          <div className="max-w-lg">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <div className="text-3xl mb-3">🔑</div>
              <h2 className="text-lg font-semibold text-white mb-1">Nhập Anthropic API Key</h2>
              <p className="text-sm text-gray-400 mb-5">
                API key được dùng trực tiếp từ trình duyệt của bạn — không lưu trên server.{" "}
                Lấy key tại{" "}
                <span className="text-blue-400">console.anthropic.com</span>
              </p>
              <div className="relative">
                <input
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  type={apiKeyVisible ? "text" : "password"}
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm font-mono pr-20"
                />
                <button
                  onClick={() => setApiKeyVisible(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200 px-1"
                >
                  {apiKeyVisible ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {apiKey && !apiKey.startsWith("sk-ant-") && (
                <p className="text-xs text-red-400 mt-2">⚠️ Key phải bắt đầu bằng sk-ant-</p>
              )}
              <div className="mt-5 p-3 bg-yellow-950/40 border border-yellow-800/50 rounded-lg">
                <p className="text-xs text-yellow-300/80">
                  🔒 Key chỉ tồn tại trong session này, không được lưu hay gửi đi đâu ngoài Anthropic API.
                </p>
              </div>
              <button
                disabled={!apiKey.startsWith("sk-ant-")}
                onClick={() => setStep(1)}
                className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Bắt đầu →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Chọn Creator */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Chọn Content Creator</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CREATORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCreator(c.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    creator === c.id
                      ? "border-blue-500 bg-blue-900/30"
                      : "border-gray-700 bg-gray-900 hover:border-gray-500"
                  }`}
                >
                  <div className="text-2xl mb-2">{c.emoji}</div>
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{c.desc}</div>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <button
                disabled={!creator}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Tiếp theo →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Input */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{CREATORS.find(c => c.id === creator)?.emoji}</span>
              <h2 className="text-lg font-semibold text-gray-200">Input cho {creator}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Chủ đề / Tiêu đề gốc video <span className="text-red-400">*</span>
                </label>
                <input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="VD: Bitcoin còn sống sau 477 lần báo tử"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  URL video tham khảo (1 gốc + 2-3 liên quan)
                </label>
                <textarea
                  value={referenceVideos}
                  onChange={e => setReferenceVideos(e.target.value)}
                  placeholder="Paste URL video tham khảo (mỗi link 1 dòng)"
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Nội dung / Transcript tham khảo (optional nhưng khuyến khích)
                </label>
                <textarea
                  value={additionalContext}
                  onChange={e => setAdditionalContext(e.target.value)}
                  placeholder="Paste nội dung transcript, tóm tắt video hoặc bài báo liên quan..."
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                ← Quay lại
              </button>
              <button
                disabled={!topic || loading}
                onClick={generateKeywords}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {loading ? "Đang generate..." : "Generate Keyword →"}
              </button>
            </div>
            {loading && <LoadingSpinner />}
          </div>
        )}

        {/* Step 3: Keyword & Tiêu đề */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Keyword & Tiêu đề</h2>

            {keywordResult ? (
              <div className="space-y-5">
                {/* Keyword chính */}
                <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-blue-400 mb-3">KEYWORD CHÍNH (chọn 2)</h3>
                  <div className="space-y-2">
                    {keywordResult.mainKeywords?.map((kw, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMainKw.includes(kw.keyword)}
                          onChange={e => {
                            setSelectedMainKw(prev =>
                              e.target.checked ? [...prev, kw.keyword] : prev.filter(k => k !== kw.keyword)
                            );
                          }}
                          className="mt-0.5 w-4 h-4 accent-blue-500"
                        />
                        <div>
                          <span className="font-medium text-white">{kw.keyword}</span>
                          {kw.notes && <span className="text-gray-400 text-xs ml-2">— {kw.notes}</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Keyword phụ */}
                <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-blue-400 mb-3">KEYWORD PHỤ (chọn 10+)</h3>
                  <div className="flex flex-wrap gap-2">
                    {keywordResult.subKeywords?.map((kw, i) => (
                      <label key={i} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSubKw.includes(kw)}
                          onChange={e => {
                            setSelectedSubKw(prev =>
                              e.target.checked ? [...prev, kw] : prev.filter(k => k !== kw)
                            );
                          }}
                          className="w-3.5 h-3.5 accent-blue-500"
                        />
                        <span className={`text-sm px-2 py-0.5 rounded ${selectedSubKw.includes(kw) ? "bg-blue-900 text-blue-200" : "bg-gray-800 text-gray-300"}`}>
                          {kw}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tiêu đề */}
                <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-blue-400 mb-3">TIÊU ĐỀ GỢI Ý</h3>
                  <div className="space-y-2">
                    {keywordResult.titleOptions?.map((t, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800">
                        <input
                          type="radio"
                          name="title"
                          checked={selectedTitle === t.title}
                          onChange={() => { setSelectedTitle(t.title); setCustomTitle(""); }}
                          className="mt-0.5 accent-blue-500"
                        />
                        <div>
                          <div className="text-white text-sm font-medium">{t.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{t.charCount || t.title.length} ký tự • {t.notes}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <label className="block text-xs text-gray-400 mb-1">Hoặc nhập tiêu đề tùy chỉnh:</label>
                    <input
                      value={customTitle}
                      onChange={e => { setCustomTitle(e.target.value); setSelectedTitle(""); }}
                      placeholder="Nhập tiêu đề..."
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                    {customTitle && <div className="text-xs text-gray-500 mt-1">{customTitle.length} ký tự {customTitle.length > 70 ? "⚠️ vượt 70" : "✓"}</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-400">Raw output</h3>
                  <CopyButton text={keywordRaw} />
                </div>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{keywordRaw}</pre>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">
                ← Quay lại
              </button>
              <button
                disabled={loading || (!selectedTitle && !customTitle)}
                onClick={generateTimeline}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {loading ? "Đang generate..." : "Generate Timeline →"}
              </button>
            </div>
            {loading && <LoadingSpinner />}
          </div>
        )}

        {/* Step 4: Timeline */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-1 text-gray-200">Timeline Video</h2>
            <div className="text-sm text-gray-500 mb-4">
              Tiêu đề: <span className="text-blue-400">{customTitle || selectedTitle}</span>
              {timelineResult?.totalDuration && <span className="ml-3">• {timelineResult.totalDuration}</span>}
            </div>

            {timelineResult ? (
              <div className="space-y-3">
                {timelineResult.timeline?.map((item, i) => (
                  <div key={i} className={`bg-gray-900 rounded-xl border p-4 ${item.hasKeyword ? "border-blue-700" : "border-gray-700"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-400 font-bold text-sm">Phần {item.part}</span>
                      <span className="text-white font-semibold">{item.title}</span>
                      {item.hasKeyword && <span className="text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded">keyword</span>}
                      <span className="text-xs text-gray-500 ml-auto">{item.duration}</span>
                    </div>
                    {item.keyPoints?.length > 0 && (
                      <ul className="text-sm text-gray-400 space-y-0.5">
                        {item.keyPoints.map((p, j) => <li key={j} className="flex gap-2"><span className="text-gray-600">•</span>{p}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Raw output</span>
                  <CopyButton text={timelineRaw} />
                </div>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{timelineRaw}</pre>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(4)} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">
                ← Quay lại
              </button>
              <button
                disabled={loading}
                onClick={generateScript}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {loading ? "Đang generate..." : "✨ Generate Kịch bản →"}
              </button>
            </div>
            {loading && <LoadingSpinner />}
          </div>
        )}

        {/* Step 5: Kịch bản */}
        {step === 5 && (
          <div>
            <div className="flex items-start justify-between mb-4 gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-200">Kịch bản hoàn chỉnh</h2>
                <div className="text-sm text-gray-500 mt-0.5">
                  Creator: <span className="text-blue-400">{creator}</span> •{" "}
                  Tiêu đề: <span className="text-blue-400">{customTitle || selectedTitle}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CopyButton text={scriptResult} />
                <button
                  onClick={() => downloadFile(scriptResult, `kich-ban-${slugify(customTitle || selectedTitle)}.md`, "text/markdown")}
                  className="text-xs px-2.5 py-1.5 bg-green-900 hover:bg-green-800 text-green-300 rounded-lg transition-colors font-medium"
                >
                  ↓ .md
                </button>
                <button
                  onClick={() => downloadFile(scriptResult, `kich-ban-${slugify(customTitle || selectedTitle)}.txt`, "text/plain")}
                  className="text-xs px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-blue-300 rounded-lg transition-colors font-medium"
                >
                  ↓ .txt
                </button>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 max-h-[70vh] overflow-y-auto">
              <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{scriptResult}</pre>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(4)} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">
                ← Quay lại
              </button>
              <button
                disabled={loading}
                onClick={generateScript}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
              >
                {loading ? "Generating..." : "🔄 Generate lại"}
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setCreator(null);
                  setTopic(""); setReferenceVideos(""); setAdditionalContext("");
                  setKeywordResult(null); setSelectedMainKw([]); setSelectedSubKw([]);
                  setSelectedTitle(""); setCustomTitle("");
                  setTimelineResult(null); setScriptResult("");
                }}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
              >
                + Video mới
              </button>
            </div>
            {loading && <LoadingSpinner />}
          </div>
        )}

        {/* Summary sidebar for steps 3-5 */}
        {step >= 3 && step < 5 && selectedMainKw.length > 0 && (
          <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Đã chọn</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedMainKw.map(k => <span key={k} className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded font-medium">{k}</span>)}
              {selectedSubKw.slice(0, 5).map(k => <span key={k} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{k}</span>)}
              {selectedSubKw.length > 5 && <span className="text-xs text-gray-500">+{selectedSubKw.length - 5} more</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
