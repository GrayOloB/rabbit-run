// =============================================================
//  game.js - The conductor. Ties every system together.
// =============================================================
//  This file:
//    1. Loads assets, then the map.
//    2. Runs the GAME LOOP (update + draw, many times a second).
//    3. Keeps track of the current STATE (title, playing, dialogue,
//       inventory, gameover, win) and behaves differently in each.
//
//  THE GAME LOOP & "DELTA TIME"
//  ----------------------------
//  Computers run at different speeds. If we moved the player "2px
//  per frame", a fast computer would zoom and a slow one would crawl.
//  Instead we measure how many SECONDS passed since the last frame
//  (we call it `dt`, for "delta time") and move "speed * dt" pixels.
//  Now everyone moves the same real-world speed. That's what
//  "framerate independent" means.
// =============================================================

// ============================================================================
// STARTER STUB - you write this file during the code-along (Week 1, Day 3 (grows every week)).
// Follow the slides / Coding Companion for this week. If you fall behind,
// the complete version is in the matching weekN-checkpoint/js/game.js.
// ============================================================================

// TODO: build this file here.
import { CONFIG } from "./config.js";
import { loadAllAssets } from "./assets.js";
import { Input } from "./input.js";
import { Sound } from "./audio.js";
import { TileMap } from "./tilemap.js";
import { Camera } from "./camera.js";
import { Player } from "./player.js";
import { NPC } from "./npc.js";
import { Item, Inventory } from "./item.js"
import { QuestLog } from "./quest.js"
import { Dialogue } from "./dialogue.js";
import { UI } from "./ui.js"

const STATE = { PLAYING : "playing", DIALOGUE : "dialogue", INVENTORY : "inventory"}

class Game {
    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.lastTime = 0;
        this.state = STATE.PLAYING;
    }
    async boot(){
        await loadAllAssets();
        const res = await fetch("assets/map_meadow.json");
        this.mapData = await res.json();
        this.loadWorld();
        requestAnimationFrame(this.loop.bind(this))
    }

    loadWorld(){
        this.map = new TileMap(this.mapData);
        this.camera = new Camera();
        this.player = new Player(this.mapData.playerStart.x, this.mapData.playerStart.y)
        this.inventory = new Inventory();
        this.dialogue = new Dialogue();
        this.questLog = new QuestLog();
        this.questLog.define(this.mapData.quests || []);
        this.npcs = [];
        this.items = [];
        for(const e of this.mapData.entities){
            if (e.kind === "npc") this.npcs.push(new NPC(e));
            else if (e.kind === "item") this.items.push(new Item(e));
        }
        Sound.playMusic(this.mapData.music || "town_theme");
    }

    loop(timestamp){
        let dt = (timestamp - this.lastTime)/1000;
        this.lastTime = timestamp;
        if(dt > 0.05) dt = 0.05;

        this.update(dt);
        this.draw();
        Input.clearFrame();
        requestAnimationFrame(this.loop.bind(this))
    }
    update(dt){
       if(this.state === STATE.PLAYING) this.updatePlaying(dt);
       else if (this.state === STATE.DIALOGUE){
        this.dialogue.update(dt);
        if(!this.dialogue.active) this.state = STATE.PLAYING;
       } else if (this.state === STATE.INVENTORY){
        if(Input.wasPressed("KeyI") || Input.wasPressed("Escape")) {
            Sound.play("select"); this.state = STATE.PLAYING;
        }
       }
    }
    updatePlaying(dt){
        if(Input.wasPressed("KeyI")) {Sound.play("select");
            this.state = STATE.INVENTORY; return;
        }
        if(Input.wasPressed("KeyQ")) {Sound.play("blip");
            this.questLog.toggleHud();
        }

        this.nearbyNpc = this.npcs.find(n=> n.isNear(this.player));
        if(this.nearbyNpc && !this.player.attacking && Input.wasPressed("KeyT")){
            this.startConversation(this.nearbyNpc);
            return;
        }
        this.player.update(dt, this.map);
        for(const npc of this.npcs) npc.update(dt);
        for(const item of this.items){
            item.update(dt);
            if(!item.collected && item.overlaps(this.player)){
                item.collected = true;
                this.inventory.add(item.id, item.name);
                this.questLog.onCollect(item.id);
            }
        }
        this.items = this.items.filter(i => !i.collected);
        this.camera.follow(this.player, this.map);
    }

    startConversation(npc){
        this.state = STATE.DIALOGUE;
        this.questLog.onTalk(npc.name);
        const quest = npc.givesQuest ?
        this.questLog.quests[npc.givesQuest] : null;
        let pages = npc.dialogue;
        let offersQuest = true;
        let handInNow = false;
        if (quest && quest.started) {
            offersQuest = false;
            const done = quest.objectives.every(o => o.current >= o.needed);
            if (done && npc.dialogueComplete && !quest.turnedIn) {
                pages = npc.dialogueComplete;
                handInNow = true;
            } else if (done) {
                pages = npc.dialogueComplete || npc.dialogueInProgress || npc.dialogue;
            } else {
                pages = npc.dialogueInProgress || npc.dialogue;
            }
        }

        this.dialogue.start(
            npc.name,
            pages,
            () => {
                if (offersQuest && npc.givesQuest && !npc._declined) {
                    this.questLog.start(npc.givesQuest);
                }
                if (handInNow && quest) {
                    quest.turnedIn = true;
                    quest.checkComplete();
                }
                npc._declined = false;
            },
            (choiceIndex) => {
                if (choiceIndex === 1) npc._declined = true;
            }
        );
    }

    draw(){
        const ctx = this.ctx;
        ctx.fillStyle = "bfe0f2";
        ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.map.drawLayer(ctx, "ground", this.camera);
        this.map.drawLayer(ctx, "overlay", this.camera);

        const things = [...this.items, ...this.npcs, this.player];
        things.sort((a,b) => (a.y + a.height) - (b.y + b.height));
        for (const t of things) t.draw(ctx, this.camera);
        
        this.map.drawLayer(ctx, "decor", this.camera);

        UI.drawQuests(ctx, this.questLog);
        if(this.state === STATE.PLAYING && this.nearbyNpc){
            UI.drawPrompt(ctx, `Press T to talk to ${this.nearbyNpc.name}`);
        }
        if(this.state === STATE.DIALOGUE) UI.drawDialogue(ctx, this.dialogue);
        if(this.state === STATE.INVENTORY) UI.drawInventory(ctx,this.inventory);
    }
}
window.addEventListener("load", ()=> {
    const canvas = document.getElementById("game");
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;
    new Game(canvas).boot();
})