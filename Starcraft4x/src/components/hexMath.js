// All hex math in one place.

export const HEX_GEOMETRY = {
  hexagonRadius: 28, // visual tile size in px

  get hexagonWidth() {
    return Math.sqrt(3) * this.hexagonRadius;
  },
  get hexagonHeight() {
    return 2 * this.hexagonRadius;
  },
  get verticalStep() {
    return (3 / 2) * this.hexagonRadius;
  },
};

/** Convert axial (q,r) into pixel coordinates (x,y) for SVG drawing. */
export function axialToPixels(columnIndex, rowIndex, geom = HEX_GEOMETRY) {
  const pixelX =
    geom.hexagonRadius * Math.sqrt(3) * (columnIndex + rowIndex / 2);
  const pixelY = geom.verticalStep * rowIndex;
  return { pixelX, pixelY };
}

/** Axial hex distance between two axial points. */
export function axialDistance(fromAxial, toAxial) {
  const deltaQ = fromAxial.q - toAxial.q;
  const deltaR = fromAxial.r - toAxial.r;
  const deltaS = -deltaQ - deltaR; // third cube axis derived so sum is zero
  return (Math.abs(deltaQ) + Math.abs(deltaR) + Math.abs(deltaS)) / 2;
}

/** SVG polygon points string for a hex centered at (0,0). */
export function hexagonPolygonPointsString(
  radius = HEX_GEOMETRY.hexagonRadius
) {
  const points = [];
  for (let vertexIndex = 0; vertexIndex < 6; vertexIndex++) {
    const angleRadians = (Math.PI / 180) * (60 * vertexIndex - 30);
    const pointX = radius * Math.cos(angleRadians);
    const pointY = radius * Math.sin(angleRadians);
    points.push([pointX, pointY]);
  }
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}
