const mainCanvas = document.getElementById('main');
const mainCtx = mainCanvas.getContext('2d');

const gameBoardCanvas = document.getElementById('gameBoard');
const gameBoardCtx = gameBoardCanvas.getContext('2d');

const scoreCanvas = document.getElementById('score');
const scoreCtx = scoreCanvas.getContext('2d');

const nextBlocksCanvas = document.getElementById('nextBlocks');
const nextBlocksCtx = nextBlocksCanvas.getContext('2d');

const BLOCK_SIZE = 10;

const BASE_LOCATION = [0, 0];

const draw = function (map, ctx) {
    map.forEach(function (line, layer) {
        line.forEach(function (locationX) {
            ctx.fillRect(locationX * BLOCK_SIZE, layer * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        })
    })
}

const erase = function (map, ctx) {
    map.forEach(function (line, layer) {
        line.forEach(function (locationX) {
            ctx.clearRect(locationX * BLOCK_SIZE, layer * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        })
    })
}

const drawLineClear = function (...layers) {
    const DELAY = 200;
    let start = start || 0;
    let count = count || 0;
    const animate = function(timestamp) {
        if (start - timestamp > DELAY) {
            layers.forEach(function (layer) {   
                let line = gameBoard.stack.get(layer);
                mainCtx.clearRect((line.length/2 - count) * blockSize, layer * blockSize, blockSize, blockSize);
                mainCtx.clearRect((line.length/2 + 1 + count) * blockSize, layer * blockSize, blockSize, blockSize);
                count++;
                start = timestamp;
            })
        }
    }
    if (count === GAMEBOARD_WIDTH) return;
    requestAnimationFrame(animate)
}

const drawScore = function () {
    const score = score.toString();
    scoreCtx.font = '48px serif'
    scoreCtx.fillText(score, BASE_LOCATION[0], BASE_LOCATION[0])
}

const showNextBlocks = function () {
    let interval = 0;
    const queue = nextBlocks.getQueue();
    queue.forEach(function (nextBlock) {
        nextBlock.baseShape.forEach(function (point) {
            let x = BASE_LOCATION[0] + point[0];
            let y = BASE_LOCATION[1] + point[1] + interval;
            nextBlocksCtx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        })
        interval += 4;
    });
}