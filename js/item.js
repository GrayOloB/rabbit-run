// =============================================================
//  item.js - Things you can pick up, and your inventory.
// =============================================================
//  An Item sits on the map (drawn from the chest/crops art). Walk
//  over it to pick it up; it goes into your Inventory. Some items
//  count toward quest objectives ("collect 3 carrots").
// =============================================================

// ============================================================================
// STARTER STUB - you write this file during the code-along (Week 3, Day 3).
// Follow the slides / Coding Companion for this week. If you fall behind,
// the complete version is in the matching weekN-checkpoint/js/item.js.
// ============================================================================

// TODO: build this file here.
import { CONFIG } from "./config.js";
import { drawTile } from "./tilesets.js"
import { Sound } from "./audio.js";

export class Item {
    constructor(data){
        this.x = data.x
        this.y = data.y
        this.width = CONFIG.SCALED_TILE
        this.height = CONFIG.SCALED_TILE
        this.id = data.id || "carrot"
        this.name = data.name || "Carrot"
        this.tile = data.tile || "crops:24"

        this.heal = data.heal === true ? CONFIG.HEAL_ITEM_AMOUNT : (data.heal || 0);
        this.bob = Math.random() * Math.PI * 2;
        this.collected = false;
    }

    update(dt){
        this.bob += dt*3
    }
    overlaps(player){
        return this.x<player.x+player.width && 
        this.x + this.width > player.x &&
        this.y < player.y + player.height &&
        this.y + this.height > player.y
    }
    draw(ctx, camera){
        const floatY = Math.sin(this.bob) * 4
        drawTile(ctx, this.tile, this.x - camera.x, this.y - camera.y + floatY);
    }
}

export class Inventory{
    constructor(){
        this.items = {};
    }
    add(id, name){
        if(!this.items[id]){
            this.items[id] = { name, count : 0}
        }
        this.items[id].count += 1;
        Sound.play("pickup")
    }

    count(id){
        return this.items[id] ? this.items[id].count : 0
    }

    list(){
        return Object.entries(this.items).map(([id,v]) => ({id,...v}));
    }
}