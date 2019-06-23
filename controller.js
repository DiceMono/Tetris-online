class Current {
    constructor() {
        this._initStack();
        this._initLevel();
        this._initBlockGenerator();
        this._resetBlock();
    }
    _initStack() {
        this._stack = new Stack();
    }
    _initLevel() {
        this._level = new Level();
    }
    _initBlockGenerator() {
        this._blockGenerator = new BlockGenerator();
    }
    _resetBlock() {
        let block = this._blockGenerator.generate();
        this._block = block;
    }
    _sendBlockEraseEvent() {
        sendEvent('erase', mainCanvas, this._block);
    }
    _sendBlockDrawEvent() {
        sendEvent('draw', mainCanvas, this._block);
    }
    _sendBlockEraseDrawEventClosure(func, ...args) {
        this._sendBlockEraseEvent();
        func(...args);
        this._sendBlockDrawEvent();
    }
    moveDownAndSendEraseDrawEvent(isDown = true) {
        const moveDown = this._block.moveDown.bind(this._block);
        this._sendBlockEraseDrawEventClosure(moveDown, isDown);
    }
    moveSideAndSendEraseDrawEvent(isRight) {
        const moveSide = this._block.moveSide.bind(this._block);
        this._sendBlockEraseDrawEventClosure(moveSide, isRight)
    }
    rotateBlockAndSendEraseDrawEvent(isClockWise) {
        const rotateBlock = this._block.rotate.bind(this._block);
        this._sendBlockEraseDrawEventClosure(rotateBlock, isClockWise);
    }
    _sendWallDrawEvent() {
        sendEvent('draw', stackCanvas, this._stack.getStopBlocks())
    }
    _sendStackEraseEvent() {
        sendEvent('erase', stackCanvas, this._stack);
    }
    _sendStackDrawEvent() {
        sendEvent('draw', stackCanvas, this._stack);
    }
    _sendStackEraseDrawEventDecorator(func, ...args) {
        this._sendStackEraseEvent();
        func(...args);
        this._sendStackDrawEvent();
    }
    _stackBlock() {
        this._stack.concat(this._block);
    }
    _stackBlockAndSendEraseDrawEvent() {
        let stackBlock = this._stackBlock.bind(this);
        this._sendBlockEraseEvent();
        this._sendStackEraseDrawEventDecorator(stackBlock);
    }
    _cleartFullLayersAndSendEraseDrawEvent() {
        let clearFullLayers = this._stack.clearFullLayers.bind(this._stack);
        this._sendStackEraseDrawEventDecorator(clearFullLayers);
    }
    isConflict() {
        let stopBlocks = this._stack.getStopBlocks()
        if (this._block.isConflictWith(stopBlocks)) return true;
        return false;
    }
    _isGameOver() {
        return this._stack.isConflictWith(new Map([[0, [0,5]]]));
    }
    _checkGameOver() {
        if(this._isGameOver()) {alert('Game Over');
        throw new Error('showtime')}
    }
    takeOneFrame() {
        this.moveDownAndSendEraseDrawEvent();
        if (!this.isConflict()) return;
        this.moveDownAndSendEraseDrawEvent(false);
        this._stackBlockAndSendEraseDrawEvent();
        this._cleartFullLayersAndSendEraseDrawEvent();
        this._resetBlock();
        this._checkGameOver();
    }
    dropBlock() {
        while (!this.isConflict()) this.moveDownAndSendEraseDrawEvent();
        this.moveDownAndSendEraseDrawEvent(false);
        this.takeOneFrame();
    }
    _takeFirstFrame() {
        this._sendWallDrawEvent();
        this._sendBlockDrawEvent();
    }
    playGame() {
        let start = 0;
        let delay = 500;
        this._takeFirstFrame();
        const animate = (timestamp) => {
            if (timestamp - start > delay) {
                this.takeOneFrame();
                start = timestamp
            }
            requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
    }
}

const KEYCODE_RIGHT = 39;
const KEYCODE_LEFT = 37;
const KEYCODE_CLOCKWISE = 65;
const KEYCODE_COUNTERCLOCKWISE = 83;
const KEYCODE_DOWN = 40;
const KEYCODE_DROP = 32;

window.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
        case KEYCODE_RIGHT: handleConfilct(current.moveSideAndSendEraseDrawEvent.bind(current), true);
        break;  
        case KEYCODE_LEFT: handleConfilct(current.moveSideAndSendEraseDrawEvent.bind(current), false);
        break;      
        case KEYCODE_CLOCKWISE: handleConfilct(current.rotateBlockAndSendEraseDrawEvent.bind(current), true);
        break;
        case KEYCODE_COUNTERCLOCKWISE: handleConfilct(current.rotateBlockAndSendEraseDrawEvent.bind(current), false);
        break;
        case KEYCODE_DOWN: handleConfilct(current.moveDownAndSendEraseDrawEvent.bind(current), true);
        break;
        case KEYCODE_DROP: current.dropBlock();
    }
});