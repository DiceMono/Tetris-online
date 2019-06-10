const canvas = document.getElementById('userCanvas');
const ctx = canvas.getContext('2d');

const blockT1 = [[0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]];

const blockT2 = [[0, 1, 0],
                [1, 1, 0],
                [0, 1, 0]];

const blockT3 = [[0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]];

const blockT4 = [[0, 1, 0],
                [0, 1, 1],
                [0, 1, 0]];

const blockJ1 = [[0, 0, 0],
                [1, 1, 1],  
                [0, 0, 1]];

const blockJ2 = [[0, 1, 0],
                [0, 1, 0],
                [1, 1, 0]];

const blockJ3 = [[1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]];

const blockJ4 = [[0, 1, 1],
                [0, 1, 0],
                [0, 1, 0]];

const blockZ1 = [[0, 0, 0],
                [1, 1, 0],
                [0, 1, 1]];

const blockZ2 = [[0, 0, 1],
                [0, 1, 1],
                [0, 1, 0]];

const blockO1 = [[1, 1, 0],
                [1, 1, 0],
                [0, 0, 0]];

const blockS1 = [[0, 0, 0],
                [0, 1, 1],
                [1, 1, 0]];

const blockS2 = [[0, 0, 1],
                [0, 1, 1],
                [0, 1, 0]];

const blockL1 = [[0, 0, 0],
                [1, 1, 1],
                [1, 0, 0]];
                
const blockL2 = [[1, 1, 0],
                [0, 1, 0],
                [0, 1, 0]];

const blockL3 = [[0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]];
                
const blockL4 = [[0, 1, 0],
                [0, 1, 0],
                [0, 1, 1]];

const blockI1 = [[0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 1],                
                [0, 0, 0, 0]];
                
const blockI2 = [[0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0]];


function Block(name, shapes, point, size) {
    this.name = name;
    this.shapes = shapes;
    this.point = point || [1.1];
    this.size = size || 3;
}

const blockT = new Block(name='T', shapes=[blockT1, blockT2, blockT3, blockT4]);
const blockJ = new Block(name='J', shapes=[blockJ1, blockJ2, blockJ3, blockJ4]);
const blockZ = new Block(name='Z', shapes=[blockZ1, blockZ2]);
const blockO = new Block(name='O', shapes=[blockO1]);
const blockS = new Block(name='S', shapes=[blockS1, blockS2]);
const blockL = new Block(name='L', shapes=[blockL1, blockL2, blockL3, blockL4]);
const blockI = new Block(name='I', shapes=[blockI1, blockI2], point=[2,2], size=4);
console.log(blockT.point)

const currentBlock = {
    block: blockT,
    locationX: 3,
    locationY: 0,
    rotation: 5,
    draw: function() {
        ctx.fillStyle = 'rgb(0,150,0)'
        for (let i = 0; i < this.block.size; i++) {
            for (let j = 0; j < this.block.size; j++) {
                if (this.block.shapes[this.rotation % this.block.shapes.length][j][i]) {
                    ctx.fillRect((this.locationX+i) * 20, (this.locationY+j) * 20, 19, 19);
                }
            }
        }
    }
}