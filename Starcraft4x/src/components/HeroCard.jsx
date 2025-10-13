import { useGame } from "../hooks/useGame.js";

/**
 * Minimal HUD with readable labels and a single action button.
 */
export default function HeroCard() {
  const {
    playerUnit,
    enemyUnit,
    activeTurnOwner,
    completePlayerTurn,
    systemNotice,
  } = useGame();

  return (
    <div className="card hud-card">
      <h3 className="title title--md" style={{ marginBottom: 6 }}>
        HUD
      </h3>

      <div className="row">
        <div className="hud-label">Turn</div>
        <div className="hud-value">{activeTurnOwner}</div>
      </div>

      {playerUnit && (
        <>
          <div className="row">
            <div className="hud-label">Hero</div>
            <div className="hud-value">{`q:${playerUnit.q} r:${playerUnit.r}`}</div>
          </div>
          <div className="row">
            <div className="hud-label">HP</div>
            <div className="hud-value">{playerUnit.hp}</div>
          </div>
          <div className="row">
            <div className="hud-label">AP</div>
            <div className="hud-value">{playerUnit.ap}</div>
          </div>
        </>
      )}

      {enemyUnit && (
        <div className="row">
          <div className="hud-label">Enemy</div>
          <div className="hud-value">{`q:${enemyUnit.q} r:${enemyUnit.r}`}</div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button
          className="button button--primary button--xl"
          onClick={completePlayerTurn}
          disabled={activeTurnOwner !== "player"}
        >
          End Turn
        </button>
      </div>

      {systemNotice && (
        <div style={{ marginTop: 10, color: "var(--muted)" }}>
          {systemNotice}
        </div>
      )}
    </div>
  );
}
