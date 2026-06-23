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
//
// TODO: build this file here.
import { CONFIG } from "./config.js";
import { Input } from "./input.js";
import { Images } from "./assets.js";
import { SpriteAnimator, DIR } from "./sprite.js";
import { Sound } from "./audio.js"
import { Particles } from "./particles.js";

const FRAMES = { idle : 5, run : 8, sword : 9}

export class Player {
    constructor(x,y){
        this.x = x;
        this.y = y;

        const FRAME = CONFIG.PLAYER_FRAME_SIZE
        const SCALE = CONFIG.SCALE
        const bodyPx = 16 * SCALE
        this.width = bodyPx//CONFIG.SCALED_TILE;
        this.height = bodyPx//CONFIG.SCALED_TILE;

        const spriteSize = CONFIG.PLAYER_FRAME_SIZE * CONFIG.SCALE;
        this.spriteOffsetX = 16*SCALE
        this.spriteOffsetY = 16*SCALE

        this.DIR = DIR.DOWN;
        this.moving = false;
        this.anim = new SpriteAnimator();

        this.hp = CONFIG.PLAYER_MAX_HP;
        this.maxHp = CONFIG.PLAYER_MAX_HP;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = CONFIG.XP_BASE;

        this.attackDamage = CONFIG.PLAYER_ATTACK_DAMAGE;
        this.justLeveledTimer = 0;

        this.attacking = false;
        this.attackTimer = 0;
        this.attackHasHit = false;
        this.invincibleTimer = 0;
        this.dashTimer = 0; 
        this.dashCooldown = 0;
        this.speed = CONFIG.PLAYER_SPEED

        this.trail = [];

    }

    gainXP(amount){
        this.xp += amount;
        while(this.xp >= this.xpToNext){
            this.xp -= this.xpToNext;
            this.levelUp();
        }
    }

    levelUp(){
        Particles.burst(this.x,this.y,"#fff2a0", 100)
        this.level += 1;
        this.maxHp += CONFIG.HP_PER_LEVEL;
        this.attackDamage += CONFIG.DAMAGE_PER_LEVEL;
        this.hp = this.maxHp;
        this.justLeveledTimer = 1.6;
        this.xpToNext = Math.round(CONFIG.XP_BASE * Math.pow(this.level, CONFIG.XP_GROWTH));
        Sound.play("quest");
    }

    heal(amount){
        this.hp = Math.min(this.maxHp, this.hp + amount);
        Sound.play("pickup");
    }

    get body(){
        return{ x: this.x, y: this.y, w: this.width, h: this.height};
    }

    update(dt,map) {

        this.trail.push({x:this.x, y:this.y, dir:this.DIR});
        if(this.trail.length > 6) this.trail.shift();

        if(this.invincibleTimer > 0) this.invincibleTimer -= dt;
        if(this.justLeveledTimer > 0) this.justLeveledTimer -= dt;

        //console.log(this.attackTimer);
        //console.log(this.attackHasHit);
        if(this.attacking){
            this.attackTimer -= dt;
            this.anim.update(dt, FRAMES.sword);
            if (this.attackTimer <=0){
                this.attacking = false;
                this.anim.reset();
            }
            return;
        }
        if(Input.wasPressed("Space")){
            this.startAttack();
            return;
        }
        let dx = 0, dy = 0;
        this.dashTimer -= dt;
        this.dashCooldown -= dt;
        if (Input.wasPressed("ShiftLeft") && this.dashCooldown <= 0) {
            this.dashTimer = 0.18; 
            this.dashCooldown = 0.6; 
            this.invincibleTimer = 0.18;
        }
        
        if(Input.left) {
            dx -= 1; this.DIR = DIR.LEFT;}
        if(Input.right) {
            dx += 1; this.DIR = DIR.RIGHT;}
        if(Input.up) {
            dy -= 1; this.DIR = DIR.UP;}
        if(Input.down) {
            dy += 1; this.DIR = DIR.DOWN;}

        this.moving = (dx !== 0 || dy !== 0);

        if(this.moving){
            const len = Math.hypot(dx, dy);
            dx /= len; dy /= len;
            const stepX = dx * this.speed * dt;
            const stepY = dy * this.speed * dt;

            this.moveAxis(stepX, 0, map);
            this.moveAxis(0, stepY, map);
            this.anim.update(dt, FRAMES.run);
        } else {
            this.anim.update(dt, FRAMES.idle);
        }
    }
    moveAxis(mx, my, map){
        this.speed = this.dashTimer > 0 ? CONFIG.PLAYER_SPEED * 3 : CONFIG.PLAYER_SPEED;
        const nextX = this.x + mx;
        const nextY = this.y + my;
        const corners = [
            [nextX, nextY],
            [nextX+ this.width - 1, nextY],
            [nextX, nextY + this.height - 1],
            [nextX+ this.width - 1, nextY + this.height - 1]
        ];
        for(const [cx, cy] of corners){
            if(map.isSolidAtPixel(cx, cy)){
                return;
            }
        }
        this.x = nextX;
        this.y = nextY;
       // this.x = Math.max(0+CONFIG.SCALED_TILE*2,
        //     Math.min(this.x, map.pixelWidth - this.width-CONFIG.SCALED_TILE*2));

        //this.y = Math.max(0+CONFIG.SCALED_TILE*2,
          //   Math.min(this.y, map.pixelHeight - this.height-CONFIG.SCALED_TILE*2));
    }
    startAttack(){
        this.attacking = true;
        this.attackTimer = FRAMES.sword / CONFIG.ANIM_FPS;
        this.attackHasHit = false;
        this.anim.reset();
        Sound.play("attack");
    }

    getAttackBox(){
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const reach = this.width/2 + CONFIG.PLAYER_ATTACK_RANGE;
        const t = 4
        if (this.dir === DIR.RIGHT) return { x: cx, y: cy-t, w: reach, h: t*2 };
        if (this.dir === DIR.LEFT) return { x: cx-reach, y: cy-t, w: reach, h: t*2 };
        if (this.dir === DIR.UP) return { x: cx-t, y: cy-reach, w: t*2, h: reach };
        return { x: cx-t, y: cy, w: t*2, h: reach }; 
    }

    takeDamage(amount){
        if(this.invincibleTimer>0) return;
        this.hp = Math.max(0, this.hp-amount);
        this.invincibleTimer = 0.8;
        Sound.play("hit");
    }

    get isDead(){ return this.hp <= 0; }

    draw(ctx, camera){

        
        const screenX = Math.round(this.x - this.spriteOffsetX - camera.x);
        const screenY = Math.round(this.y - this.spriteOffsetY - camera.y);
        const sheet = this.attacking ? "bunny_sword" : (this.moving ? "bunny_run" : "bunny_idle");

        this.trail.forEach((t, i) => {
            //needs to pass camera position like above ^^^^^^^^  
            const trailX = Math.round(t.x - this.spriteOffsetX - camera.x);
            const trailY = Math.round(t.y - this.spriteOffsetY - camera.y);
            ctx.globalAlpha = ((i + 1) / this.trail.length) * 0.4;
            this.anim.draw(ctx, sheet, t.dir, trailX, trailY);
        });
        ctx.globalAlpha = 1;
        this.anim.draw(ctx, sheet, this.DIR, screenX, screenY);

        
    }
}