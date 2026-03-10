import { appendFile, mkdir } from "fs/promises";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "main-events.log");

const escapeValue = (value: string) => value.replace(/'/g, "\\'");

const toMessage = (event: string, context?: Record<string, string | number | boolean | null | undefined>) => {
  if (!context || Object.keys(context).length === 0) {
    return event;
  }

  const parts = Object.entries(context)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}='${escapeValue(String(value))}'`);

  return `${event}${parts.length ? ` (${parts.join(", ")})` : ""}`;
};

const writeLine = async (line: string) => {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(LOG_FILE, `${line}\n`, "utf8");
  } catch (error) {
    // Logging must never break request handling.
    console.error("Failed to write log file", error);
  }
};

export const logMainEvent = (
  event: string,
  context?: Record<string, string | number | boolean | null | undefined>,
) => {
  const timestamp = new Date().toISOString();
  const message = toMessage(event, context);
  void writeLine(`[${timestamp}] INFO ${message}`);
};

export const logMainError = (
  event: string,
  context?: Record<string, string | number | boolean | null | undefined>,
) => {
  const timestamp = new Date().toISOString();
  const message = toMessage(event, context);
  void writeLine(`[${timestamp}] ERROR ${message}`);
};
