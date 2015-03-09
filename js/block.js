//==============================================================================
// Author: Nergal
// Date: 2014-11-17
//==============================================================================

function Block() {
    this.active = false;
    this.drawnLeftSide = false; // Mark if it's drawn by different block
    this.drawnTopSide = false;
    this.drawnFrontSide = false;
    this.drawnRightSide = false;
    this.drawnBottomSide = false;
    this.alpha = 0;
    this.r = 0;
    this.g = 0;
    this.b = 0;

    Block.prototype.Create = function(isActive, r, g, b, alpha) {
        this.active = isActive;
        this.alpha = alpha;
        this.r = r;
        this.g = g;
        this.b = b;
    };

    Block.prototype.setActive = function(value) {
        this.active = value;
    };

    Block.prototype.isActive = function() {
        return this.active;
    };
}
Block.prototype = new Block();
Block.prototype.constructor = Block;
