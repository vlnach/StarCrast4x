// Pointy-top axial hex helpers

/** 6 axial neighbor offsets */
export const neighborOffsetsAxial = Object.freeze([
  { deltaQ: +1, deltaR: 0 },
  { deltaQ: +1, deltaR: -1 },
  { deltaQ: 0, deltaR: -1 },
  { deltaQ: -1, deltaR: 0 },
  { deltaQ: -1, deltaR: +1 },
  { deltaQ: 0, deltaR: +1 },
]);

/** Axial distance between two axial points */
export function getAxialDistance(fromAxial, toAxial) {
  const diffQ = fromAxial.q - toAxial.q;
  const diffR = fromAxial.r - toAxial.r;
  const diffS = -diffQ - diffR;
  return (Math.abs(diffQ) + Math.abs(diffR) + Math.abs(diffS)) / 2;
}

/** Is target adjacent to source (one of six neighbors) */
export function isAdjacentAxial(fromAxial, toAxial) {
  return neighborOffsetsAxial.some(
    ({ deltaQ, deltaR }) =>
      fromAxial.q + deltaQ === toAxial.q && fromAxial.r + deltaR === toAxial.r
  );
}
