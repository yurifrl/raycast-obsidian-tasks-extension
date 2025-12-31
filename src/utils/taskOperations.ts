import fs from "fs-extra";
import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import { Task, Priority, Preferences } from "../types";
import { readTasksFile } from "./fileUtils";
import { formatTask, removeSpecialCharacters } from "./taskFormatter";
import { priorityToValue } from "./priority";
import { refreshMenubar } from "./menubarRefresh";

/**
 * Find the position to insert a new task in the file.
 * @param lines - Array of lines in the file
 * @param insertAfter - Pattern to search for (supports regex)
 * @param appendToList - If true, find list after match and append to it
 * @returns Index where new task should be inserted
 * @throws Error if insertAfter pattern is set but not found
 */
export function findInsertPosition(
  lines: string[],
  insertAfter: string,
  appendToList: boolean
): number {
  // Empty pattern = append to end
  if (!insertAfter) {
    return lines.length;
  }

  // Find line matching pattern
  const regex = new RegExp(insertAfter);
  let matchIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      matchIndex = i;
      break;
    }
  }

  if (matchIndex === -1) {
    throw new Error(`Pattern '${insertAfter}' not found in file`);
  }

  // If not appending to list, insert right after match
  if (!appendToList) {
    return matchIndex + 1;
  }

  // Find list after match and return position at end of list
  let insertIndex = matchIndex + 1;
  let foundList = false;

  for (let i = matchIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Stop at next heading
    if (trimmed.startsWith("#")) {
      break;
    }

    // Check if line is a list item (- or *)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      foundList = true;
      insertIndex = i + 1;
    } else if (foundList && trimmed !== "") {
      // Non-list, non-empty line after list = end of list
      break;
    }
  }

  return insertIndex;
}

export const getAllTasks = async (): Promise<Task[]> => {
  const taskFile = await readTasksFile();
  return taskFile.tasks;
};

export const getAllUncompletedTasks = async (): Promise<Task[]> => {
  const tasks = await getAllTasks();
  return tasks.filter((task) => !task.completed);
};

export const getHighestPriorityTask = async (): Promise<Task | null> => {
  try {
    const tasks = await getAllUncompletedTasks();

    if (tasks.length === 0) {
      return null;
    }

    // Sort tasks by priority
    const sortedTasks = [...tasks].sort((a, b) => {
      // First sort by priority (high to low)
      const priorityA = a.priority || Priority.LOWEST;
      const priorityB = b.priority || Priority.LOWEST;
      const priorityDiff = priorityToValue(priorityA) - priorityToValue(priorityB);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      // If priorities are equal, sort by due date (closest first)
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }

      // If no due dates or priorities, sort by scheduled date
      if (a.scheduledDate && b.scheduledDate) {
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      } else if (a.scheduledDate) {
        return -1;
      } else if (b.scheduledDate) {
        return 1;
      }

      // If still equal, sort by start date
      if (a.startDate && b.startDate) {
        return a.startDate.getTime() - b.startDate.getTime();
      } else if (a.startDate) {
        return -1;
      } else if (b.startDate) {
        return 1;
      }

      // If everything else is equal, sort by creation time
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return sortedTasks[0];
  } catch (error) {
    console.error("Error getting highest priority task:", error);
    return null;
  }
};

export const addTask = async (
  task: Omit<Task, "id" | "createdAt" | "line" | "filePath" | "indentation">
): Promise<Task> => {
  try {
    const preferences = getPreferenceValues<Preferences>();
    const taskFile = await readTasksFile();
    const lines = taskFile.content.split("\n");

    // Find where to insert the task
    const insertIndex = findInsertPosition(
      lines,
      preferences.insertAfter || "",
      preferences.appendToList || false
    );

    // Create a new task with missing fields
    const newTask: Task = {
      ...task,
      id: String(lines.length),
      createdAt: new Date(),
      line: insertIndex,
      filePath: taskFile.path,
      indentation: "", // Default indentation
    };

    const taskText = formatTask(newTask);

    // Insert at the calculated position
    lines.splice(insertIndex, 0, taskText);

    await fs.writeFile(taskFile.path, lines.join("\n"), "utf-8");

    await showToast({
      style: Toast.Style.Success,
      title: "Task added",
    });

    await refreshMenubar();

    return newTask;
  } catch (error) {
    console.error("Error adding task:", error);

    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to add task",
      message: String(error),
    });

    throw error;
  }
};

export const updateTask = async (task: Task): Promise<Task> => {
  try {
    task.description = removeSpecialCharacters(task.description);

    const taskFile = await readTasksFile();
    const lines = taskFile.content.split("\n");

    lines[task.line] = formatTask(task);

    await fs.writeFile(taskFile.path, lines.join("\n"), "utf-8");

    await refreshMenubar();

    return task;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const markTaskDone = async (task: Task): Promise<Task> => {
  const updatedTask = { ...task, completed: true, completedAt: new Date() };
  const result = await updateTask(updatedTask);

  await refreshMenubar();

  return result;
};

export const markTaskUndone = async (task: Task): Promise<Task> => {
  const updatedTask = { ...task, completed: false, completedAt: undefined };
  const result = await updateTask(updatedTask);

  await refreshMenubar();

  return result;
};

export const deleteTask = async (task: Task): Promise<void> => {
  try {
    const taskFile = await readTasksFile();
    const lines = taskFile.content.split("\n");

    lines.splice(task.line, 1);

    await fs.writeFile(taskFile.path, lines.join("\n"), "utf-8");

    await refreshMenubar();
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};
