const mainCanvas = document.getElementById('main');
const mainCtx = mainCanvas.getContext('2d');
mainCanvas.ctx = mainCtx;

const stackCanvas = document.getElementById('stack');
const stackCtx = stackCanvas.getContext('2d');
stackCanvas.ctx = stackCtx;

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
    [-1, [5]],
    [0, [5, 6]],
    [1, [6]]
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
    getSortedLayers(isDecending = true) {
        let sign = (isDecending) ? 1 : -1;
        let sortedLayers = [];
        for (let layer of this.keys()) sortedLayers.push(layer);
        sortedLayers.sort((a, b) => {
            return sign * (b - a);
        });
        return sortedLayers;
    }
    map(func) {
        return Array.from(this, func) // func ex) ([layer, line]) => [2 * layer, line];
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
        this.forEach((line, layer) => {
            if (line.some((x) => {
                    point.get(layer).includes(x);
                })) return true;
        });
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
        result = this.map(([layer, line]) => {
            if (fullLayers.includes(layer)) return;
            let count = 0;
            fullLayers.forEach((fullLayer) => {
                if (fullLayer > layer) count++;
            });
            return [layer + count, line];
        });
        this.setMap(new Map(result));
    }
    stackBlock(block) {
        this.concat(block);
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
        this._defaultShaft = shaft
        this._shaft = [shaft, shaft]
    }
    getColor() {
        return this._color;
    }
    resetBlock() {
        this.reset();
        this._resetShaft();
    }
    _resetShaft() {
        this._shaft = [this._defaultShaft, this._defaultShaft];
    }
    _moveShaft(x, y) {
        this._shaft[0] += x;
        this._shaft[1] += y;
    }
    copy() {
        return new Block(this._defaultArray, this._defaultShaft, this._color);
    }
    rotate(isClockWise) {
        let sign = (isClockWise) ? -1 : 1;
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
        return this._blocks[randomIndex];
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

class Current {
    constructor() {
        this._initStack();
        this._initLevel();
        this._initBlockGenerator();
        this._resetBlock();
    }
    _initStack() {
        this._stack = new Stack();
    }
    _initLevel() {
        this._level = new Level();
    }
    _initBlockGenerator() {
        this._blockGenerator = new BlockGenerator();
    }
    _resetBlock() {
        let block = this._blockGenerator.generate();
        this._block = block;
    }
    _sendBlockEraseEvent() {
        sendEvent('erase', mainCanvas, this._block);
    }
    _sendBlockDrawEvent() {
        sendEvent('draw', mainCanvas, this._block);
    }
    _sendBlockEraseDrawEventClosure(func, ...args) {
        this._sendBlockEraseEvent();
        func(...args);
        this._sendBlockDrawEvent();
    }
    _sendStackEraseEvent() {
        sendEvent('erase', stackCanvas, this._stack);
    }
    _sendStackDrawEvent() {
        sendEvent('draw', stackCanvas, this._stack);
    }
    _sendStackEraseDrawEvent(func, ...args) {
        this._sendStackEraseEvent();
        func(...args);
        this._sendStackDrawEvent();
    }
    _stackBlock() {
        this._stack.concat(this._block);
    }
    _isConflict() {
        let stopBlocks = this._stack.getStopBlocks()
        if (this._block.isConflictWith(stopBlocks)) return true;
        return false;
    }
    takeFirstFrame() {
        this._sendBlockDrawEvent();
        this._sendStackDrawEvent();
    }
    takeOneFrame() {
        this._moveDownAndSendEraseDrawEvent();
        if (!this._isConflict()) return;
        this._stackBlock();
        this._stack.clearFullLayers();
        this._resetBlock();
    }
    _moveDownAndSendEraseDrawEvent() {
        this._sendBlockEraseEvent();
        this._block.moveDown();
        this._sendBlockDrawEvent();
    }
    playGame() {
        let start = 0;
        let delay = 1000;
        this.takeFirstFrame();
        const animate = (timestamp) => {
            if (timestamp - start > delay) {
                this.takeOneFrame();
                start = timestamp
            }
            requestAnimationFrame(animate)
        }


        requestAnimationFrame(animate)
    }
}
const current = new Current();
current.playGame();

//viewer


const BLOCK_SIZE = 20;
const BASE_LOCATION_X = 0;
const BASE_LOCATION_Y = 0;

const drawPoint = function (point, ctx, color) {
    ctx.fillStyle = color;
    point.forEach(function (line, y) {
        line.forEach(function (x) {
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        })
    })
}
const erasePoint = function (point, ctx) {
    point.forEach(function (line, y) {
        line.forEach(function (x) {
            ctx.clearRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        })
    })
}
mainCanvas.addEventListener('draw', (e) => {
    let point = e.detail.point;
    let color = point.getColor();
    let ctx = mainCanvas.ctx;
    drawPoint(point, ctx, color);
});
mainCanvas.addEventListener('erase', (e) => {
    let point = e.detail.point
    let ctx = mainCanvas.ctx;
    erasePoint(point, ctx);
})
stackCanvas.addEventListener('draw', (e) => {
    let point = e.detail.point
    let ctx = this.ctx;

    drawPoint(point, ctx);
})
stackCanvas.addEventListener('erase', (e) => {
    let point = e.detail.point
    let ctx = this.ctx;
    erasePoint(point, ctx);
})