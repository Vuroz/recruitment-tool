const DATABASE_ERROR_PATTERNS = [
  /p1001/i,
  /p1002/i,
  /p1017/i,
  /p2024/i,
  /p2028/i,
  /can't reach database server/i,
  /database server at .* was reached but timed out/i,
  /server has closed the connection/i,
  /database system is shutting down/i,
  /unable to start a transaction in the given time/i,
  /transaction api error/i,
  /timed out fetching a new connection from the connection pool/i,
  /econnrefused/i,
  /etimedout/i,
  /service unavailable/i,
];

type AnyRecord = Record<string, unknown>;

const toRecord = (value: unknown): AnyRecord | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as AnyRecord;
};

const matchesDatabasePattern = (value: unknown) => {
  if (typeof value !== "string") {
    return false;
  }

  return DATABASE_ERROR_PATTERNS.some((pattern) => pattern.test(value));
};

const hasDatabaseErrorSignal = (
  value: unknown,
  visited = new WeakSet<object>(),
  depth = 0,
): boolean => {
  if (!value || depth > 8) {
    return false;
  }

  if (typeof value === "string") {
    return matchesDatabasePattern(value);
  }

  if (value instanceof Error) {
    return (
      matchesDatabasePattern(value.message) ||
      hasDatabaseErrorSignal(value.cause, visited, depth + 1)
    );
  }

  if (typeof value !== "object") {
    return false;
  }

  if (visited.has(value)) {
    return false;
  }
  visited.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => hasDatabaseErrorSignal(item, visited, depth + 1));
  }

  const record = toRecord(value);
  if (!record) {
    return false;
  }

  if (record.code === "SERVICE_UNAVAILABLE") {
    return true;
  }

  if (
    matchesDatabasePattern(record.code) ||
    matchesDatabasePattern(record.message) ||
    hasDatabaseErrorSignal(record.cause, visited, depth + 1) ||
    hasDatabaseErrorSignal(record.error, visited, depth + 1) ||
    hasDatabaseErrorSignal(record.data, visited, depth + 1)
  ) {
    return true;
  }

  return Object.values(record).some((entry) =>
    hasDatabaseErrorSignal(entry, visited, depth + 1),
  );
};

export const isDatabaseUnavailableError = (error: unknown): boolean => {
  return hasDatabaseErrorSignal(error);
};

export const redirectToServiceUnavailable = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== "/service-unavailable") {
    window.location.assign("/service-unavailable");
  }
};