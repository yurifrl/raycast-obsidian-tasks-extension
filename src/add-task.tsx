import { useState } from "react";
import { Form, ActionPanel, Action, showToast, Toast, closeMainWindow } from "@raycast/api";
import { Priority } from "./types";
import { addTask } from "./utils/taskOperations";
import { ICONS } from "./constants";

export default function Command() {
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<Priority | "">("");
  const [tags, setTags] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTask = async () => {
    if (!description.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Description is required",
      });
      return false;
    }

    setIsSubmitting(true);
    try {
      await addTask({
        description,
        completed: false,
        priority: priority || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        recurrence: recurrence || undefined,
      });

      await showToast({
        style: Toast.Style.Success,
        title: "Task added",
      });

      return true;
    } catch (error) {
      console.error("Error adding task:", error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to add task",
        message: String(error),
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAndClose = async () => {
    const success = await submitTask();
    if (success) {
      await closeMainWindow({ clearRootSearch: true });
    }
  };

  const handleSubmitAndContinue = async () => {
    const success = await submitTask();
    if (success) {
      setDescription("");
      setDueDate(null);
      setScheduledDate(null);
      setStartDate(null);
      setPriority("");
      setTags("");
      setRecurrence("");
    }
  };

  const handleClearDates = () => {
    setDueDate(null);
    setScheduledDate(null);
    setStartDate(null);
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Task" onSubmit={handleSubmitAndClose} />
          <Action.SubmitForm
            title="Add Task & Continue"
            onSubmit={handleSubmitAndContinue}
            shortcut={{ modifiers: ["cmd", "shift"], key: "return" }}
          />
          <Action title="Clear Dates" onAction={handleClearDates} />
        </ActionPanel>
      }
      isLoading={isSubmitting}
    >
      <Form.TextField
        id="description"
        title="Description"
        placeholder="Enter task description"
        value={description}
        onChange={setDescription}
        autoFocus
      />

      <Form.Dropdown
        id="priority"
        title="Priority"
        value={priority}
        onChange={(newValue) => setPriority(newValue as Priority | "")}
      >
        <Form.Dropdown.Item value="" title="No Priority" />
        <Form.Dropdown.Item value={Priority.HIGHEST} title={`${ICONS.PRIORITY.HIGHEST}  Highest`} />
        <Form.Dropdown.Item value={Priority.HIGH} title={`${ICONS.PRIORITY.HIGH}  High`} />
        <Form.Dropdown.Item value={Priority.MEDIUM} title={`${ICONS.PRIORITY.MEDIUM}  Medium`} />
        <Form.Dropdown.Item value={Priority.LOW} title={`${ICONS.PRIORITY.LOW}  Low`} />
        <Form.Dropdown.Item value={Priority.LOWEST} title={`${ICONS.PRIORITY.LOWEST}  Lowest`} />
      </Form.Dropdown>

      <Form.DatePicker
        id="dueDate"
        title={`${ICONS.DATE.DUE}  Due Date`}
        value={dueDate}
        onChange={setDueDate}
      />

      <Form.DatePicker
        id="scheduledDate"
        title={`${ICONS.DATE.SCHEDULED}  Scheduled Date`}
        value={scheduledDate}
        onChange={setScheduledDate}
      />

      <Form.DatePicker
        id="startDate"
        title={`${ICONS.DATE.START}  Start Date`}
        value={startDate}
        onChange={setStartDate}
      />

      <Form.TextField
        id="recurrence"
        title={`${ICONS.RECURRING}  Recurrence`}
        placeholder="e.g., every day, every week on Monday"
        value={recurrence}
        onChange={setRecurrence}
        info="Use natural language for recurring tasks, such as 'every day' or 'every week on Monday'"
      />

      <Form.TextField
        id="tags"
        title="Tags"
        placeholder="Enter comma-separated tags"
        value={tags}
        onChange={setTags}
        info="Enter tags separated by commas, e.g., work, personal, urgent"
      />

      <Form.Description title="Note" text="The task will be added to your Obsidian tasks file." />
      <Form.Description title="" text="v1.2.0" />
    </Form>
  );
}
