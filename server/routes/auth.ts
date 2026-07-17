import express from "express";
import { dbEngine } from "../../src/backendDb_supa";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password, bio, fullName, location, interests, avatarUrl } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: "Username and email are required fields." });
  }
  if (!password || typeof password !== 'string' || password.trim().length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  try {
    const newUser = await dbEngine.registerUser(
      username,
      email,
      password,
      typeof bio === 'string' ? bio : undefined,
      typeof fullName === 'string' ? fullName : undefined,
      typeof location === 'string' ? location : undefined,
      typeof interests === 'string' ? interests : undefined,
      typeof avatarUrl === 'string' ? avatarUrl : undefined
    );
    res.json({
      user: newUser,
      token: `mock-jwt-token-for-${newUser.id}`
    });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { usernameOrEmail } = req.body;
  if (!usernameOrEmail) {
    return res.status(400).json({ error: "Username or email is required." });
  }
  try {
    const user = await dbEngine.loginUser(usernameOrEmail);
    res.json({
      user,
      token: `mock-jwt-token-for-${user.id}`
    });
  } catch (e: unknown) {
    res.status(404).json({ error: e instanceof Error ? e.message : "Login failed" });
  }
});

router.put("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("mock-jwt-token-for-")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  const userId = authHeader.replace("mock-jwt-token-for-", "");
  const { bio, fullName, location, interests, avatarUrl, username, email, total_xp } = req.body;

  // Accept all provided fields, including empty strings (to allow clearing values).
  // Only reject if the body has none of the recognized profile keys at all.
  const hasAnyKey = ['bio', 'fullName', 'location', 'interests', 'avatarUrl']
    .some((k) => Object.prototype.hasOwnProperty.call(req.body, k));

  if (!hasAnyKey) {
    return res.status(400).json({ error: "At least one profile field is required." });
  }

  // Build update payload.
  const profileUpdates: Record<string, string | number> = {};
  if (typeof bio === 'string') profileUpdates.bio = bio.trim();
  if (typeof fullName === 'string') profileUpdates.full_name = fullName.trim();
  if (typeof location === 'string') profileUpdates.location = location.trim();
  if (typeof interests === 'string') profileUpdates.interests = interests.trim();
  if (typeof avatarUrl === 'string') profileUpdates.avatar_url = avatarUrl.trim();

  // Only pass identity/read-only fields if we are using the MockDatabaseEngine.
  // Supabase forbids updating these columns or fails on write constraints.
  const usingSupabase = !process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('your-') && !!process.env.SUPABASE_URL;
  if (!usingSupabase) {
    if (typeof username === 'string') profileUpdates.username = username.trim();
    if (typeof email === 'string') profileUpdates.email = email.trim();
    if (typeof total_xp === 'number') profileUpdates.total_xp = total_xp;
  }

  try {
    const updatedUser = await dbEngine.updateUserProfile(userId, profileUpdates);
    res.json({ user: updatedUser });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Profile update failed" });
  }
});

export default router;
