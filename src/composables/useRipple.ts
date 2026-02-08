import { onUnmounted } from "vue";

const MAX_RIPPLES = 3;

export function useRipple() {
  const activeRipples = new WeakMap<HTMLElement, number>();

  function onTouchStart(event: TouchEvent) {
    const button = event.currentTarget as HTMLButtonElement;
    if (!button || button.disabled) return;

    // Get touch coordinates
    const touch = event.touches[0];
    if (!touch) return;

    const rect = button.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Limit concurrent ripples
    const count = activeRipples.get(button) || 0;
    if (count >= MAX_RIPPLES) return;
    activeRipples.set(button, count + 1);

    // Create ripple element
    const ripple = document.createElement("span");
    ripple.className = "ripple";

    // Calculate size (cover button)
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    //button.style.width = rect.width + "px";
    //console.log(rect.width, x, y, size);

    // Center ripple on touch point
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;

    button.appendChild(ripple);

    // Cleanup after animation
    const cleanup = () => {
      ripple.remove();
      const newCount = (activeRipples.get(button) || 1) - 1;
      if (newCount <= 0) {
        activeRipples.delete(button);
      } else {
        activeRipples.set(button, newCount);
      }
    };

    ripple.addEventListener("animationend", cleanup, { once: true });
    // Fallback cleanup if animationend doesn't fire
    setTimeout(cleanup, 1000);
  }

  function cleanup() {
    // Cleanup handled per-ripple, this is for component unmount
  }

  onUnmounted(cleanup);

  return {
    onTouchStart,
    cleanup,
  };
}
