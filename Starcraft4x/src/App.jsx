import { Routes, Route, NavLink } from "react-router-dom";
import HomePage from "./routes/Home.jsx";
import PlayScreen from "./routes/Play.jsx";
import CodexPage from "./routes/Codex.jsx";
import { GameProvider } from "./context/GameContext.jsx";

/**
 * Application shell: header + routed pages + footer.
 * Uses .container and class names that match index.css.
 */
export default function App() {
  return (
    <GameProvider>
      <header className="app_header">
        <div className="container header_inner">
          <div className="app_header__brand">Eclipse of Realms</div>
          <nav>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              Home
            </NavLink>
            <NavLink
              to="/play"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              Play
            </NavLink>
            <NavLink
              to="/codex"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              Codex
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="app_main">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/play" element={<PlayScreen />} />
            <Route path="/codex" element={<CodexPage />} />
          </Routes>
        </div>
      </main>

      <footer className="app_footer">
        <div className="container">This is minimal 4X prototype</div>
      </footer>
    </GameProvider>
  );
}
