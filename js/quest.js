// =============================================================
//  quest.js - Quests and their objectives.
// =============================================================
//  A QUEST is a goal with one or more OBJECTIVES (small steps).
//  Examples of objective types we support:
//      "collect" - gather N of an item   (e.g. collect 3 carrots)
//      "defeat" - beat N enemies of a type (e.g. defeat 2 slimes)
//      "talk" - talk to a specific NPC
//      "reach" - step on a special tile / location
//  The QuestLog holds all active/finished quests and checks progress.
// =============================================================

// ============================================================================
// STARTER STUB - you write this file during the code-along (Week 3, Day 4).
// Follow the slides / Coding Companion for this week. If you fall behind,
// the complete version is in the matching weekN-checkpoint/js/quest.js.
// ============================================================================

// TODO: build this file here.
import { Sound } from "./audio.js";

export class Quest{
    constructor(def){
        this.id = def.id;
        this.title = def.title;
        this.description = def.description || "";
        this.objectives = def.objectives.map(o => ({
            type: o.type,
            target: o.target,
            needed: o.needed || 1,
            current : 0,
            text: o.text || "",
        }));
        this.started = false;
        this.completed = false
    }
    start(){
        this.started = true
    }
    checkComplete(){
        const done = this.objectives.every(o => o.current >= o.needed );
        if(done && !this.completed){
            this.completed = true;
            Sound.play("quest");
        }
        return this.completed;
    }
}

export class QuestLog {
    constructor(){
        this.quests = {};
        this.hudVisible = true;
    }
    define(defs){
        for(const def of defs){
            this.quests[def.id] = new Quest(def);
        }
    }
    start(id){
        const q = this.quests[id];
        if (q && !q.started){
            q.start();
            return q;
        }
        return null
    }

    onCollect(itemId) {
        this.progress("collect", itemId);
    }
    onDefeat(enemyType){
        this.progress("defeat", enemyType);
    }
    onTalk(npcName){
        this.progress("talk", npcName)
    }
    onReach(locationId){
        this.progress("reach", locationId)
    }

    progress(type, target){
        for(const q of Object.values(this.quests)){
            if (!q.started || q.completed) continue;
            for(const o of q.objectives){
                if(o.type === type && o.target === target && o.current < o.needed){
                    o.current += 1;
                }
            }
            q.checkComplete();
        }
    }
    activeQuests(){
        return Object.values(this.quests).filter(q => q.started);
    }
    toggleHud(){
        this.hudVisible = !this.hudVisible;
    }
}