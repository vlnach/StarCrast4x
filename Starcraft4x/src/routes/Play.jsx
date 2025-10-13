import HexMap from "../components/HexMap.jsx";
import HeroCard from "../components/HeroCard.jsx";
import { useGame } from "../hooks/useGame.js";
import { useGameContext } from "../context/GameContext.jsx";

export default function PlayScreen() {
  const { isDataLoading, loadErrorText, terrainById } = useGame();

  // Guard states
  if (isDataLoading) return <div className="card">Loading…</div>;
  if (loadErrorText)
    return (
      <div className="card" style={{ color: "#ef4444" }}>
        {String(loadErrorText)}
      </div>
    );
  if (!terrainById || !Object.keys(terrainById).length)
    return <div className="card">No data loaded</div>;

  return (
    <div className="map__wrap">
      <HexMap />

      {/* Right column (HUD + legend) */}
      <div className="side-panel">
        <HeroCard />
        <TerrainLegend />
      </div>
    </div>
  );
}

/* ---------- Right sidebar: terrain legend ---------- */

function TerrainLegend() {
  const { gameState } = useGameContext();
  const terrainById = gameState.terrainById;

  return (
    <div className="card legend">
      <h3 className="legend__title">Terrains</h3>

      {Object.entries(terrainById).map(([terrainId, terrainRecord]) => (
        <div
          key={terrainId}
          className="legend__item"
          title={`move cost: ${terrainRecord.moveCost}`}
        >
          {/* color is passed via CSS variable consumed by .legend__dot */}
          <span
            className="legend__dot"
            style={{ ["--color"]: terrainRecord.color }}
          />
          <span>
            {terrainId} — cost {terrainRecord.moveCost}
            {terrainRecord.passable ? "" : " (impassable)"}
          </span>
        </div>
      ))}
    </div>
  );
}
