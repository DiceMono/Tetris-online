const mainCanvas = document.getElementById('main');
const mainCtx = mainCanvas.getContext('2d');
mainCanvas.ctx = mainCtx;

const stackCanvas = document.getElementById('stack');
const stackCtx = stackCanvas.getContext('2d');
stackCanvas.ctx = stackCtx;

const nextBlocksCanvas = document.getElementById('next-blocks');
const nextBlocksCtx = nextBlocksCanvas.getContext('2d');
nextBlocksCanvas.ctx = nextBlocksCtx;

const levelCanvas = document.getElementById('level');
const levelCtx = levelCanvas.getContext('2d');
levelCanvas.ctx = levelCtx;

const scoreCanvas = document.getElementById('score');
const scoreCtx = scoreCanvas.getContext('2d');
scoreCanvas.ctx = scoreCtx;

const BLOCK_SIZE = 15;
const START_POINT = [-4, 0]

const resetCanvas = (canvas) => {
    canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
}
const drawPoint = (point, ctx, color) => {
    ctx.fillStyle = color;
    point.forEach(function (line, y) {
        line.forEach(function (x) {
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        });
    });
}
const erasePoint = (point, ctx) => {
    point.forEach(function (line, y) {
        line.forEach(function (x) {
            ctx.clearRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        })
    })
}
const drawNextBlocks = (blocks, ctx) => {
    let count = 0;
    blocks.forEach((block) => {
        block = block.copy();
        block.move(START_POINT[0], START_POINT[1]);
        for (let i = 0; i < count; i++) {
            block.move(5, 0)
        }
        const color = block.getColor();
        drawPoint(block, ctx, color);
        count++
    });
}
const drawText = (text, ctx) => {
    ctx.font = '50px serif';
    ctx.fillText(text, 0, 50);
}


mainCanvas.addEventListener('draw', (e) => {
    const point = e.detail.object;
    const color = point.getColor();
    const ctx = e.target.ctx;
    drawPoint(point, ctx, color);
});
mainCanvas.addEventListener('erase', (e) => {
    const point = e.detail.object;
    const ctx = e.target.ctx;
    erasePoint(point, ctx);
})
stackCanvas.addEventListener('draw', (e) => {
    const point = e.detail.object;
    const ctx = e.target.ctx;
    drawPoint(point, ctx);
})
stackCanvas.addEventListener('erase', (e) => {
    const point = e.detail.object;
    const ctx = e.target.ctx;
    erasePoint(point, ctx);
})
nextBlocksCanvas.addEventListener('draw', (e) => {
    const blocks = e.detail.object;
    const canvas = e.target;
    const ctx = canvas.ctx;
    resetCanvas(canvas);
    drawNextBlocks(blocks, ctx);
})
levelCanvas.addEventListener('draw', (e) => {
    console.log('level');
    const level = e.detail.object;
    const canvas = e.target;
    const ctx = canvas.ctx;
    resetCanvas(canvas);
    drawText(level, ctx);
})
scoreCanvas.addEventListener('draw', (e) => {
    console.log('score');
    const score = e.detail.object;
    const canvas = e.target;
    const ctx = canvas.ctx;
    console.log(ctx)
    resetCanvas(canvas);
    drawText(score, ctx);
})

//메서드 배치를 어떤식으로 하는게 좋을까? 목차처럼? 중요도순? 
