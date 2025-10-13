import { axialDistance, axialToPixels } from "./hexMath.js";

/** Filter cells to a circular window around center (player). */
export function computeVisibleCellsAround(centerAxial, allCells, maxHexRadius) {
  if (!centerAxial || !Array.isArray(allCells)) return [];
  return allCells.filter(
    (cell) => axialDistance(cell, centerAxial) <= maxHexRadius
  );
}

/** Build tight viewport box for a list of visible cells. */
export function computeViewportForCells(visibleCells, geom, padding = 8) {
  if (!visibleCells?.length)
    return { minPixelX: 0, minPixelY: 0, width: 400, height: 240 };

  let minPixelX = Infinity,
    maxPixelX = -Infinity,
    minPixelY = Infinity,
    maxPixelY = -Infinity;

  for (const cell of visibleCells) {
    const { pixelX, pixelY } = axialToPixels(cell.q, cell.r, geom);
    minPixelX = Math.min(minPixelX, pixelX - geom.hexagonWidth / 2);
    maxPixelX = Math.max(maxPixelX, pixelX + geom.hexagonWidth / 2);
    minPixelY = Math.min(minPixelY, pixelY - geom.hexagonHeight / 2);
    maxPixelY = Math.max(maxPixelY, pixelY + geom.hexagonHeight / 2);
  }

  return {
    minPixelX,
    minPixelY,
    width: maxPixelX - minPixelX + padding * 2,
    height: maxPixelY - minPixelY + padding * 2,
  };
}

/** Fast lookup set: "q,r" keys for reachable cells. */
export function buildReachableKeySet(reachableList) {
  const setObject = new Set();
  for (const pos of reachableList) setObject.add(`${pos.q},${pos.r}`);
  return setObject;
}
