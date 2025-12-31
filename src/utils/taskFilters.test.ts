import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { filterCurrentTasks } from "./taskFilters";
import { Task } from "../types";

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: "test-id",
  description: "Test task",
  completed: false,
  createdAt: new Date("2025-01-01"),
  line: 1,
  filePath: "/test/file.md",
  indentation: "",
  ...overrides,
});

describe("filterCurrentTasks", () => {
  beforeEach(() => {
    // Fix "today" to 2025-12-31 for consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-31T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return all tasks when filter is disabled", () => {
    const tasks = [
      createTask({ description: "Task 1", dueDate: new Date("2026-01-15") }),
      createTask({ description: "Task 2", dueDate: new Date("2025-12-30") }),
    ];

    const result = filterCurrentTasks(tasks, false);
    expect(result).toHaveLength(2);
  });

  it("should filter tasks with due date in the future", () => {
    const tasks = [
      createTask({ description: "Future", dueDate: new Date("2026-01-15") }),
      createTask({ description: "Today", dueDate: new Date("2025-12-31") }),
      createTask({ description: "Past", dueDate: new Date("2025-12-30") }),
    ];

    const result = filterCurrentTasks(tasks, true);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.description)).toEqual(["Today", "Past"]);
  });

  it("should include tasks with scheduled date today or earlier", () => {
    const tasks = [
      createTask({ description: "Scheduled future", scheduledDate: new Date("2026-01-15") }),
      createTask({ description: "Scheduled today", scheduledDate: new Date("2025-12-31") }),
      createTask({ description: "Scheduled past", scheduledDate: new Date("2025-12-25") }),
    ];

    const result = filterCurrentTasks(tasks, true);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.description)).toEqual(["Scheduled today", "Scheduled past"]);
  });

  it("should include task if either due or scheduled date is current", () => {
    const tasks = [
      createTask({
        description: "Due future but scheduled past",
        dueDate: new Date("2026-01-15"),
        scheduledDate: new Date("2025-12-25"),
      }),
    ];

    const result = filterCurrentTasks(tasks, true);
    expect(result).toHaveLength(1);
  });

  it("should exclude tasks with no dates when filter is enabled", () => {
    const tasks = [
      createTask({ description: "No dates" }),
      createTask({ description: "Has due", dueDate: new Date("2025-12-31") }),
    ];

    const result = filterCurrentTasks(tasks, true);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Has due");
  });

  it("should handle empty task list", () => {
    const result = filterCurrentTasks([], true);
    expect(result).toHaveLength(0);
  });
});
