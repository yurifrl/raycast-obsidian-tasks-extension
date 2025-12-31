import { launchCommand, LaunchType } from "@raycast/api";

export const refreshMenubar = async (): Promise<void> => {
  try {
    await launchCommand({
      name: "menubar-item",
      type: LaunchType.Background,
    });
  } catch {
    // Silently fail - menubar command may not be enabled
  }
};
