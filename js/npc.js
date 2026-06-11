// =============================================================
//  npc.js - Friendly characters you can talk to.
// =============================================================
//  An NPC (Non-Player Character) stands on the map. When the player
//  walks up and presses the talk key, we open a dialogue. NPCs can
//  also give quests (the dialogue lines and quest are set in the map
//  data from the editor).
// =============================================================

// ============================================================================
// STARTER STUB - you write this file during the code-along (Week 3, Day 1).
// Follow the slides / Coding Companion for this week. If you fall behind,
// the complete version is in the matching weekN-checkpoint/js/npc.js.
// ============================================================================

// TODO: build this file here.

import { CONFIG } from "./config.js";
import { SpriteAnimator } from "./sprite.js";

export class NPC{
    constructor(data){
        this.x = data.x;
        this.y = data.y;
        this.width = CONFIG.SCALED_TILE;
        this.height = CONFIG.SCALED_TILE;
        this.sprite = data.sprite || "cow";

        this.frames = data.frames || 8;
        this.name = data.name || "Villager";
        this.dialogue = data.dialogue || ["..."];
        this.dialogueInProgress = data.dialogueInProgress || null;
        this.dialogueComplete = data.dialogueComplete || null;
        this.givesQuest = data.givesQuest || null;
        this.anim = new SpriteAnimator();
        this.facing = data.facing !== undefined ? data.facing : 3;

    }

    update(dt){
        this.anim.update(dt, this.frames);
    }

    isNear(player){
        const dx = (this.x + this.width/2) - (player.x + player.width/2);
        const dy = (this.y + this.height/2) - (player.y + player.height/2);
        return Math.hypot(dx, dy) < CONFIG.SCALED_TILE * 2.2; 
    }
    draw(ctx, camera){
        const offset = (CONFIG.PLAYER_FRAME_SIZE * CONFIG.SCALE - this.width) / 2;
        const screenX = this.x - offset - camera.x;
        const screenY = this.y - (CONFIG.PLAYER_FRAME_SIZE*CONFIG.SCALE - this.height)+6- camera.y;
        this.anim.draw(ctx, this.sprite, this.facing, screenX, screenY);
    }
}