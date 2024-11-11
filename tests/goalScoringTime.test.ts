import { formatScoringTime } from "../src/timeUtils";

describe("should format scoring time", () => {
  it("should handle 1st period", () => {
    const time = formatScoringTime(20, 0, 35, 10);
    expect(time).toBe("20");
  });
  it("should handle second period", () => {
    const time = formatScoringTime(55, 1, 35, 10);
    expect(time).toBe("55");
  });
  it("should handle extra time first half", () => {
    const time = formatScoringTime(37, 0, 35, 10);
    expect(time).toBe("35+2");
  });
  it("should handle extra time first half", () => {
    const time = formatScoringTime(71, 1, 35, 10);
    expect(time).toBe("70+1");
  });
  it("should handle extra period goal", () => {
    const time = formatScoringTime(75, 2, 35, 10);
    expect(time).toBe("75");
  });
  it("should handle extra time in extra period goal", () => {
    const time = formatScoringTime(81, 2, 35, 10);
    expect(time).toBe("80+1");
  });
});
