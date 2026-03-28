import { EventEmitter } from "events";

export type BootstrapStatus = "pending" | "running" | "success" | "error";
export type BootstrapPhase = "idle" | "initializing" | "ready" | "failed";

export type BootstrapStepId =
  | "database-connection"
  | "database-structure"
  | "database-seed"
  | "auth-config"
  | "world-config"
  | "database-update"
  | "realm-update"
  | "client-data";

export interface BootstrapStep {
  id: BootstrapStepId;
  title: string;
  description: string;
  status: BootstrapStatus;
  message: string;
  progress: number | null;
  startedAt: string | null;
  endedAt: string | null;
}

export interface BootstrapEventEntry {
  id: number;
  timestamp: string;
  message: string;
  level: "info" | "success" | "error";
  stepId: BootstrapStepId | null;
}

export interface BootstrapLogEntry {
  id: number;
  timestamp: string;
  message: string;
  stepId: BootstrapStepId | null;
}

interface BootstrapSnapshot {
  phase: BootstrapPhase;
  startedAt: string | null;
  completedAt: string | null;
  headline: string;
  steps: BootstrapStep[];
  events: BootstrapEventEntry[];
  logs: BootstrapLogEntry[];
}

type StepDefinition = Pick<BootstrapStep, "id" | "title" | "description">;

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: "database-connection",
    title: "Database Connection",
    description: "Waiting for MySQL to become reachable.",
  },
  {
    id: "database-structure",
    title: "Database Structure",
    description: "Create the required TrinityCore schemas and users.",
  },
  {
    id: "database-seed",
    title: "Initial Data",
    description: "Download and unpack TrinityCore bootstrap data.",
  },
  {
    id: "auth-config",
    title: "Auth Configuration",
    description: "Generate the auth or bnet server configuration.",
  },
  {
    id: "world-config",
    title: "World Configuration",
    description: "Generate the worldserver configuration.",
  },
  {
    id: "database-update",
    title: "Database Update",
    description: "Run TrinityCore updates with worldserver -u.",
  },
  {
    id: "realm-update",
    title: "Realm Update",
    description: "Apply realm name and public address settings.",
  },
  {
    id: "client-data",
    title: "Client Extraction",
    description: "Extract maps, vmaps and mmaps from the game client.",
  },
];

class BootstrapTracker extends EventEmitter {
  private phase: BootstrapPhase = "idle";
  private startedAt: string | null = null;
  private completedAt: string | null = null;
  private headline = "Waiting for container startup...";
  private steps: BootstrapStep[] = [];
  private events: BootstrapEventEntry[] = [];
  private logs: BootstrapLogEntry[] = [];
  private nextEventId = 1;
  private nextLogId = 1;

  constructor() {
    super();
    this.reset();
  }

  public reset() {
    this.phase = "idle";
    this.startedAt = null;
    this.completedAt = null;
    this.headline = "Waiting for container startup...";
    this.steps = STEP_DEFINITIONS.map((definition) => ({
      ...definition,
      status: "pending",
      message: "Pending",
      progress: null,
      startedAt: null,
      endedAt: null,
    }));
    this.events = [];
    this.logs = [];
    this.nextEventId = 1;
    this.nextLogId = 1;
    this.emitUpdate();
  }

  public beginInitialization(message: string) {
    this.phase = "initializing";
    this.startedAt = new Date().toISOString();
    this.completedAt = null;
    this.headline = message;
    this.addEvent(message);
    this.emitUpdate();
  }

  public markStepRunning(stepId: BootstrapStepId, message: string) {
    const step = this.getStep(stepId);
    step.status = "running";
    step.message = message;
    step.progress = step.progress ?? 0;
    step.startedAt = step.startedAt ?? new Date().toISOString();
    step.endedAt = null;
    this.headline = message;
    this.addEvent(message, "info", stepId);
    this.emitUpdate();
  }

  public updateStepProgress(stepId: BootstrapStepId, progress: number | null, message?: string) {
    const step = this.getStep(stepId);
    step.progress = progress;
    if (message) {
      step.message = message;
      this.headline = message;
    }
    this.emitUpdate();
  }

  public markStepSuccess(stepId: BootstrapStepId, message: string) {
    const step = this.getStep(stepId);
    step.status = "success";
    step.message = message;
    step.progress = 100;
    step.startedAt = step.startedAt ?? new Date().toISOString();
    step.endedAt = new Date().toISOString();
    this.headline = message;
    this.addEvent(message, "success", stepId);
    this.emitUpdate();
  }

  public markStepError(stepId: BootstrapStepId, message: string) {
    const step = this.getStep(stepId);
    step.status = "error";
    step.message = message;
    step.endedAt = new Date().toISOString();
    this.headline = message;
    this.addEvent(message, "error", stepId);
    this.emitUpdate();
  }

  public markReady(message: string) {
    this.phase = "ready";
    this.completedAt = new Date().toISOString();
    this.headline = message;
    this.addEvent(message, "success");
    this.emitUpdate();
  }

  public markFailed(message: string) {
    this.phase = "failed";
    this.completedAt = new Date().toISOString();
    this.headline = message;
    this.addEvent(message, "error");
    this.emitUpdate();
  }

  public addEvent(message: string, level: "info" | "success" | "error" = "info", stepId: BootstrapStepId | null = null) {
    this.events.unshift({
      id: this.nextEventId++,
      timestamp: new Date().toISOString(),
      message: this.normalizeMessage(message),
      level,
      stepId,
    });
    this.events = this.events.slice(0, 80);
  }

  public addLog(message: string, stepId: BootstrapStepId | null = null) {
    const normalizedLines = this.normalizeLogMessage(message);
    if (normalizedLines.length === 0) {
      return;
    }

    normalizedLines.forEach((line) => {
      this.logs.push({
        id: this.nextLogId++,
        timestamp: new Date().toISOString(),
        message: line,
        stepId,
      });
    });
    this.logs = this.logs.slice(-400);
    this.emitUpdate();
  }

  public getSnapshot(): BootstrapSnapshot {
    return {
      phase: this.phase,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      headline: this.headline,
      steps: this.steps.map((step) => ({ ...step })),
      events: this.events.map((event) => ({ ...event })),
      logs: this.logs.map((log) => ({ ...log })),
    };
  }

  private getStep(stepId: BootstrapStepId): BootstrapStep {
    const step = this.steps.find((item) => item.id === stepId);
    if (!step) {
      throw new Error(`Unknown bootstrap step: ${stepId}`);
    }
    return step;
  }

  private normalizeMessage(message: string): string {
    return message.replace(/\s+/g, " ").trim();
  }

  private normalizeLogMessage(message: string): string[] {
    return message
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trimEnd())
      .filter((line) => line.trim().length > 0);
  }

  private emitUpdate() {
    this.emit("update", this.getSnapshot());
  }
}

export default new BootstrapTracker();
