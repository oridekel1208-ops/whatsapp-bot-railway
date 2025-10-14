// utils/botsStore.js
import fs from "fs";
import path from "path";

const botsFilePath = path.join(process.cwd(), "data", "bots.json");

export function getAllBots() {
  if (!fs.existsSync(botsFilePath)) return [];
  const data = fs.readFileSync(botsFilePath, "utf8");
  return JSON.parse(data || "[]");
}

export function getBotById(id) {
  const bots = getAllBots();
  return bots.find((b) => b.id === Number(id)) || null;
}

export function saveBots(bots) {
  fs.writeFileSync(botsFilePath, JSON.stringify(bots, null, 2));
}

export function addBot(bot) {
  const bots = getAllBots();
  bots.push(bot);
  saveBots(bots);
}

export function updateBot(id, updatedData) {
  const bots = getAllBots();
  const index = bots.findIndex((b) => b.id === Number(id));
  if (index === -1) throw new Error("Bot not found");
  bots[index] = { ...bots[index], ...updatedData };
  saveBots(bots);
}
