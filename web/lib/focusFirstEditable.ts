const DEFAULT_EDITABLE_SELECTOR =
  "#contact input, #contact textarea, #contact select, #quote input, #quote textarea, #quote select";

export function focusFirstEditable(
  selector: string = DEFAULT_EDITABLE_SELECTOR,
  delayMs = 0,
  attempts = 6
): () => void {
  let cancelled = false;
  const pendingTimeouts = new Set<number>();

  const scheduleRetry = (remaining: number) => {
    if (cancelled || remaining <= 1) {
      return;
    }

    const retryTimeout = window.setTimeout(() => {
      pendingTimeouts.delete(retryTimeout);
      tryFocus(remaining - 1);
    }, 50);
    pendingTimeouts.add(retryTimeout);
  };

  const tryFocus = (remaining: number) => {
    if (cancelled) return;

    const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);
    if (!field) {
      scheduleRetry(remaining);
      return;
    }

    field.focus({ preventScroll: true });

    if (document.activeElement === field || remaining <= 1) {
      return;
    }

    scheduleRetry(remaining);
  };

  const initialTimeout = window.setTimeout(() => {
    pendingTimeouts.delete(initialTimeout);
    tryFocus(attempts);
  }, delayMs);
  pendingTimeouts.add(initialTimeout);

  return () => {
    cancelled = true;
    for (const timeoutId of pendingTimeouts) {
      window.clearTimeout(timeoutId);
    }
    pendingTimeouts.clear();
  };
}
