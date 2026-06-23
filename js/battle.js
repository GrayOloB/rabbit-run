// =============================================================
//  battle.js - Connects the player's sword to the enemies.
// =============================================================
//  Our combat is "action" style (like Zelda), not turn-based: you
//  swing in real time and hit whatever is in front of you. This file
//  holds the rule for "did the swing connect with an enemy?".
// =============================================================

// ============================================================================
// STARTER STUB - you write this file during the code-along (Week 4, Day 2).
// Follow the slides / Coding Companion for this week. If you fall behind,
// the complete version is in the matching weekN-checkpoint/js/battle.js.
// ============================================================================

// TODO: build this file here.
import { CONFIG } from "./config.js";
import { Sound } from "./audio.js";
import { Floaters, Particles } from "./particles.js";

export const Battle = {
    resolvePlayerAttack(player, enemies, questLog){
        if(!player.attacking || player.attackHasHit) return;

        const swingProgress = 1 - (player.attackTimer / (9 / CONFIG.ANIM_FPS));
        if(swingProgress < 0.3 || swingProgress > 0.7) return;

        const point = player.getAttackBox();

        for (const enemy of enemies){
            if(enemy.state === "dead") continue;

            const inside = point.x >= enemy.x && point.x <= enemy.x + enemy.width
            && point.y >= enemy.y && point.y <= enemy.y + enemy.height;
            //console.log(point.x + " " + point.y + " " + enemy.x + " " + enemy.y);
            if(inside){
                //console.log(inside);
                const wasAlive = enemy.hp > 0;
                Floaters.spawn(enemy.centerX,enemy.centerY, "-" + player.attackDamage, "#ff8a8a");
                enemy.takeDamage(player.attackDamage);
                player.attackHasHit = true;
                if (wasAlive && enemy.hp <= 0){
                    questLog.onDefeat(enemy.type);
                    player.gainXP(enemy.xpReward);
                    Floaters.spawn(player.x, player.y, enemy.xpReward, "#ffd98a");
                    Particles.burst(enemy.centerX, enemy.centerY-10, "#8B0000",5);
                    
                }
                break;
            }
        }
    }
}