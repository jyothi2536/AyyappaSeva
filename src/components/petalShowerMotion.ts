export const PETAL_SHOWER_DURATION = 2800;

const petalColors = [
  ["#FFE2E9", "#D9547A"],
  ["#FFF0BE", "#E0A637"],
  ["#FFF9E7", "#DBC49B"],
  ["#EE8FA9", "#A92750"],
] as const;

// A fixed, staggered offering: no random re-render jumps or endless confetti loop.
export const offeringPetals = Array.from({ length: 26 }, (_, index) => {
  const lane = ((index * 7) % 26) / 25;
  const start = (index % 9) * 0.035;
  return {
    id: index,
    start,
    end: start + 0.62 + (index % 3) * 0.025,
    startX: 0.07 + lane * 0.86,
    endX: 0.3 + lane * 0.4,
    endY: 0.64 + (index % 4) * 0.025,
    sway: (index % 2 === 0 ? 1 : -1) * (10 + index % 13),
    size: 10 + index % 7,
    rotation: (index * 43) % 180 - 90,
    turn: index % 2 === 0 ? 155 : -135,
    colors: petalColors[index % petalColors.length]!,
  };
});
