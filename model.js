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
        this.baseShape = shape;
        this.shape = shape;
        this.middle = middle;
        this.color = color;
    }
    resetShape() {
        this.shape = this.baseShape;
    }
}

const BLOCK_T = new Block(SHAPE_T, 1, COLORS[0]);
const BLOCK_J = new Block(SHAPE_J, 1, COLORS[1]);
const BLOCK_Z = new Block(SHAPE_Z, 1, COLORS[2]);
const BLOCK_O = new Block(SHAPE_O, 1.5, COLORS[3]);
const BLOCK_S = new Block(SHAPE_S, 1, COLORS[4]);
const BLOCK_L = new Block(SHAPE_L, 1, COLORS[5]);
const BLOCK_I = new Block(SHAPE_I, 1.5, COLORS[6]);

const GAMEBOARD_WIDTH = 10;
const GAMEBOARD_HEIGHT = GAMEBOARD_WIDTH * 2;

const WALL_BASE = new Map(
    (function () {
        const BOTTOM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        let wall = [];

        for (let layer = 0; layer < GAMEBOARD_HEIGHT; layer++) {
            wall.push([layer, [0, GAMEBOARD_WIDTH + 1]]);
        }

        wall.push([GAMEBOARD_HEIGHT, BOTTOM]);
        return wall;
    }())
);

const gameBoard = {
    stack: new Map(),
    wall: WALL_BASE,
    getFullLayers: function () {
        let layers = [];
        this.stack.forEach(function (line, layer) {
            if (line.length === GAMEBOARD_WIDTH) layers.push(layer); 
        })
        return layers;
    },
    removeStackLayer: function (layer) {
        this.stack.delete(layer);
    },
    moveStackLayer: function (layer, destination) {
        this.stack.set(destination, this.stack.get(layer));
        this.stack.delete(layer);
    },
    getStopBlocks: function () {
        let stopBlocks = new Map();
        for (let layer = 0; layer < this.wall.size; layer++) {
            let line = this.wall.get(layer);
            if (this.stack.has(layer)) {
                let stackLine = this.stack.get(layer);
                line = line.concat(stackLine);
            }
            stopBlocks.set(layer, line);
        }
        return stopBlocks;
    },
    clearFullLayers: function (fullLayers) {
        let newStack = new Map();

        this.stack.forEach(function(line, layer) {
            let count = 0;
            fullLayers.forEach(function (fullLayer) {
                if (fullLayer < layer) count++;
            });
            newStack.set(layer - count, line);
        });
        this.stack = newStack;
    }
}

const START_LOCATION = [4, -1];
const nextBlocks = {
    blocks: [BLOCK_T, BLOCK_J, BLOCK_Z, BLOCK_O, BLOCK_S, BLOCK_L, BLOCK_I],
    queueSize: 2,
    queue: null,
    getQueue: function () {
        return this.queue;
    },
    generateRandomBlock: function () {
        let randomIndex = Math.floor(Math.random() * this.blocks.length);
        return this.blocks[randomIndex];
    },
    setQueue: function() {
        let queue = [];
        for(let i = 0; i < this.queueSize; i++) {
            queue.push(this.generateRandomBlock());
        }
        this.queue = queue
    },
    setCurrentBlock: function() {
        currentBlock.block = this.queue.shift();
        currentBlock.location = START_LOCATION;
        this.queue.push(this.generateRandomBlock());
    },
}
nextBlocks.setQueue();

const currentBlock = {
    block: null,
    location: null,
    toMap: function() {
        let location = this.location;
        let map = new Map();
        this.block.shape.forEach(function (point) {
            let x = location[0] + point[0];
            let y = location[1] + point[1];
            map.set(y, (map.get(y) || []).concat([x]))
        })
        return map;
    },
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
    stack: function () {
        let map = this.toMap();
        map.forEach(function (line, layer) {
            if (gameBoard.stack.has(layer)) {
                let newLine = gameBoard.stack.get(layer).concat(line);
                gameBoard.stack.set(layer, newLine);
                return;
            } 
            gameBoard.stack.set(layer, line)
        });        
    }
}
nextBlocks.setCurrentBlock();

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
        return true;
    }
}

const MAX_SCORE = '000000';
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
        return MAX_SCORE.slice(0 , MAX_SCORE.length - score.toString.length - 1) + score;
    }
}
