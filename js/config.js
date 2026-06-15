// =============================================================
//  config.js - All the "magic numbers" for Rabbit Run: Tales of the Warren RPG live here.
// =============================================================
//  Keeping settings in ONE place means you never have to hunt
//  through the whole project to change how fast the player walks
//  or how big a tile is. Change a value here, save, refresh.
// =============================================================

// ============================================================================
// STARTER STUB - you write this file during the code-along (Week 1, Day 1).
// Follow the slides / Coding Companion for this week. If you fall behind,
// the complete version is in the matching weekN-checkpoint/js/config.js.
// ============================================================================

// TODO: build this file here.
export const CONFIG = {
    TILE_SIZE : 16, //Pixel size of tiles in the art
    SCALE : 3, //sprites are scaled up by this amount. ex, an original size of 16 by scale of 3 is 48 pixesl
    VIEW_TILES_X : 16, //number of tiles seen by the camera in the x direction
    VIEW_TILES_Y : 12, //number of tiles seen by the camera in the y direction

    PLAYER_SPEED : 190, //pixels moved per second
    PLAYER_FRAME_SIZE : 48, //Pixel size of player character
    PLAYER_MAX_HP : 20,
    PLAYER_ATTACK_DAMAGE : 5,
    PLAYER_ATTACK_RANGE : 24,

    XP_BASE: 12,
    XP_GROWTH: 1.5,
    HP_PER_LEVEL :6,
    DAMAGE_PER_LEVEL : 2,
    HEAL_ITEM_AMOUNT : 8,

    SOLID_TOP_INSET : 16, //remove unneeded pixels of solid tiles
    ANIM_FPS : 8,
    PLAYER_ATTACK_RANGE: 24,
    SFX_VOLUME : 0.6,
    MUSIC_VOLUME : 0.3
};
CONFIG.SCALED_TILE = CONFIG.TILE_SIZE * CONFIG.SCALE;
CONFIG.CANVAS_WIDTH = CONFIG.VIEW_TILES_X * CONFIG.SCALED_TILE //gives width of canvas in pixels
CONFIG.CANVAS_HEIGHT = CONFIG.VIEW_TILES_Y * CONFIG.SCALED_TILE //height of canvas in pixels