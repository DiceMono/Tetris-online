const GAMEBOARD_WIDTH = 10;
const GAMEBOARD_HEIGHT = GAMEBOARD_WIDTH * 2;

const START_LOCATION_X = 4;
const START_LOCATION_Y = -1;

class Block {
    constructor(point, middle, color) {
        this.setOriginPoint(point)
        this.init(point, middle, color)
    }
    setOriginPoint(point) {
        this.originPoint = point;
    }

    init(point, middle, color) {
        this.point = point;
        this.middle = middle;
        this.color = color;
    }

    resetPoint() {
        this.point = this.originPoint;
    }

    move(x, y) {
        this.
    }
}

class Point {
    constructor(map=new Map()) {
        this.init(map)
    }

    init(map) {
        this.map = map;
    }

    getLine(layer) {
        return this.map.get(layer);
    }

    hasLayer(Layer) {
        return this.map.has(layer);
    }

    setLayer(layer, line) {
        this.map.set(layer, line);
    }

    deleteLayer(layer) {
        this.map.delete(layer);
    }

    getFullLayers() {
        let layers = [];
        this.map.forEach((line, layer) => {
            if (line.length === GAMEBOARD_WIDTH) layers.push(layer);
        })
        if (layers.length === 0) return false;
        return layers;
    }

    move(x, y) {
        let movedMap = new Map()
        this.map.forEach((line, layer) => {
            line.forEach((value) => {
                value += x;
            });
            movedMap.set(layer + y, line);
        });
        this.map = movedMap;
    }
}
const BASE_MAP_T = new Map([
    [1, [0, 1, 2]],
    [2, [1]]
]);
const BASE_MAP_J = new Map([
    [1, [0, 1, 2]],
    [2, [2]]
])
const BASE_MAP_Z = new Map([
    [0, [1]],
    [1, [1, 2]],
    [2, [2]]
]);
const BASE_MAP_O = new Map([
    [1, [1, 2]],
    [2, [1, 2]],
]);
const BASE_MAP_S = new Map([
    [1, [1, 2]],
    [2, [0, 1]]
]);
const BASE_MAP_L = new Map([
    [1, [0, 1, 2]],
    [2, [0]]
]);
const BASE_MAP_I = new Map([
    [1, [0, 1, 2, 3]]
]);

const POINT_T = new Point(BASE_MAP_T);
const POINT_J = new Point(BASE_MAP_J);
const POINT_Z = new Point(BASE_MAP_Z);
const POINT_O = new Point(BASE_MAP_O);
const POINT_S = new Point(BASE_MAP_S);
const POINT_L = new Point(BASE_MAP_L);
const POINT_I = new Point(BASE_MAP_I);
const POINTS = [POINT_T, POINT_J, POINT_Z, POINT_O, POINT_S, POINT_L, POINT_I];

const COLORS = (function () {
    const MIN_RGB = 0;
    const MAX_RGB = 200;
    let randomRGB = function () {
        return MIN_RGB + Math.round(Math.random() * (MAX_RGB - MIN_RGB))
    };
    let colors = [];
    for (let i = 0; i < POINTS.length; i++) {
        colors.push(`rgb(${randomRGB()},${randomRGB()},${randomRGB()})`);
    }
    return colors;
}())

const BLOCK_T = new Block(POINT_T, 1, COLORS[0]);
const BLOCK_J = new Block(POINT_J, 1, COLORS[1]);
const BLOCK_Z = new Block(POINT_Z, 1, COLORS[2]);
const BLOCK_O = new Block(POINT_O, 1.5, COLORS[3]);
const BLOCK_S = new Block(POINT_S, 1, COLORS[4]);
const BLOCK_L = new Block(POINT_L, 1, COLORS[5]);
const BLOCK_I = new Block(POINT_I, 1.5, COLORS[6]);


const BOTTOM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const WALL_BASE = new Point(new Map(
    (function () {
        let wall = [];

        for (let layer = 0; layer < GAMEBOARD_HEIGHT; layer++) {
            wall.push([layer, [0, GAMEBOARD_WIDTH + 1]]);
        }

        wall.push([GAMEBOARD_HEIGHT, BOTTOM]);
        return wall;
    }())
));

class GameBoard {
    constructor() {
        this.init()
    }

    init() {
        this.initWall()
        this.initStack()
    }

    initWall() {
        let wallMap = new Map(
            (function () {
                let wall = [];

                for (let layer = 0; layer < GAMEBOARD_HEIGHT; layer++) {
                    wall.push([layer, [0, GAMEBOARD_WIDTH + 1]]);
                }

                wall.push([GAMEBOARD_HEIGHT, BOTTOM]);
                return wall;
            }())
        )
        this.wall = new Point(wallMap);
    }

    initStack() {
        this.stack = new Point();
    }

    getStopBlocks() {
        let stopBlocks = new Point();
        for (let layer = 0; layer < this.wall.size; layer++) {
            let line = this.wall.getLine(layer);
            if (this.stack.hasLayer(layer)) {
                let stackLine = this.stack.getLine(layer);
                line = line.concat(stackLine);
            }
            stopBlocks.setLayer(layer, line);
        }
        return stopBlocks;
    }

    getFullLayersInStack() {
        return this.stack.getFullLayers();
    }

    clearFullLayers(fullLayers) {
        let newStack = new Point();
        fullLayers.forEach((fullLayer) => {
            this.stack.deleteLayer(fullLayer);
        })
        this.stack.forEach((line, layer) => {
            let count = 0;
            fullLayers.forEach((fullLayer) => {
                if (fullLayer > layer) count++;
            });
            newStack.setLayer(layer + count, line);
        });
        this.stack = newStack;
    }
}
const gameBoard = new GameBoard();

class NextBlock {
    constructor() {
        this.init()
    }

    init() {
        this.blocks = [BLOCK_T, BLOCK_J, BLOCK_Z, BLOCK_O, BLOCK_S, BLOCK_L, BLOCK_I];
        this.initQueue();
    }

    initQueue() {
        this.queueLength = 2;
        this.setQueue();
    }

    setQueue() {
        let queue = [];
        for (let i = 0; i < this.queueLength; i++) {
            queue.push(this.getRandomBlock());
        }
        this.queue = queue
    }

    getRandomBlock() {
        let randomIndex = Math.floor(Math.random() * this.blocks.length);
        return this.blocks[randomIndex];
    }

    setCurrentBlock() {
        currentBlock.block = this.queue.shift();
        currentBlock.block.resetShape();
        currentBlock.location = [START_LOCATION_X, START_LOCATION_Y];
        this.queue.push(this.generateRandomBlock());
    }
}
const nextBlock = new NextBlock();

const currentBlock = {
    block: null,
    location: null,
    getColor: function () {
        return this.block.color;
    },
    toMap: function () {
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
        const SHAFT = currentBlock.block.middle;
        const sign = isClockwise ? 1 : -1;
        let rotatedShape = [];
        currentBlock.block.shape.forEach(function (point) {
            let x = -sign * (point[1] - SHAFT) + SHAFT;
            let y = sign * (point[0] - SHAFT) + SHAFT;
            rotatedShape.push([x, y]);
        })
        currentBlock.block.shape = rotatedShape;
    },
    moveSide: function (isRight) {
        const movement = isRight ? 1 : -1;
        currentBlock.location[0] += movement;
    },
    moveDown: function (isDown = true) {
        const movement = isDown ? 1 : -1;
        currentBlock.location[1] += movement;
    },
    stack: function () {
        let map = this.toMap();
        currentBlock.toMap().forEach(function (line, layer) {
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
        if (stopBlocks.get(currentBlock.location[1] + point[1]).includes(currentBlock.location[0] + point[0])) return true;
    }
    return false;
}

const conflictHandler = function (func, direction) {
    func(direction);
    if (isConflict()) {
        func(!direction);
        return true;
    }
}

const MAX_SCORE = '000000';
const Score = {
    score: 0,
    reset: function () {
        this.score = 0;
        return this.score;
    },
    add: function (point) {
        this.score += point;
        return this.score;
    },
    toString: function () {
        return MAX_SCORE.slice(0, MAX_SCORE.length - score.toString.length - 1) + score;
    }
}