import { useCallback, useEffect, useRef, useState } from "react";
import Dashboard from "./component/Dashboard.jsx";
import Login from "./component/Login.jsx";
import { authApi, setStoredToken } from "./api/auth.js";
import { StudyProvider } from "./StudyContext.jsx";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export const PROFILE_AVATAR_KEY = "studify-profile-avatar";

export const OAUTH_ERROR_MESSAGES = {
  github_no_code: "GitHub login was cancelled or failed. Please try again.",
  github_no_email: "Your GitHub account has no public email. A fallback was generated, please retry.",
  github_failed: "GitHub authentication failed. Please verify your credentials.",
};

export const getSavedAvatar = () => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(PROFILE_AVATAR_KEY) || "";
  } catch {
    return "";
  }
};

export const App = () => {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authError, setAuthError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToastType(type);
    setToastMessage(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(""), 4000);
  }, []);

  const applyUser = useCallback((nextUserOrUpdater) => {
    setUser((currentUser) => {
      const nextUser =
        typeof nextUserOrUpdater === "function"
          ? nextUserOrUpdater(currentUser)
          : nextUserOrUpdater;

      if (typeof window !== "undefined" && nextUser) {
        const nextAvatar = nextUser.avatar || getSavedAvatar();

        if (nextAvatar) {
          window.localStorage.setItem(PROFILE_AVATAR_KEY, nextAvatar);
        } else {
          window.localStorage.removeItem(PROFILE_AVATAR_KEY);
        }

        nextUser.avatar = nextAvatar;
      }

      return nextUser;
    });
  }, []);

  useEffect(() => {
    let active = true;

    // Read OAuth parameters from query string (e.g. after GitHub redirect)
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("auth_error");
    const oauthToken = params.get("token");
    const oauthSuccess = params.get("auth_success");

    if (oauthToken) {
      setStoredToken(oauthToken);
    }

    if (oauthError) {
      const msg =
        OAUTH_ERROR_MESSAGES[oauthError] ||
        decodeURIComponent(oauthError) ||
        "OAuth sign-in failed. Please try again.";
      setAuthError(msg);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (oauthSuccess) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    authApi
      .currentUser()
      .then((result) => {
        if (active && result?.user) {
          const savedAvatar = getSavedAvatar();
          applyUser({
            ...result.user,
            avatar: result.user.avatar || savedAvatar,
          });
          if (result.user.authProvider === "github" && oauthSuccess) {
            setTimeout(() => showToast(`Welcome, ${result.user.name}! Connected with GitHub.`), 300);
          }
        }
      })
      .catch((error) => {
        if (!active) return;
        if (error.status !== 401) setAuthError(error.message);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [applyUser, showToast]);

  const login = async (mode, credentials) => {
    let result;
    if (mode === "social") {
      result = await authApi.socialLogin(credentials);
      const providerCapitalized =
        credentials.provider.charAt(0).toUpperCase() + credentials.provider.slice(1);
      showToast(`Welcome, ${result.user.name}! Connected with ${providerCapitalized}.`);
    } else if (mode === "register") {
      result = await authApi.register(credentials);
      showToast("Your student account is ready.");
    } else {
      result = await authApi.login(credentials);
      if (result.user.role === "student") {
        showToast(`Login successful. Welcome back, ${result.user.name}!`);
      }
    }
    setAuthError("");
    const nextUser = {
      ...result.user,
      avatar: result.user.avatar || getSavedAvatar() || user?.avatar || "",
    };
    applyUser(nextUser);
  };

  const logout = async () => {
    let logoutError = "";
    try {
      await authApi.logout();
      setAuthError("");
    } catch (error) {
      logoutError = error.message;
      setAuthError(`Signed out in this window, but server logout failed: ${logoutError}`);
    }
    showToast(
      logoutError ? `Signed out locally; server logout failed: ${logoutError}` : "You have signed out.",
      logoutError ? "error" : "success",
    );
    setUser(null);
  };

  if (checkingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f7ff] text-sm font-semibold text-[#52627d]">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#4364f7] border-t-transparent shadow-lg" />
          <span className="tracking-wide">Checking your Studify session…</span>
        </div>
      </main>
    );
  }

  return (
    <div className="font-semibold text-[black] min-h-screen">
      {user ? (
        <StudyProvider onToast={showToast}>
          <Dashboard user={user} onLogout={logout} onUpdateUser={applyUser} />
        </StudyProvider>
      ) : (
        <Login onLogin={login} initialError={authError} />
      )}
      {toastMessage && (
        <div
          role={toastType === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`fixed right-5 top-5 z-[70] flex max-w-[min(92vw,420px)] items-center gap-3 rounded-2xl border bg-white/95 backdrop-blur-md px-4 py-3.5 text-sm font-semibold shadow-2xl transition-all duration-300 animate-slide-in-down ${
            toastType === "error"
              ? "border-[#ffd4d7] text-[#b93c48] shadow-red-500/10"
              : "border-[#c8eddd] text-[#237c5c] shadow-emerald-500/10"
          }`}
        >
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold shadow-sm ${
              toastType === "error"
                ? "bg-[#fff0f1] text-[#c84751]"
                : "bg-[#e8f8f0] text-[#237c5c]"
            }`}
          >
            {toastType === "error" ? "!" : "✓"}
          </span>
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
