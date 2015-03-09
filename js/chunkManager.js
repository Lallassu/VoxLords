//==============================================================================
// Author: Nergal
// Date: 2014-12-23
//==============================================================================

function ChunkManager() {
    this.worldChunks = [];
    this.totalBlocks = 0;
    this.totalChunks = 0;
    this.activeBlocks = 0;
    this.activeTriangles = 0;
    this.updateChunks = [];
    this.maxChunks = 0;

    ChunkManager.prototype.PercentLoaded = function() {
        console.log("TOTAL: "+this.totalChunks + " MAX: "+this.maxChunks);
        
        return Math.round((this.maxChunks/this.totalChunks)*100);
    };

    ChunkManager.prototype.Draw = function (time, delta) {
        if(this.updateChunks.length > 0) {
            var cid = this.updateChunks.pop();
            this.worldChunks[cid].Rebuild();   
        }
    };

    ChunkManager.prototype.Create = function() {

    };

    ChunkManager.prototype.Blood = function(x, z, power) {
        var aChunks = [];
        var aBlocksXZ = [];
        var aBlocksZ = [];

        x = Math.round(x);
        z = Math.round(z);
        var cid = 0;
        var totals = 0;
        var y = this.GetHeight(x,z);
        y = y/game.world.blockSize;
        for(var rx = x+power; rx >= x-power; rx-=game.world.blockSize) {
            for(var rz = z+power; rz >= z-power; rz-=game.world.blockSize) {
                for(var ry = y+power; ry >= y-power; ry-=game.world.blockSize) {
                    if((rx-x)*(rx-x)+(ry-y)*(ry-y)+(rz-z)*(rz-z) <= power*power) {
                        if(Math.random() > 0.7) {
                            // Set random shade to the blocks to look as burnt.
                            cid = this.GetWorldChunkID(rx,rz);
                            if(cid == undefined) { continue; }
                            var pos = this.Translate(rx,rz,cid);

                            var yy = Math.round(ry);
                            if(yy <= 0) {
                                yy = 0;
                            }
                            if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy] != undefined) {
                                if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].active) {
                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r = 111+Math.random()*60;
                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g = 0;
                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b = 0;
                                    aChunks.push(cid);
                                }
                            }
                        }
                    }
                }
            }
        }
        var crebuild = {};
        for(var i = 0; i < aChunks.length; i++) {
            crebuild[aChunks[i].id] = 0;
        }
        for(var c in crebuild) {
            this.updateChunks.push(c);
        }
    };

    ChunkManager.prototype.ExplodeBombSmall = function(x,z) {
        x = Math.round(x);
        z = Math.round(z);
        var y = this.GetHeight(x, z);
        y = Math.round(y/game.world.blockSize);
        var cid = this.GetWorldChunkID(x, z);
        if(cid == undefined) {
            return;
        }
        var pos = this.Translate(x, z, cid);
        if(this.worldChunks[cid.id].blocks[pos.x][pos.z][y] == undefined) {
            return;
        }
        this.worldChunks[cid.id].blocks[pos.x][pos.z][y].setActive(false);
        this.worldChunks[cid.id].Rebuild();

        for(var i = 0; i < 6; i++) {
            var block = game.physBlockPool.Get();
            if(block != undefined) {
                block.Create(x,y/2,z,
                             this.worldChunks[cid.id].blockSize/2,
                             this.worldChunks[cid.id].blocks[pos.x][pos.z][y].r,
                             this.worldChunks[cid.id].blocks[pos.x][pos.z][y].g,
                             this.worldChunks[cid.id].blocks[pos.x][pos.z][y].b,
                             2,
                             Math.random()*180,
                             2);
            }
        }
    
    }

    ChunkManager.prototype.ExplodeBomb = function(x,z, power, blood, iny) {
        // Get all blocks in the explosion.
        // then for each block get chunk and remove the blocks
        // and rebuild the affected chunks.
        var aChunks = [];
        var aBlocksXZ = [];
        var aBlocksY = [];
        x = Math.round(x);
        z = Math.round(z);
        var cid = 0;
        
        var totals = 0;
        var y;
        if(iny == undefined) {
            var y = this.GetHeight(x,z);
            y = Math.round(y/game.world.blockSize);
        } else {
            y = iny;
        }
        var shade = 0.5;
        
        var yy = 0;
        var pos = 0;
        var val = 0;
        var pow = 0;
        var rand = 0;
        var block = undefined;
        for(var rx = x+power; rx >= x-power; rx-=game.world.blockSize) {
            for(var rz = z+power; rz >= z-power; rz-=game.world.blockSize) {
                for(var ry = y+power; ry >= y-power; ry-=game.world.blockSize) {
                    val = (rx-x)*(rx-x)+(ry-y)*(ry-y)+(rz-z)*(rz-z);
                    pow = power*power;
                    if(val <= pow) {
                        cid = this.GetWorldChunkID(rx,rz);
                        if(cid == undefined) { continue; }
                        pos = this.Translate(rx,rz,cid);
                        if(ry <= 0) {
                            yy = 0;
                        } else {
                            yy = Math.round(ry);
                        }
                        if(this.worldChunks[cid.id].blocks[pos.x] == undefined) {
                            continue;
                        }
                        if(this.worldChunks[cid.id].blocks[pos.x][pos.z] == undefined) {
                            continue;
                        }

                        if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy] != undefined) {
                            if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].isActive()) {
                                aBlocksXZ.push(pos);
                                aChunks.push(cid);
                                aBlocksY.push(yy);
                                totals++;
                                if(Math.random() > 0.95) {
                                    // Create PhysBlock
                                    block = game.physBlockPool.Get();
                                    if(block != undefined) {
                                        block.Create(rx,yy,rz,
                                                 this.worldChunks[cid.id].blockSize,
                                                 this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r,
                                                 this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g,
                                                 this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b,
                                                 3,
                                                 Math.random()*180,
                                                 power);
                                    }
                                }
                            } else {
                                //console.log("NO ACTIVE CID: "+cid.id+ " X: "+pos.z + " Z: "+pos.z + " Y: "+yy);
                            }
                        }
                    } else if(val <= pow*1.2 && val >= pow) {
                        // Set random shade to the blocks to look as burnt.
                        cid = this.GetWorldChunkID(rx,rz);
                        if(cid == undefined) {
                            continue; 
                        }
                        pos = this.Translate(rx,rz,cid);

                        yy = Math.round(ry);
                        if(yy <= 0) {
                            yy = 0;
                        }
                        if(pos == undefined) {
                            continue;
                        }
                        if(this.worldChunks[cid.id].blocks[pos.x] == undefined) {
                            continue;
                        }
                        if(this.worldChunks[cid.id].blocks[pos.x][pos.z] == undefined) {
                            continue;
                        }
                        if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy] != undefined) {
                            if(this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].isActive()) {
                                if(blood) {
                                    rand = Math.random()*60;
                                    if(rand > 20) {
                                        aBlocksXZ.push(pos);
                                        aChunks.push(cid);
                                        aBlocksY.push(yy);
                                        this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r = 111+rand;
                                        this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g = 0;
                                        this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b = 0;
                                    }
                                } else {
                                    aBlocksXZ.push(pos);
                                    aChunks.push(cid);
                                    aBlocksY.push(yy);
                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].r *= shade;
                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].g *= shade;
                                    this.worldChunks[cid.id].blocks[pos.x][pos.z][yy].b *= shade;
                                }
                            }
                        }
                    }
                }
            }
        }

       // Deactivate all and rebuild chunks
        var crebuild = {};
        for(var i = 0; i < aChunks.length; i++) {
            this.worldChunks[aChunks[i].id].blocks[aBlocksXZ[i].x][aBlocksXZ[i].z][aBlocksY[i]].setActive(false);
            // Check if on border
            if(aBlocksXZ[i].x == this.worldChunks[aChunks[i].id].chunkSizeX-1) {
                crebuild[aChunks[i].id+1] = 0;
            } else if(aBlocksXZ[i].x == 0) {
                crebuild[aChunks[i].id-1] = 0;
            }
            
            if(aBlocksXZ[i].z == this.worldChunks[aChunks[i].id].chunkSizeZ-1) {

            } else if(aBlocksXZ[i].z == 0) {

            }

            if(aBlocksY[i] == this.worldChunks[aChunks[i].id].chunkSizeY-1) {
                crebuild[aChunks[i].id + Math.sqrt(game.world.map.length)] = 0;
            } else if(aBlocksY[i] == 0) {
                crebuild[aChunks[i].id - Math.sqrt(game.world.map.length)] = 0;
            }

            crebuild[aChunks[i].id] = 0;
        }
        for(var c in crebuild) {
            this.updateChunks.push(c);
        }
    };

    ChunkManager.prototype.AddWorldChunk = function(chunk) {
       this.totalChunks++;
       this.totalBlocks += (chunk.blocks.length*chunk.blocks.length*chunk.blocks.length);
       this.activeBlocks += chunk.NoOfActiveBlocks();
       this.worldChunks.push(chunk); 
    };

    ChunkManager.prototype.BuildAllChunks = function() {
        for(var i = 0; i < this.worldChunks.length; i++) {
            this.worldChunks[i].Rebuild();
            this.activeTriangles += this.worldChunks[i].GetActiveTriangles();
        }
        this.AddTargets();
        console.log("ACTIVE TRIANGLES: "+this.activeTriangles);
        console.log("ACTIVE BLOCKS: "+this.activeBlocks);
    };

    ChunkManager.prototype.AddTargets = function() {
        for(var i = 0; i < this.worldChunks.length; i++) {
            var chunk = this.worldChunks[i];
        }
    };

    ChunkManager.prototype.GetWorldChunkID = function(x,z) {
        if(game.worldMap == undefined) {
            return;
        }
        var mp = game.world.chunkSize*game.world.blockSize;
        var w_x = Math.floor(Math.abs(x)/mp);
        var w_z = Math.floor(Math.abs(z)/mp);
        if(game.worldMap[w_x] == undefined) {
            return;
        }
        if(game.worldMap[w_x][w_z] == undefined) {
            return;
        }
        var cid = game.worldMap[w_x][w_z];
        return cid;
    };

    ChunkManager.prototype.GetChunk = function(x,z) {
        var mp = game.world.chunkSize*game.world.blockSize;
        var w_x = Math.floor(Math.abs(x)/mp);
        var w_z = Math.floor(Math.abs(z)/mp);
        if(game.worldMap[w_x][w_z] == undefined) {
            return; 
        }
        var cid = game.worldMap[w_x][w_z];
        return this.worldChunks[cid.id];
    };

    ChunkManager.prototype.Translate = function(x, z, cid) {
        var x1 = Math.round((z-this.worldChunks[cid.id].posX) / game.world.blockSize);
        var z1 = Math.round((x-this.worldChunks[cid.id].posY) / game.world.blockSize); 
        x1 = Math.abs(x1-1); 
        z1 = Math.abs(z1-1);
        return {x: x1, z: z1};
    };

    ChunkManager.prototype.GetHeight = function(x, z) {
        var cid = this.GetWorldChunkID(x,z);
        if(cid == undefined) {
            return undefined;
        }
        if(this.worldChunks[cid.id] == undefined) {
            return undefined;
        }
        var tmp = this.Translate(x, z, cid);

        var x1 = Math.round(tmp.x);
        var z1 = Math.round(tmp.z);
        if(this.worldChunks[cid.id].blocks[x1] != undefined) {
            if(this.worldChunks[cid.id].blocks[x1][z1] != undefined) {
                var y = this.worldChunks[cid.id].blocks[x1][z1].height*game.world.blockSize;
            }
        }

        if(y > 0) {
            return y;
        } else {
            return 0;
        }
    };

    ChunkManager.prototype.CheckActive = function(x, z, y) {
        var cid = this.GetWorldChunkID(x,z);
        if(cid == undefined) {
            return false;
        }
        var tmp = this.Translate(x, z, cid); //x+1
        var x1 = tmp.x;
        var z1 = tmp.z;
        if(this.worldChunks[cid.id] == undefined || this.worldChunks[cid.id].blocks[x1][z1][y] == undefined) {
            return false;
        } else {
            this.worldChunks[cid.id].blocks[x1][z1][y].r = 255;
            return !this.worldChunks[cid.id].blocks[x1][z1][y].isActive();
        }
    };

}
