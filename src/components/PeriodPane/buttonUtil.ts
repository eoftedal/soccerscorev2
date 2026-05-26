export function setActive(e: TouchEvent) {
  const x = e.target as HTMLElement;
  x.classList.add("active");
}
export function setInactive(e: TouchEvent) {
  const x = e.target as HTMLElement;
  x.classList.remove("active");
}
