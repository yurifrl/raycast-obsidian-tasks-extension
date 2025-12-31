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
  /** Show Due Date in Menubar - Display the due date of tasks in the menubar */
  "showDueDate": boolean,
  /** Show Task Count in Menubar - Show the number of tasks in the menubar */
  "menubarTaskCount": boolean,
  /** Show Icon in Menubar - Show the icon of tasks in the menubar */
  "showIcon": boolean,
  /** Sort by Priority - Sort tasks by priority */
  "sortByPriority": boolean,
  /** Max Description Length - Maximum length of task description to show in menubar */
  "maxMenubarDescriptionLength": string,
  /** Refresh Interval - Refresh interval in minutes */
  "refreshIntervalInMinutes": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `list-tasks` command */
  export type ListTasks = ExtensionPreferences & {}
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

