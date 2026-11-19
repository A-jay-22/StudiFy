import { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  ArrowRight,
  BrainCircuit,
  BookOpen,
  Eye,
  EyeOff,
  Github,
  GraduationCap,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

export const StudentIllustration = () => {
  return (
    <div className="relative group">
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition duration-700 pointer-events-none animate-pulse-slow" />
      <svg
        viewBox="0 0 520 350"
        role="img"
        aria-label="Student studying on a laptop"
        className="relative mx-auto w-full max-w-[510px] filter drop-shadow-xl transition-transform duration-500 hover:scale-[1.02]"
      >
        <defs>
          <linearGradient id="login-desk" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#172e72" />
            <stop offset="1" stopColor="#0c1d49" />
          </linearGradient>
          <linearGradient id="login-laptop" x1="0" x2="1">
            <stop offset="0" stopColor="#101d3a" />
            <stop offset="1" stopColor="#263c67" />
          </linearGradient>
        </defs>
        <g opacity=".8">
          <rect x="56" y="74" width="48" height="44" rx="12" fill="#304f9d" />
          <rect x="123" y="28" width="45" height="45" rx="12" fill="#2569af" />
          <rect x="391" y="44" width="48" height="46" rx="12" fill="#25499b" />
          <rect x="442" y="117" width="42" height="43" rx="12" fill="#3055aa" />
          <rect x="77" y="155" width="46" height="42" rx="12" fill="#243f83" />
          <rect x="362" y="147" width="48" height="45" rx="12" fill="#253c83" />
          <rect x="180" y="20" width="34" height="34" rx="10" fill="#203d84" />
          <rect x="318" y="22" width="36" height="36" rx="10" fill="#25488f" />
          <rect x="29" y="125" width="35" height="35" rx="10" fill="#233d81" />
          <rect x="463" y="58" width="30" height="30" rx="9" fill="#253d82" />
        </g>
        <g fill="#a7c7ff">
          <path d="M72 90h16v16H72zM88 90h4v4h-4z" />
          <path d="M137 40h17v20h-17zM157 40h4v4h-4z" />
          <path d="M404 55h21v23h-21zM410 61h9v11h-9z" />
          <path d="M453 127h19v22h-19zM458 132h9v4h-9zM458 140h9v4h-9z" />
          <path d="M89 167h19v19H89zM94 172h9v9h-9z" />
          <path d="M376 158h20v21h-20zM381 163h10v10h-10z" />
        </g>

        <ellipse cx="259" cy="303" rx="215" ry="18" fill="#071536" opacity=".5" />
        <rect x="105" y="284" width="320" height="20" rx="6" fill="url(#login-desk)" />
        <path d="M138 303h255l-14 10H151z" fill="#071536" />

        <g>
          <rect x="47" y="257" width="88" height="21" rx="3" fill="#f5f6ff" />
          <rect x="51" y="239" width="80" height="18" rx="3" fill="#c8d8f5" />
          <rect x="58" y="222" width="70" height="17" rx="3" fill="#f1f4ff" />
          <path d="M64 222h51" stroke="#8ba6d5" strokeWidth="2" />
          <rect x="393" y="255" width="81" height="23" rx="3" fill="#eff4ff" />
          <rect x="400" y="235" width="75" height="20" rx="3" fill="#cbdcf7" />
          <rect x="409" y="217" width="64" height="18" rx="3" fill="#f7f8ff" />
        </g>

        <g>
          <path d="M63 220c-2-35-9-58-21-76 23 11 36 37 34 76z" fill="#3ac58c" />
          <path d="M68 223c4-39 20-62 44-73-8 28-21 52-38 76z" fill="#36ab7b" />
          <path d="M66 224c-14-31-30-43-48-47 8 22 22 39 48 54z" fill="#52d39a" />
          <path d="M66 203v44" stroke="#9d7655" strokeWidth="3" />
          <path d="M43 214h44l-5 33H48z" fill="#f2a273" />
          <path d="M47 215h36" stroke="#ffd1a8" strokeWidth="4" />
        </g>

        <g>
          <path
            d="M174 161c0-37 22-62 55-62 31 0 50 23 50 61v48H174z"
            fill="#171f39"
          />
          <path
            d="M188 138c0-24 15-39 37-39 24 0 39 17 39 42v21h-76z"
            fill="#182039"
          />
          <path
            d="M202 151c0-21 12-34 29-34 18 0 30 14 30 35v18c0 19-13 33-30 33-17 0-29-14-29-33z"
            fill="#f0a178"
          />
          <path
            d="M201 148c1-24 15-40 37-40 14 0 24 6 31 18-12 0-22-4-29-11-7 14-21 22-39 23z"
            fill="#172039"
          />
          <circle cx="222" cy="158" r="2" fill="#26314b" />
          <circle cx="245" cy="158" r="2" fill="#26314b" />
          <path d="M224 176c6 5 13 5 19 0" fill="none" stroke="#bd665e" strokeWidth="2" strokeLinecap="round" />
          <path d="M205 190c-25 1-41 14-48 41l-8 44h141l-7-45c-4-25-22-39-49-40l-14 18z" fill="#9368df" />
          <path d="M216 195l14 20 16-20" fill="#c5a6ff" />
          <path d="M212 200l18 28-3 44h-41l10-55zM248 200l-18 28 3 44h40l-10-55z" fill="#8158ce" />
          <path d="M194 269h72v12h-72z" fill="#f0a178" />
        </g>

        <g>
          <path d="M169 249h187l-14 39H181z" fill="url(#login-laptop)" />
          <path d="M177 255h171l-10 28H187z" fill="#111c35" />
          <circle cx="263" cy="270" r="5" fill="#334a77" />
          <path d="M155 288h215c-4 7-14 11-25 11H177c-11 0-18-4-22-11z" fill="#9aabc5" />
          <path d="M222 290h82" stroke="#596b89" strokeWidth="2" strokeLinecap="round" />
        </g>

        <circle cx="119" cy="122" r="5" fill="#57d5ff" />
        <circle cx="386" cy="111" r="4" fill="#b58aff" />
        <circle cx="345" cy="83" r="3" fill="#70cfff" />
        <circle cx="158" cy="92" r="3" fill="#a985ff" />
        <path d="M324 109l5 9 9 2-9 4-3 9-4-9-8-3 8-3z" fill="#8b7aff" />
      </svg>
    </div>
  );
};

export const Login = ({ onLogin, initialError = "" }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(initialError);
  const [submitting, setSubmitting] = useState(false);

  // Social Login Modal State
  const [socialProvider, setSocialProvider] = useState(null);
  const [socialName, setSocialName] = useState("");
  const [socialEmail, setSocialEmail] = useState("");
  const [socialSubmitting, setSocialSubmitting] = useState(false);

  // OAuth Loading States
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setError("");
  };

  // Google OAuth via @react-oauth/google popup
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError("");
      try {
        const profileRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } },
        );
        if (!profileRes.ok) throw new Error("Failed to fetch Google profile.");
        const profile = await profileRes.json();

        await onLogin("social", {
          provider: "google",
          email: profile.email,
          name: profile.name || profile.email.split("@")[0],
          avatar: profile.picture || "",
          providerId: profile.sub,
        });
      } catch (err) {
        setError(err.message || "Google sign-in failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError("Google sign-in was cancelled or failed.");
      setGoogleLoading(false);
    },
    flow: "implicit",
  });

  // GitHub OAuth Redirect flow
  const handleGithubLogin = () => {
    setGithubLoading(true);
    setError("");
    const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
    window.location.href = `${apiBase}/auth/github`;
  };

  const openSocialModal = (provider) => {
    setError("");
    setMessage("");
    setSocialProvider(provider);
    if (!socialName) setSocialName(name || "Student User");
    if (!socialEmail) {
      if (email) {
        setSocialEmail(email);
      } else {
        setSocialEmail(`student@outlook.com`);
      }
    }
  };

  const handleSocialSubmit = async (event) => {
    event.preventDefault();
    if (!socialEmail.trim() || !socialProvider) return;
    setSocialSubmitting(true);
    setError("");

    try {
      await onLogin("social", {
        provider: socialProvider,
        email: socialEmail.trim().toLowerCase(),
        name: socialName.trim() || socialEmail.split("@")[0],
        avatar: "",
      });
      setSocialProvider(null);
    } catch (err) {
      setError(err.message || "Social login failed. Please try again.");
    } finally {
      setSocialSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    if (mode === "forgot") {
      setMessage("Password reset instructions have been sent to your email.");
      return;
    }

    setSubmitting(true);
    try {
      await onLogin(mode, {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        remember,
      });
    } catch (err) {
      setError(err.message || "Could not complete the request.");
    } finally {
      setSubmitting(false);
    }
  };

  const isRegister = mode === "register";
  const isForgot = mode === "forgot";

  return (
    <main className="relative min-h-screen bg-[#f3f7ff] px-4 py-8 sm:px-6 sm:py-12 flex items-center justify-center overflow-hidden">
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-300/25 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-300/15 blur-3xl pointer-events-none animate-float" />

      {/* Social Login Modal */}
      {socialProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl animate-fade-in-up border border-blue-100">
            <button
              type="button"
              onClick={() => setSocialProvider(null)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 shadow-inner">
                <span className="grid grid-cols-2 gap-[2px]">
                  <span className="h-2.5 w-2.5 rounded-[1px] bg-[#f35325]" />
                  <span className="h-2.5 w-2.5 rounded-[1px] bg-[#81bc06]" />
                  <span className="h-2.5 w-2.5 rounded-[1px] bg-[#05a6f0]" />
                  <span className="h-2.5 w-2.5 rounded-[1px] bg-[#ffba08]" />
                </span>
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-900 capitalize">
                  Continue with {socialProvider}
                </h3>
                <p className="text-xs text-gray-500">
                  Instant registration & login for Studify
                </p>
              </div>
            </div>

            <form onSubmit={handleSocialSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Student Name
                </label>
                <div className="relative">
                  <UserRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    placeholder="Your Full Name"
                    className="h-10 w-full rounded-xl border border-gray-200 pl-10 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    placeholder="student@outlook.com"
                    className="h-10 w-full rounded-xl border border-gray-200 pl-10 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={socialSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#334fd0] to-[#506beb] py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-[0.98] transition duration-200"
                >
                  {socialSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Connecting...
                    </span>
                  ) : (
                    <>
                      <span>Sign in with {socialProvider.charAt(0).toUpperCase() + socialProvider.slice(1)}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[10px] text-gray-400">
                If you don't have an account yet, one will be created automatically.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Auth Card */}
      <div className="relative mx-auto flex w-full max-w-[1050px] flex-col overflow-hidden rounded-[2.5rem] bg-white/95 backdrop-blur-xl shadow-[0_25px_60px_rgba(28,49,94,.16)] border border-white/80 lg:flex-row transition-all duration-300 hover:shadow-[0_30px_70px_rgba(28,49,94,.2)] animate-fade-in-up">
        {/* Left Hero Side */}
        <section className="relative flex flex-col justify-between bg-gradient-to-br from-[#0e1f52] via-[#17327d] to-[#2e55c7] p-8 sm:p-10 text-white lg:w-1/2 lg:p-12 overflow-hidden">
          {/* Subtle geometric light patterns */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 backdrop-blur-md text-[#9fb7ff] border border-white/15 shadow-inner">
                <GraduationCap size={26} strokeWidth={2.4} />
              </span>
              <span className="font-display text-2xl font-black tracking-[-0.04em]">
                Study<span className="text-[#89b4ff]">AI</span>
              </span>
            </div>
            <h2 className="mt-8 font-display text-2xl font-black leading-tight sm:text-3xl tracking-tight">
              Supercharge your learning with Gemini AI.
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[#c3d5ff] max-w-md">
              Upload documents, ask AI questions, generate personalized study topics, and test your readiness with auto-graded mock exams.
            </p>
          </div>

          <div className="my-6 relative z-10 floating-element">
            <StudentIllustration />
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-center">
            <div className="hover:scale-105 transition-transform duration-200">
              <p className="font-display text-base font-bold text-white">Smart Q&amp;A</p>
              <p className="text-[10px] text-[#a3c0ff]">PDF &amp; Notes</p>
            </div>
            <div className="hover:scale-105 transition-transform duration-200">
              <p className="font-display text-base font-bold text-white">Mock Exams</p>
              <p className="text-[10px] text-[#a3c0ff]">Auto-graded</p>
            </div>
            <div className="hover:scale-105 transition-transform duration-200">
              <p className="font-display text-base font-bold text-white">Save &amp; Export</p>
              <p className="text-[10px] text-[#a3c0ff]">Instant PDF</p>
            </div>
          </div>
        </section>

        {/* Right Form Side */}
        <section className="flex flex-col justify-center p-8 sm:p-10 lg:w-1/2">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#1a2b49]">
                {isForgot
                  ? "Reset Password"
                  : isRegister
                  ? "Create Student Account"
                  : "Welcome to Studify"}
              </h1>
              <p className="mt-1 text-xs text-[#75849e]">
                {isForgot
                  ? "Enter your email to receive recovery instructions."
                  : isRegister
                  ? "Start your journey to smarter studying today."
                  : "Sign in to access your notes, exams, and AI assistant."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegister && (
                <label className="block animate-fade-in">
                  <span className="mb-1 block text-[11px] font-semibold text-[#263854]">
                    Full Name
                  </span>
                  <span className="relative block">
                    <UserRound
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7586a0]"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Alex Johnson"
                      required
                      className="h-10 w-full rounded-xl border border-[#dce5f1] bg-white pl-10 pr-3 text-[12px] text-[#243652] outline-none transition placeholder:text-[#a0aabd] focus:border-[#75a5ff] focus:ring-4 focus:ring-[#eaf2ff]"
                    />
                  </span>
                </label>
              )}

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#263854]">
                  Email Address
                </span>
                <span className="relative block">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7586a0]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="student@example.com"
                    autoComplete="email"
                    required
                    className="h-10 w-full rounded-xl border border-[#dce5f1] bg-white pl-10 pr-3 text-[12px] text-[#243652] outline-none transition placeholder:text-[#a0aabd] focus:border-[#75a5ff] focus:ring-4 focus:ring-[#eaf2ff]"
                  />
                </span>
              </label>

              {!isForgot && (
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-[#263854]">
                    Password
                  </span>
                  <span className="relative block">
                    <LockKeyhole
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7586a0]"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimum 8 characters"
                      autoComplete={isRegister ? "new-password" : "current-password"}
                      minLength={8}
                      required
                      className="h-10 w-full rounded-xl border border-[#dce5f1] bg-white pl-10 pr-11 text-[12px] text-[#243652] outline-none transition placeholder:text-[#a0aabd] focus:border-[#75a5ff] focus:ring-4 focus:ring-[#eaf2ff]"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#7586a0] transition-colors hover:bg-[#eaf2ff] hover:text-[#286cf1]"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </span>
                </label>
              )}

              {isRegister && (
                <label className="block animate-fade-in">
                  <span className="mb-1 block text-[11px] font-semibold text-[#263854]">
                    Confirm Password
                  </span>
                  <span className="relative block">
                    <LockKeyhole
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7586a0]"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="h-10 w-full rounded-xl border border-[#dce5f1] bg-white pl-10 pr-3 text-[12px] text-[#243652] outline-none transition placeholder:text-[#a0aabd] focus:border-[#75a5ff] focus:ring-4 focus:ring-[#eaf2ff]"
                    />
                  </span>
                </label>
              )}

              {!isRegister && !isForgot && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium text-[#586a85]">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 rounded accent-[#397afa] cursor-pointer"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => changeMode("forgot")}
                    className="text-[10px] font-semibold text-[#286cf1] transition-colors hover:text-[#5549e7]"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-[#fff0f1] px-3.5 py-2.5 text-[11px] font-semibold text-[#c84751] border border-red-100 animate-slide-in-down"
                >
                  {error}
                </p>
              )}
              {message && (
                <p
                  role="status"
                  className="rounded-xl bg-[#eff5ff] px-3.5 py-2.5 text-[11px] leading-5 font-semibold text-[#4d60bc] border border-blue-100 animate-slide-in-down"
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#249cf7] via-[#3d78f7] to-[#7853f1] text-[12px] font-bold text-white shadow-[0_7px_16px_rgba(56,116,240,.2)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_10px_22px_rgba(56,116,240,.32)] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#dfeaff]"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Please wait…
                  </span>
                ) : isForgot ? (
                  "Send reset instructions"
                ) : isRegister ? (
                  "Create Account"
                ) : (
                  "Login"
                )}
                {!isForgot && !submitting && <ArrowRight size={14} />}
              </button>
            </form>

            {isForgot ? (
              <button
                type="button"
                onClick={() => changeMode("login")}
                className="mt-4 w-full text-center text-[11px] font-semibold text-[#286cf1] transition-colors hover:text-[#5549e7]"
              >
                Back to login
              </button>
            ) : (
              <>
                <div className="auth-social-divider my-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-[#e3eaf3]" />
                  <span className="whitespace-nowrap text-[10px] font-medium text-[#8390a5]">
                    Or continue with
                  </span>
                  <span className="h-px flex-1 bg-[#e3eaf3]" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={() => googleLogin()}
                    disabled={googleLoading || githubLoading}
                    aria-label="Continue with Google"
                    className="auth-provider-button inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#dce5f1] bg-white text-[11px] font-medium text-[#52627c] transition duration-200 hover:-translate-y-0.5 hover:border-[#b9d1ff] hover:bg-[#4285f4] hover:text-white hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {googleLoading ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#4285f4] border-t-transparent" />
                    ) : (
                      <span className="font-display text-[16px] font-extrabold text-[#4285f4] group-hover:text-white transition">
                        G
                      </span>
                    )}
                    <span>{googleLoading ? "Connecting…" : "Google"}</span>
                  </button>

                  {/* GitHub OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGithubLogin}
                    disabled={githubLoading || googleLoading}
                    aria-label="Continue with GitHub"
                    className="auth-provider-button inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#dce5f1] bg-white text-[11px] font-medium text-[#52627c] transition duration-200 hover:-translate-y-0.5 hover:border-[#181717] hover:bg-[#181717] hover:text-white hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {githubLoading ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                    ) : (
                      <Github size={16} className="text-[#24292e] group-hover:text-white transition" />
                    )}
                    <span>{githubLoading ? "Redirecting…" : "GitHub"}</span>
                  </button>
                </div>

                <p className="auth-switch-copy mt-4 text-center text-[10px] text-[#75839a]">
                  {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => changeMode(isRegister ? "login" : "register")}
                    className="font-semibold text-[#286cf1] transition-colors hover:text-[#5549e7]"
                  >
                    {isRegister ? "Login" : "Register"}
                  </button>
                </p>
              </>
            )}

            <p className="auth-disclaimer mt-3 text-center text-[9px] leading-[1.35] text-[#8390a5]">
              Protected with encrypted passwords and OAuth. Studify respects your privacy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
