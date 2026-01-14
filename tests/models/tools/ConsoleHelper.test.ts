import { describe, it, expect, vi } from "vitest";
import consoleHelper from "../../../src/models/tools/ConsoleHelper";

describe("ConsoleHelper", () => {
  it("generates centered content and lines", () => {
    const line = consoleHelper.generateLine("+", "-", "+");
    expect(line.length).toBe(80);
    const centered = consoleHelper.centerContent("test", 10);
    expect(centered.trim()).toBe("test");
  });

  it("truncates long content", () => {
    const centered = consoleHelper.centerContent("very-long-content", 4);
    expect(centered.length).toBe(4);

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    consoleHelper.writeBoxLine("x".repeat(200));
    expect(infoSpy).toHaveBeenCalled();
  });

  it("writes boxes to console", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    consoleHelper.beginBox("Title");
    consoleHelper.writeBoxLine("Line");
    consoleHelper.endBox("Done");
    consoleHelper.writeBox("Full");
    consoleHelper.newLine();

    expect(infoSpy).toHaveBeenCalled();
  });
});
