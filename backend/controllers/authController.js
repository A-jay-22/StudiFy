import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

export const COOKIE_NAME = "studify_session";
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

// Set Session Cookie Options
export const sessionCookieOptions = (remember = true) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: SESSION_DURATION_SECONDS * 1000 } : {}),
  };
};

// Set Session Cookie and return token
export const setSessionCookie = (res, user, remember = true) => {
  const token = jwt.sign(
    { tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { subject: String(user._id || user.id), expiresIn: SESSION_DURATION_SECONDS },
  );
  res.cookie(COOKIE_NAME, token, sessionCookieOptions(remember));
  return token;
};

export const publicUser = (user) => {
  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider || "local",
    avatar: user.avatar || "",
  };
};

export const validEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const passwordIsValid = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    Buffer.byteLength(password, "utf8") <= 72
  );
};

// Register
export const register = async (req, res, next) => {
  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const { password } = body;

  if (!name || name.length > 80) {
    return res.status(400).json({ message: "Enter a name between 1 and 80 characters." });
  }
  if (email.length > 254 || !validEmail(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (!passwordIsValid(password)) {
    return res.status(400).json({ message: "Password must be 8 to 72 UTF-8 bytes long." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      authProvider: "local",
    });
    const token = setSessionCookie(res, user, body.remember !== false);
    return res.status(201).json({ user: publicUser(user), token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    return next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  const body = req.body || {};
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const { password } = body;
  if (!validEmail(email) || !passwordIsValid(password)) {
    return res.status(400).json({ message: "Enter your email address and password." });
  }

  try {
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    const token = setSessionCookie(res, user, body.remember !== false);
    return res.json({ user: publicUser(user), token });
  } catch (error) {
    return next(error);
  }
};

// Social Login (Google, Microsoft, etc.)
export const socialLogin = async (req, res, next) => {
  const { provider, email, name, avatar, providerId } = req.body || {};
  const validProviders = ["google", "github", "microsoft"];

  if (!validProviders.includes(provider)) {
    return res.status(400).json({
      message: `Invalid provider. Must be one of: ${validProviders.join(", ")}`,
    });
  }

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!cleanEmail || !validEmail(cleanEmail)) {
    return res.status(400).json({ message: "A valid email is required for social login." });
  }

  const cleanName =
    typeof name === "string" && name.trim()
      ? name.trim().slice(0, 80)
      : cleanEmail.split("@")[0];

  try {
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      let shouldSave = false;
      if (!user.avatar && avatar) {
        user.avatar = String(avatar).slice(0, 500);
        shouldSave = true;
      }
      if (!user.providerId && providerId) {
        user.providerId = String(providerId).slice(0, 150);
        shouldSave = true;
      }
      if (shouldSave) await user.save();
    } else {
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        authProvider: provider,
        providerId: providerId ? String(providerId).slice(0, 150) : "",
        avatar: avatar ? String(avatar).slice(0, 500) : "",
        role: "student",
      });
    }

    const token = setSessionCookie(res, user, true);
    return res.json({
      user: publicUser(user),
      token,
      provider,
      message: `Signed in successfully with ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
    });
  } catch (error) {
    return next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = req.cookies?.[COOKIE_NAME] || bearerToken;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.sub && mongoose.isValidObjectId(payload.sub)) {
        await User.updateOne(
          { _id: payload.sub, tokenVersion: payload.tokenVersion },
          { $inc: { tokenVersion: 1 } },
        );
      }
    } catch (error) {
      if (!(error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError)) {
        return next(error);
      }
    }
  }

  res.clearCookie(COOKIE_NAME, sessionCookieOptions(false));
  return res.json({ message: "You have been logged out." });
};

// Current User
export const currentUser = (req, res) => {
  return res.json({ user: req.user });
};

// Admin Only
export const adminOnly = (_req, res) => {
  return res.json({ message: "Authorized admin access." });
};

// GitHub OAuth Redirect (Initiate login)
export const githubOAuthRedirect = (_req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || "http://localhost:5000/api/auth/github/callback";
  const scope = "read:user user:email";
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  res.redirect(url);
};

// GitHub OAuth Callback
export const githubOAuthCallback = async (req, res, next) => {
  const frontendOrigin = (process.env.FRONTEND_ORIGIN || "http://localhost:5173").split(",")[0].trim();
  const { code, error, error_description } = req.query;

  if (error || !code) {
    const errorMsg = encodeURIComponent(error_description || error || "GitHub login cancelled or no code received");
    return res.redirect(`${frontendOrigin}/?auth_error=${errorMsg}`);
  }

  try {
    // 1. Exchange code for access token with GitHub
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Studify-AI-App",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI || "http://localhost:5000/api/auth/github/callback",
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("[GitHub Token Exchange Error]:", tokenData);
      const desc = encodeURIComponent(tokenData.error_description || tokenData.error || "GitHub token exchange failed");
      return res.redirect(`${frontendOrigin}/?auth_error=${desc}`);
    }

    const accessToken = tokenData.access_token;
    const ghHeaders = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Studify-AI-App",
    };

    // 2. Fetch GitHub user profile and emails in parallel
    const [profileRes, emailsRes] = await Promise.all([
      fetch("https://api.github.com/user", { headers: ghHeaders }),
      fetch("https://api.github.com/user/emails", { headers: ghHeaders }),
    ]);

    if (!profileRes.ok) {
      const errText = await profileRes.text();
      console.error("[GitHub Profile Error]:", errText);
      return res.redirect(`${frontendOrigin}/?auth_error=${encodeURIComponent("Failed to fetch GitHub profile")}`);
    }

    const profile = await profileRes.json();

    // 3. Find primary verified email or fallback to noreply address
    let email = profile.email || "";
    if (!email && emailsRes.ok) {
      try {
        const emails = await emailsRes.json();
        if (Array.isArray(emails) && emails.length > 0) {
          const primary = emails.find((e) => e.primary && e.verified);
          email = primary ? primary.email : (emails.find((e) => e.verified)?.email || emails[0]?.email || "");
        }
      } catch (e) {
        console.warn("Could not parse emails JSON from GitHub:", e);
      }
    }

    // If email is still hidden/private, fallback to GitHub username's noreply email
    if (!email) {
      const handle = profile.login || `github_${profile.id}`;
      email = `${handle}@users.noreply.github.com`;
    }

    // 4. Create or update student user
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (profile.name || profile.login || cleanEmail.split("@")[0]).slice(0, 80);
    const avatar = profile.avatar_url ? String(profile.avatar_url).slice(0, 500) : "";
    const providerId = String(profile.id);

    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      let shouldSave = false;
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        shouldSave = true;
      }
      if (!user.providerId && providerId) {
        user.providerId = providerId;
        shouldSave = true;
      }
      if (shouldSave) await user.save();
    } else {
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        authProvider: "github",
        providerId,
        avatar,
        role: "student",
      });
    }

    // 5. Set session cookie AND provide session token in redirect URL for guaranteed login
    const token = setSessionCookie(res, user, true);
    return res.redirect(`${frontendOrigin}/?auth_success=true&token=${encodeURIComponent(token)}&provider=github`);
  } catch (error) {
    console.error("[GitHub OAuth Callback Error]:", error);
    const msg = encodeURIComponent(error.message || "An unexpected error occurred during GitHub login");
    return res.redirect(`${frontendOrigin}/?auth_error=${msg}`);
  }
};
