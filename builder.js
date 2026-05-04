function generateSpawnCommands(cx, cy, cz) {
  const cmds = [];
  const R = 25, H = 14;
  const sq = (n) => n * n;

  // Fill full circle slice using scanlines (one /fill per row)
  function fillDisc(y1, y2, r, block) {
    for (let z = -r; z <= r; z++) {
      const xMax = Math.floor(Math.sqrt(Math.max(0, sq(r) - sq(z))));
      cmds.push(`fill ${cx-xMax} ${y1} ${cz+z} ${cx+xMax} ${y2} ${cz+z} ${block}`);
    }
  }

  // Fill ring between innerR and outerR using scanlines
  function fillRing(y1, y2, innerR, outerR, block) {
    for (let z = -outerR; z <= outerR; z++) {
      const xOut = Math.floor(Math.sqrt(Math.max(0, sq(outerR) - sq(z))));
      if (Math.abs(z) > innerR) {
        cmds.push(`fill ${cx-xOut} ${y1} ${cz+z} ${cx+xOut} ${y2} ${cz+z} ${block}`);
      } else {
        const xIn = Math.floor(Math.sqrt(Math.max(0, sq(innerR) - sq(z))));
        if (xOut > xIn) {
          cmds.push(`fill ${cx-xOut} ${y1} ${cz+z} ${cx-(xIn+1)} ${y2} ${cz+z} ${block}`);
          cmds.push(`fill ${cx+(xIn+1)} ${y1} ${cz+z} ${cx+xOut} ${y2} ${cz+z} ${block}`);
        }
      }
    }
  }

  // ── 0. Clear ───────────────────────────────────────────────────────────────
  cmds.push(`fill ${cx-R-4} ${cy-3} ${cz-R-4} ${cx+R+4} ${cy+H+8} ${cz+R+4} air`);

  // ── 1. FLOOR — painter's algorithm (outer → inner) ─────────────────────────
  fillDisc(cy-1, cy-1, R,  'chiseled_deepslate');
  fillDisc(cy-1, cy-1, 24, 'deepslate_bricks');
  fillDisc(cy-1, cy-1, 22, 'polished_deepslate');
  fillDisc(cy-1, cy-1, 18, 'deepslate_tile_slab');
  fillDisc(cy-1, cy-1, 13, 'end_stone_bricks');
  fillDisc(cy-1, cy-1, 9,  'polished_blackstone_bricks');
  fillDisc(cy-1, cy-1, 7,  'gilded_blackstone');
  fillDisc(cy-1, cy-1, 5,  'amethyst_block');
  fillDisc(cy-1, cy-1, 3,  'gold_block');

  // Under-floor seal
  fillDisc(cy-2, cy-2, R, 'blackstone');

  // ── 2. OUTER WALLS (ring r=21–24, height 0–H) ─────────────────────────────
  fillRing(cy, cy+H, 21, 24, 'deepslate_bricks');

  // Bottom accent rows
  fillRing(cy,   cy+1, 21, 24, 'polished_blackstone');
  fillRing(cy+2, cy+2, 21, 24, 'crying_obsidian');
  fillRing(cy+3, cy+3, 21, 24, 'chiseled_deepslate');

  // Top accent rows
  fillRing(cy+H-2, cy+H-2, 21, 24, 'chiseled_deepslate');
  fillRing(cy+H-1, cy+H-1, 21, 24, 'smooth_quartz');
  fillRing(cy+H,   cy+H,   21, 24, 'quartz_bricks');

  // Carve 4 entrances (N/S/E/W) 5-wide, 6-tall
  cmds.push(`fill ${cx-2} ${cy} ${cz-26} ${cx+2} ${cy+5} ${cz-20} air`);
  cmds.push(`fill ${cx-2} ${cy} ${cz+20} ${cx+2} ${cy+5} ${cz+26} air`);
  cmds.push(`fill ${cx+20} ${cy} ${cz-2} ${cx+26} ${cy+5} ${cz+2} air`);
  cmds.push(`fill ${cx-26} ${cy} ${cz-2} ${cx-20} ${cy+5} ${cz+2} air`);

  // ── 3. EIGHT GRAND PILLARS at r≈17 ────────────────────────────────────────
  for (let a = 0; a < 8; a++) {
    const rad = a * 45 * Math.PI / 180;
    const px = Math.round(Math.cos(rad) * 17);
    const pz = Math.round(Math.sin(rad) * 17);
    // Full pillar
    cmds.push(`fill ${cx+px} ${cy-1} ${cz+pz} ${cx+px+1} ${cy+H+2} ${cz+pz+1} purpur_pillar`);
    // Base & cap
    cmds.push(`fill ${cx+px} ${cy-1} ${cz+pz} ${cx+px+1} ${cy}    ${cz+pz+1} polished_blackstone`);
    cmds.push(`fill ${cx+px} ${cy+H} ${cz+pz} ${cx+px+1} ${cy+H+2} ${cz+pz+1} chiseled_deepslate`);
    // Gilded rings every 3 blocks
    for (let y = 3; y <= H - 3; y += 3)
      cmds.push(`fill ${cx+px} ${cy+y} ${cz+pz} ${cx+px+1} ${cy+y} ${cz+pz+1} gilded_blackstone`);
    // Glowstone crown
    cmds.push(`fill ${cx+px} ${cy+H+3} ${cz+pz} ${cx+px+1} ${cy+H+3} ${cz+pz+1} glowstone`);
  }

  // ── 4. GLASS WINDOWS — 8 strips between pillars ───────────────────────────
  const WIN_ANGLES = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
  for (const ang of WIN_ANGLES) {
    const rad = ang * Math.PI / 180;
    // Place glass panes along the wall ring at this angle
    for (let r = 21; r <= 24; r++) {
      const wx = Math.round(Math.cos(rad) * r);
      const wz = Math.round(Math.sin(rad) * r);
      cmds.push(`fill ${cx+wx} ${cy+4} ${cz+wz} ${cx+wx} ${cy+H-3} ${cz+wz} glass`);
    }
  }

  // ── 5. CEILING — painter's algorithm ──────────────────────────────────────
  fillDisc(cy+H, cy+H, 24, 'chiseled_deepslate');
  fillDisc(cy+H, cy+H, 22, 'polished_deepslate');
  fillDisc(cy+H, cy+H, 18, 'deepslate_bricks');
  fillDisc(cy+H, cy+H, 14, 'chiseled_deepslate');
  fillDisc(cy+H, cy+H, 10, 'end_stone_bricks');
  fillDisc(cy+H, cy+H, 6,  'deepslate_bricks');
  fillDisc(cy+H, cy+H, 3,  'sea_lantern');
  // Glowstone grid
  for (let x = -20; x <= 20; x += 5)
    for (let z = -20; z <= 20; z += 5)
      if (Math.sqrt(x*x+z*z) <= 20) cmds.push(`setblock ${cx+x} ${cy+H} ${cz+z} glowstone`);
  // Sea lantern inner ring
  for (let x = -9; x <= 9; x += 3)
    for (let z = -9; z <= 9; z += 3)
      if (Math.sqrt(x*x+z*z) <= 9) cmds.push(`setblock ${cx+x} ${cy+H} ${cz+z} sea_lantern`);

  // ── 6. DOME above ceiling ──────────────────────────────────────────────────
  fillDisc(cy+H+1, cy+H+1, 13, 'blackstone');
  fillDisc(cy+H+2, cy+H+2, 9,  'deepslate_bricks');
  fillDisc(cy+H+3, cy+H+3, 5,  'quartz_bricks');
  cmds.push(`fill ${cx-2} ${cy+H+4} ${cz-2} ${cx+2} ${cy+H+4} ${cz+2} sea_lantern`);
  cmds.push(`setblock ${cx} ${cy+H+5} ${cz} beacon`);

  // ── 7. ENTRANCE ARCHES ─────────────────────────────────────────────────────
  cmds.push(`fill ${cx-3} ${cy+6} ${cz-24} ${cx+3} ${cy+7} ${cz-20} quartz_bricks`);
  cmds.push(`fill ${cx-3} ${cy+6} ${cz+20} ${cx+3} ${cy+7} ${cz+24} quartz_bricks`);
  cmds.push(`fill ${cx+20} ${cy+6} ${cz-3} ${cx+24} ${cy+7} ${cz+3} quartz_bricks`);
  cmds.push(`fill ${cx-24} ${cy+6} ${cz-3} ${cx-20} ${cy+7} ${cz+3} quartz_bricks`);

  // Hanging lanterns at entrances
  for (const [ex, ez] of [[0,-22],[0,22],[22,0],[-22,0]]) {
    for (let s = -1; s <= 1; s++) {
      const lx = cx + ex + (ez === 0 ? 0 : s);
      const lz = cz + ez + (ez === 0 ? s : 0);
      cmds.push(`setblock ${lx} ${cy+5} ${lz} lantern[hanging=true]`);
    }
  }

  // ── 8. BEACON CENTERPIECE ─────────────────────────────────────────────────
  cmds.push(`fill ${cx-3} ${cy-2} ${cz-3} ${cx+3} ${cy-2} ${cz+3} iron_block`);
  cmds.push(`fill ${cx-2} ${cy-1} ${cz-2} ${cx+2} ${cy-1} ${cz+2} iron_block`);
  cmds.push(`setblock ${cx} ${cy-1} ${cz} beacon`);
  for (const [ox, oz] of [[4,0],[-4,0],[0,4],[0,-4],[3,3],[-3,3],[3,-3],[-3,-3]]) {
    cmds.push(`setblock ${cx+ox} ${cy}   ${cz+oz} amethyst_block`);
    cmds.push(`setblock ${cx+ox} ${cy+1} ${cz+oz} budding_amethyst`);
  }

  // ── 9. INTERIOR SHROOMLIGHT ring at r=14 ──────────────────────────────────
  for (let a = 0; a < 8; a++) {
    const rad = a * 45 * Math.PI / 180;
    cmds.push(`setblock ${cx + Math.round(Math.cos(rad)*14)} ${cy+1} ${cz + Math.round(Math.sin(rad)*14)} shroomlight`);
  }

  // ── 10. WORLD SETTINGS ────────────────────────────────────────────────────
  cmds.push(`setworldspawn ${cx} ${cy} ${cz}`);
  cmds.push(`gamerule spawnRadius 3`);
  cmds.push(`gamerule doWeatherCycle false`);
  cmds.push(`weather clear 1000000`);
  cmds.push(`time set day`);
  cmds.push(`gamerule doDaylightCycle false`);

  return cmds;
}

module.exports = { generateSpawnCommands };
