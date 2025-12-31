import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { getTodayDailyNotePath, findLatestDailyNote } from "./fileUtils";

// Mock fs-extra
vi.mock("fs-extra");

// Mock @raycast/api
vi.mock("@raycast/api", () => ({
  getPreferenceValues: vi.fn(),
}));

describe("getTodayDailyNotePath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return today's daily note path when file exists", async () => {
    const dailyNotesFolder = "/vault/daily";
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const expectedPath = path.join(dailyNotesFolder, `${todayStr}.md`);

    vi.mocked(fs.pathExists).mockResolvedValue(true as never);

    const result = await getTodayDailyNotePath(dailyNotesFolder, "YYYY-MM-DD");
    expect(result).toBe(expectedPath);
  });

  it("should return null when today's daily note doesn't exist", async () => {
    const dailyNotesFolder = "/vault/daily";

    vi.mocked(fs.pathExists).mockResolvedValue(false as never);

    const result = await getTodayDailyNotePath(dailyNotesFolder, "YYYY-MM-DD");
    expect(result).toBeNull();
  });
});

describe("findLatestDailyNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should find the latest dated file in folder with YYYY-MM-DD pattern", async () => {
    const dailyNotesFolder = "/vault/daily";
    const files = [
      "2025-11-17.md",
      "2025-11-18.md",
      "2025-11-19.md",
      "2025-11-23.md",
      "2025-11-24.md",
      "2025-11-30.md",
      "random-file.md",
    ];

    vi.mocked(fs.readdir).mockResolvedValue(files as never);

    const result = await findLatestDailyNote(dailyNotesFolder, "YYYY-MM-DD");
    expect(result).toBe(path.join(dailyNotesFolder, "2025-11-30.md"));
  });

  it("should return null when no matching files found", async () => {
    const dailyNotesFolder = "/vault/daily";
    const files = ["random-file.md", "another-file.txt"];

    vi.mocked(fs.readdir).mockResolvedValue(files as never);

    const result = await findLatestDailyNote(dailyNotesFolder, "YYYY-MM-DD");
    expect(result).toBeNull();
  });

  it("should return null for empty folder", async () => {
    const dailyNotesFolder = "/vault/daily";

    vi.mocked(fs.readdir).mockResolvedValue([] as never);

    const result = await findLatestDailyNote(dailyNotesFolder, "YYYY-MM-DD");
    expect(result).toBeNull();
  });

  it("should handle different date patterns", async () => {
    const dailyNotesFolder = "/vault/daily";
    const files = ["17-11-2025.md", "18-11-2025.md", "30-11-2025.md"];

    vi.mocked(fs.readdir).mockResolvedValue(files as never);

    const result = await findLatestDailyNote(dailyNotesFolder, "DD-MM-YYYY");
    expect(result).toBe(path.join(dailyNotesFolder, "30-11-2025.md"));
  });
});
