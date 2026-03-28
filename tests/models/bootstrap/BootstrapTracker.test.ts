import { describe, it, expect, beforeEach } from "vitest";
import bootstrapTracker from "../../../src/models/bootstrap/BootstrapTracker";

describe("BootstrapTracker", () => {
  beforeEach(() => {
    bootstrapTracker.reset();
  });

  it("starts with pending steps after reset", () => {
    const snapshot = bootstrapTracker.getSnapshot();

    expect(snapshot.phase).toBe("idle");
    expect(snapshot.steps).toHaveLength(8);
    expect(snapshot.steps.every((step) => step.status === "pending")).toBe(true);
  });

  it("tracks a successful initialization flow", () => {
    bootstrapTracker.beginInitialization("Boot started");
    bootstrapTracker.markStepRunning("database-connection", "Connecting");
    bootstrapTracker.updateStepProgress("database-connection", 50, "Halfway there");
    bootstrapTracker.markStepSuccess("database-connection", "Connected");
    bootstrapTracker.markReady("Ready");

    const snapshot = bootstrapTracker.getSnapshot();
    expect(snapshot.phase).toBe("ready");
    expect(snapshot.headline).toBe("Ready");
    expect(snapshot.steps[0].status).toBe("success");
    expect(snapshot.steps[0].progress).toBe(100);
    expect(snapshot.events[0].message).toBe("Ready");
  });

  it("stores logs and failures", () => {
    bootstrapTracker.beginInitialization("Boot started");
    bootstrapTracker.markStepRunning("client-data", "Extracting");
    bootstrapTracker.addLog("Chunk 1\nChunk 2", "client-data");
    bootstrapTracker.markStepError("client-data", "Extraction failed");
    bootstrapTracker.markFailed("Initialization failed");

    const snapshot = bootstrapTracker.getSnapshot();
    expect(snapshot.phase).toBe("failed");
    expect(snapshot.logs.at(0)?.message).toBe("Chunk 1");
    expect(snapshot.logs.at(1)?.message).toBe("Chunk 2");
    expect(snapshot.steps.find((step) => step.id === "client-data")?.status).toBe("error");
  });

  it("ignores empty logs and rejects unknown steps", () => {
    bootstrapTracker.addLog("   ");

    expect(bootstrapTracker.getSnapshot().logs).toHaveLength(0);
    expect(() => bootstrapTracker.markStepRunning("unknown-step" as never, "Oops")).toThrow("Unknown bootstrap step");
  });

  it("can complete a step without a prior running state", () => {
    bootstrapTracker.markStepSuccess("auth-config", "Generated");

    const step = bootstrapTracker.getSnapshot().steps.find((entry) => entry.id === "auth-config");
    expect(step?.status).toBe("success");
    expect(step?.startedAt).not.toBeNull();
  });
});
