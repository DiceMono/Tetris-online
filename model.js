const SHAPE_T = [
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2]
];
const SHAPE_J = [
    [0, 1],
    [1, 1],
    [2, 1],
    [2, 2]
];
const SHAPE_Z = [
    [0, 1],
    [1, 1],
    [1, 2],
    [2, 2]
];
const SHAPE_O = [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2]
];
const SHAPE_S = [
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2]
];
const SHAPE_L = [
    [0, 1],
    [1, 1],
    [2, 1],
    [0, 2]
];
const SHAPE_I = [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2]
];
const SHAPES = [SHAPE_T, SHAPE_J, SHAPE_Z, SHAPE_O, SHAPE_S, SHAPE_L, SHAPE_I];
const COLORS = (function () {
    const MIN_RGB = 100;
    const MAX_RGB = 150;
    let randomRGB = function () {
        return MIN_RGB + Math.round(Math.random() * (MAX_RGB - MIN_RGB))
    };
    let colors = [];
    for (let i = 0; i < SHAPES.length; i++) {
        colors.push(`rgb(${randomRGB()},${randomRGB()},${randomRGB()})`);
    }
    return colors;
}())

class Block {
    constructor(shape, middle, color) {
        this.shape = shape;
        this.middle = middle;
        this.color = color;
    }
}

const BLOCK_T = Block(SHAPE_T, 1, COLORS[0]);
const BLOCK_J = Block(SHAPE_J, 1, COLORS[1]);
const BLOCK_Z = Block(SHAPE_Z, 1, COLORS[2]);
const BLOCK_O = Block(SHAPE_O, 1.5, COLORS[3]);
const BLOCK_S = Block(SHAPE_S, 1, COLORS[4]);
const BLOCK_L = Block(SHAPE_L, 1, COLORS[5]);
const BLOCK_I = Block(SHAPE_I, 1.5, COLORS[6]);

const GAMEBOARD_WIDTH = 10;
const GAMEBOARD_HEIGHT = GAMEBOARD_WIDTH * 2;

const WALL_BASE = new Map(
    (function () {
        const BOTTOM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        let wall = [];

        for (let layer = 0; layer < GAMEBOARD_HEIGHT; layer++) {
            wall.push([layer, [0, mapWidth + 1]]);
        }

        wall.push([GAMEBOARD_HEIGHT, BOTTOM]);
        return wall;
    }())
);

const gameBoard = {
    stack: new Map(),
    wall: WALL_BASE,
    getLine: function (map, layer) {
        return map.get(layer);
    },
    removeStackLayer: function (layer) {
        this.stack.delete(layer);
    },
    moveStackLayer: function (layer, destination) {
        this.stack.set(destination, this.getLine(this.stack, layer));
        this.stack.delete(layer);
    },
    getStopBlocks: function () {
        let stopBlocks = new Map();
        for (let layer = 0; layer < this.wall.size; layer++) {
            let line = this.getLine(this.wall, layer);
            if (this.stack.has(layer)) {
                let stackLine = this.getLine(this.stack, layer);
                line = line.concat(stackLine);
            }
            stopBlocks.set(layer, line);
        }
        return stopBlocks;
    },
}

const currentBlock = {
    block: null,
    location: null,
    rotate: function (isClockwise) {
        const SHAFT = this.block.middle;
        const sign = isClockwise ? 1 : -1;
        let rotatedShape = [];
        this.block.shape.forEach(function (point) {
            let x = -sign * (point[1] - SHAFT) + SHAFT;
            let y = sign * (point[0] - SHAFT) + SHAFT;
            rotatedShape.push([x, y]);
        })
        this.block.shape = rotatedShape;
    },
    moveSide: function (isRight) {
        const movement = isRight ? 1 : -1;
        location[0] += movement;
    },
    moveDown: function (isDown = true) {
        const movement = isDown ? 1 : -1;
        location[1] += movement;
    },
}

const isConflict = function () {
    let stopBlocks = gameBoard.getStopBlocks();
    for (let point of currentBlock.block.shape) {
        if (!stopBlocks.has(currentBlock.location[1] + point[1])) continue;
        if (stopBlocks.get(currentBlock.location[1] + point[1]).includes(this.locationX + point[0])) return true;
    }
    return false;
}

const conflictHandler = function (func, direction) {
    func(direction);
    if (isConflict) {
        func(!direction);
    }
}

const nextBlock = {
    blocks: [BLOCK_T, BLOCK_J, BLOCK_Z, BLOCK_O, BLOCK_S, BLOCK_L, BLOCK_I],
    startLocation: [4, -1],
    queueSize: 1,
    queue: (function() {
        setQueue();
    }()),
    generateRandomBlock: function () {
        let randomIndex = Math.floor(Math.random() * this.blockShapes.length);
        return this.blocks[randomIndex];
    },
    setQueue: function() {
        let queue = [];
        for(let i = 0; i < this.queueSize; i++) {
            queue.push(this.generateRandomBlock());
        }
        return queue;
    },
    setCurrentBlock: function() {
        currentBlock.block = this.queue.shift();
        currentBlock.location = this.startLocation;
        this.queue.push(this.generateRandomBlock());
    },
}

const score = {
    score: 0,
    reset: function() {
        this.score = 0;
        return this.score;
    },
    add: function(point) {
        this.score += point;
        return this.score;
    },
    toString: function() {
        const MAX_SCORE = '000000';
        return MAX_SCORE.slice(0 , MAX_SCORE.length - score.toString.length - 1) + score;
    }
}
