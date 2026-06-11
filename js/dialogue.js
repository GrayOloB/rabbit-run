// =============================================================
//  dialogue.js - Talking to NPCs, with typewriter text & choices.
// =============================================================
//  When you talk to an NPC, this takes over the screen with a text
//  box. Text appears letter-by-letter (a "typewriter" effect). Some
//  pages end with CHOICES the player picks between with the arrow
//  keys - that's how RPG conversations branch.
// =============================================================

// ============================================================================
// STARTER STUB - you write this file during the code-along (Week 3, Day 2).
// Follow the slides / Coding Companion for this week. If you fall behind,
// the complete version is in the matching weekN-checkpoint/js/dialogue.js.
// ============================================================================

// TODO: build this file here.

import { Input } from "./input.js";
import { Sound } from "./audio.js";

export class Dialogue{
    constructor(){
        this.active = false;
        this.pages = [];
        this.pageIndex = 0;
        this.charIndex = 0;

        this.charTimer = 0;
        this.charsPerSecond = 40;
        this.speakerName = "";
        this.choiceIndex = 0;
        this.onChoice = null;
        this.onFinish = null;
    }

    start(speakerName, pages, onFinish = null, onChoice = null){
        this.active = true;
        this.speakerName = speakerName;
        this.pages = pages; 
        this.pageIndex = 0;
        this.charIndex = 0;
        this.charTimer = 0;
        this.choiceIndex = 0;
        this.onFinish = onFinish;
        this.onChoice = onChoice;
    }
    get currentPage() {return this.pages[this.pageIndex]}
    get currentText() {
        const p = this.currentPage;
        return typeof p === "string" ? p : p.text;
    }
    get currentChoices(){
        const p = this.currentPage;
        return typeof p === "object" && p.choices ? p.choices : null;
    }
    get fullyTyped() {
        return this.charIndex >= this.currentText.length
    }
    update(dt){
        if(!this.active)return;

        if(!this.fullyTyped){
            this.charTimer += dt;
            const charsToAdd = Math.floor(this.charTimer * this.charsPerSecond);
            if(charsToAdd > 0){
                this.charIndex = Math.min(this.currentText.length, this.charIndex + charsToAdd);
                this.charTimer = 0;
                Sound.play("text");
            }
        }
        const choices = this.currentChoices;
        if(choices && this.fullyTyped){
            if(Input.wasPressed("ArrowUp")){
                this.choiceIndex = (this.choiceIndex-1 + choices.length) % choices.length;
                Sound.play("blip")
            }
            if(Input.wasPressed("ArrowDown")){
                this.choiceIndex = (this.choiceIndex+1)%choices.length;
                Sound.play("blip")
            }
        }
        if(Input.wasPressed("Space") || Input.wasPressed("Enter")){
            if(!this.fullyTyped){
                this.charIndex = this.currentText.length;
            } else if (choices) {
                Sound.play("select");
                if (this.onChoice){
                    this.onChoice(this.choiceIndex);
                }
                this.finish();
            } else {
                Sound.play("select");
                this.nextPage();
            }
        }
    }
    nextPage(){
        if(this.pageIndex < this.pages.length - 1){
            this.pageIndex += 1;
            this.charIndex = 0;
            this.charTimer = 0;
            this.choiceIndex = 0;
        } else {
            this.finish()
        }
    }
    finish(){
        this.active = false;
        const cb = this.onFinish;
        this.onFinish = null;
        if(cb){
            cb();
        }
    }
}