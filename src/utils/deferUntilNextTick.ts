export function deferUntilNextTick(callback: () => unknown): void {
  setTimeout(() => {
    callback();
  }, 0);
}
