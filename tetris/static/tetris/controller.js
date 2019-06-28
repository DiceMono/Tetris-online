class Current {
    constructor() {
        this._initStack();
        this._initBlockGenerator();
        this._initLevel();
        this._initScore();
        this._resetBlock();
    }
    _initStack() {
        this._stack = new Stack();
    }
    _initBlockGenerator() {
        this._blockGenerator = new BlockGenerator();
    }
    _initLevel() {
        this._level = new Level();
        this._lineClearCount = 0;
    }
    _initScore() {
        this._score = new Score();
    }
    _resetBlock() {
        let block = this._blockGenerator.generate();
        this._block = block;
    }
    _sendNextBlocksDrawEvent() {
        sendEvent('draw', nextBlocksCanvas, this._blockGenerator.getQueue());
    }
    _sendLeveldrawEvent() {
        sendEvent('draw', levelCanvas, this._level.toString());
        sendSocket(this._level.toString(), 'enemy-level');
    }
    _upLevelAndSendDrawEvent() {
        this._level.up();
        this._lineClearCount = this._lineClearCount % LEVEL_PER_LINE_CLEAR_COUNT;
        this._sendLeveldrawEvent();
    }
    _sendScoreDrawEvent() {
        sendEvent('draw', scoreCanvas, this._score.toString());
        sendSocket(this._score.toString(), 'enemy-score');
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
    _addLineClearCount(count) {
        this._lineClearCount += count
    }
    _stackBlock() {
        this._stack.concat(this._block);
    }
    _stackBlockAndSendEraseDrawEvent() {
        let stackBlock = this._stackBlock.bind(this);
        this._sendBlockEraseEvent();
        this._sendStackEraseDrawEventDecorator(stackBlock);
    }
    _clearFullLayersAndSendEraseDrawEvent(fullLayers) {
        let clearFullLayers = this._stack.clearFullLayers.bind(this._stack);
        this._sendStackEraseDrawEventDecorator(clearFullLayers, fullLayers);
    }
    _makeShadow() {
        let shadow = new Block(this._block.entries(), [0, 0], this._block.getColor());
        let stopBlocks = this._stack.getStopBlocks()
        while (!shadow.isConflictWith(stopBlocks)) {
            shadow.moveDown()
        }
        shadow.moveDown(false);
        sendEvent('draw', shadowCanvas, shadow)
    }
    _isLevelUp() {
        if(this._lineClearCount >= LEVEL_PER_LINE_CLEAR_COUNT) return true;
        return false;
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
    _takeOneFrame() {
        this.moveDownAndSendEraseDrawEvent();
        sendSocket(this._block, 'enemy-main');
        if (!this.isConflict()) return;
        this.moveDownAndSendEraseDrawEvent(false);
        sendSocket(this._block, 'enemy-main');
        this._stackBlockAndSendEraseDrawEvent();
        const fullLayers = this._stack.getFullLayers();
        if (fullLayers) {
            this._clearFullLayersAndSendEraseDrawEvent(fullLayers);
            this._score.addLineClearScore(fullLayers.length, this._level);
            this._sendScoreDrawEvent();
            this._addLineClearCount(fullLayers.length);
            if(this._isLevelUp()) this._upLevelAndSendDrawEvent();
        }
        sendSocket(this._stack, 'enemy-stack');
        this._checkGameOver();
        this._resetBlock();
        this._sendBlockDrawEvent();
        this._sendNextBlocksDrawEvent();
    }
    dropBlock() {
        let distance = -1;
        while (!this.isConflict()) {
            this.moveDownAndSendEraseDrawEvent();
            distance++;
        }
        this._score.addDropScore(distance, this._level);
        this._sendScoreDrawEvent();
        this.moveDownAndSendEraseDrawEvent(false);
        this._takeOneFrame();
    }
    _takeFirstFrame() {
        this._sendWallDrawEvent();
        this._sendBlockDrawEvent();
        this._sendNextBlocksDrawEvent();
        this._sendLeveldrawEvent();
        this._sendScoreDrawEvent();
    }
    playGame() {
        let start = 0;
        this._takeFirstFrame();
        const animate = (timestamp) => {
            let delay = this._level.getDelay();
            this._makeShadow();
            if (timestamp - start > delay) {
                this._takeOneFrame();
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

const handleConfilct = (func, movement) => {
    func(movement)
    if (current.isConflict()) func(!movement)
}

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