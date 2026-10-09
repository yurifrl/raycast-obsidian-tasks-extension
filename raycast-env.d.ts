/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Tasks File In Your Vault - Path to your tasks file in your vault (used when daily note mode is disabled) */
  "filePath"?: string,
  /** Use Daily Note - Add tasks to today's daily note instead of a fixed file */
  "useDailyNote": boolean,
  /** Daily Notes Folder - Path to your daily notes folder in your vault */
  "dailyNotesFolder"?: string,
  /** Daily Note Pattern - Filename pattern for daily notes (e.g., YYYY-MM-DD) */
  "dailyNotePattern": string,
  /** Insert After - Insert tasks after this text/pattern. Leave empty to append to file */
  "insertAfter"?: string,
  /** Append to List - Find list after pattern and append to it */
  "appendToList": boolean,
  /** Show Due Date in Menubar - Display the due date of tasks in the menubar */
  "showDueDate": boolean,
  /** Show Task Count in Menubar - Show the number of tasks in the menubar */
  "menubarTaskCount": boolean,
  /** Show Icon in Menubar - Show the icon of tasks in the menubar */
  "showIcon": boolean,
  /** Sort by Priority - Sort tasks by priority */
  "sortByPriority": boolean,
  /** Show Only Current Tasks - Show only tasks with a due or scheduled date that is today or earlier */
  "showOnlyCurrent": boolean,
  /** Max Description Length - Maximum length of task description to show in menubar dropdown items */
  "maxMenubarDescriptionLength": string,
  /** Max Menubar Title Length - Maximum number of characters for the task title shown in the macOS menu bar (0 = no limit) */
  "menubarTitleMaxLength": string,
  /** Menubar Title Delimiter - Delimiter to split the task title (e.g. '->' or ':'). Only the text before the delimiter is shown in the menu bar */
  "menubarTitleDelimiter"?: string,
  /** Refresh Interval - Refresh interval in minutes */
  "refreshIntervalInMinutes": string,
  /** Task Reminder Interval - Show a HUD reminder of the current task every N minutes (0 = disabled) */
  "reminderIntervalInMinutes": string,
  /** Test Reminder - Toggle this checkbox to fire a test HUD reminder */
  "testReminder": boolean,
  /** Reminder Duration - How long the HUD reminder stays visible in seconds */
  "reminderDurationInSeconds": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `list-tasks` command */
  export type ListTasks = ExtensionPreferences & {
  /** Show Description - Show Description in Details Markdown */
  "showDescriptionInDetails": boolean
}
  /** Preferences accessible in the `add-task` command */
  export type AddTask = ExtensionPreferences & {}
  /** Preferences accessible in the `edit-task` command */
  export type EditTask = ExtensionPreferences & {}
  /** Preferences accessible in the `mark-done` command */
  export type MarkDone = ExtensionPreferences & {}
  /** Preferences accessible in the `menubar-item` command */
  export type MenubarItem = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `list-tasks` command */
  export type ListTasks = {}
  /** Arguments passed to the `add-task` command */
  export type AddTask = {}
  /** Arguments passed to the `edit-task` command */
  export type EditTask = {}
  /** Arguments passed to the `mark-done` command */
  export type MarkDone = {}
  /** Arguments passed to the `menubar-item` command */
  export type MenubarItem = {}
}

