export const getPreferenceValues = () => ({
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
});

export const showToast = () => Promise.resolve();

export const Toast = {
  Style: {
    Success: "success",
    Failure: "failure",
  },
};
