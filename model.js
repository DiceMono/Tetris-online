const GAMEBOARD_WIDTH = 10;
const GAMEBOARD_HEIGHT = GAMEBOARD_WIDTH * 2;

const START_LOCATION_X = 4;
const START_LOCATION_Y = -1;

class Block {
    constructor(point, middle, color) {
        this._init(point, middle, color)
    }

    _init(point, middle, color) {
        this._initVars(point, middle, color)
        this._copyPointDeep(point)
    }

    _initVars(point, middle, color) {
        this._originPoint = point;
        this._middle = middle;
        this._color = color;
    }

    _copyPointDeep(point) {
        this._point = point.copy();
    }

    getPoint() {
        return this._point;
    }

    getOriginPoint() {
        return this._originPoint;
    }

    getColor() {
        return this._color;
    }

    resetPoint() {
        this._point = this._originPoint;
    }

    move(x, y) {
        this._point.move(x, y);
    }

    rotate(isClockwise) {
        this._point.rotate(isClockwise, this._middle)
    }

    addblock(block) {
        this._point
    }
}

class Point {
    constructor(map = new Map()) {
        this._init(map)
    }

    _init(map) {
        this._map = map;
    }
    getMap() {
        return this._map;
    }

    getLine(layer) {
        return this._map.get(layer);
    }

    hasLayer(layer) {
        return this._map.has(layer);
    }

    setLayer(layer, line) {
        this._map.set(layer, line);
    }

    deleteLayer(layer) {
        this._map.delete(layer);
    }

    getFullLayers() {
        let layers = [];
        this._map.forEach((line, layer) => {
            if (line.length === GAMEBOARD_WIDTH) layers.push(layer);
        })
        if (layers.length === 0) return false;
        return layers;
    }

    copy() {
        let newMap = new Map();
        this._map.forEach((line, y) => {
            line.forEach((x) => {
                if (newMap.has(y)) {
                    newMap.set(y, newMap.get(y).concat([x]));
                    return;
                }
                newMap.set(y, x)
            });
        });
        return new Point(newMap);
    }

    move(x, y) {
        let movedMap = new Map()
        this._map.forEach((line, layer) => {
            line.forEach((value, index) => {
                line[index] += x;
            });
            movedMap.set(layer + y, line);
        });
        this._map = movedMap;
    }

    rotate(isClockwise, shaft) {
        let sign = 1;
        if (!isClockwise) sign = -1;
        let rotatedMap = new Map();
        this._map.forEach((line, y) => {
            let rotatedX = -sign * (y - shaft) + shaft;
            line.forEach((x) => {
                let rotatedY = sign * (x - shaft) + shaft;
                if (rotatedMap.has(rotatedY)) {
                    let rotatedLine = rotatedMap.get(rotatedY).concat([rotatedX])
                    rotatedMap.set(rotatedY, rotatedLine);
                    return;
                }
                rotatedMap.set(rotatedY, rotatedX)
            });
        });
    }

    addPoint(point) {
        let result = new Point();
        this._map.forEach((line, y) => {
            if (this.hasLayer(y)) {
                let newLine = line.concat(point.getMap().getLine(y))
                result.setLayer(y, newLine);
                return;
            }
            result.setLayer(y, line);
        });
        return result;
    }

    static isConflict(point1, point2) {
        for (let y in point1.getMap().keys()) {
            if (point2.getLine(y).some((x) => {
                    point1.getLine(y).includes(x);
                })) return true;
        }
        return false;
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

const BOTTOM_LINE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

class Stack {
    constructor() {
        this._init()
    }

    _init() {
        this._initWall()
        this._initStack()
    }

    _initWall() {
        let wallMap = new Map(
            (function () {
                let wall = [];

                for (let layer = 0; layer < GAMEBOARD_HEIGHT; layer++) {
                    wall.push([layer, [0, GAMEBOARD_WIDTH + 1]]);
                }

                wall.push([GAMEBOARD_HEIGHT, BOTTOM_LINE]);
                return wall;
            }())
        )
        this._wall = new Point(wallMap);
    }

    _initStack() {
        this._stack = new Point();
    }

    getStopBlocks() {
        return this._stack.addPoint(this._wall);
    }

    getFullLayersInStack() {
        return this.stack.getFullLayers();
    }

    clearFullLayers(fullLayers) {
        let newStack = new Point();
        fullLayers.forEach((fullLayer) => {
            this._stack.deleteLayer(fullLayer);
        })
        this._stack.forEach((line, layer) => {
            let count = 0;
            fullLayers.forEach((fullLayer) => {
                if (fullLayer > layer) count++;
            });
            newStack.setLayer(layer + count, line);
        });
        this._stack = newStack;
    }

    stack(block) {
        this._stack.addPoint(block.getPoint());
    }
}
const gameBoard = new GameBoard();

class NextBlock {
    constructor() {
        this._init();
    }

    _init() {
        this.blocks = [BLOCK_T, BLOCK_J, BLOCK_Z, BLOCK_O, BLOCK_S, BLOCK_L, BLOCK_I];
        this._initQueue();
    }

    _initQueue() {
        this.queueLength = 2;
        this._setQueue();
    }

    _setQueue() {
        let queue = [];
        for (let i = 0; i < this.queueLength; i++) {
            queue.push(this.getRandomBlock());
        }
        this.queue = queue
    }

    _getRandomBlock() {
        let randomIndex = Math.floor(Math.random() * this.blocks.length);
        return this.blocks[randomIndex];
    }

    generate() {
        let nextBlock = this.queue.shift();
        this.queue.push(this._generateRandomBlock());
        nextBlock.resetPoint();
        return nextBlock;
    }
}
const nextBlock = new NextBlock();
class CurrentBlock {
    constructor(block) {
        this.init(block)
    }

    init(block) {
        this._setBlock(block);
        this._resetLocation();
    }

    _setBlock(block) {
        this._block = block;
    }

    _resetLocation() {
        this._location = [START_LOCATION_X, START_LOCATION_Y];
    }

    getBlock() {
        return this._block;
    }

    rotate(isClockwise) {
        this._block.rotate(isClockwise);
    }

    moveSide(isRight) {
        let movement = isRight ? 1 : -1;
        this._block.move(movement, 0);
    }

    moveDown(isDown = true) {
        let movement = isDown ? 1 : -1;
        this._block.move(0, movement);
    }
}
const currentBlock = new CurrentBlock(nextBlock.generate());
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

const handleConflict = function (func, direction) {
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