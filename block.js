const canvas = document.getElementById('userCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 200;
canvas.height = canvas.width * 2;
const blockSize = 10;
const mapWidth = 10;
const mapHeight = 20;

const mapCtx = document.getElementById('mapCanvas').getContext('2d');

let map = new Array();
for (let i = 0; i < mapHeight; i++) {
    map.push([0, i]);
    map.push([mapWidth + 1, i]);
} 

for (let i = 0; i < mapWidth + 2; i++) {
    map.push([i, mapHeight])
}

for (let i = 0; i < map.length; i++) {
    mapCtx.fillRect(map[i][0]* blockSize, map[i][1]* blockSize, blockSize-1, blockSize-1)
}


const blockTShape = [[0,1], [1,1], [2,1], [1,2]];
const blockJShape = [[0,1], [1,1], [2,1], [2,2]];
const blockZShape = [[0,1], [1,1], [1,2], [2,2]];
const blockOShape = [[0,1], [1,1], [0,2], [1,2]];
const blockSSahpe = [[1,1], [2,1], [0,2], [1,2]];
const blockLShape = [[0,1], [1,1], [2,1], [0,2]];
const blockIShape = [[0,2], [1,2], [2,2], [3,2]];

const current = {
    shape: blockJShape,
    midPoint: 1,
    locationX: 4,
    locationY: -1,
    rotate: function(isClockwise) {
        let sign = isClockwise ? 1 : -1;
        let rotatedShape = new Array(this.shape.length);
        for (let i = 0; i < this.shape.length; i++) {
            let x = -sign * (this.shape[i][1] - this.midPoint) + this.midPoint;
            let y = sign * (this.shape[i][0] - this.midPoint) + this.midPoint;
            rotatedShape[i] = new Array(x, y);
        }
        this.shape = rotatedShape;
    },
    draw: function() {
        ctx.fillStyle = 'rgb(0,150,0)';
        for (let i = 0; i < this.shape.length; i++) {
            ctx.fillRect((this.locationX + this.shape[i][0]) * blockSize, (this.locationY + this.shape[i][1]) * blockSize, blockSize - 1, blockSize -1);
        }
    },
    clear: function() {
        ctx.fillStyle = 'rgb(0,150,0)';
        for (let i = 0; i < this.shape.length; i++) {
            ctx.clearRect((this.locationX + this.shape[i][0]) * blockSize, (this.locationY + this.shape[i][1]) * blockSize, blockSize - 1, blockSize -1);
        }
    },
    isConflict: function() {
        for (let i = 0; i < this.shape.length; i++) {
            console.log(this.locationX + this.shape[i][0], this.locationY + this.shape[i][1])
            if (map.some(mapLocation => mapLocation[0] === this.locationX + this.shape[i][0] && mapLocation[1] === this.locationY + this.shape[i][1])) {
                console.log('conflict!');
                return true;
            }
        }  
    }

}

// keyboard event
window.onkeydown = function(e) {
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
        current.rotate(isClocwise=false);
        if (current.isConflict()) {
            current.rotate(isClockwise=true);
            current.draw();
            return;
        }
        current.draw();
    }
    if (e.keyCode == 83) {
        current.clear();
        current.rotate(isClockwise=true);
        if (current.isConflict()) {
            current.rotate(isClocwise=false);
            current.draw();
            return;
        }
        current.draw();
    }  
}


const delay = 1000;
let start = null;
handler = function(timeStamp) {
    if (!start) {
        start = timeStamp;
    }
    if (timeStamp -  start > delay) {
        current.clear();
        ++current.locationY;
        if (current.isConflict()){
            --current.locationY;
            current.draw();
            return;
        };
        current.draw();
        start = timeStamp
    }


    requestAnimationFrame(handler);
}
current.draw();
requestAnimationFrame(handler);


