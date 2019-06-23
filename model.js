'use strict';
const BLOCK_MAX_WIDTH = 10;
const BLOCK_MAX_HEIGHT = BLOCK_MAX_WIDTH * 2;

const START_LOCATION_X = 4;
const START_LOCATION_Y = -1;    
    
const MAX_SCORE = '000000';
const BLOCK_MAX_NUMBER = 7;
const NEXT_BLOCKS_NUMBER = 3;
const SHAPE_T = [
    [0, [4, 5, 6]],
    [1, [5]]
];
const SHAPE_J = [
    [0, [4, 5, 6]],
    [1, [6]]
];
const SHAPE_Z = [
    [0, [4, 5]],
    [1, [5, 6]]
];
const SHAPE_O = [
    [0, [5, 6]],
    [1, [5, 6]],
];
const SHAPE_S = [
    [0, [5, 6]],
    [1, [4, 5]]
];
const SHAPE_L = [
    [0, [4, 5, 6]],
    [1, [4]]
];
const SHAPE_I = [
    [0, [4, 5, 6, 7]]
];

const COLORS = (function () {
    const MIN_RGB = 0;
    const MAX_RGB = 200;
    let randomRGB = () => {
        return MIN_RGB + Math.round(Math.random() * (MAX_RGB - MIN_RGB))
    };
    let colors = [];
    for (let i = 0; i < BLOCK_MAX_NUMBER; i++) {
        colors.push(`rgb(${randomRGB()},${randomRGB()},${randomRGB()})`);
    }
    return colors;
}())

const sendEvent = (eventName, target, object) => {
    let event = new CustomEvent(eventName, {
        detail: {
            point: object
        }
    });
    target.dispatchEvent(event);
}

const BOTTOM_WALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const WALL_ARRAY = [];
for (let layer = 0; layer < BLOCK_MAX_HEIGHT; layer++) {
    WALL_ARRAY.push([layer, [0, BLOCK_MAX_WIDTH + 1]]);
}
WALL_ARRAY.push([BLOCK_MAX_HEIGHT, BOTTOM_WALL]);


class Point extends Map {
    constructor(array = []) {
        super(array);
        this._defaultArray = array;
    }
    reset() {
        this.clear();
        this._defaultArray.forEach(([layer, line]) => {
            this.set(layer, line);
        });
    }
    setMap(map) {
        this.clear();
        map.forEach((line, layer) => {
            this.set(layer, line);
        });
    }
    concat(point) {
        point.forEach((line, layer) => {
            if (this.has(layer)) {
                let newLine = line.concat(this.get(layer));
                this.set(layer, newLine);
                return;
            }
            this.set(layer, line);
        });
    }
    map(func) {
        return Array.from(this, func) 
    }
    move(x, y) {
        let result = this.map(([layer, line]) => {
            layer += y;
            line = line.map((value) => value + x);
            return [layer, line];
        })
        this.setMap(new Map(result));
    }
    isConflictWith(point) {
        for (let entry of this.entries()) {
            let layer = entry[0]
            let line = entry[1]
            if (line.some((x) => {
                if (!point.has(layer)) return false;
                return point.get(layer).includes(x);
            })) return true;
        }
    }
}

class Stack extends Point {
    constructor(array = []) {
        super(array);
        this._initWall();
    }
    _initWall() {
        this._wall = WALL_ARRAY
    }
    getStopBlocks() {
        let stopBlocks = new Point(this._wall)
        stopBlocks.concat(this);
        return stopBlocks;
    }
    _getFullLayers() {
        let result = [];
        this.forEach((line, layer) => {
            if (line.length === BLOCK_MAX_WIDTH) {
                result.push(layer);
            }
        });
        if (result.length === 0) return false;
        return result;
    }
    clearFullLayers() {
        let fullLayers = this._getFullLayers();
        if (!fullLayers) return;
        let result = this.map(([layer, line]) => {
            if (fullLayers.includes(layer)) return;
            let count = 0;
            fullLayers.forEach((fullLayer) => {
                if (fullLayer > layer) count++;
            });
            return [layer + count, line];
        });
        result = result.filter((value) => value !== undefined)
        this.setMap(new Map(result));
    }
}
class Block extends Point {
    constructor(array, shaft, color) {
        super(array);
        this._initShaft(shaft);
        this._initColor(color);
    }
    _initColor(color) {
        this._color = color;
    }
    _initShaft(shaft) {
        this._defaultShaft = [shaft[0], shaft[1]];
        this._shaft = shaft
    }
    getColor() {
        return this._color;
    }
    resetBlock() {
        this.reset();
        this._resetShaft();
    }
    _resetShaft() {
        this._shaft = [this._defaultShaft[0], this._defaultShaft[1]];
    }
    _moveShaft(x, y) {
        this._shaft[0] += x;
        this._shaft[1] += y;
    }
    copy() {
        const defaultShaft = [this._defaultShaft[0], this._defaultShaft[1]]
        const block = new Block(this._defaultArray, defaultShaft, this._color);
        return block;
    }
    rotate(isClockWise) {
        let sign = (isClockWise) ? 1 : -1;
        let result = this.copy();
        result.clear();
        this.forEach((line, y) => {
            let rotatedX = -sign * (y - this._shaft[1]) + this._shaft[0];
            line.forEach((x) => {
                let rotatedY = sign * (x - this._shaft[0]) + this._shaft[1];
                if (result.has(rotatedY)) {
                    let rotatedLine = result.get(rotatedY).concat([rotatedX])
                    result.set(rotatedY, rotatedLine);
                    return;
                }
                result.set(rotatedY, [rotatedX]);
            });
        });
        this.setMap(result);
    }
    moveSide(isRight) {
        let movement = (isRight) ? 1 : -1;
        this._moveShaft(movement, 0);
        this.move(movement, 0)
    }
    moveDown(isDown = true) {
        let movement = (isDown) ? 1 : -1;
        this._moveShaft(0, movement);
        this.move(0, movement);
    }
}

const BLOCK_T = new Block(SHAPE_T, [5, 0], COLORS[0]);
const BLOCK_J = new Block(SHAPE_J, [5, 0], COLORS[1]);
const BLOCK_Z = new Block(SHAPE_Z, [5, 0], COLORS[2]);
const BLOCK_O = new Block(SHAPE_O, [5.5, 0.5], COLORS[3]);
const BLOCK_S = new Block(SHAPE_S, [5, 0], COLORS[4]);
const BLOCK_L = new Block(SHAPE_L, [5, 0], COLORS[5]);
const BLOCK_I = new Block(SHAPE_I, [5.5, 0.5], COLORS[6]);

class BlockGenerator {
    constructor() {
        this._initBlocks();
        this._initQueue();
    }
    _initBlocks() {
        this._blocks = [BLOCK_I, BLOCK_J, BLOCK_L, BLOCK_O, BLOCK_S, BLOCK_T, BLOCK_Z];
    }
    _initQueue() {
        let queue = [];
        for (let i = 0; i < NEXT_BLOCKS_NUMBER; i++) {
            let randomBlock = this._getRandomBlock();
            queue.push(randomBlock);
        }
        this._queue = queue
    }
    _getRandomBlock() {
        let randomIndex = Math.floor(Math.random() * BLOCK_MAX_NUMBER);
        return this._blocks[randomIndex].copy();
    }
    generate() {
        let randomBlock = this._getRandomBlock();
        randomBlock.resetBlock();
        this._queue.push(randomBlock);
        return this._queue.shift();
    }
}
// level과 score을 분리할까?
class Level {
    constructor() {
        this._init();
    }
    _init() {
        this._level = 0;
        this._score = 0;
    }
    addScore(score) {
        this._score += score;
    }
}
