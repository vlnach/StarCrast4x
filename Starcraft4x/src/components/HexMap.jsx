import { useGame } from "../hooks/useGame.js";
import {
  HEX_GEOMETRY,
  axialToPixels,
  hexagonPolygonPointsString,
} from "./hexMath.js";
import {
  computeVisibleCellsAround,
  computeViewportForCells,
  buildReachableKeySet,
} from "./camera.js";

/**
 * Hex map with follow-player camera.
 * Utils live in components/utils to keep everything close to UI.
 */

/* Camera and visual settings */
const cameraEnabled = true;
const cameraHexRadius = 3; // how many hex steps around the player
const tileBorderColor = "#1f2937";
const svgPaddingInside = 8;

/* Precompute polygon once (uses HEX_GEOMETRY.hexagonRadius) */
const hexagonPolygonPoints = hexagonPolygonPointsString();

function terrainGlyph(terrainId) {
  if (terrainId === "forest") return "🌲";
  if (terrainId === "mountain") return "⛰️";
  if (terrainId === "water") return "≈";
  return "·";
}

function HexTile({
  worldCell,
  isReachableNow,
  onClick,
  viewport,
  getTerrainByCell,
}) {
  const { pixelX, pixelY } = axialToPixels(
    worldCell.q,
    worldCell.r,
    HEX_GEOMETRY
  );
  const drawX = pixelX - viewport.minPixelX + svgPaddingInside;
  const drawY = pixelY - viewport.minPixelY + svgPaddingInside;

  const terrainRecord = getTerrainByCell(worldCell);
  const tileFillColor = terrainRecord?.color || "#94a3b8";

  return (
    <g transform={`translate(${drawX}, ${drawY})`}>
      <polygon
        points={hexagonPolygonPoints}
        fill={tileFillColor}
        stroke={tileBorderColor}
        strokeWidth="1.5"
        onClick={() => onClick(worldCell)}
        style={{
          cursor: "pointer",
          filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.25))",
        }}
      />
      {isReachableNow && (
        <polygon
          points={hexagonPolygonPoints}
          fill="none"
          stroke="rgba(34,211,238,0.8)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      )}
      <text
        x="0"
        y="5"
        textAnchor="middle"
        fontSize="13"
        fill="rgba(0,0,0,0.55)"
      >
        {terrainGlyph(worldCell.terrainId)}
      </text>
    </g>
  );
}

function UnitMarker({ unitState, viewport, unitColor }) {
  if (!unitState) return null;
  const { pixelX, pixelY } = axialToPixels(
    unitState.q,
    unitState.r,
    HEX_GEOMETRY
  );
  const drawX = pixelX - viewport.minPixelX + svgPaddingInside;
  const drawY = pixelY - viewport.minPixelY + svgPaddingInside;
  return (
    <g transform={`translate(${drawX}, ${drawY})`}>
      <circle r="9" fill={unitColor} stroke="#0B0F14" strokeWidth="2.2" />
    </g>
  );
}

export default function HexMap() {
  const {
    worldCells,
    playerUnit,
    enemyUnit,
    attemptMovePlayer,
    getReachableNeighborCells,
    getTerrainByCell,
  } = useGame();

  if (!playerUnit || !worldCells?.length) return null;

  const visibleCells = cameraEnabled
    ? computeVisibleCellsAround(playerUnit, worldCells, cameraHexRadius)
    : worldCells;

  const reachableKeySet = buildReachableKeySet(getReachableNeighborCells());
  const viewport = computeViewportForCells(
    visibleCells,
    HEX_GEOMETRY,
    svgPaddingInside
  );

  function handleTileClick(worldCell) {
    attemptMovePlayer(worldCell.q, worldCell.r);
  }

  const enemyIsVisible =
    !!enemyUnit &&
    visibleCells.some((c) => c.q === enemyUnit.q && c.r === enemyUnit.r);
  const playerIsVisible =
    !!playerUnit &&
    visibleCells.some((c) => c.q === playerUnit.q && c.r === playerUnit.r);

  return (
    <div className="card map-card">
      <svg
        width={viewport.width}
        height={viewport.height}
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        preserveAspectRatio="xMinYMin meet"
      >
        {visibleCells.map((cell) => (
          <HexTile
            key={`cell-${cell.q}:${cell.r}`}
            worldCell={cell}
            isReachableNow={reachableKeySet.has(`${cell.q},${cell.r}`)}
            onClick={handleTileClick}
            viewport={viewport}
            getTerrainByCell={getTerrainByCell}
          />
        ))}

        {enemyIsVisible && (
          <UnitMarker
            unitState={enemyUnit}
            viewport={viewport}
            unitColor="#ef4444"
          />
        )}
        {playerIsVisible && (
          <UnitMarker
            unitState={playerUnit}
            viewport={viewport}
            unitColor="#22d3ee"
          />
        )}
      </svg>
    </div>
  );
}
