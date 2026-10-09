import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { getPreferenceValues } from "@raycast/api";
import { getTodayDailyNotePath, findLatestDailyNote, getTargetFilePath } from "./fileUtils";

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
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
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

describe("getTargetFilePath — root fallback", () => {
  const dailyNotesFolder = "/vault/daily";
  const vaultRoot = "/vault";
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayFilename = `${todayStr}.md`;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPreferenceValues).mockReturnValue({
      useDailyNote: true,
      dailyNotesFolder,
      dailyNotePattern: "YYYY-MM-DD",
    } as never);
  });

  it("returns today's note from dailyNotesFolder when it exists", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.readdir).mockResolvedValue([] as never);

    const result = await getTargetFilePath();
    expect(result).toBe(path.join(dailyNotesFolder, todayFilename));
  });

  it("returns latest note from dailyNotesFolder when today's doesn't exist there", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);
    vi.mocked(fs.readdir).mockResolvedValue(["2025-11-30.md"] as never);

    const result = await getTargetFilePath();
    expect(result).toBe(path.join(dailyNotesFolder, "2025-11-30.md"));
  });

  it("returns today's note from vault root when dailyNotesFolder has nothing", async () => {
    // pathExists: first call (today in dailyNotesFolder) = false, second (today in root) = true
    vi.mocked(fs.pathExists)
      .mockResolvedValueOnce(false as never) // daily folder check
      .mockResolvedValueOnce(true as never); // root check
    vi.mocked(fs.readdir).mockResolvedValue([] as never); // no files in daily folder

    const result = await getTargetFilePath();
    expect(result).toBe(path.join(vaultRoot, todayFilename));
  });

  it("returns latest note from vault root when today's note is nowhere", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false as never); // nothing exists anywhere
    vi.mocked(fs.readdir)
      .mockResolvedValueOnce([] as never) // daily folder: no matches
      .mockResolvedValueOnce(["2025-11-28.md"] as never); // vault root: one match

    const result = await getTargetFilePath();
    expect(result).toBe(path.join(vaultRoot, "2025-11-28.md"));
  });

  it("creates today's note in vault root when nothing is found anywhere", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);
    vi.mocked(fs.readdir).mockResolvedValue([] as never);

    const result = await getTargetFilePath();
    expect(result).toBe(path.join(vaultRoot, todayFilename));
  });
});
