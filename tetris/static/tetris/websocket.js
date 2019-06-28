const roomName = window.location.pathname.split('/')[2];

const tetrisSocket = new WebSocket(
    'ws://' + window.location.host +
    '/ws/tetris/' + roomName + '/');

tetrisSocket.onopen = (e) => {

}
/*
type text or block
value = string or Array
color = color
*/

const sendSocket = (object, canvasId) => {
    const type = typeof object;
    let value = object;
    let color;
    if (type === 'object') {
        value = Array.from(object);
        color = object.getColor();
    }
    let form = {
        type: type,
        canvasId: canvasId,
        value: value,
        color: color,
    };
    tetrisSocket.send(JSON.stringify(form));
}


tetrisSocket.onmessage = (e) => {
    let data = JSON.parse(e.data).message;
    const type = data.type;
    const canvas = document.getElementById(data.canvasId);
    const ctx = canvas.ctx;
    let value = data.value;
    resetCanvas(canvas);
    if (type === 'object') {
        const color = data.color;
        value = new Map(value);
        drawPoint(value, ctx, color);
        return;
    };
    drawText(value, ctx)
}






















// const sendImgURLs = () => {
//     const imgURLs = [];
//     for (let canvas of canvasCollection) {
//         let imgURL = canvas.toDataURL("image/jpeg", 0.5);
//         imgURLs.push(imgURL);
//     }
//     tetrisSocket.send(JSON.stringify(imgURLs));}
// }

// const enemyCanvases = document.getElementsByClassName('enemy');
// const enemyCtxes = [];
// (function () {
//     for (let enemyCanvas of enemyCanvases) {
//         const ctx = enemyCanvas.getContext('2d');
//         enemyCtxes.push(ctx);
//     }
// }())
// tetrisSocket.onmessage = function (e) {
//     const data = JSON.parse(e.data);
//     console.log(data['message']);

// }