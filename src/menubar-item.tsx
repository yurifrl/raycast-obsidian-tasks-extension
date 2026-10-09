import {
  Icon,
  MenuBarExtra,
  open,
  getPreferenceValues,
  launchCommand,
  LaunchType,
  openExtensionPreferences,
  LocalStorage,
  showHUD,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { getFormattedDescription } from "./utils";
import { Preferences, PRIORITY_VALUES, Task } from "./types";
import { useTasks } from "./hooks/useTasks";
import { priorityToIcon } from "./utils/priority";

const TASK_COUNT_OVERRIDE_KEY = "menubar-task-count-override";

const Command = () => {
  const preferences = getPreferenceValues<Preferences>();
  const maxLength = parseInt(preferences.maxMenubarDescriptionLength) || 30;

  const [taskCountOverride, setTaskCountOverride] = useState<boolean | null>(null);

  useEffect(() => {
    LocalStorage.getItem<boolean>(TASK_COUNT_OVERRIDE_KEY).then((value) => {
      setTaskCountOverride(value ?? null);
    });
  }, []);

  const showTaskCount = taskCountOverride ?? preferences.menubarTaskCount;

  const toggleTaskCount = async () => {
    const newValue = !showTaskCount;
    setTaskCountOverride(newValue);
    await LocalStorage.setItem(TASK_COUNT_OVERRIDE_KEY, newValue);
  };

  const {
    allTasks,
    topTask,
    isLoading,
    handleMarkDone,
    handleDeleteTask,
    handleSetPriority,
    refreshTaskList,
  } = useTasks(preferences);

  // HUD reminder interval
  useEffect(() => {
    const reminderMinutes = parseInt(preferences.reminderIntervalInMinutes) || 0;
    if (reminderMinutes <= 0 || !topTask) return;

    const interval = setInterval(() => {
      if (topTask) {
        const desc = getFormattedDescription(topTask);
        showHUD(`📌 ${desc}`);
      }
    }, reminderMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [topTask, preferences.reminderIntervalInMinutes]);

  // Test reminder: fire HUD whenever the checkbox is toggled on
  useEffect(() => {
    if (preferences.testReminder && topTask) {
      const desc = getFormattedDescription(topTask);
      showHUD(`📌 ${desc}`);
    } else if (preferences.testReminder) {
      showHUD("No tasks to remind");
    }
  }, [preferences.testReminder]);

  const getMenubarTitle = (task: Task): string => {
    if (!task) return "No Tasks";

    if (showTaskCount) {
      return `${allTasks.length.toString()}`;
    }

    let description = getFormattedDescription(task);

    // Apply delimiter: show only the part before the delimiter
    const delimiter = preferences.menubarTitleDelimiter?.trim();
    if (delimiter && description.includes(delimiter)) {
      description = description.split(delimiter)[0].trim();
    }

    // Apply max length
    const titleMaxLength = parseInt(preferences.menubarTitleMaxLength) || 0;
    if (titleMaxLength > 0 && description.length > titleMaxLength) {
      description = description.substring(0, titleMaxLength).trim() + "...";
    }

    const parts: string[] = [description];

    if (preferences.showDueDate && task.dueDate) {
      parts.push(`${task.dueDate.toLocaleDateString()}`);
    }

    return parts.join(" • ");
  };

  const handleOpenInObsidian = async () => {
    if (!topTask || !topTask.filePath) return;

    const fileName = topTask.filePath.split("/").pop() || "";
    const obsidianURI = `obsidian://open?file=${encodeURIComponent(fileName)}`;
    await open(obsidianURI);
  };

  const handleLaunchCommand = async (command: string) => {
    await launchCommand({ name: command, type: LaunchType.UserInitiated });
  };

  const handleEditTask = async (task: Task) => {
    await launchCommand({
      name: "edit-task",
      type: LaunchType.UserInitiated,
      arguments: { taskId: task.id },
    });
  };

  const handleDone = async (task: Task) => {
    await handleMarkDone(task);
    await refreshTaskList();
  };

  const BottomSection = (
    <>
      <MenuBarExtra.Item
        title="Create Task"
        icon={Icon.Plus}
        onAction={() => handleLaunchCommand("add-task")}
      />

      <MenuBarExtra.Item
        title="Open Tasks File in Obsidian"
        icon={Icon.Link}
        onAction={handleOpenInObsidian}
      />

      <MenuBarExtra.Item
        title={showTaskCount ? "Show Task Name" : "Show Task Count"}
        icon={showTaskCount ? Icon.Text : Icon.NumberList}
        onAction={toggleTaskCount}
      />

      <MenuBarExtra.Item
        title="Open Extension Preferences"
        icon={Icon.Gear}
        onAction={openExtensionPreferences}
        shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
      />
    </>
  );

  if (isLoading || taskCountOverride === undefined) {
    return (
      <MenuBarExtra icon={Icon.Clock} tooltip="Loading tasks...">
        <MenuBarExtra.Item title="Obsidian Tasks is loading..." />
      </MenuBarExtra>
    );
  }

  if (!topTask) {
    return (
      <MenuBarExtra title="No Tasks" tooltip="No pending tasks">
        {BottomSection}
      </MenuBarExtra>
    );
  }

  const icon = showTaskCount
    ? Icon.CheckList
    : priorityToIcon(topTask.priority).icon;

  return (
    <MenuBarExtra title={getMenubarTitle(topTask)} {...(preferences.showIcon ? { icon } : {})}>
      <MenuBarExtra.Item
        title="Mark as Done"
        icon={Icon.Checkmark}
        onAction={() => handleDone(topTask)}
      />

      <MenuBarExtra.Section>
        {allTasks?.map((task) => (
          <MenuBarExtra.Submenu
            key={task.id}
            title={`${getFormattedDescription(task, maxLength)}`}
            icon={priorityToIcon(task.priority).icon}
          >
            <MenuBarExtra.Item
              title="Mark as Done"
              icon={Icon.Checkmark}
              onAction={() => handleDone(task)}
            />
            <MenuBarExtra.Submenu title="Set Priority" icon={Icon.ArrowUp}>
              {PRIORITY_VALUES.map((priority) => (
                <MenuBarExtra.Item
                  key={priority}
                  title={`${priority}`}
                  icon={priorityToIcon(priority).icon}
                  onAction={() => handleSetPriority(task, priority)}
                />
              ))}
            </MenuBarExtra.Submenu>
            <MenuBarExtra.Item
              title="Edit Task"
              icon={Icon.Pencil}
              onAction={() => handleEditTask(task)}
            />
            <MenuBarExtra.Item
              title="Delete Task"
              icon={Icon.Trash}
              onAction={() => handleDeleteTask(task)}
            />
          </MenuBarExtra.Submenu>
        ))}
      </MenuBarExtra.Section>

      <MenuBarExtra.Section>{BottomSection}</MenuBarExtra.Section>
    </MenuBarExtra>
  );
};

export default Command;
