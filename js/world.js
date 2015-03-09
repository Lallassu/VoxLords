//==============================================================================
// Author: Nergal
// Date: 2014-11-17
//==============================================================================

function World() {
    this.width = 0;
    this.height = 0;
    this.name = "Unknown";
    this.map = undefined;
    //this.chunkSize = 16;
    this.chunkSize = 16;
    this.chunks = 0;
    this.blocks = 0;
    this.hemiLight = undefined;
    this.dirLight = undefined;
    this.wallHeight = 15;
    this.blockSize = 0.1;
    this.mapWidth = 0;
    this.mapHeight = 0;


    World.prototype.Load = function(filename, wallHeight, blockSize) {
        this.wallHeight = wallHeight;
        this.blockSize = blockSize;
        this.readWorld(filename);
        this.readMap();
    };

    World.prototype.readMap = function() {
        if(this.map == undefined) {
            var that = this;
            setTimeout(function() { that.readMap()}, 500);
            console.log("loading map...");
            return;
        }
        
        game.worldMap = new Array(this.map.length);
        for(var i = 0; i < game.worldMap.length; i++) {
            game.worldMap[i] = new Array();
        }
        this.mapHeight = this.blockSize*this.map.length;
        this.mapWidth = this.blockSize*this.map.length;

        for(var cy = 0; cy < this.map.length; cy+=this.chunkSize) {
            var alpha = 0;
            var total = 0;
            var chunk = new Array();
            for(var cx = 0; cx < this.map.length; cx+=this.chunkSize) {
                var ix = 0;
                for(var x = cx; x < cx+this.chunkSize; x++) {
                    chunk[ix] = new Array();
                    var iy = 0;
                    for (var y = cy; y < cy+this.chunkSize; y++) {
                        if(this.map[x][y] == 0) {
                            alpha++;
                        } else {
                            this.blocks++;
                        }
                        chunk[ix][iy++] = this.map[x][y];
                        total++;
                    }
                    ix++;
                }
                var cSize = this.blockSize;
                if(total != alpha) {
                    var c = new ChunkWorld();
                    c.Create(this.chunkSize, cSize, cx * cSize-this.blockSize/2, cy * cSize-this.blockSize/2, chunk, this.wallHeight, this.chunks);
                    game.chunkManager.AddWorldChunk(c);
                    
                    // Save to world map
                    var z = this.chunks%(this.map.length/this.chunkSize);
                    var x = Math.floor(this.chunks/(this.map.length/this.chunkSize));
                    game.worldMap[x][z] = {'id': this.chunks, 'avgHeight': c.GetAvgHeight()};
                    this.chunks++;
                } else {
                    console.log("=> Skipping invisible chunk.");
                }
            }
        }

    }; 

    World.prototype.readWorld = function(filename) {
        // Read png file binary and get color for each pixel
        // one pixel = one block
        // Read RGBA (alpha is height)
        // 255 = max height
        // a < 50 = floor
        var image = new Image();
        image.src = filename;

        var ctx = document.createElement('canvas').getContext('2d');
        var that = this;
        image.onload = function() {
            ctx.canvas.width  = image.width;
            ctx.canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            that.width = image.width;
            that.height = image.height;
            that.map = new Array();
            var imgData = ctx.getImageData(0, 0, that.width, that.height);

            game.worldMap = new Array();
            for(var y = 0; y < that.height; y++) {
                var pos = y * that.width * 4;
                that.map[y] = new Array();
                game.worldMap[y] = new Array();
                for(var x = 0; x < that.width; x++) {
                    var r = imgData.data[pos++];
                    var g = imgData.data[pos++];
                    var b = imgData.data[pos++];
                    var a = imgData.data[pos++];
                    that.map[y][x] = {'r': r, 'g': g, 'b': b, 'a': a};
                }
            }
            console.log("Read world complete.");
            game.chunkManager.maxChunks = (that.height / that.chunkSize)*(that.height/that.chunkSize);
            
        }
    };
}
World.prototype = new World();
World.prototype.constructor = World;



