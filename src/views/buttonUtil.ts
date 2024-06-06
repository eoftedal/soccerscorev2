export function setActive(e: TouchEvent) {
  console.log("active", e);
  const x = e.target as HTMLElement;
  x.classList.add("active");
}
export function setInactive(e: TouchEvent) {
  console.log("inactive", e);
  const x = e.target as HTMLElement;
  x.classList.remove("active");
}
