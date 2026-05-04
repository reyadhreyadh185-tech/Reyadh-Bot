
function generateSpawnCommands(cx, cy, cz) {
  const cmds = [];
  const OUTER = 10;
  const INNER = 8;
  const HEIGHT = 6;

  const dist = (x, z) => Math.sqrt(x * x + z * z);

  // ── 1. Clear the area ──────────────────────────────────────────────────────
  cmds.push(`fill ${cx - 13} ${cy - 2} ${cz - 13} ${cx + 13} ${cy + HEIGHT + 3} ${cz + 13} air`);

  // ── 2. Floor (filled circle, oak planks with stone brick border) ───────────
  for (let x = -OUTER; x <= OUTER; x++) {
    for (let z = -OUTER; z <= OUTER; z++) {
      const d = dist(x, z);
      if (d <= OUTER) {
        const block = d > OUTER - 1.5 ? 'stone_bricks' : 'oak_planks';
        cmds.push(`setblock ${cx + x} ${cy - 1} ${cz + z} ${block}`);
      }
    }
  }

  // ── 3. Walls (ring between INNER and OUTER, height 0-HEIGHT) ──────────────
  for (let x = -OUTER; x <= OUTER; x++) {
    for (let z = -OUTER; z <= OUTER; z++) {
      const d = dist(x, z);
      if (d <= OUTER && d > INNER) {
        // 4 entrances: N/S/E/W — 3 blocks wide, 3 blocks tall
        const isN = z < -INNER && Math.abs(x) <= 1;
        const isS = z > INNER  && Math.abs(x) <= 1;
        const isE = x > INNER  && Math.abs(z) <= 1;
        const isW = x < -INNER && Math.abs(z) <= 1;
        const isEntrance = isN || isS || isE || isW;

        // Window angle positions (every 45° at y=2-4, skipping entrance angles)
        const angleDeg = ((Math.atan2(z, x) * 180 / Math.PI) + 360) % 360;
        const isWindowAngle = angleDeg % 45 < 12;

        for (let y = 0; y <= HEIGHT; y++) {
          // Door openings: entrance columns, first 3 rows
          if (isEntrance && y <= 2) continue;

          // Pillars at 8 positions (every 45°): always stone bricks
          const isPillar = angleDeg % 45 < 8 && (y === 0 || y === HEIGHT);

          // Windows: glass pane at y=2-4 on window-angle, non-entrance walls
          const isWindow = isWindowAngle && !isEntrance && y >= 2 && y <= 4;

          let block;
          if (isPillar)  block = 'chiseled_stone_bricks';
          else if (isWindow) block = 'glass_pane';
          else           block = 'stone_bricks';

          cmds.push(`setblock ${cx + x} ${cy + y} ${cz + z} ${block}`);
        }
      }
    }
  }

  // ── 4. Ceiling (stone bricks + glowstone pattern) ─────────────────────────
  for (let x = -OUTER; x <= OUTER; x++) {
    for (let z = -OUTER; z <= OUTER; z++) {
      const d = dist(x, z);
      if (d <= OUTER) {
        const isGlow = d <= OUTER - 2 && Math.abs(x) % 4 === 0 && Math.abs(z) % 4 === 0;
        const isBorder = d > OUTER - 1.5;
        const block = isGlow ? 'glowstone' : isBorder ? 'chiseled_stone_bricks' : 'stone_bricks';
        cmds.push(`setblock ${cx + x} ${cy + HEIGHT} ${cz + z} ${block}`);
      }
    }
  }

  // ── 5. Central decoration (beacon-style pillar) ───────────────────────────
  cmds.push(`setblock ${cx} ${cy - 1} ${cz} beacon`);
  cmds.push(`fill ${cx - 1} ${cy - 1} ${cz - 1} ${cx + 1} ${cy - 1} ${cz + 1} iron_block`);

  // ── 6. Torches on inner walls (at entrance frames) ────────────────────────
  cmds.push(`setblock ${cx}      ${cy + 2} ${cz - OUTER + 2} wall_torch[facing=south]`);
  cmds.push(`setblock ${cx}      ${cy + 2} ${cz + OUTER - 2} wall_torch[facing=north]`);
  cmds.push(`setblock ${cx + OUTER - 2} ${cy + 2} ${cz}      wall_torch[facing=west]`);
  cmds.push(`setblock ${cx - OUTER + 2} ${cy + 2} ${cz}      wall_torch[facing=east]`);

  // ── 7. Signs at entrances ─────────────────────────────────────────────────
  // (plain stone brick frame above each entrance — just decoration)

  // ── 8. Set world spawn to inside the building ─────────────────────────────
  cmds.push(`setworldspawn ${cx} ${cy} ${cz}`);
  cmds.push(`gamerule spawnRadius 3`);

  return cmds;
}

module.exports = { generateSpawnCommands };
