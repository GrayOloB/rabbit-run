const CELL = 64;
function cellOf(px,py){
    return { c: Math.floor(px/CELL), r: Math.floor(py/CELL) };
}
function cellCenter(c, r) { return { x: c*CELL + CELL/2, y: r*CELL + CELL/2 }; }
function isWall(c,r){
    if(r<0 || r>=GRID_ROWS || c<0 || c>= GRID_COLS) return true;
    return WALLS[r][c] === 1;
}
function heuristic(c,r,goalC,goalR){
    return Math.abs(c-goalC) + Math.abs(r-goalR);
}

const PARENT = new Map();

function findPath(startC,startR,goalC,goalR){
    PARENT.clear();
    const key = (c, r) => c + "," + r;
    const open = new Map(); // cells seen but not explored
    const closed = new Set(); // cells we're finished with
    open.set(key(startC, startR), {
        c: startC, r: startR,
        g: 0,
        f: heuristic(startC, startR, goalC, goalR),
    });

    while(open.size > 0){
        let current = null;
        for(const node of open.values()){
            if(!current || node.f < current.f) current = node;
        }

        if(current.c === goalC && current.r === goalR) return rebuildPath(current);

        open.delete(key(current.c, current.r));
        closed.add(key(current.c, current.r));

        for(const[dc,dr] of [[0,-1],[0,1],[-1,0],[1,0]]){
            const nc = current.c + dc, nr = current.r + dr;
            const nk = key(nc, nr);
            if (isWall(nc, nr) || closed.has(nk)) continue;
            const tentativeG = current.g + 1;
            const existing = open.get(nk);

            if(!existing || tentativeG < existing.g){
                PARENT.set(nk,key(current.c,current.r));
                open.set(nk, {
                    c: nc, r: nr,
                    g: tentativeG,
                    f: tentativeG + heuristic(nc, nr, goalC, goalR),
                });
            }
        }
    }
    return[];
}
function rebuildPath(goalNode) {
    const path = [];
    let k = goalNode.c + "," + goalNode.r;
    while (k) {
        const [c, r] = k.split(",").map(Number);
        path.unshift({ c, r }); 
        k = PARENT.get(k);
    }
    path.shift();
    return path;
}