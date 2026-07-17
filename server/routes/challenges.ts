import express from "express";
import { dbEngine } from "../../src/backendDb_supa";
import { getUserIdFromAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const chal = await dbEngine.getChallenges();
    res.json(chal);
  } catch (e) {
    res.status(500).json({ error: "Failed to load challenges" });
  }
});

router.post("/", async (req, res) => {
  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized session credentials." });
  }
  const user = await dbEngine.getUserById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const {
    title,
    description,
    category,
    type,
    reward_xp,
    xp_reward,
    xp,
    duration_days,
    duration,
    days,
    starts_in_hours,
    challenge_type,
    challenge_mode,
    stake_description,
    confirmation_method,
    friend_id,
    friend_username,
    target_lat,
    target_lng,
    target_radius_m,
    location_name,
    wager_xp,
    media_url,
  } = req.body;

  const finalCategory = category || type;
  const finalRewardXp = reward_xp ?? xp_reward ?? xp ?? wager_xp;
  const finalDurationDays = duration_days ?? duration ?? days ?? 7;
  const finalStartsInHours = starts_in_hours ?? 0;
  const effectiveType = friend_id ? 'friend' : (challenge_type || 'local');
  const effectiveMode = challenge_mode || 'normal';
  const effectiveConfirmation = confirmation_method || 'photo_video';

  const isFriendBet = effectiveType === 'friend';
  const resolvedCategory = finalCategory || (isFriendBet ? 'fitness' : undefined);
  const resolvedRewardXp = finalRewardXp ?? (isFriendBet ? 0 : undefined);

  if (
    !title ||
    !description ||
    !resolvedCategory ||
    resolvedRewardXp === undefined ||
    resolvedRewardXp === null ||
    resolvedRewardXp === "" ||
    finalDurationDays === undefined ||
    finalDurationDays === null ||
    finalDurationDays === ""
  ) {
    return res.status(400).json({ error: "All challenge meta parameters are required." });
  }

  if (effectiveType === 'friend' && !friend_id) {
    return res.status(400).json({ error: "A friend must be selected for friend challenges." });
  }

  try {
    const newChal = await dbEngine.createChallenge(
      title,
      description,
      resolvedCategory,
      Number(resolvedRewardXp),
      Number(finalDurationDays),
      user.id,
      user.username,
      finalStartsInHours,
      effectiveType,
      effectiveMode,
      stake_description || undefined,
      effectiveConfirmation,
      friend_id || undefined,
      friend_username || undefined,
      target_lat ? Number(target_lat) : undefined,
      target_lng ? Number(target_lng) : undefined,
      target_radius_m ? Number(target_radius_m) : undefined,
      location_name || undefined,
      media_url || undefined,
    );

    if (effectiveType === 'friend' && friend_id) {
      try {
        const friendUser = await dbEngine.getUserById(friend_id);
        if (friendUser) {
          await dbEngine.joinChallenge(friend_id, friendUser.username, newChal.id);
        }
      } catch {
        // Friend enrollment is best-effort
      }
    }

    res.json(newChal);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Failed to create challenge" });
  }
});

router.post("/:challengeId/join", async (req, res) => {
  const userId = await getUserIdFromAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized session." });

  const user = await dbEngine.getUserById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  try {
    const enrollment = await dbEngine.joinChallenge(userId, user.username, req.params.challengeId);
    res.json(enrollment);
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Failed to join challenge" });
  }
});

router.get("/:challengeId/check-ins", async (req, res) => {
  try {
    const checkIns = await dbEngine.getChallengeCheckIns(req.params.challengeId);
    res.json(checkIns);
  } catch (e) {
    res.status(500).json({ error: "Failed to load check-ins" });
  }
});

router.post("/:challengeId/check-in", async (req, res) => {
  const userId = await getUserIdFromAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized session." });

  const user = await dbEngine.getUserById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { text_proof, message, imageUrl, media_url, location_lat, location_lng } = req.body;
  const proof = text_proof || message;
  if (!proof) return res.status(400).json({ error: "A check-in message is required." });

  try {
    const checkIn = await dbEngine.submitCheckIn(
      userId,
      user.username,
      req.params.challengeId,
      proof,
      imageUrl || media_url,
      location_lat ? Number(location_lat) : undefined,
      location_lng ? Number(location_lng) : undefined,
    );
    res.json(checkIn);
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Failed to submit check-in" });
  }
});

export default router;
