import { useGameContext } from "../context/GameContext.jsx";

/**
 * Axial hex helpers and gameplay actions with descriptive names.
 * Public API (returned from useGame) is unchanged.
 */

const neighborOffsetsAxial = [
  { deltaQ: +1, deltaR: 0 },
  { deltaQ: +1, deltaR: -1 },
  { deltaQ: 0, deltaR: -1 },
  { deltaQ: -1, deltaR: 0 },
  { deltaQ: -1, deltaR: +1 },
  { deltaQ: 0, deltaR: +1 },
];

/** Hex distance in axial coordinates. */
function getAxialDistance(fromAxial, toAxial) {
  const deltaQ = fromAxial.q - toAxial.q;
  const deltaR = fromAxial.r - toAxial.r;
  const deltaS = -deltaQ - deltaR; // third cube axis so q+r+s = 0
  return (Math.abs(deltaQ) + Math.abs(deltaR) + Math.abs(deltaS)) / 2;
}

/** Adjacent check in axial coordinates (six neighbors). */
function isAdjacentAxial(fromAxial, toAxial) {
  return neighborOffsetsAxial.some(
    ({ deltaQ, deltaR }) =>
      fromAxial.q + deltaQ === toAxial.q && fromAxial.r + deltaR === toAxial.r
  );
}

export function useGame() {
  const { gameState, dispatchGameAction } = useGameContext();
  const {
    terrainById,
    worldCells,
    playerUnit,
    enemyUnit,
    activeTurnOwner,
    isDataLoading,
    loadErrorText,
    systemNotice,
  } = gameState;

  /** Return world cell by axial coordinates, or null if missing. */
  function getCellByAxial(columnIndex, rowIndex) {
    return (
      worldCells.find(
        (worldCell) => worldCell.q === columnIndex && worldCell.r === rowIndex
      ) || null
    );
  }

  /** Return terrain record for a given world cell, or null. */
  function getTerrainByCell(worldCell) {
    return worldCell ? terrainById[worldCell.terrainId] : null;
  }

  /**
   * Attempt to move the player unit to an adjacent passable hex if AP allows.
   */
  function attemptMovePlayer(columnIndex, rowIndex) {
    const isPlayerTurn = activeTurnOwner === "player";
    if (isDataLoading || loadErrorText || !playerUnit || !isPlayerTurn) return;

    const destinationCell = getCellByAxial(columnIndex, rowIndex);
    const destinationTerrain = getTerrainByCell(destinationCell);

    const isDestinationPassable =
      Boolean(destinationCell) && Boolean(destinationTerrain?.passable);

    if (!isDestinationPassable) {
      dispatchGameAction({
        type: "SET_SYSTEM_NOTICE",
        payload: "Impassable terrain",
      });
      return;
    }

    const isAdjacent = isAdjacentAxial(playerUnit, {
      q: columnIndex,
      r: rowIndex,
    });
    if (!isAdjacent) {
      dispatchGameAction({
        type: "SET_SYSTEM_NOTICE",
        payload: "Move only to adjacent hex",
      });
      return;
    }

    const movementCost = Number.isFinite(destinationTerrain.moveCost)
      ? destinationTerrain.moveCost
      : 1;

    const nextActionPoints = playerUnit.ap - movementCost;
    if (nextActionPoints < 0) {
      dispatchGameAction({
        type: "SET_SYSTEM_NOTICE",
        payload: "Not enough AP",
      });
      return;
    }

    dispatchGameAction({
      type: "MOVE_PLAYER",
      payload: { q: columnIndex, r: rowIndex, nextActionPoints },
    });
  }

  /**
   * Ends player turn and triggers a single enemy step toward the player.
   * If enemy cannot move, it stays in place and the turn returns to the player.
   */
  function completePlayerTurn() {
    if (activeTurnOwner !== "player") return;

    dispatchGameAction({ type: "END_PLAYER_TURN" });

    setTimeout(() => {
      // Safety: always return the turn even if enemy or player is missing.
      if (!enemyUnit || !playerUnit) {
        dispatchGameAction({
          type: "ENEMY_DID_STEP",
          payload: enemyUnit || { q: 0, r: 0 },
        });
        return;
      }

      const candidatePositions = neighborOffsetsAxial
        .map(({ deltaQ, deltaR }) => ({
          q: enemyUnit.q + deltaQ,
          r: enemyUnit.r + deltaR,
        }))
        // staying still is allowed
        .concat({ q: enemyUnit.q, r: enemyUnit.r });

      const candidatePassable = candidatePositions.filter((axialPos) => {
        const candidateCell = getCellByAxial(axialPos.q, axialPos.r);
        const candidateTerrain = getTerrainByCell(candidateCell);
        return Boolean(candidateCell) && Boolean(candidateTerrain?.passable);
      });

      // If nowhere to go, enemy stays but turn returns to player.
      if (candidatePassable.length === 0) {
        dispatchGameAction({
          type: "ENEMY_DID_STEP",
          payload: { q: enemyUnit.q, r: enemyUnit.r },
        });
        return;
      }

      let bestAxialPosition = { q: enemyUnit.q, r: enemyUnit.r };
      let bestDistanceToPlayer = getAxialDistance(enemyUnit, playerUnit);

      for (const axialPos of candidatePassable) {
        const distanceToPlayer = getAxialDistance(axialPos, playerUnit);
        if (distanceToPlayer < bestDistanceToPlayer) {
          bestAxialPosition = axialPos;
          bestDistanceToPlayer = distanceToPlayer;
        }
      }

      dispatchGameAction({
        type: "ENEMY_DID_STEP",
        payload: bestAxialPosition,
      });
    }, 180);
  }

  /**
   * Adjacent passable cells you can step onto with current AP (>0).
   * Returns a list of axial positions: [{ q, r }, ...]
   */
  function getReachableNeighborCells() {
    if (!playerUnit || playerUnit.ap <= 0) return [];

    const reachablePositions = [];

    for (const { deltaQ, deltaR } of neighborOffsetsAxial) {
      const neighborQ = playerUnit.q + deltaQ;
      const neighborR = playerUnit.r + deltaR;

      const neighborCell = getCellByAxial(neighborQ, neighborR);
      const neighborTerrain = getTerrainByCell(neighborCell);
      const neighborMoveCost = neighborTerrain?.moveCost ?? 1;

      const isPassableAndAffordable =
        Boolean(neighborCell) &&
        Boolean(neighborTerrain?.passable) &&
        playerUnit.ap - neighborMoveCost >= 0;

      if (isPassableAndAffordable) {
        reachablePositions.push({ q: neighborQ, r: neighborR });
      }
    }

    return reachablePositions;
  }

  return {
    // state (read-only to components)
    terrainById,
    worldCells,
    playerUnit,
    enemyUnit,
    activeTurnOwner,
    isDataLoading,
    loadErrorText,
    systemNotice,
    // helpers
    getCellByAxial,
    getTerrainByCell,
    // actions
    attemptMovePlayer,
    completePlayerTurn,
    getReachableNeighborCells,
  };
}
