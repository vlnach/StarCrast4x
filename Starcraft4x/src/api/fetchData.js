import { supabaseClient } from "./supabaseClient.js";

/**
 * Data loading with clear function names and async/await.
 * Tables assumed:
 *   terrains(id, moveCost, passable, color)
 *   map(q, r, terrainId)
 */

export async function fetchTerrainRecords() {
  if (supabaseClient) {
    const { data, error } = await supabaseClient.from("terrains").select("*");
    if (!error && Array.isArray(data) && data.length) {
      return Object.fromEntries(
        data.map((row) => [
          row.id,
          { moveCost: row.moveCost, passable: row.passable, color: row.color },
        ])
      );
    }
    if (error) console.warn("Supabase terrains error:", error.message);
  }

  const response = await fetch("/data/terrains.json");
  if (!response.ok) throw new Error("Failed to load terrains.json");
  const arrayData = await response.json();
  return Object.fromEntries(
    arrayData.map((row) => [
      row.id,
      { moveCost: row.moveCost, passable: row.passable, color: row.color },
    ])
  );
}

export async function fetchWorldCells() {
  if (supabaseClient) {
    const { data, error } = await supabaseClient.from("map").select("*");
    if (!error && Array.isArray(data) && data.length) return data;
    if (error) console.warn("Supabase map error:", error.message);
  }

  const response = await fetch("/data/map.json");
  if (!response.ok) throw new Error("Failed to load map.json");
  return response.json();
}
