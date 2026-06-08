// =============================================================
//  player.js - The bunny you control.
// =============================================================
//  The player can:
// - walk in 4 directions (with smooth, framerate-independent speed)
// - animate (idle vs running) and face the right way
// - bump into solid tiles (collision)
// - swing a sword to attack
// - take damage and have hit-points (HP)
// =============================================================

// ============================================================================
// STARTER STUB - you write this file during the code-along (Week 2, Day 1 (grows in Week 4)).
// Follow the slides / Coding Companion for this week. If you fall behind,
// the complete version is in the matching weekN-checkpoint/js/player.js.
// ============================================================================

// TODO: build this file here.
import { CONFIG } from "./config.js";
import { Input } from "./input.js";
import { Images } from "./assets.js";

export class Player {
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.width = CONFIG.SCALED_TILE;
        this.height = CONFIG.SCALED_TILE;
    }
    update(dt) {
        let dx = 0, dy = 0;
        if(Input.left) dx -= 1;
        if(Input.right) dx += 1;
        if(Input.down) dy += 1;
        if(Input.up) dy -= 1;

        this.x += dx * CONFIG.PLAYER_SPEED * dt;
        this.y += dy * CONFIG.PLAYER_SPEED * dt;
    }
    draw(ctx, camera){
        const img = Images.bunny_idle;
        const size = CONFIG.PLAYER_FRAME_SIZE * CONFIG.SCALE;
        const screenX = this.x - camera.x - (size - this.width)/2
        const screenY = this.y - camera.y - (size - this.height)/2

        ctx.drawImage(img, 0, 48, 48, 48, screenX, screenY, size, size)
    }
}