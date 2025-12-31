import { Task } from "../types";

/**
 * Filter tasks to show only those with a due or scheduled date that is today or earlier.
 */
export function filterCurrentTasks(tasks: Task[], showOnlyCurrent: boolean): Task[] {
  if (!showOnlyCurrent) {
    return tasks;
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    const { dueDate, scheduledDate } = task;
    return (dueDate && dueDate < tomorrow) || (scheduledDate && scheduledDate < tomorrow);
  });
}
