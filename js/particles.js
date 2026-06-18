//
class Particle{
    constructor(x,y,color){
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 70;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.2 + Math.random() * 0.7;
        this.maxLife = this.life;
        this.size = 5 + Math.random() * 4;
        this.color = color;
    }

    update(dt){
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 60 * dt;
        this.vx *= 0.96; this.vy *= 0.96;
        this.life -= dt;
    }
    draw(ctx, camera){
        const t = Math.max(0, this.life / this.maxLife);
        const alpha = Math.sqrt(t);
        const sx = this.x - camera.x, sy = this.y - camera.y;
        const r = this.size * (0.5 + t * 0.5);

        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = "lighter";

        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(sx, sy,r,0,Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx,sy,r,0,Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff"
        ctx.beginPath();
        ctx.arc(sx, sy, r*0.45, 0, Math.PI * 2);

        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
    }
}

export const Particles = {
    list: [],

    burst(x,y,color = "ffd98a", count = 12){
        for(let i = 0; i< count; i++){
            this.list.push(new Particle(x,y,color));
        }
    },
    update(dt){
        for(const p of this.list) p.update(dt);
        this.list = this.list.filter(p=>p.life > 0);
    },
    draw(ctx, camera){
        for(const p of this.list) p.draw(ctx,camera);
    }
};

export const Floaters = {
    list: [],
    spawn(x,y,text, color = "fff"){
        this.list.push({x,y,text,color,life:1.1,vy:-34});
    },
    update(dt){
        for (const f of this.list){f.y += f.vy * dt; f.life -=dt;}
        this.list = this.list.filter(f => f.life > 0);
    },
    draw(ctx, camera) {
        ctx.font = "bold 22px monospace";
        ctx.textAlign = "center";
        ctx.lineWidth = 4;
        for(const f of this.list){
            ctx.globalAlpha = Math.max(0, f.life/1.1);
            const sx = f.x - camera.x, sy = f.y - camera.y;
            ctx.strokeStyle = "rgba(30,20,10,0.85)";
            ctx.strokeText(f.text,sx,sy);
            ctx.fillStyle = f.color;
            ctx.fillText(f.text, sx, sy);
            ctx.globalAlpha = 1;
        }
    },

};