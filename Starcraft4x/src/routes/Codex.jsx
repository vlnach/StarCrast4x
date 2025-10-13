import { useGame } from "../hooks/useGame.js";

export default function CodexPage() {
  const { terrainById } = useGame();
  const terrainEntries = Object.entries(terrainById);

  return (
    <div className="card">
      <h2>Codex</h2>
      <p style={{ color: "#9aa6b2" }}>
        Data loaded via async API (Supabase if configured, otherwise local JSON
        fallback).
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #243141" }}>
            <th>id</th>
            <th>moveCost</th>
            <th>passable</th>
            <th>color</th>
          </tr>
        </thead>
        <tbody>
          {terrainEntries.map(([terrainId, record]) => (
            <tr key={terrainId} style={{ borderBottom: "1px solid #243141" }}>
              <td>{terrainId}</td>
              <td>{record.moveCost}</td>
              <td>{String(record.passable)}</td>
              <td>
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    background: record.color,
                    border: "1px solid #243141",
                    borderRadius: 4,
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
