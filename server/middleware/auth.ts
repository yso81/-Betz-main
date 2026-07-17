import express from "express";
import { dbEngine } from "../../src/backendDb_supa";

export async function getUserIdFromAuth(req: express.Request): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  if (authHeader.startsWith("mock-jwt-token-for-")) {
    const userId = authHeader.replace("mock-jwt-token-for-", "");
    const user = await dbEngine.getUserById(userId);
    return user ? user.id : null;
  }
  return null;
}
