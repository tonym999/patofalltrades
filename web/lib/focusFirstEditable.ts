const DEFAULT_EDITABLE_SELECTOR =
  "#contact input:not([type='hidden']), #contact textarea, #contact select, #quote input:not([type='hidden']), #quote textarea, #quote select";

type EditableField =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

function isFocusableField(field: EditableField): boolean {
  if (field.disabled) return false;
  if ("readOnly" in field && field.readOnly) return false;
  if (field.matches("[inert], [aria-hidden='true']")) return false;
  if (field.tabIndex < 0) return false;

  let node: HTMLElement | null = field;
  while (node) {
    if (node.hidden || node.getAttribute("aria-hidden") === "true" || node.hasAttribute("inert")) {
      return false;
    }
    node = node.parentElement;
  }

  const styles = window.getComputedStyle(field);
  if (styles.display === "none" || styles.visibility === "hidden") return false;

  return field.getClientRects().length > 0;
}

export function focusFirstEditable(
  selector: string = DEFAULT_EDITABLE_SELECTOR,
  delayMs = 0,
  attempts = 6
): () => void {
  let cancelled = false;
  const pendingTimeouts = new Set<ReturnType<typeof window.setTimeout>>();

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

    const field = Array.from(
      document.querySelectorAll<EditableField>(selector)
    ).find(isFocusableField);
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
