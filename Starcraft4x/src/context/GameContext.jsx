import { createContext, useContext, useEffect, useReducer } from "react";
import { fetchTerrainRecords, fetchWorldCells } from "../api/fetchData.js";
import {
  loadSavedGameState,
  persistGameStateToLocalStorage,
} from "../hooks/storage.js";

/**
 * Central game state stored in a small reducer.
 * Intentionally compact and explicit to remain readable.
 */

/* ------------------------ action type constants ------------------------ */
export const ACTION_TYPES = Object.freeze({
  LOAD_STATIC_DATA: "LOAD_STATIC_DATA",
  SET_LOAD_ERROR: "SET_LOAD_ERROR",
  START_NEW_GAME: "START_NEW_GAME",
  LOAD_SAVED_GAME: "LOAD_SAVED_GAME",
  MOVE_PLAYER: "MOVE_PLAYER",
  END_PLAYER_TURN: "END_PLAYER_TURN",
  ENEMY_DID_STEP: "ENEMY_DID_STEP",
  SET_SYSTEM_NOTICE: "SET_SYSTEM_NOTICE",
});

const actionPointsPerTurn = 3;
const startAxialPosition = { q: 5, r: 5 }; // axial coords (column, row)

const initialGameState = {
  terrainById: {}, // { [terrainId]: { moveCost, passable, color } }
  worldCells: [], // [{ q, r, terrainId }]
  playerUnit: null, // { q, r, hp, power, ap }
  enemyUnit: null, // { q, r, hp, power }
  activeTurnOwner: "player",
  isDataLoading: true,
  loadErrorText: null,
  systemNotice: "",
};

export const GameContext = createContext(null);

function gameStateReducer(currentState, action) {
  switch (action.type) {
    case ACTION_TYPES.LOAD_STATIC_DATA: {
      const { terrainById, worldCells } = action.payload ?? {};
      return {
        ...currentState,
        terrainById: terrainById ?? currentState.terrainById,
        worldCells: Array.isArray(worldCells)
          ? worldCells
          : currentState.worldCells,
        isDataLoading: false,
        loadErrorText: null,
        systemNotice: "", // clear any previous notice
      };
    }

    case ACTION_TYPES.SET_LOAD_ERROR: {
      return {
        ...currentState,
        isDataLoading: false,
        loadErrorText: action.payload,
      };
    }

    case ACTION_TYPES.START_NEW_GAME: {
      const playerUnit = {
        q: startAxialPosition.q,
        r: startAxialPosition.r,
        hp: 10,
        power: 2,
        ap: actionPointsPerTurn,
      };
      const enemyUnit = { q: 2, r: 2, hp: 8, power: 1 };
      return {
        ...currentState,
        playerUnit,
        enemyUnit,
        activeTurnOwner: "player",
        systemNotice: "", // fresh start
      };
    }

    case ACTION_TYPES.LOAD_SAVED_GAME: {
      const {
        terrainById,
        worldCells,
        playerUnit,
        enemyUnit,
        activeTurnOwner,
      } = action.payload ?? {};
      return {
        ...currentState,
        terrainById: terrainById ?? currentState.terrainById,
        worldCells: worldCells ?? currentState.worldCells,
        playerUnit: playerUnit ?? currentState.playerUnit,
        enemyUnit: enemyUnit ?? currentState.enemyUnit,
        activeTurnOwner: activeTurnOwner ?? currentState.activeTurnOwner,
        isDataLoading: false,
        loadErrorText: null,
        systemNotice: "", // avoid stale notice
      };
    }

    case ACTION_TYPES.MOVE_PLAYER: {
      const { q, r, nextActionPoints } = action.payload ?? {};
      if (
        typeof q !== "number" ||
        typeof r !== "number" ||
        typeof nextActionPoints !== "number" ||
        !currentState.playerUnit
      ) {
        return currentState; // guard against malformed action
      }
      return {
        ...currentState,
        playerUnit: { ...currentState.playerUnit, q, r, ap: nextActionPoints },
      };
    }

    case ACTION_TYPES.END_PLAYER_TURN: {
      return { ...currentState, activeTurnOwner: "enemy" };
    }

    case ACTION_TYPES.ENEMY_DID_STEP: {
      const { q, r } = action.payload ?? {};
      if (typeof q !== "number" || typeof r !== "number") {
        return {
          ...currentState,
          activeTurnOwner: "player",
          playerUnit: { ...currentState.playerUnit, ap: actionPointsPerTurn },
        };
      }
      return {
        ...currentState,
        enemyUnit: { ...currentState.enemyUnit, q, r },
        activeTurnOwner: "player",
        playerUnit: { ...currentState.playerUnit, ap: actionPointsPerTurn },
      };
    }

    case ACTION_TYPES.SET_SYSTEM_NOTICE: {
      return { ...currentState, systemNotice: action.payload ?? "" };
    }

    default:
      return currentState;
  }
}

export function GameProvider({ children }) {
  const [gameState, dispatchGameAction] = useReducer(
    gameStateReducer,
    initialGameState
  );

  // Load terrain + world cells, then load saved state or start new game.
  useEffect(() => {
    let isComponentAlive = true;

    (async () => {
      try {
        const [terrainById, worldCells] = await Promise.all([
          fetchTerrainRecords(),
          fetchWorldCells(),
        ]);
        if (!isComponentAlive) return;

        dispatchGameAction({
          type: ACTION_TYPES.LOAD_STATIC_DATA,
          payload: { terrainById, worldCells },
        });

        const savedSnapshot = loadSavedGameState();
        if (savedSnapshot) {
          dispatchGameAction({
            type: ACTION_TYPES.LOAD_SAVED_GAME,
            payload: savedSnapshot,
          });
        } else {
          dispatchGameAction({ type: ACTION_TYPES.START_NEW_GAME });
        }
      } catch (errorObject) {
        if (!isComponentAlive) return;
        dispatchGameAction({
          type: ACTION_TYPES.SET_LOAD_ERROR,
          payload: String(errorObject?.message || errorObject),
        });
      }
    })();

    return () => {
      isComponentAlive = false;
    };
  }, []);

  // Persist a small state slice to localStorage.
  useEffect(() => {
    if (gameState.isDataLoading || gameState.loadErrorText) return;
    if (!gameState.playerUnit || !gameState.enemyUnit) return; // light guard
    persistGameStateToLocalStorage({
      terrainById: gameState.terrainById,
      worldCells: gameState.worldCells,
      playerUnit: gameState.playerUnit,
      enemyUnit: gameState.enemyUnit,
      activeTurnOwner: gameState.activeTurnOwner,
    });
  }, [
    gameState.isDataLoading,
    gameState.loadErrorText,
    gameState.terrainById,
    gameState.worldCells,
    gameState.playerUnit,
    gameState.enemyUnit,
    gameState.activeTurnOwner,
  ]);

  return (
    <GameContext.Provider value={{ gameState, dispatchGameAction }}>
      {children}
    </GameContext.Provider>
  );
}

/** Named hook used by useGame.js to access state + dispatch. */
export function useGameContext() {
  const contextValue = useContext(GameContext);
  if (!contextValue)
    throw new Error("useGameContext must be used inside GameProvider");
  return contextValue;
}
