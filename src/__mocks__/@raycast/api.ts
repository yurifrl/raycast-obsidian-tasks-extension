import { vi } from "vitest";

export const getPreferenceValues = vi.fn(() => ({
  filePath: "",
  showDueDate: false,
  maxMenubarDescriptionLength: "30",
  menubarTaskCount: false,
  showIcon: false,
  sortByPriority: false,
  showCompletedDate: false,
  refreshIntervalInMinutes: "1",
  useDailyNote: false,
  dailyNotesFolder: "",
  dailyNotePattern: "YYYY-MM-DD",
}));

export const showToast = vi.fn(() => Promise.resolve());

export const Toast = {
  Style: {
    Success: "success",
    Failure: "failure",
  },
};
