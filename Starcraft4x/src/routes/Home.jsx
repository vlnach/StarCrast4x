import { useNavigate } from "react-router-dom";
import { useGameContext } from "../context/GameContext.jsx";
import { clearSavedGameState } from "../hooks/storage.js";

export default function HomePage() {
  const navigateTo = useNavigate();
  const { dispatchGameAction } = useGameContext();

  function handleStartNewGame() {
    clearSavedGameState();
    dispatchGameAction({ type: "START_NEW_GAME" });
    navigateTo("/play");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h1 style={{ margin: 0 }}>Eclipse of Realms</h1>
        <p style={{ color: "#9aa6b2", marginTop: 6 }}>Minimal 4X on hexes</p>
        <div className="row">
          <button className="button" onClick={handleStartNewGame}>
            Start New Game
          </button>
          <button
            className="button button--ghost"
            onClick={() => navigateTo("/play")}
          >
            Continue
          </button>
          <button
            className="button button--ghost"
            onClick={() => navigateTo("/codex")}
          >
            Codex
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>How to play</h3>
        <ul>
          <li>
            Click an adjacent hex to move. Movement costs depend on terrain.
          </li>
          <li>You have 3 Action Points per turn.</li>
          <li>
            Press <b>End Turn</b>: the enemy moves one step closer to you.
          </li>
        </ul>
      </div>
    </div>
  );
}
