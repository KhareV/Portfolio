export class TimeoutError extends Error {
  constructor(message = "Operation timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Rejects with TimeoutError if `promise` has not settled within `ms`.
 * The underlying work is not cancelled (e.g. the EmailJS SDK exposes no
 * abort), only the caller stops waiting for it.
 */
export const withTimeout = (promise, ms) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError()), ms);
  });

  return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
    clearTimeout(timeoutId);
  });
};
