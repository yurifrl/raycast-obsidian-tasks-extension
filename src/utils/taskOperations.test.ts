import { describe, it, expect, vi } from "vitest";

// Mock @raycast/api
vi.mock("@raycast/api", () => ({
  getPreferenceValues: vi.fn(),
  showToast: vi.fn(),
  Toast: { Style: { Success: "success", Failure: "failure" } },
}));

// Mock fs-extra
vi.mock("fs-extra");

import { findInsertPosition } from "./taskOperations";

describe("findInsertPosition", () => {
  describe("empty insertAfter", () => {
    it("should return lines.length when insertAfter is empty", () => {
      const lines = ["# Header", "Some content", "- [ ] task"];
      const result = findInsertPosition(lines, "", false);
      expect(result).toBe(3);
    });

    it("should return 0 for empty file with empty insertAfter", () => {
      const lines: string[] = [];
      const result = findInsertPosition(lines, "", false);
      expect(result).toBe(0);
    });
  });

  describe("insertAfter without appendToList", () => {
    it("should return index after matching line", () => {
      const lines = ["# Header", "# Today", "Some content"];
      const result = findInsertPosition(lines, "# Today", false);
      expect(result).toBe(2);
    });

    it("should use first match when multiple matches exist", () => {
      const lines = ["# Today", "content", "# Today", "more"];
      const result = findInsertPosition(lines, "# Today", false);
      expect(result).toBe(1);
    });

    it("should support regex patterns", () => {
      const lines = ["# Header", "## Tasks for 2025-12-31", "content"];
      const result = findInsertPosition(lines, "## Tasks for \\d{4}-\\d{2}-\\d{2}", false);
      expect(result).toBe(2);
    });

    it("should throw error when pattern not found", () => {
      const lines = ["# Header", "content"];
      expect(() => findInsertPosition(lines, "# NotFound", false)).toThrow(
        "Pattern '# NotFound' not found in file"
      );
    });
  });

  describe("insertAfter with appendToList", () => {
    it("should append to existing list after match", () => {
      const lines = ["# Today", "- [ ] task1", "- [ ] task2", "# Other"];
      const result = findInsertPosition(lines, "# Today", true);
      expect(result).toBe(3);
    });

    it("should find list end even with blank lines", () => {
      const lines = ["# Today", "", "- [ ] task1", "- [x] task2", "", "# Other"];
      const result = findInsertPosition(lines, "# Today", true);
      expect(result).toBe(4);
    });

    it("should return index after match when no list exists", () => {
      const lines = ["# Today", "Just text here", "# Other"];
      const result = findInsertPosition(lines, "# Today", true);
      // No list found, insert right after match
      expect(result).toBe(1);
    });

    it("should handle list at end of file", () => {
      const lines = ["# Today", "- [ ] task1", "- [ ] task2"];
      const result = findInsertPosition(lines, "# Today", true);
      expect(result).toBe(3);
    });

    it("should stop at next heading", () => {
      const lines = ["# Today", "- task1", "## Subheading", "- task2"];
      const result = findInsertPosition(lines, "# Today", true);
      expect(result).toBe(2);
    });

    it("should handle different list markers", () => {
      const lines = ["# Today", "* item1", "* item2", "text"];
      const result = findInsertPosition(lines, "# Today", true);
      expect(result).toBe(3);
    });
  });
});
