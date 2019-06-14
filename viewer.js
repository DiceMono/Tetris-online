const mainCanvas = document.getElementById('main');
const mainCtx = mainCanvas.getContext('2d');

const gameBoardCanvas = document.getElementById('gameBoard');
const gmaeBoardCtx = gameBoardCanvas.getContext('2d');

const BLOCK_SIZE = 10;

const BASE_LOCATION = [0, 0];

const draw = function (map, ctx) {
    map.forEach(function (line, layer) {
        line.forEach(function (locationX) {
            ctx.fillRect(locationX * BLOCK_SIZE, layer * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        })
    })
}