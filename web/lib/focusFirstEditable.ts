const DEFAULT_EDITABLE_SELECTOR =
  "#contact input, #contact textarea, #contact select, #quote input, #quote textarea, #quote select";

export function focusFirstEditable(
  selector: string = DEFAULT_EDITABLE_SELECTOR,
  delayMs = 0,
  attempts = 6
) {
  const tryFocus = (remaining: number) => {
    const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);
    if (!field) return;

    field.focus({ preventScroll: true });

    if (document.activeElement === field || remaining <= 1) {
      return;
    }

    window.setTimeout(() => {
      tryFocus(remaining - 1);
    }, 50);
  };

  window.setTimeout(() => {
    tryFocus(attempts);
  }, delayMs);
}
