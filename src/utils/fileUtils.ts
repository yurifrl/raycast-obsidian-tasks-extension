import fs from "fs-extra";
import path from "path";
import matter from "gray-matter";
import { getPreferenceValues } from "@raycast/api";
import { isValid } from "date-fns";
import { Preferences, TaskFile, Task } from "../types";
import { parseTask } from "./taskParser";

/**
 * Convert a date pattern like "YYYY-MM-DD" to a regex pattern
 */
const patternToRegex = (pattern: string): RegExp => {
  const regexStr = pattern
    .replace(/YYYY/g, "(\\d{4})")
    .replace(/MM/g, "(\\d{2})")
    .replace(/DD/g, "(\\d{2})");
  return new RegExp(`^${regexStr}\\.md$`);
};

/**
 * Parse a filename to extract the date based on the pattern
 */
const parseFilenameDate = (filename: string, pattern: string): Date | null => {
  const regex = patternToRegex(pattern);
  const match = filename.match(regex);
  if (!match) return null;

  // Extract year, month, day based on pattern order
  const parts = pattern.match(/(YYYY|MM|DD)/g);
  if (!parts) return null;

  let year = 0,
    month = 0,
    day = 0;
  parts.forEach((part, index) => {
    const value = parseInt(match[index + 1], 10);
    if (part === "YYYY") year = value;
    else if (part === "MM") month = value;
    else if (part === "DD") day = value;
  });

  const date = new Date(year, month - 1, day);
  return isValid(date) ? date : null;
};

/**
 * Format today's date according to the pattern
 */
const formatDatePattern = (date: Date, pattern: string): string => {
  return pattern
    .replace(/YYYY/g, String(date.getFullYear()))
    .replace(/MM/g, String(date.getMonth() + 1).padStart(2, "0"))
    .replace(/DD/g, String(date.getDate()).padStart(2, "0"));
};

/**
 * Get today's daily note path if it exists
 */
export const getTodayDailyNotePath = async (
  dailyNotesFolder: string,
  pattern: string
): Promise<string | null> => {
  const today = new Date();
  const filename = formatDatePattern(today, pattern) + ".md";
  const filePath = path.join(dailyNotesFolder, filename);

  if (await fs.pathExists(filePath)) {
    return filePath;
  }
  return null;
};

/**
 * Find the latest daily note file in a folder
 */
export const findLatestDailyNote = async (
  dailyNotesFolder: string,
  pattern: string
): Promise<string | null> => {
  const files = await fs.readdir(dailyNotesFolder);
  const regex = patternToRegex(pattern);

  const datedFiles = files
    .filter((f) => regex.test(f))
    .map((f) => ({ filename: f, date: parseFilenameDate(f, pattern) }))
    .filter((f) => f.date !== null)
    .sort((a, b) => b.date!.getTime() - a.date!.getTime());

  if (datedFiles.length === 0) return null;
  return path.join(dailyNotesFolder, datedFiles[0].filename);
};

export const getTasksFilePath = (): string => {
  const preferences = getPreferenceValues<Preferences>();
  const filePath = preferences.filePath;

  if (!filePath) {
    throw new Error("Tasks file path is not set");
  }

  return filePath;
};

export const getTargetFilePath = async (): Promise<string> => {
  const preferences = getPreferenceValues<Preferences>();

  if (preferences.useDailyNote && preferences.dailyNotesFolder) {
    const pattern = preferences.dailyNotePattern || "YYYY-MM-DD";

    // First try to find today's daily note
    const todayPath = await getTodayDailyNotePath(preferences.dailyNotesFolder, pattern);
    if (todayPath) {
      return todayPath;
    }

    // Fall back to the latest daily note
    const latestPath = await findLatestDailyNote(preferences.dailyNotesFolder, pattern);
    if (latestPath) {
      return latestPath;
    }

    // If no daily notes exist, create today's
    const today = new Date();
    const filename = formatDatePattern(today, pattern) + ".md";
    return path.join(preferences.dailyNotesFolder, filename);
  }

  return getTasksFilePath();
};

export const readTasksFromFile = async (filePath: string): Promise<TaskFile> => {
  try {
    // Create file if it doesn't exist
    if (!(await fs.pathExists(filePath))) {
      const dirPath = path.dirname(filePath);
      await fs.ensureDir(dirPath);

      const fileName = path.basename(filePath);
      const title = fileName.replace(".md", "");

      await fs.writeFile(filePath, `# ${title}\n\n`, "utf-8");
    }

    const content = await fs.readFile(filePath, "utf-8");
    let fileContent = "";

    try {
      // Try to parse with gray-matter, but don't fail if it can't parse
      const parsed = matter(content);
      fileContent = parsed.content;
    } catch (error) {
      console.error("Error parsing frontmatter, treating entire file as content:", error);
      fileContent = content;
    }

    const lines = fileContent.split("\n");
    const tasks: Task[] = [];

    lines.forEach((line, index) => {
      try {
        const task = parseTask(line, index);
        if (task) {
          task.filePath = filePath; // Set the file path for the task
          tasks.push(task);
        }
      } catch (error) {
        console.error(`Error processing line ${index}: "${line}"`, error);
        // Continue with next line
      }
    });

    return {
      content: content,
      tasks: tasks,
      path: filePath,
    };
  } catch (error) {
    console.error("Error reading tasks file:", error);
    throw error;
  }
};

export const readTasksFile = async (): Promise<TaskFile> => {
  try {
    const filePath = await getTargetFilePath();
    return readTasksFromFile(filePath);
  } catch (error) {
    console.error("Error reading tasks file:", error);
    throw error;
  }
};
