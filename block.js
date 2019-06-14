const canvas = document.getElementById('userCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 200;
canvas.height = canvas.width * 2;
const blockSize = 10;
const mapWidth = 10;
const mapHeight = 20;

const mapCtx = document.getElementById('mapCanvas').getContext('2d');

let mb = [];
for (let i = 0; i < mapHeight; i++) {
    mb.push([i, [0, mapWidth + 1]]);
}
mb.push([mapHeight, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]])
const border = new Map(mb)
const gameBoard = {
    border: border,
    stack: new Map(),
    getStopBlocks: function () {
        let board = new Map();
        for (let i = 0; i < border.size; i++) {
            let layer = this.border.get(i);
            if (this.stack.has(i)) {
                layer = layer.concat(this.stack.get(i));
            }
            board.set(i, layer);
        }
        return board;
    },
    draw: function () {
        let board = this.getStopBlocks();
        for (let y = 0; y < board.size; y++) {
            let layer = board.get(y);
            for (let x of layer) {
                mapCtx.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);
            }
        }
    },
    removeLine: function(lineNumber) {
        this.stack.delete(lineNumber);
    },
    ereaseStackImage: function () {
        mapCtx.clearRect(0, 0 , canvas.width, canvas.height);
    }
}
gameBoard.draw()
let a = gameBoard.getStopBlocks();

const blockTShape = [
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2]
];
const blockJShape = [
    [0, 1],
    [1, 1],
    [2, 1],
    [2, 2]
];
const blockZShape = [
    [0, 1],
    [1, 1],
    [1, 2],
    [2, 2]
];
const blockOShape = [
    [0, 1],
    [1, 1],
    [0, 2],
    [1, 2]
];
const blockSShape = [
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2]
];
const blockLShape = [
    [0, 1],
    [1, 1],
    [2, 1],
    [0, 2]
];
const blockIShape = [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2]
];

const current = {
    shape: blockJShape,
    midPoint: 1,
    locationX: 4,
    locationY: -1,
    rotate: function (isClockwise) {
        if (this.shape === blockOShape) return;
        let sign = isClockwise ? 1 : -1;
        let rotatedShape = new Array(this.shape.length);
        for (let i = 0; i < this.shape.length; i++) {
            let x = -sign * (this.shape[i][1] - this.midPoint) + this.midPoint;
            let y = sign * (this.shape[i][0] - this.midPoint) + this.midPoint;
            rotatedShape[i] = new Array(x, y);
        }
        this.shape = rotatedShape;
    },
    draw: function () {
        ctx.fillStyle = 'rgb(0,150,0)';
        for (let i = 0; i < this.shape.length; i++) {
            ctx.fillRect((this.locationX + this.shape[i][0]) * blockSize, (this.locationY + this.shape[i][1]) * blockSize, blockSize - 1, blockSize - 1);
        }
    },
    clear: function () {
        ctx.fillStyle = 'rgb(0,150,0)';
        for (let i = 0; i < this.shape.length; i++) {
            ctx.clearRect((this.locationX + this.shape[i][0]) * blockSize, (this.locationY + this.shape[i][1]) * blockSize, blockSize - 1, blockSize - 1);
        }
    },
    isConflict: function () {
        let stopBlocks = gameBoard.getStopBlocks();
        for (let point of this.shape) {
            if (!stopBlocks.has(this.locationY + point[1])) continue;
            if (stopBlocks.get(this.locationY + point[1]).includes(this.locationX + point[0])) return true;
        }
        return false;
    },
    stackCurrentBlock: function () {
        let locationX = this.locationX
        let locationY = this.locationY
        this.shape.forEach(function (point) {
            if (gameBoard.stack.has(locationY + point[1])) {
                gameBoard.stack.get(locationY + point[1]).push(locationX + point[0]);
                return;
            }
            gameBoard.stack.set(locationY + point[1], [locationX + point[0]])
        });
    }
}

const gameHandler = {
    blockShapes: [blockTShape, blockJShape, blockZShape, blockOShape, blockSShape, blockLShape, blockIShape],
    getRandomBlock: function () {
        let randomIndex = Math.floor(Math.random() * this.blockShapes.length);
        return this.blockShapes[randomIndex];
    },
    assignNewCurrentBlock: function () {
        current.shape = this.getRandomBlock();
        current.midPoint = (current.shape === blockIShape) ? 1.5 : 1;
        current.locationX = 4;
        current.locationY = -1;
    },
    isLineFull: function () {
        for (let i = 0; i < 4; i++) {
            if (!gameBoard.stack.has(current.locationY + i)) continue;
            if (gameBoard.stack.get(current.locationY + i).length === 10) return true;
        }
        return false;
    },
    clearLine: function () {
        let clearCount = 0;
        for (let i = 3; i > - gameBoard.stack.size - 1; i--) {
            let blockPointY = current.locationY + i
            if (!gameBoard.stack.has(blockPointY)) continue;
            if (gameBoard.stack.get(blockPointY).length === 10) {
                gameBoard.removeLine(blockPointY);  
                clearCount++;
            } else {
                let line = gameBoard.stack.get(blockPointY);
                gameBoard.removeLine(blockPointY);  
                gameBoard.stack.set(blockPointY + clearCount, line);
            }
        }
    }
}

// keyboard event

// window.addEventListener('keydown', function (e) {});
window.onkeydown = function (e) {
    if (e.keyCode == 40) {
        current.clear();
        current.locationY++;
        if (current.isConflict()) {
            current.locationY--;
            current.draw();
            return;
        }
        current.draw();
    }
    if (e.keyCode == 32) {
        current.clear();
        while(!current.isConflict()) {
            current.locationY++;
        }
        current.locationY--;
        current.draw(); 
    }
    if (e.keyCode == 37) {
        current.clear();
        current.locationX--;
        if (current.isConflict()) {
            current.locationX++;
            current.draw();
            return;
        }
        current.draw();
    }
    if (e.keyCode == 39) {
        current.clear();
        current.locationX++;
        if (current.isConflict()) {
            current.locationX--;
            current.draw();
            return;
        }
        current.draw();
    }
    if (e.keyCode == 65) {
        current.clear();
        current.rotate(isClockwise = false);


        if (current.isConflict()) {
            current.rotate(isClockwise = true);
            current.draw();
            return;
        }
        current.draw();
    }
    if (e.keyCode == 83) {
        current.clear();
        current.rotate(isClockwise = true);
        if (current.isConflict()) {
            current.rotate(isClocwise = false);
            current.draw();
            return;
        }
        current.draw();
    }
}