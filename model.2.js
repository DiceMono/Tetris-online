'use strict';
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
    moveDownAndSendEraseDrawEvent(isDown = true) {
        const moveDown = this._block.moveDown.bind(this._block);
        this._sendBlockEraseDrawEventClosure(moveDown, isDown);
    }
    moveSideAndSendEraseDrawEvent(isRight) {
        const moveSide = this._block.moveSide.bind(this._block);
        this._sendBlockEraseDrawEventClosure(moveSide, isRight)
    }
    rotateBlockAndSendEraseDrawEvent(isClockWise) {
        const rotateBlock = this._block.rotate.bind(this._block);
        this._sendBlockEraseDrawEventClosure(rotateBlock, isClockWise);
    }
    _sendWallDrawEvent() {
        sendEvent('draw', stackCanvas, this._stack.getStopBlocks())
    }
    _sendStackEraseEvent() {
        sendEvent('erase', stackCanvas, this._stack);
    }
    _sendStackDrawEvent() {
        sendEvent('draw', stackCanvas, this._stack);
    }
    _sendStackEraseDrawEventDecorator(func, ...args) {
        this._sendStackEraseEvent();
        func(...args);
        this._sendStackDrawEvent();
    }
    _stackBlock() {
        this._stack.concat(this._block);
    }
    _stackBlockAndSendEraseDrawEvent() {
        let stackBlock = this._stackBlock.bind(this);
        this._sendBlockEraseEvent();
        this._sendStackEraseDrawEventDecorator(stackBlock);
    }
    _cleartFullLayersAndSendEraseDrawEvent() {
        let clearFullLayers = this._stack.clearFullLayers.bind(this._stack);
        this._sendStackEraseDrawEventDecorator(clearFullLayers);
    }
    isConflict() {
        let stopBlocks = this._stack.getStopBlocks()
        if (this._block.isConflictWith(stopBlocks)) return true;
        return false;
    }
    _isGameOver() {
        return this._stack.isConflictWith(new Map([[0, [0,5]]]));
    }
    _checkGameOver() {
        if(this._isGameOver()) alert('Game Over');
    }
    takeOneFrame() {
        this.moveDownAndSendEraseDrawEvent();
        if (!this.isConflict()) return;
        this.moveDownAndSendEraseDrawEvent(false);
        this._stackBlockAndSendEraseDrawEvent();
        this._cleartFullLayersAndSendEraseDrawEvent();
        this._resetBlock();
        this._checkGameOver();
    }
    dropBlock() {
        while (!this.isConflict()) this.moveDownAndSendEraseDrawEvent();
        this.moveDownAndSendEraseDrawEvent(false);
        this.takeOneFrame();

    }
    _takeFirstFrame() {
        this._sendWallDrawEvent();
        this._sendBlockDrawEvent();
    }
    playGame() {
        let start = 0;
        let delay = 500;
        this._takeFirstFrame();
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


const BLOCK_SIZE = 15;


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
    let ctx = e.target.ctx;
    drawPoint(point, ctx, color);
});
mainCanvas.addEventListener('erase', (e) => {
    let point = e.detail.point
    let ctx = e.target.ctx;
    erasePoint(point, ctx);
})
stackCanvas.addEventListener('draw', (e) => {
    let point = e.detail.point
    let ctx = e.target.ctx;
    drawPoint(point, ctx);
})
stackCanvas.addEventListener('erase', (e) => {
    let point = e.detail.point
    let ctx = e.target.ctx;
    erasePoint(point, ctx);
})

const handleConfilct = (func, movement) => {
    func(movement)
    if (current.isConflict()) func(!movement)
}
const KEYCODE_RIGHT = 39;
const KEYCODE_LEFT = 37;
const KEYCODE_CLOCKWISE = 65;
const KEYCODE_COUNTERCLOCKWISE = 83;
const KEYCODE_DOWN = 40;
const KEYCODE_DROP = 32;

window.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
        case KEYCODE_RIGHT: handleConfilct(current.moveSideAndSendEraseDrawEvent.bind(current), true);
        break;  
        case KEYCODE_LEFT: handleConfilct(current.moveSideAndSendEraseDrawEvent.bind(current), false);
        break;      
        case KEYCODE_CLOCKWISE: handleConfilct(current.rotateBlockAndSendEraseDrawEvent.bind(current), true);
        break;
        case KEYCODE_COUNTERCLOCKWISE: handleConfilct(current.rotateBlockAndSendEraseDrawEvent.bind(current), false);
        break;
        case KEYCODE_DOWN: handleConfilct(current.moveDownAndSendEraseDrawEvent.bind(current), true);
        break;
        case KEYCODE_DROP: current.dropBlock();
    }
});



current.playGame();
//메서드 배치를 어떤식으로 하는게 좋을까? 목차처럼? 중요도순? 
