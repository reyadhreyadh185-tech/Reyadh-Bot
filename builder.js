function generateSpawnCommands(cx, cy, cz) {
  const cmds = [];
  const R = 25;
  const H = 14;
  const d = (x, z) => Math.sqrt(x * x + z * z);

  // ── 0. Clear ────────────────────────────────────────────────────────────────
  cmds.push(`fill ${cx-R-4} ${cy-3} ${cz-R-4} ${cx+R+4} ${cy+H+5} ${cz+R+4} air`);

  // ── 1. FLOOR — 6 concentric rings of different materials ───────────────────
  for (let x = -R; x <= R; x++) {
    for (let z = -R; z <= R; z++) {
      const r = d(x, z);
      if (r > R) continue;
      let block;
      if      (r <= 3)  block = 'gold_block';
      else if (r <= 5)  block = 'amethyst_block';
      else if (r <= 7)  block = 'polished_blackstone';
      else if (r <= 9)  block = 'gilded_blackstone';
      else if (r <= 13) block = ((x + z) % 2 === 0) ? 'end_stone_bricks'           : 'polished_blackstone_bricks';
      else if (r <= 18) block = ((x + z) % 2 === 0) ? 'deepslate_bricks'            : 'chiseled_deepslate';
      else if (r <= 22) block = ((x + z) % 2 === 0) ? 'polished_deepslate'           : 'deepslate_tile_slab';
      else if (r <= 24) block = 'deepslate_bricks';
      else              block = 'chiseled_deepslate';
      cmds.push(`setblock ${cx+x} ${cy-1} ${cz+z} ${block}`);
    }
  }

  // ── 2. UNDER-FLOOR — seal bedrock look ─────────────────────────────────────
  for (let x = -R; x <= R; x++) {
    for (let z = -R; z <= R; z++) {
      if (d(x, z) <= R)
        cmds.push(`setblock ${cx+x} ${cy-2} ${cz+z} blackstone`);
    }
  }

  // ── 3. OUTER WALL ring (r = 22–25) ─────────────────────────────────────────
  const WOUT = 24, WIN = 21;
  for (let x = -R; x <= R; x++) {
    for (let z = -R; z <= R; z++) {
      const r = d(x, z);
      if (r > WOUT || r <= WIN) continue;

      const isN = z < -WIN && Math.abs(x) <= 2;
      const isS = z >  WIN && Math.abs(x) <= 2;
      const isE = x >  WIN && Math.abs(z) <= 2;
      const isW = x < -WIN && Math.abs(z) <= 2;
      const entrance = isN || isS || isE || isW;

      const ang = ((Math.atan2(z, x) * 180 / Math.PI) + 360) % 360;
      const pillar  = ang % 45 < 7;
      const window_ = !pillar && ang % 30 < 10;

      for (let y = 0; y <= H; y++) {
        if (entrance && y <= 5) continue;

        let block;
        if (pillar) {
          block = (y === 0 || y === H) ? 'polished_blackstone'
                : (y % 4 === 0)       ? 'gilded_blackstone'
                                      : 'purpur_pillar';
        } else if (window_ && y >= 4 && y <= H - 3) {
          block = y % 2 === 0 ? 'glass' : 'tinted_glass';
        } else if (y <= 1)       block = 'polished_blackstone';
        else if (y === 2)        block = 'crying_obsidian';
        else if (y >= H - 1)     block = 'quartz_bricks';
        else if (y === H - 2)    block = 'smooth_quartz';
        else if (y === 3)        block = 'chiseled_deepslate';
        else block = (Math.round(r) % 2 === 0) ? 'deepslate_bricks' : 'polished_deepslate';

        cmds.push(`setblock ${cx+x} ${cy+y} ${cz+z} ${block}`);
      }
    }
  }

  // ── 4. INNER DECORATIVE WALL ring (r = 10–12) ──────────────────────────────
  for (let x = -13; x <= 13; x++) {
    for (let z = -13; z <= 13; z++) {
      const r = d(x, z);
      if (r > 12 || r <= 10) continue;
      const ang = ((Math.atan2(z, x) * 180 / Math.PI) + 360) % 360;
      const isPillar = ang % 90 < 8;
      for (let y = 0; y <= 5; y++) {
        const block = isPillar ? 'purpur_pillar'
                    : y === 0 ? 'polished_blackstone'
                    : y <= 2  ? 'end_stone_bricks'
                    : y === 3 ? 'amethyst_block'
                              : 'end_stone_bricks';
        cmds.push(`setblock ${cx+x} ${cy+y} ${cz+z} ${block}`);
      }
    }
  }

  // ── 5. EIGHT GRAND PILLARS at r=17 (2×2 each, h=H+3) ──────────────────────
  for (let a = 0; a < 8; a++) {
    const rad = (a * 45) * Math.PI / 180;
    const px = Math.round(Math.cos(rad) * 17);
    const pz = Math.round(Math.sin(rad) * 17);
    for (let y = -1; y <= H + 2; y++) {
      for (let ox = 0; ox <= 1; ox++) {
        for (let oz = 0; oz <= 1; oz++) {
          const block = y < 0        ? 'polished_blackstone'
                      : y === 0      ? 'chiseled_deepslate'
                      : y === H      ? 'chiseled_deepslate'
                      : y % 4 === 0  ? 'gilded_blackstone'
                      : y % 2 === 0  ? 'purpur_pillar'
                                     : 'polished_blackstone_bricks';
          cmds.push(`setblock ${cx+px+ox} ${cy+y} ${cz+pz+oz} ${block}`);
        }
      }
    }
    // Glowstone cap on each pillar
    cmds.push(`setblock ${cx+px}   ${cy+H+3} ${cz+pz}   glowstone`);
    cmds.push(`setblock ${cx+px+1} ${cy+H+3} ${cz+pz}   glowstone`);
    cmds.push(`setblock ${cx+px}   ${cy+H+3} ${cz+pz+1} glowstone`);
    cmds.push(`setblock ${cx+px+1} ${cy+H+3} ${cz+pz+1} glowstone`);
  }

  // ── 6. CEILING — layered star/mandala pattern ───────────────────────────────
  for (let x = -R; x <= R; x++) {
    for (let z = -R; z <= R; z++) {
      const r = d(x, z);
      if (r > WOUT) continue;
      const ang = ((Math.atan2(z, x) * 180 / Math.PI) + 360) % 360;
      let block;
      if      (r <= 3)  block = (x === 0 && z === 0) ? 'sea_lantern' : ((Math.abs(x)+Math.abs(z)) % 2 === 0 ? 'sea_lantern' : 'amethyst_block');
      else if (r <= 6)  block = ((x+z) % 2 === 0) ? 'shroomlight' : 'end_stone_bricks';
      else if (r <= 10) block = (x % 3 === 0 && z % 3 === 0) ? 'sea_lantern' : 'deepslate_bricks';
      else if (r <= 14) block = ((x+z) % 4 === 0) ? 'glowstone' : ((x+z) % 4 === 2) ? 'sea_lantern' : 'chiseled_deepslate';
      else if (r <= 18) block = (ang % 30 < 8) ? 'quartz_bricks' : 'deepslate_bricks';
      else if (r <= 22) block = ((x+z) % 3 === 0) ? 'shroomlight' : 'polished_deepslate';
      else              block = (ang % 45 < 7) ? 'purpur_block' : 'chiseled_deepslate';
      cmds.push(`setblock ${cx+x} ${cy+H} ${cz+z} ${block}`);
    }
  }

  // ── 7. CEILING LAYER 2 — inner dome one block higher ───────────────────────
  for (let x = -13; x <= 13; x++) {
    for (let z = -13; z <= 13; z++) {
      if (d(x, z) <= 13)
        cmds.push(`setblock ${cx+x} ${cy+H+1} ${cz+z} blackstone`);
    }
  }
  for (let x = -9; x <= 9; x++) {
    for (let z = -9; z <= 9; z++) {
      const r = d(x, z);
      if (r <= 9) {
        const block = r <= 4 ? 'end_stone_bricks' : 'deepslate_bricks';
        cmds.push(`setblock ${cx+x} ${cy+H+2} ${cz+z} ${block}`);
      }
    }
  }
  for (let x = -5; x <= 5; x++) {
    for (let z = -5; z <= 5; z++) {
      if (d(x, z) <= 5)
        cmds.push(`setblock ${cx+x} ${cy+H+3} ${cz+z} quartz_bricks`);
    }
  }
  cmds.push(`fill ${cx-2} ${cy+H+4} ${cz-2} ${cx+2} ${cy+H+4} ${cz+2} sea_lantern`);
  cmds.push(`setblock ${cx} ${cy+H+5} ${cz} beacon`);

  // ── 8. ENTRANCE ARCHES — decorative frame ──────────────────────────────────
  for (const [ex, ez, face] of [[0,-22,'z'],[0,22,'z'],[22,0,'x'],[-22,0,'x']]) {
    const isX = face === 'x';
    for (let s = -3; s <= 3; s++) {
      const fx = cx + ex + (isX ? 0 : s);
      const fz = cz + ez + (isX ? s : 0);
      cmds.push(`setblock ${fx} ${cy+6} ${fz} quartz_bricks`);
      cmds.push(`setblock ${fx} ${cy+7} ${fz} smooth_quartz`);
    }
    // Hanging lanterns in entrance
    for (let s = -1; s <= 1; s++) {
      const fx = cx + ex + (isX ? 0 : s);
      const fz = cz + ez + (isX ? s : 0);
      cmds.push(`setblock ${fx} ${cy+5} ${fz} lantern[hanging=true]`);
    }
  }

  // ── 9. BEACON CENTERPIECE ──────────────────────────────────────────────────
  cmds.push(`fill ${cx-3} ${cy-2} ${cz-3} ${cx+3} ${cy-2} ${cz+3} iron_block`);
  cmds.push(`fill ${cx-2} ${cy-1} ${cz-2} ${cx+2} ${cy-1} ${cz+2} iron_block`);
  cmds.push(`setblock ${cx} ${cy-1} ${cz} beacon`);

  // Amethyst crystal clusters around beacon
  for (const [ox, oz] of [[4,0],[-4,0],[0,4],[0,-4],[3,3],[-3,3],[3,-3],[-3,-3]]) {
    cmds.push(`setblock ${cx+ox} ${cy}   ${cz+oz} amethyst_block`);
    cmds.push(`setblock ${cx+ox} ${cy+1} ${cz+oz} budding_amethyst`);
  }

  // ── 10. FLOOR BORDER — outer decorative ring ───────────────────────────────
  for (let x = -R; x <= R; x++) {
    for (let z = -R; z <= R; z++) {
      const r = d(x, z);
      if (r > R && r <= R + 1)
        cmds.push(`setblock ${cx+x} ${cy-1} ${cz+z} crying_obsidian`);
    }
  }

  // ── 11. INTERIOR TORCHES / LIGHTING ────────────────────────────────────────
  for (let a = 0; a < 8; a++) {
    const rad = (a * 45) * Math.PI / 180;
    const tx = Math.round(Math.cos(rad) * 19);
    const tz = Math.round(Math.sin(rad) * 19);
    cmds.push(`setblock ${cx+tx} ${cy+2} ${cz+tz} shroomlight`);
  }

  // ── 12. WORLD SETTINGS ─────────────────────────────────────────────────────
  cmds.push(`setworldspawn ${cx} ${cy} ${cz}`);
  cmds.push(`gamerule spawnRadius 3`);
  cmds.push(`gamerule doWeatherCycle false`);
  cmds.push(`weather clear 1000000`);
  cmds.push(`time set day`);
  cmds.push(`gamerule doDaylightCycle false`);

  return cmds;
}

module.exports = { generateSpawnCommands };
