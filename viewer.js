const mainCanvas = document.getElementById('main');
const mainCtx = mainCanvas.getContext('2d');
mainCanvas.ctx = mainCtx;

const stackCanvas = document.getElementById('stack');
const stackCtx = stackCanvas.getContext('2d');
stackCanvas.ctx = stackCtx;

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
//메서드 배치를 어떤식으로 하는게 좋을까? 목차처럼? 중요도순? 
