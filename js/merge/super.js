//==============================================================================
// Author: Nergal
// Date: 2014-11-17
//==============================================================================

function Block() {
    this.active = false;
    this.color = '0xFFFFFF';
    this.alpha = 0;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.wallHeight = 0;
    this.height = 0; // current height

    Block.prototype.Create = function(isActive, r, g, b, alpha) {
        this.active = isActive;
        this.alpha = alpha;
        //this.color = rgbToHex(r, g, b);
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

    Block.prototype.getColor= function() {
        return parseInt(this.color);
    };
}
Block.prototype = new Block();
Block.prototype.constructor = Block;
//==============================================================================
// Author: Nergal
// Date: 2014-11-17
//==============================================================================

function Chunk() {
    this.blockSize = 0.1;
    this.chunkSize = 4;
    this.chunkSizeX = 0;
    this.chunkSizeY = 0;
    this.chunkSizeZ = 0;
    this.posX = 0;
    this.posY = 0;
    this.posZ = 0;
    this.life = 1;
    this.type = "GenericChunk";
    this.activeBlocks = 0;
    this.mesh = undefined;
    this.blocks = undefined;

    this.explodeArray = [];
    this.explode = false;
    this.explodeDelta = 0;
    this.explodeSpeed = 0.1;

    this.avgHeight = 0;

    this.box = {maxx: 0, minx: 0, maxz: 0, minz: 0};

    this.remove = 0;

    Chunk.prototype.GetAvgHeight = function() {
        return this.avgHeight;
    };

    Chunk.prototype.GetBoundingBox = function() {
        var minx = this.posX;
        var maxx = this.posX + (this.chunkSizeX*this.blockSize/2);
        var miny = this.posY;
        var maxy = this.posY + (this.chunkSizeY*this.blockSize/2);
        
        // y is actually Z when rotated.
        this.box = {'minx': minx, 'maxx': maxx, 
                    'minz': miny, 'maxz': maxy};
    };

    Chunk.prototype.Explode = function() {

        // For each block create array with color etc and create a particleEngine 
        // with that array. 
        for(var x = 0; x < this.chunkSizeX/2; x++) {
            for(var y = 0; y < this.chunkSizeY/2; y++) {
                for(var z = 0; z < this.chunkSizeZ; z++) {
                    if(this.blocks[x][y][z].isActive() == true) {
                        var b = this.blocks[x][y][z];
                       
                        var m = new THREE.Mesh(
                            new THREE.BoxGeometry(this.blockSize/2, this.blockSize/2, this.blockSize/2),
                            new THREE.MeshBasicMaterial({
                                color: new THREE.Color("rgb("+b.r+","+b.g+","+b.b+")").getHex()
                            })
                        );
                        m.position.set(this.mesh.position.x+x*this.blockSize/4, //+this.mesh.position.x/2+x*this.blockSize/4,
                                       this.mesh.position.z+z*this.blockSize/4, //+this.mesh.position.y/2+y*this.blockSize/4,
                                       this.mesh.position.y+y*this.blockSize/4); // +this.mesh.position.z/2+z*this.blockSize/4);
                        //m.position.set(this.posX+this.mesh.position.x/2+x*this.blockSize/2,
                        //               this.posZ+this.mesh.position.y/2+y*this.blockSize/2,
                        //               this.posY+this.mesh.position.z/2+z*this.blockSize/2);
                        
                        m.dir = {x: (Math.random() * this.explodeSpeed)-(this.explodeSpeed/2),
                                 y: (Math.random() * this.explodeSpeed)-(this.explodeSpeed/2),
                                 z: (Math.random() * this.explodeSpeed)-(this.explodeSpeed/2)};
                        m.life = Math.random()*0.2;
                        
                        game.scene.add(m);
                        this.explodeArray.push(m);
                    }
                }
            }
        }
        this.explode = true;
        game.scene.remove(this.mesh);
        game.objects.push(this);
        
    };

    Chunk.prototype.Draw = function(delta, time) {
        if(this.explode) {
            this.explodeDelta += delta;
            //var gravity = this.explodeDelta/50000;
            if(this.explodeArray.length == 0) {
                this.remove = 1;
            }
            for(var i = 0; i < this.explodeArray.length; i++) {
                if(this.explodeArray[i].life < this.explodeDelta/40000) {
                    game.scene.remove(this.explodeArray[i]);
                    this.explodeArray.splice(i, 1);
                    continue;
                }
                this.explodeArray[i].position.x += this.explodeArray[i].dir.x;
                this.explodeArray[i].position.y += this.explodeArray[i].dir.y;
                this.explodeArray[i].position.z += this.explodeArray[i].dir.z;

                this.explodeArray[i].rotation.x += this.explodeArray[i].dir.x;
                this.explodeArray[i].rotation.y += this.explodeArray[i].dir.y;
                this.explodeArray[i].rotation.z += this.explodeArray[i].dir.z;
            }

        }
    };

    Chunk.prototype.Create = function() {
        
    }; 

    Chunk.prototype.Rebuild = function() {
       // Create mesh for each block and merge them to one geometry
       // Set each color from block + alpha
        //
       if(this.NoOfActiveBlocks() <= 0) {
           console.log("No active blocks.");
            return;
       }
       
       var b = 0;
       var vertices = [];
       var colors = [];

       var drawBlock = false;
       for(var x = 0; x < this.chunkSizeX; x++) {
           for(var y = 0; y < this.chunkSizeY; y++) {
               for(var z = 0; z < this.chunkSizeZ; z++) {
                    if(this.blocks[x][y][z].isActive() == true) {
                        var sides = 0;

                        drawBlock = false;

                        // left side (+X)
                        if(x > 0 ) { // this.chunkSize - 1) {
                            if(!this.blocks[x-1][y][z].isActive()) {
                                drawBlock = true;
                            } 
                        } else {
                                drawBlock = true;
                        }
                        if(drawBlock) {
                            sides++;
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize]);

                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);

                            var shade = 0.8;
                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r*shade,
                                            this.blocks[x][y][z].g*shade,
                                            this.blocks[x][y][z].b*shade,
                                            255]);
                            }
                        }
                        drawBlock = false;



                        // right side (-X)
                        if(x < this.chunkSize - 1) {
                            if(!this.blocks[x+1][y][z].isActive()) {
                                drawBlock = true;
                            }
                        } else {
                            drawBlock = true;
                        }
                         if(drawBlock) {
                                sides++;
                                vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);

                                vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);

                                var shade = 0.8;
                                for(var i = 0; i < 6; i++) {
                                    colors.push([this.blocks[x][y][z].r*shade,
                                                this.blocks[x][y][z].g*shade,
                                                this.blocks[x][y][z].b*shade,
                                                255]);
                                }
                         }


                         // Back side (-Z)   
                         if(z > 0 ) { //this.chunkSize - 1) {
                             if(!this.blocks[x][z][z-1].isActive()) {
                                 drawBlock = true;
                             }
                         } else {
                             drawBlock = true;
                         }
                         if(drawBlock) {
                             sides++;
                             vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                             vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                             vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);

                             vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                             vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                             vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                             var shade = 0.8;
                             for(var i = 0; i < 6; i++) {
                                 colors.push([this.blocks[x][y][z].r*shade,
                                             this.blocks[x][y][z].g*shade,
                                             this.blocks[x][y][z].b*shade,
                                             255]);
                             }
                         }
                         drawBlock = false;
                        

                        // Front side (+Z)
                        if(z < this.chunkSize - 1 ) {
                            if(!this.blocks[x][y][z+1].isActive()) {
                                drawBlock = true;
                            }
                        } else {
                            drawBlock = true;
                        }
                        if(drawBlock) {
                                sides++;
                                vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);

                                vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);

                                var shade = 0.9;
                                for(var i = 0; i < 6; i++) {
                                    colors.push([this.blocks[x][y][z].r*shade,
                                                this.blocks[x][y][z].g*shade,
                                                this.blocks[x][y][z].b*shade,
                                                255]);
                                }
                        } 
                        drawBlock = false;

                        // top (+Y) 
                        if(y < this.chunkSize - 1) {
                            if(!this.blocks[x][y+1][z].isActive()) {
                                drawBlock = true;
                            }
                        } else {
                            drawBlock = true;
                        }
                        if(drawBlock) {
                            sides++;
                            vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize]);

                            vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);

                            var shade = 0.8;
                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r*shade,
                                            this.blocks[x][y][z].g*shade,
                                            this.blocks[x][y][z].b*shade,
                                            255]);
                            }
                        }
                        drawBlock = false;

                        // Bottom (-Y)
                        if(y > 0 ) { //< this.chunkSize - 1) {
                            if(!this.blocks[x][y-1][z].isActive()) {
                                drawBlock = true;
                            }
                        } else {
                            drawBlock = true;
                        }
                        if(drawBlock) {
                            sides++;
                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);

                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);

                            var shade = 0.8;
                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r*shade,
                                            this.blocks[x][y][z].g*shade,
                                            this.blocks[x][y][z].b*shade,
                                            255]);
                            }
                        }

                        // Add colors0
                        b += 2*sides;
                        /*
                        for(var i = 0; i < 6*sides; i++) {
                            colors.push([this.blocks[x][y][z].r,
                                        this.blocks[x][y][z].g,
                                        this.blocks[x][y][z].b,
                                        255]);
                                        //this.blocks[x][y][z].alpha]);
                        }
                        */
                    }                    
               }
           }
       }
       // Create Object
       //
       var geometry = new THREE.BufferGeometry();
       var v = new THREE.BufferAttribute( new Float32Array( vertices.length * 3), 3 );
       for ( var i = 0; i < vertices.length; i++ ) {
           v.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
          // console.log(i + ", "+ vertices[i][0] + ", "+ vertices[i][1]+ ", "+ vertices[i][2]);
       }
       geometry.addAttribute( 'position', v );

       var c = new THREE.BufferAttribute(new Float32Array( colors.length *4), 4 );
       for ( var i = 0; i < colors.length; i++ ) {
           c.setXYZW( i, colors[i][0]/255, colors[i][1]/255, colors[i][2]/255, colors[i][3]/255);
          // c.setXYZW( i, Math.random(), Math.random(), Math.random(), Math.random() );
       }
       geometry.addAttribute( 'color', c );

       var material = new THREE.RawShaderMaterial( {
           uniforms: {
               time: { type: "f", value: 1.0 }
           },
           vertexShader: document.getElementById( 'vertexShader' ).textContent,
           fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
           //side: THREE.DoubleSide, // TBD: Draw only one side!
           transparent: false,
       } );
       //var material2 = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors});

       var mesh = new THREE.Mesh( geometry, material);
       mesh.rotation.set(Math.PI/2, Math.PI, 0);
       mesh.position.set(0, 0 , 0);
       game.scene.add( mesh );
       mesh.that = this;
       game.targets.push(mesh); // TBD: Should this be here?
       this.mesh = mesh;
       this.GetBoundingBox();
       Log("Model CREATED TRIANGLES: "+b);
    }; 

    Chunk.prototype.Destroy = function() {
        var x = ((this.mesh.pos.getX()-this.posX)/this.blockSize);
        var y = ((this.mesh.pos.getY()-this.posY)/this.blockSize);

        if(x >= 0 && x < this.blocks.length && y >= 0 && y < this.blocks.length) {
            if(this.blocks[x][y][z].isActive()) {
                this.blocks[x][y][z].setActive(false);
                this.Rebuild();
                console.log("Destroy block: "+x + ", "+y+", "+z);
                return true;
            }
        }
        return false;
    };

    Chunk.prototype.getPosY = function(posx, posy) {
        // This is posZ (?)
        //var x = Math.round(this.box.maxx-posx)/(this.blockSize/2);
        //var y = Math.round(this.box.maxz-posy)/(this.blockSize/2);
        var x = Math.round(this.box.maxx-posx)/(this.blockSize);
        var y = Math.round(this.box.maxz-posy)/(this.blockSize);

        x = Math.abs(x);
        y = Math.abs(y);
        if(x >= 0 && x < this.blocks.length && y >= 0 && y < this.blocks[x].length) {
       // console.log("CHUNK X: "+x + " Y: "+y + " Player X: "+posx + " Y: "+posy);
          //  this.mesh.visible = false;
          for(var i = 0; i < this.blocks[x][y].length; i++) {
             this.blocks[x][y][i].r = 255;
             this.blocks[x][y][i].g = 0;
             this.blocks[x][y][i].b = 0;
          }
          this.Rebuild();
           return this.blocks[x][y][0].wallHeight*this.blockSize;
        } else {
            return 0;
        }
    };

    Chunk.prototype.DestroyBlock = function() {

    };

    Chunk.prototype.ActivateBlock = function(x, y, z, color) {
        this.blocks[x][y][z].setActive(true);
        this.blocks[x][y][z].r = color.r;
        this.blocks[x][y][z].g = color.g;
        this.blocks[x][y][z].b = color.b;
        this.blocks[x][y][z].a = color.a;
    };

    Chunk.prototype.Create = function(sizex, sizey, sizez) {        
        this.chunkSizeX = sizex;
        this.chunkSizeY = sizey;
        this.chunkSizeZ = sizez;
        console.log("Create: "+sizex + ", "+sizey + ", "+sizez);
        this.blocks = new Array();
        for(var x = 0; x < sizex; x++) {
            this.blocks[x] = new Array();
            for(var y = 0; y < sizey; y++) {
                this.blocks[x][y] = new Array();
                for(var z = 0; z < sizez; z++) {
                    this.blocks[x][y][z] = new Block();
                    this.blocks[x][y][z].Create(false, 0, 0, 0, 0);
                }
            }
        }
    };

    Chunk.prototype.ActivateAll = function() {

    };

    Chunk.prototype.NoOfActiveBlocks = function() {
        var b = 0;
        if(this.blocks != undefined) {
            for(var x = 0; x < this.chunkSizeX; x++) {
                for(var y = 0; y < this.chunkSizeY; y++) {
                    for(var z = 0; z < this.chunkSizeZ; z++) {
                        if(this.blocks[x][y][z].isActive()) {
                            b++;
                        }
                    }
                }
            }
        }
        return b;
    };
}

// Chunks of other types such as crates/weapons/mob/player

function ChunkWorld() {
    Chunk.call(this);
    this.wallHeight = 1;

    ChunkWorld.prototype.Create = function(chunkSize, blockSize, posX, posY, map, wallHeight) {
        this.chunkSize = chunkSize;
        this.chunkSizeX = chunkSize;
        this.chunkSizeY = chunkSize;
        this.chunkSizeZ = chunkSize;
        this.blockSize = blockSize;
        this.posX = posX;
        this.posY = posY;

        this.blocks = new Array();
        var visible = false;
        for(var x = 0; x < this.chunkSize; x++) {
            this.blocks[x] = new Array();
            for(var y = 0; y < this.chunkSize; y++) {
                this.blocks[x][y] = new Array();
                this.wallHeight = map[x][y].a/wallHeight;
                this.avgHeight += this.wallHeight;
                for(var z = 0; z < this.chunkSize; z++) {
                    visible = false; 

                    if(map[x][y].a > 0  && z <= this.wallHeight) {
                        visible = true;
                    } else {
                        visible = false;
                    }
                    
                    if(map[x][y].a < 255) {
                        //visible = false;
                    }
                    this.blocks[x][y][z] = new Block();
                    this.blocks[x][y][z].Create(visible, map[x][y].r, map[x][y].g, map[x][y].b, map[x][y].a);
                }
                this.blocks[x][y][0].wallHeight = this.wallHeight;
            }
        }
      //  Log("Created new WorldChunk!");
      // Log("Active blocks: "+this.NoOfActiveBlocks() + " TOTAL : "+(this.chunkSize*this.chunkSize*this.chunkSize));
      this.avgHeight = this.avgHeight/(this.chunkSize*this.chunkSize);
    };


    ChunkWorld.prototype.Rebuild = function() {
       // Create mesh for each block and merge them to one geometry
       // Set each color from block + alpha
       if(this.NoOfActiveBlocks() <= 0) {
            return;
       }
       
       var b = 0;
       var vertices = [];
       var colors = [];

       //this.chunkSize = 5;
       //this.blockSize = 10;

       var drawBlock = false;
       for(var x = 0; x < this.chunkSize; x++) {
           for(var y = 0; y < this.chunkSize; y++) {
               var height = 0;
               for(var z = 0; z < this.chunkSize; z++) {
                    if(this.blocks[x][y][z].isActive() == true) {
                        height++;
                        var sides = 0;

                        drawBlock = false;

                        // left side (+X)
                        if(x > 0 ) { // this.chunkSize - 1) {
                            if(!this.blocks[x-1][y][z].isActive()) {
                                drawBlock = true;
                            } 
                        } else {
                                drawBlock = true;
                        }
                        if(drawBlock) {
                            sides++;
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize]);

                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                            var shade = 1.0;
                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r*shade,
                                            this.blocks[x][y][z].g*shade,
                                            this.blocks[x][y][z].b*shade,
                                            255]);
                            }

                        }
                        drawBlock = false;

                        // right side (-X)
                        if(x < this.chunkSize - 1) {
                            if(!this.blocks[x+1][y][z].isActive()) {
                                drawBlock = true;
                            }
                        } else {
                            drawBlock = true;
                        }
                         if(drawBlock) {
                                sides++;
                                vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);

                                vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                                var shade = 0.9;
                                for(var i = 0; i < 6; i++) {
                                    colors.push([this.blocks[x][y][z].r*shade,
                                                this.blocks[x][y][z].g*shade,
                                                this.blocks[x][y][z].b*shade,
                                                255]);
                                }
                         }


                         // Back side (-Z)   
                         if(z > 0 ) { //this.chunkSize - 1) {
                             if(!this.blocks[x][z][z-1].isActive()) {
                                 drawBlock = true;
                             }
                         } else {
                             drawBlock = true;
                         }
                         drawBlock = false; // TBD: Really?
                         if(drawBlock) {
                             sides++;
                             vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                             vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                             vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);

                             vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                             vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                             vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                             var shade = 1.0;
                             for(var i = 0; i < 6; i++) {
                                 colors.push([this.blocks[x][y][z].r*shade,
                                             this.blocks[x][y][z].g*shade,
                                             this.blocks[x][y][z].b*shade,
                                             255]);
                             }
                         }
                         drawBlock = false;
                        

                        // Front side (+Z)
                        if(z < this.chunkSize - 1 ) {
                            if(!this.blocks[x][y][z+1].isActive()) {
                                drawBlock = true;
                            }
                        } else {
                            drawBlock = true;
                        }
                        if(drawBlock) {
                                sides++;
                                vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);

                                vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                                vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                                var shade = 0.95;
                                for(var i = 0; i < 6; i++) {
                                    colors.push([this.blocks[x][y][z].r*shade,
                                                this.blocks[x][y][z].g*shade,
                                                this.blocks[x][y][z].b*shade,
                                                255]);
                                }
                        } 
                        drawBlock = false;

                        // top (+Y) 
                        if(y < this.chunkSize - 1) {
                            if(!this.blocks[x][y+1][z].isActive()) {
                                drawBlock = true;
                            }
                        } else {
                            drawBlock = true;
                        }
                        if(drawBlock) {
                            sides++;
                            vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize]);

                            vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                            var shade = 0.97;
                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r*shade,
                                            this.blocks[x][y][z].g*shade,
                                            this.blocks[x][y][z].b*shade,
                                            255]);
                            }
                        }
                        drawBlock = false;

                        // Bottom (-Y)
                        if(y > 0 ) { //< this.chunkSize - 1) {
                            if(!this.blocks[x][y-1][z].isActive()) {
                                drawBlock = true;
                            }
                        } else {
                            drawBlock = true;
                        }
                        if(drawBlock) {
                            sides++;
                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);

                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            var shade = 1.0;
                            for(var i = 0; i < 6; i++) {
                                colors.push([this.blocks[x][y][z].r*shade,
                                            this.blocks[x][y][z].g*shade,
                                            this.blocks[x][y][z].b*shade,
                                            255]);
                            }
                        }

                        // Add colors0
                        b += 2*sides;
                        /*
                        for(var i = 0; i < 6*sides; i++) {
                            colors.push([this.blocks[x][y][z].r*shade,
                                        this.blocks[x][y][z].g*shade,
                                        this.blocks[x][y][z].b*shade,
                                        255]);
                           //             this.blocks[x][y][z].alpha]);
                        }
                        */
                    }                    
               }
               this.blocks[x][y].height = height;
           }
       }
       // Create Object
       //
       var geometry = new THREE.BufferGeometry();
       var v = new THREE.BufferAttribute( new Float32Array( vertices.length * 3), 3 );
       for ( var i = 0; i < vertices.length; i++ ) {
           v.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
          // console.log(i + ", "+ vertices[i][0] + ", "+ vertices[i][1]+ ", "+ vertices[i][2]);
       }
       geometry.addAttribute( 'position', v );

       var c = new THREE.BufferAttribute(new Float32Array( colors.length *4), 4 );
       for ( var i = 0; i < colors.length; i++ ) {
           c.setXYZW( i, colors[i][0]/255, colors[i][1]/255, colors[i][2]/255, colors[i][3]/255);
       }
       geometry.addAttribute( 'color', c );

       var material = new THREE.RawShaderMaterial( {
           uniforms: {
               time: { type: "f", value: 1.0 }
           },
           vertexShader: document.getElementById( 'vertexShader' ).textContent,
           fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
           //side: THREE.DoubleSide, 
           transparent: true,
       } );

       //var material2 = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors});

       var mesh = new THREE.Mesh( geometry, material );
       //mesh.rotation.set(Math.PI/2, -Math.PI, 0);
       mesh.rotation.set(Math.PI/2, Math.PI, Math.PI/2);
       mesh.position.set(this.posY, 0 , this.posX);
       //mesh.castShadow = true;
       //mesh.receiveShadow = true;
       if(this.mesh != undefined) {
            game.scene.remove(this.mesh);
       }
       game.scene.add( mesh );
       mesh.that = this;
       game.targets.push(mesh); // TBD: Should this be here?
       this.mesh = mesh;
       Log(" Chunk World => CREATED TRIANGLES: "+b);
       this.GetBoundingBox();

    };
}
ChunkWorld.prototype = new Chunk();
ChunkWorld.prototype.constructor = ChunkWorld;


/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-08
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Player base 'class'
/////////////////////////////////////////////////////////////
function Enemies() {
    this.type = "Enemies";
    this.mesh = undefined;
    this.chunk = undefined;
    this.dir = undefined;
    this.explodeSpeed = 0;

    Enemies.prototype.Remove = function(data) {
        scene.remove(this.mesh);
    };

    Enemies.prototype.Remove = function(data) {
        this.chunk.Explode();
        this.Remove();
    };

    Enemies.prototype.Spawn = function(x, y ,z) {
        var that = this;
        var santa = new Vox();
        santa.LoadModel("elf2.vox");
        setTimeout(function() {
            santa.getChunk().Rebuild(); 
          //  setTimeout(function() {
          //      santa.getChunk().Explode();
          //  }, 10000);
            that.chunk = santa.getChunk();
            that.mesh = santa.getMesh();
            that.mesh.position.set(0,(santa.getChunk().chunkSizeY*santa.getChunk().blockSize)/2 - 0.5,0);
            
            //game.camera.rotation.x = Math.min(Math.PI+1, Math.max(Math.PI, game.camera.rotation.x));
            game.objects.push(that);

            setTimeout(function() {
                console.log("Explode!");
                that.chunk.Explode();
            }, 3000+Math.random()*7000);

            that.explodeSpeed = Math.random()*0.5;
            that.dir =
               {x: (Math.random() * that.explodeSpeed)-(that.explodeSpeed/2),
                y: (Math.random() * that.explodeSpeed)-(that.explodeSpeed/2),
                z: (Math.random() * that.explodeSpeed)-(that.explodeSpeed/2)};

            console.log("Enemies loaded...");

        }, 2000);

    };

    Enemies.prototype.Draw = function(time, delta) {
        var rotateAngle = (Math.PI / 1.5) * delta ;
        var moveDistance = 20 * delta;

        this.mesh.position.x += this.dir.x;
        this.mesh.position.z += this.dir.z;

        this.mesh.rotation.z = Math.random()*1;
    };

}
Enemies.prototype = new Enemies();
Enemies.prototype.constructor = Enemies;

//==============================================================================
// Author: Nergal
// Date: 2014-11-17
//==============================================================================
"use strict";

function Game() {
    this.container;
    this.scene;
    this.camera;
    this.renderer;
    this.stats;
    this.clock;
    this.controls;

    // Scene settings
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.view_angle = 45; // 45
    this.aspect = this.screenWidth/this.screenHeight;
    this.near = 0.1;
    this.far = 80;
    this.invMaxFps = 1/60;
    this.frameDelta = 0;
    this.updateEnd = 0;
    this.animId = 0;
    this.spectate = 1;

    // Object arrays
    this.objects = [];
    this.engines = [];
    this.targets = [];

    // Game
    this.world = undefined;
    this.projector = undefined;
    this.rotateY = new THREE.Matrix4().makeRotationY( 0.005 );

    this.worldMap = undefined;

    this.player = undefined;

    //==========================================================
    // InitScene
    //==========================================================
    Game.prototype.initScene = function() {
        this.scene = new THREE.Scene();
        //this.scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0025 );
        this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
        this.scene.add(this.camera);


      //  this.camera.rotation.order = "YXZ";
     //   this.camera.up = new THREE.Vector3(0,1,0);

    };

    //==========================================================
    // Init other stuff
    //==========================================================
    Game.prototype.Init = function() {
        this.clock = new THREE.Clock();
        this.stats = new Stats();
        $('#stats').append(this.stats.domElement);

        this.initScene();
        this.renderer = new THREE.WebGLRenderer( {antialias: true} );
        this.renderer.setSize(this.screenWidth, this.screenHeight);
        //this.renderer.setClearColor(0x6698FF, 1);
        this.renderer.setClearColor(0x000000, 1);

        this.keyboard = new THREEx.KeyboardState();
        this.container = document.getElementById('container');
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        this.projector = new THREE.Projector();
        

        THREEx.WindowResize(this.renderer, this.camera);

        this.renderer.shadowMapEnabled = true;
//        this.renderer.shadowMapType = THREE.PCFSoftShadowMap;

    	this.camera.position.set(0,0,0);

        //this.controls = new THREE.PointerLockControls( this.camera );
        //this.scene.add( this.controls.getObject() );
        //this.controls.enabled = true;
        
        var that = this;
	   // this.camera.setRotateX(this.camera.getRotateX()-10);
       /* 
        var pointerlockchange = function ( event ) {
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
                that.controls.enabled = true;
            } else {
                that.controls.enabled = false;
            }

        }
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

        var element = document.body;
        this.container.addEventListener( 'click', function ( event ) {
            //  element.container.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock();
        });

*/
        // event listener for mosue click
        //$(document).mousedown(this.OnMouseDown.bind(this));
//        document.addEventListener( 'mousemove', this.OnMouseDown.bind(this), false );
        //window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
        // Mouse pointer
 //       $('#container').css( 'cursor', 'url("crosshair2.png"), auto');

//        var b = new Block();
  //      b.Create();
        //


        this.player = new Player();
        this.player.Spawn();

     //   this.projector = new THREE.Projector();

      //  this.soundLoader = new SoundLoader();

        // Add sounds
        /*
           this.soundLoader.Add({file: "sounds/burst.mp3",
name: "burst"});
this.soundLoader.Add({file: "sounds/shot2.mp3",
name: "shoot"});
this.soundLoader.Add({file: "sounds/gameover.wav",
name: "end"});
this.soundLoader.Add({file: "sounds/countdown.mp3",
name: "countdown"});

*/

        this.buildScene();
        this.animate();
    };

    Game.prototype.onWindowResize = function() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    };

    Game.prototype.OnMouseDown = function(event) {
        var mouseButton = event.keyCode || event.which;
        event.preventDefault();
        if(mouseButton === 1){
            console.log("mouse click");
            if(this.world != undefined) {
                //this.world.chunkList[Math.round(Math.random()*this.world.chunkList.length)].Explode();
                var x = (event.clientX  / window.innerWidth ) * 2 - 1 ;
                var y = -( event.clientY / window.innerHeight ) * 2 + 1;
                console.log("CLICK: "+x+", "+y);

                var vector = new THREE.Vector3( x, y, 1 ).unproject(game.camera);
                var ray = new THREE.Raycaster();
                ray.ray.set(game.camera.position, vector.sub(game.camera.position ).normalize());
                var intersects = ray.intersectObjects(game.targets);
                if (intersects.length > 0) {
                    //for(var i=0; i < intersects.length; i++) {
                        console.log(intersects[0].object.that);
                        if(intersects[0].object.that.type == 'GenericChunk') {
                            intersects[0].object.that.Explode();
                        }
                   // }
                }
            }
        }
    };
    
    //==========================================================
    // Build scene
    //==========================================================
    Game.prototype.buildScene = function() {
        var spotLight = new THREE.SpotLight(0xF8D898);
        spotLight.position.set(0,100, 100);
        spotLight.intensity = 1;
        //spotLight.castShadow = true;
       // game.scene.add(spotLight);

        //game.scene.fog = new THREE.Fog( 0x6698FF,  1, 140 );
     //   game.scene.fog = new THREE.Fog( 0xCEECF5,  1, 120 );
        game.scene.fog = new THREE.Fog( 0xFFFFFF,  1, 50 );
	  //  game.scene.fog.color.setHSL( 0.6, 0, 1 );

        /*
        var pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(0, 500, 200);
 
        this.scene.add(pointLight);
*/
        // Load top
        this.world = new World();
        this.world.Load("maps/christmas.png", 25, 0.5);

        // place a box in 0,0,0 to have as landmark
     //   var m = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),
     //                          new THREE.MeshBasicMaterial({color: 0x00FF00}));
     //   m.position.set(0,0,0);
     //   this.scene.add(m);
        

//        var bottom = new World();
//        bottom.Load("maps/bottom1.png", 5);
//       setTimeout(function() {
//            for(var i = 0; i < bottom.chunkList.length; i++) {
//                bottom.chunkList[i].mesh.rotation.z = Math.PI/2;
//                bottom.chunkList[i].mesh.position.y = -0.1;
//            }
//        }, 15000);
       
       this.camera.position.set(0, 15, 80);
        var that = this;
        
//       var model = new Vox();
//        model.LoadModel("cage2.vox");
//        setTimeout(function() {
//            model.getChunk().Rebuild(); 
//            model.getMesh().scale.set(2,2,2);
//            model.getMesh().position.set(5,0.5,-5);
//            game.targets.push(model.getMesh());
//        }, 3000);
//
//        var x = new Array();
//        for(var i = 0; i < 10; i++) {
//            var e = new Enemies();
//            e.Spawn();
//        }
//        

    //    var land = new Plateau();
    //    land.Create(40, 40, 1, 0, 0, 0, 1, this.scene);

       this.TestParticle();
    
    //    var water = new Water();
   //     water.Create(this.scene); 
   //     this.objects.push(water);
    };



    Game.prototype.TestParticle = function() {
        var engine = new ParticleEngine();
    	engine.setValues({
       
            positionStyle    : Type.CUBE,
            positionBase     : new THREE.Vector3( 0, 60, 0 ),
            positionSpread   : new THREE.Vector3( 200, 0, 200 ),

            velocityStyle    : Type.CUBE,
            velocityBase     : new THREE.Vector3( 0, -60, 0 ),
            velocitySpread   : new THREE.Vector3( 50, 20, 50 ), 
            accelerationBase : new THREE.Vector3( 0, 0,0 ),

            angleBase               : 0,
            angleSpread             : 720,
            angleVelocityBase       :  0,
            angleVelocitySpread     : 60,

            sizeTween    : new Tween( [1, 1], [1, 10] ),
            colorBase   : new THREE.Vector3(0.66, 1.0, 0.9), // H,S,L
            opacityTween : new Tween( [2, 3], [0.8, 0] ),

            particlesPerSecond : 420,
            particleDeathAge   : 1.0,		
            emitterDeathAge    : 50,
            dead: 0
          /*
		positionStyle  : Type.SPHERE,
		positionBase   : new THREE.Vector3( 0, 20, 0 ),
		positionRadius : 10,
		
		velocityStyle  : Type.SPHERE,
		speedBase      : 90,
		speedSpread    : 1,
		
		accelerationBase : new THREE.Vector3( 0, -80, 0 ),
		
		
		sizeTween    : new Tween().Create( [0.5, 0.7, 1.3], [5, 10, 0.5] ),
		opacityTween : new Tween().Create( [0.2, 0.7, 2.5], [0.75, 1, 0] ),
		colorTween   : new Tween().Create( [0.4, 0.8, 1.0], [ new THREE.Vector3(0,1,1), new THREE.Vector3(0,1,0.6), new THREE.Vector3(0.8, 1, 0.6) ] ),
		
		particlesPerSecond : 300,
		particleDeathAge   : 2.5,		
		emitterDeathAge    : 0.2
*/

        });

	    engine.initialize();
        this.objects.push(engine);
    };

    //==========================================================
    // Render
    //==========================================================
    Game.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
    };

    //==========================================================
    // Animate
    //==========================================================
    Game.prototype.animate = function() {
        this.animId = requestAnimationFrame(this.animate.bind(this));
        this.render();
        this.update();
    };

    //==========================================================
    // Update
    //==========================================================
    Game.prototype.update = function() {
        var delta = this.clock.getDelta(),
        time = this.clock.getElapsedTime() * 10;

        this.frameDelta += delta;

        while(this.frameDelta >= this.invMaxFps) {
            THREE.AnimationHandler.update(this.invMaxFps);
            for(var i = 0; i < this.objects.length; i++) {
                if(this.objects[i] != undefined) {
                    if(this.objects[i].remove == 1) { 
                        this.objects.splice(i, 1);
                    } else {
                        this.objects[i].Draw(time, this.invMaxFps, i);
                    }
                }
            }
            this.frameDelta -= this.invMaxFps;
            //this.controls.update();
/*
            if(this.player != undefined) { 
                for(var i = 0; i < this.targets.length; i++) {
                    if(this.getDistance(this.targets[i].position, this.player.mesh.position) > 40) {
                       this.targets[i].visible = false;
                    } else {
                        this.targets[i].visible = true;
                    }
                }
            }
*/
            //var vector = new THREE.Vector3( 0, -1, 0 );
            //vector.applyQuaternion( this.camera.quaternion );
//            var vector = this.camera.getWorldDirection();
   //          var vector = this.player.mesh.getWorldDirection();

   //          // Only draw chunks that are in the view of camera
   //          for(var i = 0; i < this.targets.length; i++) {
   //              if(this.targets[i] == undefined && this.targets[i].type == 'Player') { 
   //                  continue;
   //              }
   //              //var box = this.targets[i].box;
   //              var angle = vector.angleTo( this.targets[i].position );
   //              if(angle < 2 ) {
   //                  // TBD: Check if this is far away
   //              console.log(angle);
   //                  this.targets[i].visible = false;
   //              } else {
   //                  this.targets[i].visible = true;
   //              }
   //          }
            if(this.spectate) {
              //  this.camera.position.x = 5-Math.floor(Math.cos(time/10) * 10);
              // 	this.camera.position.z = -2 +Math.floor(Math.sin(time/10) * 10);
             //  	this.camera.position.y = 10; //Math.floor(Math.sin(time/10) * 20);
              	//this.camera.lookAt(this.scene.position);
            }
           
           
//            this.camera.applyMatrix( this.rotateY );
  //          this.camera.updateMatrixWorld( true );
            
        }	
        this.stats.update();
    };

    Game.prototype.getDistance = function(v1, v2) {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        var dz = v1.z - v2.z;
        return Math.sqrt(dx*dx+dy*dy+dz*dz);
    };
}
function Object3D() {
    // THREE.Mesh.apply(this, arguments); inherite from mesh
    this.mesh;
    this.time;

    Object3D.prototype.GetObject = function() {
        return this.mesh;
    };

    Object3D.prototype.Draw = function() {
        //draw object
    };

    Object3D.prototype.AddToScene = function(scene) {
        scene.add(this.mesh);
    };
}

function Plateau() {
    Object3D.call(this);

    Plateau.prototype.Create = function(width, height, depth, x, y, z, scale, scene) {
        var group = new THREE.Object3D();

        var materials = [];
        var side = new THREE.ImageUtils.loadTexture("textures/box_sides_snow.png");
        // side.wrapS = side.wrapT = THREE.RepeatWrapping;
        var sideMat = new THREE.MeshBasicMaterial({
            emissive: 0xAAAAAA,
            color: 0xFFFFFF,
            specular: 0x000000,
            map: side
        });
        materials.push(sideMat);
        materials.push(sideMat);
        materials.push(sideMat);
        materials.push(sideMat);

        var top = new THREE.ImageUtils.loadTexture("textures/box_top_snow.png");
        top.wrapS = top.wrapT = THREE.RepeatWrapping;
        top.repeat.set(1,1);
        materials.push(new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
           // map: top
        }));
        var bottom = new THREE.ImageUtils.loadTexture("textures/box_bottom.png");
        materials.push(new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            map: bottom
        }));

        var cubeGeo = new THREE.BoxGeometry(width,height,depth,1,1,1, materials);

        // rotate texture on sides
        cubeGeo.faceVertexUvs[0][0] = [];
        cubeGeo.faceVertexUvs[0][0].push(new THREE.Vector2(0,1));
        cubeGeo.faceVertexUvs[0][0].push(new THREE.Vector2(1,1));
        cubeGeo.faceVertexUvs[0][0].push(new THREE.Vector2(0,0));
        cubeGeo.faceVertexUvs[0][1] = [];
        cubeGeo.faceVertexUvs[0][1].push(new THREE.Vector2(1,1));
        cubeGeo.faceVertexUvs[0][1].push(new THREE.Vector2(1,0));
        cubeGeo.faceVertexUvs[0][1].push(new THREE.Vector2(0,0));

        cubeGeo.faceVertexUvs[0][2] = [];
        cubeGeo.faceVertexUvs[0][2].push(new THREE.Vector2(1,0));
        cubeGeo.faceVertexUvs[0][2].push(new THREE.Vector2(0,0));
        cubeGeo.faceVertexUvs[0][2].push(new THREE.Vector2(1,1));
        cubeGeo.faceVertexUvs[0][3] = [];
        cubeGeo.faceVertexUvs[0][3].push(new THREE.Vector2(0,0));
        cubeGeo.faceVertexUvs[0][3].push(new THREE.Vector2(0,1));
        cubeGeo.faceVertexUvs[0][3].push(new THREE.Vector2(1,1));

        cubeGeo.faceVertexUvs[0][4] = [];
        cubeGeo.faceVertexUvs[0][4].push(new THREE.Vector2(1,0));
        cubeGeo.faceVertexUvs[0][4].push(new THREE.Vector2(1,1));
        cubeGeo.faceVertexUvs[0][4].push(new THREE.Vector2(0,0));
        cubeGeo.faceVertexUvs[0][5] = [];
        cubeGeo.faceVertexUvs[0][5].push(new THREE.Vector2(0,1));
        cubeGeo.faceVertexUvs[0][5].push(new THREE.Vector2(1,1));
        cubeGeo.faceVertexUvs[0][5].push(new THREE.Vector2(1,0));

        var mesh = new THREE.Mesh(cubeGeo, new THREE.MeshFaceMaterial(materials));

        mesh.rotation.x = - Math.PI/2;
        mesh.position.set( x+(width/20), -0.1, z-(height/20)  );
        mesh.scale.set( scale, scale, scale );
        mesh.receiveShadow = true;
        group.add(mesh);

        // Base of the plateau
        var texture = THREE.ImageUtils.loadTexture( "textures/stone.jpg" );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 2, 2 );
        var base_material = new THREE.MeshBasicMaterial( {color: 0xFFFFFF, map: texture, transparent: false} );
        //    var base = new THREE.CubeGeometry(500,1000,500,10,10,10);
        //    var baseobject = new THREE.Mesh(base, base_material);
        var baseobject = new THREE.Mesh( new THREE.CylinderGeometry( 6, 4 , 15, 10, 5, true ), base_material);
        baseobject.position.set( x, y-depth-7 , z);
        baseobject.scale.set(scale,scale,scale);
        group.add(baseobject);
        this.mesh = group;
        game.scene.add(group);
    };
}
Plateau.prototype = new Object3D();
Plateau.prototype.constructor = Plateau;

/////////////////////////////////////////////////////////////
// Water
/////////////////////////////////////////////////////////////
function Water() {
    Object3D.call(this);
    
    Water.prototype.Create = function(scene) {
    var width = 350;
    var depth = 350;
	var geometry = new THREE.PlaneGeometry( width, depth, 128 - 1, 128 - 1 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
	geometry.dynamic = true;
	
	var i, j, il, jl;
	for ( i = 0, il = geometry.vertices.length; i < il; i ++ ) {
	    geometry.vertices[ i ].y = 0.4 * Math.sin( i/2 );
	}
	
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	
	var texture = THREE.ImageUtils.loadTexture( "textures/water.jpg" );
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 3, 3 );
	
	var material = new THREE.MeshBasicMaterial( { color: 0x00CCFF, map: texture, transparent: false, opacity: 1} );
	
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(0,-10,0);
	//mesh.receiveShadow = true;
	this.mesh = mesh;
	scene.add(this.mesh);
    };

    Water.prototype.Draw = function(time, delta, i) {
	for ( var i = 0, l = this.mesh.geometry.vertices.length; i < l; i ++ ) {
	    this.mesh.geometry.vertices[ i ].y = 0.2 * Math.sin( i / 5 + ( time + i ) / 7 );    
	    this.mesh.geometry.vertices[ i ].y += 0.3 * Math.sin( i / 10 + ( time + i ) / 4 );
	}
	this.mesh.geometry.verticesNeedUpdate = true;
    };
}
Water.prototype = new Object3D();
Water.prototype.constructor = Water;



//==============================================================================
// Author: Nergal
// Date: 2014-12-03
//==============================================================================
function Tween() {
    this.times = [];
    this.values = [];

    Tween.prototype.Create = function(tArr, valArr) {
        this.times = tArr || [];
        this.values = valArr || [];
        return this;
    };

    Tween.prototype.lerp = function(t) {
        var i = 0;
        var n = this.times.length;
        while (i < n && t > this.times[i])  
            i++;
        if (i == 0) return this.values[0];
        if (i == n)	return this.values[n-1];
        var p = (t - this.times[i-1]) / (this.times[i] - this.times[i-1]);
        if (this.values[0] instanceof THREE.Vector3)
            return this.values[i-1].clone().lerp( this.values[i], p );
        else // its a float
            return this.values[i-1] + p * (this.values[i] - this.values[i-1]);
    };

}
Tween.prototype = new Tween();
Tween.prototype.constructor = Tween;

var Type = Object.freeze({ "CUBE":1, "SPHERE":2, "CHUNK":3 });

function Particle() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();

    this.angle = 0;
    this.angleVelocity = 0;
    this.angleAcceleration = 0;

    this.size = 1;
    this.color = new THREE.Color();
    this.opacity = 1.0;

    this.age = 0;
    this.alive = 0;
    this.times = [];
    this.values = [];

    this.sizeTween;
    this.colorTween;
    this.sizeTween; 

    this.color = undefined;
    this.mesh = undefined;

    Particle.prototype.UpdateParticle = function() {
        if(this.size > 0) {
            this.mesh.scale.set(this.size, this.size, this.size);
        }
        this.mesh.rotation.x = this.position.x;      
        this.mesh.rotation.y = this.position.y;      
        this.mesh.rotation.z = this.position.z;      
        this.mesh.rotation.x = this.position.x;      

        this.mesh.position.y = this.position.y;      
        this.mesh.position.z = this.position.z;      
    //    this.mesh.material.color.setHex(this.color.getHex());
    };

    Particle.prototype.Create = function() {
        var geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        var mat = new THREE.MeshBasicMaterial({color: this.color});
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;
        this.mesh.position.z = this.position.z;
        game.scene.add(this.mesh);
    };

    Particle.prototype.Destroy = function() {
        game.scene.remove(this.mesh);
    };

    Particle.prototype.update = function(delta) {
        this.position.add( this.velocity.clone().multiplyScalar(delta) );
        this.velocity.add( this.acceleration.clone().multiplyScalar(delta) );

        this.angle         += this.angleVelocity     * 0.01745329251 * delta;
        this.angleVelocity += this.angleAcceleration * 0.01745329251 * delta;

        this.age += delta;

        if ( this.sizeTween.times.length > 0 )
            this.size = this.sizeTween.lerp( this.age );

        if ( this.colorTween.times.length > 0 )
            {
                var colorHSL = this.colorTween.lerp( this.age );
                this.color = new THREE.Color().setHSL( colorHSL.x, colorHSL.y, colorHSL.z );
            }

            if ( this.opacityTween.times.length > 0 )
                this.opacity = this.opacityTween.lerp( this.age );
    };

    
}
Particle.prototype = new Particle();
Particle.prototype.constructor = Particle;

function ParticleEngine() {
    this.positionBase   = new THREE.Vector3();
	this.positionSpread = new THREE.Vector3();
	this.positionRadius = 0; 

	// cube movement data
	this.velocityBase       = new THREE.Vector3();
	this.velocitySpread     = new THREE.Vector3(); 
	// sphere movement data
	//   direction vector calculated using initial position
	this.speedBase   = 0;
  	this.speedSpread = 0;
	
	this.accelerationBase   = new THREE.Vector3();
	this.accelerationSpread = new THREE.Vector3();	
	
	this.angleBase               = 0;
	this.angleSpread             = 0;
	this.angleVelocityBase       = 0;
	this.angleVelocitySpread     = 0;
	this.angleAccelerationBase   = 0;
	this.angleAccelerationSpread = 0;
	
	this.sizeBase   = 0.0;
	this.sizeSpread = 0.0;
	this.sizeTween  = new Tween().Create();    
			
	// store colors in HSL format in a THREE.Vector3 object
	// http://en.wikipedia.org/wiki/HSL_and_HSV
	this.colorBase   = new THREE.Vector3(0.0, 1.0, 0.5); 
	this.colorSpread = new THREE.Vector3(0.0, 0.0, 0.0);
	this.colorTween  = new Tween().Create();
	
	this.opacityBase   = 1.0;
	this.opacitySpread = 0.0;
	this.opacityTween  = new Tween().Create();

//	this.blendStyle = THREE.NormalBlending; // false;

	this.particleArray = [];
    this.blocks = []; // blocks for chunk 
	this.particlesPerSecond = 100;
	this.particleDeathAge = 1.0;
	
	////////////////////////
	// EMITTER PROPERTIES //
	////////////////////////
	
    this.dead            = 0;
	this.emitterAge      = 0.0;
	this.emitterAlive    = true;
	this.emitterDeathAge = 60; // time (seconds) at which to stop creating particles.
	
	// How many particles could be active at any time?
	this.particleCount = this.particlesPerSecond * Math.min( this.particleDeathAge, this.emitterDeathAge );

    ParticleEngine.prototype.setValues = function(parameters) {
        if ( parameters === undefined ) return;

        // clear any previous tweens that might exist
        this.sizeTween    = new Tween().Create();
        this.colorTween   = new Tween().Create();
        this.opacityTween = new Tween().Create();

        for(var key in parameters) {
            this[ key ] = parameters[ key ];
        }

        // attach tweens to particles
        Particle.prototype.sizeTween    = this.sizeTween;
        Particle.prototype.colorTween   = this.colorTween;
        Particle.prototype.opacityTween = this.opacityTween;	

        // calculate/set derived particle engine values
        this.particleArray = [];
        this.emitterAge      = 0.0;
        this.emitterAlive    = true;
        this.particleCount = this.particlesPerSecond * Math.min( this.particleDeathAge, this.emitterDeathAge );
	 
    };
    ParticleEngine.prototype.randomValue = function(base, spread) {
    	return base + spread * (Math.random() - 0.5);
    };

    ParticleEngine.prototype.randomVector3 = function(base, spread) {
        var rand3 = new THREE.Vector3( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
        return new THREE.Vector3().addVectors( base, new THREE.Vector3().multiplyVectors( spread, rand3 ) );
    };

    ParticleEngine.prototype.createParticle = function(i) {
        var particle;
        if(i >= 0) {
            particle = this.particleArray[i];
        } else {
            particle = new Particle();
        }
        if (this.positionStyle == Type.CUBE)
            particle.position = this.randomVector3( this.positionBase, this.positionSpread ); 
        if (this.positionStyle == Type.SPHERE) {
            var z = 2 * Math.random() - 1;
            var t = 6.2832 * Math.random();
            var r = Math.sqrt( 1 - z*z );
            var vec3 = new THREE.Vector3( r * Math.cos(t), r * Math.sin(t), z );
            particle.position = new THREE.Vector3().addVectors( this.positionBase, vec3.multiplyScalar( this.positionRadius ) );
        } else {
            
        }  
        if ( this.velocityStyle == Type.CUBE ) {
            particle.velocity     = this.randomVector3( this.velocityBase,     this.velocitySpread ); 
        }
        if ( this.velocityStyle == Type.SPHERE ) {
            var direction = new THREE.Vector3().subVectors( particle.position, this.positionBase );
            var speed     = this.randomValue( this.speedBase, this.speedSpread );
            particle.velocity  = direction.normalize().multiplyScalar( speed );
        }
        particle.acceleration = this.randomVector3( this.accelerationBase, this.accelerationSpread ); 

        particle.angle             = this.randomValue( this.angleBase,             this.angleSpread );
        particle.angleVelocity     = this.randomValue( this.angleVelocityBase,     this.angleVelocitySpread );
        particle.angleAcceleration = this.randomValue( this.angleAccelerationBase, this.angleAccelerationSpread );

        particle.size = this.randomValue( this.sizeBase, this.sizeSpread );

        var color = this.randomVector3( this.colorBase, this.colorSpread );
        particle.color = new THREE.Color().setHSL( color.x, color.y, color.z );

        particle.opacity = this.randomValue( this.opacityBase, this.opacitySpread );

        particle.age   = 0;
        particle.alive = 0; // particles initialize as inactive

        if(i >= 0) {
        } else   {
            particle.Create();
        }

        return particle;
    };

    ParticleEngine.prototype.initialize = function() {
        if(this.blocks.length > 0) {
            this.particleCount = this.blocks.length;
            console.log("BLOCKS: "+this.particleCount);
            for(var i = 0; i < this.particleCount; i++) {
                this.particleArray[i] = this.createParticle();
                this.particleArray[i].color = new THREE.Color(
                        "rgb("+this.blocks[i].r+","+
                         this.blocks[i].g+","+
                         this.blocks[i].b+")");
                this.particleArray[i].position = new THREE.Vector3(this.blocks[i].x,
                                                                   this.blocks[i].y,
                                                                   this.blocks[i].z);
            }
        } else {
            for (var i = 0; i < this.particleCount; i++) {
                this.particleArray[i] = this.createParticle();
            }
        }
    }

    ParticleEngine.prototype.Draw = function(time, dt, index) {
        if(this.dead) {
            return;
        }
        dt *= 0.1;

        var recycleIndices = [];

        // update particle data
        for (var i = 0; i < this.particleCount; i++) {
            if ( this.particleArray[i].alive ) {
                this.particleArray[i].update(dt);

                // check if particle should expire
                // could also use: death by size<0 or alpha<0.
                if ( this.particleArray[i].age > this.particleDeathAge ) {
                    this.particleArray[i].alive = 0.0;
                    recycleIndices.push(i);
                }
                this.particleArray[i].UpdateParticle();
            }		
        }

        // check if particle emitter is still running
        if ( !this.emitterAlive ) {
            for(var i = 0; i < this.particleArray.length; i++ ) {
                this.particleArray[i].Destroy();
            }
            this.particleArray.splice(0, this.particleArray.length);
            this.dead = 1;

            return;
        }

        // if no particles have died yet, then there are still particles to activate
        if ( this.emitterAge < this.particleDeathAge ) {
            // determine indices of particles to activate
            var startIndex = Math.round( this.particlesPerSecond * (this.emitterAge +  0) );
            var   endIndex = Math.round( this.particlesPerSecond * (this.emitterAge + dt) );
            if  ( endIndex > this.particleCount ) 
                endIndex = this.particleCount; 

            for (var i = startIndex; i < endIndex; i++)
            this.particleArray[i].alive = 1.0;		
        }

        // if any particles have died while the emitter is still running, we imediately recycle them
        if(this.velocityStyle == Type.CHUNK) {
            for (var j = 0; j < recycleIndices.length; j++) {
                var i = recycleIndices[j];
                this.particleArray[i].Destroy();
                this.particleArray.splice(i, 1);
            }
        } else {
            for (var j = 0; j < recycleIndices.length; j++) {
                var i = recycleIndices[j];
                this.particleArray[i] = this.createParticle(i);
                this.particleArray[i].alive = 1.0; // activate right away
               // this.particleGeometry.vertices[i] = this.particleArray[i].position;
            }
        }

        // stop emitter?
        this.emitterAge += dt;
        if ( this.emitterAge > this.emitterDeathAge )  this.emitterAlive = false;
    };

    ParticleEngine.prototype.destroy = function() {
    };

}
ParticleEngine.prototype = new ParticleEngine();
ParticleEngine.prototype.constructor = ParticleEngine;

//==============================================================================
// Author: Nergal
// Date: 2014-12-03
//==============================================================================

function PhysBlock() {
    this.opacity = 1.0;
    this.color = '0xFFFFFF';

    PhysBlock.prototype.Create = function(size, color, alpha) {

    };

    PhysBlock.prototype.Draw = function(time, delta) {

    };

    PhysBlock.prototype.Break = function(time, delta) {

    };

    PhysBlock.prototype.getColor= function() {
        return parseInt(this.color);
    };
}
PhysBlock.prototype = new PhysBlock();
PhysBlock.prototype.constructor = PhysBlock;
/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-08
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Player base 'class'
/////////////////////////////////////////////////////////////
function Player() {
    this.type = "Player";
    this.health = 100;
    this.mesh = undefined;
    this.jump = 0;
    this.jump_power = 20; 
    this.t_delta = 0;
    this.camera_obj = 0;
    this.attached_camera = 0;
    this.keyboard = undefined;

    Player.prototype.Remove = function(data) {
        scene.remove(this.mesh);
    };

    Player.prototype.Spawn = function(x, y ,z) {
        this.keyboard = new THREEx.KeyboardState();
        var that = this;
        var santa = new Vox();
        santa.LoadModel("santa2.vox");
        setTimeout(function() {
            santa.getChunk().Rebuild(); 
          //  setTimeout(function() {
          //      santa.getChunk().Explode();
          //  }, 10000);
            that.mesh = santa.getMesh();
            that.mesh.position.set(0,(santa.getChunk().chunkSizeY*santa.getChunk().blockSize)/2 - 0.5,0);
            that.AddBindings();
            LockPointer();

            that.camera_obj = new THREE.Object3D(); 
            that.mesh.add(that.camera_obj);
            that.camera_obj.add(game.camera);
            game.camera.position.set(0, 15, 4);
            game.camera.rotation.set(-Math.PI/2, 0, Math.PI);
            
            //game.camera.rotation.x = Math.min(Math.PI+1, Math.max(Math.PI, game.camera.rotation.x));
            that.attached_camera = 1;
            game.objects.push(that);
            console.log("Player loaded...");
            that.mesh.position.set(43, 5.5, 44);

        }, 2000);

    };

    Player.prototype.Draw = function(time, delta) {
        var rotateAngle = (Math.PI / 1.5) * delta ;
        var moveDistance = 10 * delta;
        if ( this.keyboard.pressed("v") ) {
           // game.camera.rotation.set(Math.PI/2, 0, 0);
           // game.camera.position.set(0, -15, 4);
        }
        if ( this.keyboard.pressed("space") ) {
            this.jump = 1;
        }
        if ( this.keyboard.pressed("m") ){
        } 
        if ( this.keyboard.pressed("W") ){
            this.mesh.translateY( -moveDistance );
        }
        if (this.keyboard.pressed("S") ) {
            this.mesh.translateY( moveDistance );
        }
        if ( this.keyboard.pressed("A") ) {
            this.mesh.translateX(moveDistance);
        }
        if ( this.keyboard.pressed("D") ) {
            this.mesh.translateX(-moveDistance);
        }
        /*
        if(this.jump) {
            var y = this.mesh.position.y + 1;
            if(this.mesh.position.y <= y && this.t_delta != 0) {
                this.jump = 0;
                this.t_delta = 0;
               // this.mesh.position.y = y;
            } else {
                this.t_delta += delta;                
                var tmp = (this.jump_power*this.t_delta)+(0.5)*-32.2*(2*this.t_delta*this.t_delta);
                if(this.mesh.position.y < 3) {
                    this.mesh.position.y += tmp;
                } else {
                    this.mesh.position.y -= tmp;
                }
            }
        }
        */
        this.UpdatePos(time);
        //this.mesh.position.y = 5;
    };

    Player.prototype.UpdatePos = function(time) {       
        var mp = game.world.chunkSize*game.world.blockSize;
        var w_x = Math.floor(Math.abs(this.mesh.position.x)/mp);
        var w_z = Math.floor(Math.abs(this.mesh.position.z)/mp);
        if(game.worldMap[w_x][w_z] == undefined) {
            return;
        }
        var cid = game.worldMap[w_x][w_z];
        var x1 = Math.round((this.mesh.position.z-game.world.chunkList[cid.id].posX) / game.world.blockSize);
        var z1 = Math.round((this.mesh.position.x-game.world.chunkList[cid.id].posY) / game.world.blockSize); 
        x1 = Math.abs(x1-1);
        z1 = Math.abs(z1-1);
        if(game.world.chunkList[cid.id] == undefined || game.world.chunkList[cid.id].blocks[x1][z1] == undefined) {
            return;
        }
        var y = game.world.chunkList[cid.id].blocks[x1][z1].height*game.world.blockSize;
        if(y > 0) {
          this.mesh.position.y = y;
        }
    };

    Player.prototype.OnMouseMove = function(jevent) {
        var event = jevent.originalEvent; // jquery convert
        if(this.attached_camera == 1) {
            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX ||0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            var	x = movementX*0.001;
            var	y = movementY*0.001;

            var rotateAngle = (Math.PI / 1.5) * x;
            this.mesh.rotateOnAxis( new THREE.Vector3(0,0,1), -rotateAngle);
            game.camera.rotation.z += y;
            game.camera.rotation.z = Math.min( Math.PI+1, Math.max( Math.PI, game.camera.rotation.x ) );
        }
    };



    Player.prototype.OnMouseUp = function(event) {
        var mouseButton = event.keyCode || event.which;
        if(mouseButton === 1){
            this.mouseDown = 0;
            // TBD: Shoot
                console.log(this.mesh.position);
          //   this.mesh.position.set(0,10,10);
            //game.world.chunkList[1].mesh.visible= false;
        }
    };

    Player.prototype.OnMouseDown = function(event) {
        var mouseButton = event.keyCode || event.which;
        if(mouseButton === 1){ 
            //this.mouseDown = 1;
        }
    };

    Player.prototype.RemoveBindings = function() {
        $(document).unbind('mouseup');
	    $(document).unbind('mousemove');
        $(document).unbind('mousedown');
    };

    Player.prototype.AddBindings = function() {
        $(document).mouseup(this.OnMouseUp.bind(this));
        $(document).mousedown(this.OnMouseDown.bind(this));
	    $(document).mousemove(this.OnMouseMove.bind(this));
    };
}
Player.prototype = new Player();
Player.prototype.constructor = Player;

//==============================================================================
// Author: Nergal
// Date: 2014-06-12
//==============================================================================
function timeStamp() {
  var now = new Date();
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
  time[0] = time[0] || 12;
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
  return date.join("/") + " " + time.join(":");
}

function Log(msg) {

    if(typeof(msg) != 'object') {
        console.log("["+timeStamp()+"] "+msg);
    } else {
        console.log(msg);
    }
}

THREE.PerspectiveCamera.prototype.setRotateX = function( deg ){
    if ( typeof( deg ) == 'number' && parseInt( deg ) == deg ){
        this.rotation.x = deg * ( Math.PI / 180 );
    }
};
THREE.PerspectiveCamera.prototype.setRotateY = function( deg ){
    if ( typeof( deg ) == 'number' && parseInt( deg ) == deg ){
        this.rotation.y = deg * ( Math.PI / 180 );
    }
};
THREE.PerspectiveCamera.prototype.setRotateZ = function( deg ){
    if ( typeof( deg ) == 'number' && parseInt( deg ) == deg ){
        this.rotation.z = deg * ( Math.PI / 180 );
    }
};
THREE.PerspectiveCamera.prototype.getRotateX = function(){
    return Math.round( this.rotation.x * ( 180 / Math.PI ) );
};
THREE.PerspectiveCamera.prototype.getRotateY = function(){
    return Math.round( this.rotation.y * ( 180 / Math.PI ) );
};
THREE.PerspectiveCamera.prototype.getRotateZ = function(){
    return Math.round( this.rotation.z * ( 180 / Math.PI ) );
};


function MsgBoard(msg) {
    $('#msgboard').fadeIn(1000);
    $('#msgboard_msg').html("<font color='#FF0000'>"+msg+"</font>");
    setTimeout(function() { 
	$('#msgboard').fadeOut(1000);
    }, 2000);
}

function ExplodeMesh(obj) {
	obj.attributes = {
	    displacement: {	type: 'v3', value: [] },
	    customColor:  {	type: 'c', value: [] }
	};
	
	obj.uniforms = {
	    time: { type: "f", value: 0.0 }
	};
	
	var shaderMaterial = new THREE.ShaderMaterial( {
	    uniforms: 	obj.uniforms,
	    attributes:     obj.attributes,
	    vertexShader:   document.getElementById( 'vertexshaderExplode' ).textContent,
	    fragmentShader: document.getElementById( 'fragmentshaderExplode' ).textContent,
	    shading: 		THREE.FlatShading,
	    side: 			THREE.DoubleSide
	});
	
    var geometry = obj.mesh.geometry.clone();
//	var geometry = geos[g].geometry.clone();

    assignUVs(geometry);
    geometry.dynamic = true;
    THREE.GeometryUtils.center( geometry );

//    var tessellateModifier = new THREE.TessellateModifier( 1 );
  //  for ( var i = 0; i < 1; i ++ ) {
//	tessellateModifier.modify( geometry );
  //  }
    var explodeModifier = new THREE.ExplodeModifier();
    explodeModifier.modify( geometry );
    
    var vertices = geometry.vertices;
    var colors = obj.attributes.customColor.value;
    var displacement = obj.attributes.displacement.value;
    var nv, v = 0;
    for ( var f = 0; f < geometry.faces.length; f ++ ) {
	var face = geometry.faces[ f ];
	if ( face instanceof THREE.Face3 ) {
	    nv = 3;
	} else {
	    nv = 4;
	}
	var x = 2 * ( 0.5 - Math.random() );
	var y = 2 * ( -0.5 - Math.random() );
	var z = 2 * ( 0.5 - Math.random() );
	for ( var i = 0; i < nv; i ++ ) {
	    colors[ v ] = new THREE.Color(0x00B9EE);
	    displacement[ v ] = new THREE.Vector3();
	    displacement[ v ].set( x, y, z );
	    v += 1;
	}
    }

    mesh = new THREE.Mesh( geometry, shaderMaterial );
    mesh.rotation.set( 0.5, 0.5, 0 );
    mesh.scale.set(obj.mesh.scale.x/2, obj.mesh.scale.y/2, obj.mesh.scale.z/2);
    mesh.doubleSided = true;
    var vector = new THREE.Vector3();
    vector.setFromMatrixPosition(obj.mesh.matrixWorld);
    mesh.position.set(vector.x, vector.y, vector.z);

    game.scene.remove(obj.mesh);
    obj.emesh = mesh;
    

    var thisvector = new THREE.Vector3();
    thisvector.setFromMatrixPosition(obj.fish.matrixWorld);
    obj.fish.rotation.set(Math.PI/2, 0, 0);
    obj.fish.position = thisvector;
    obj.fish.scale.set(0.4,0.4,0.4);
    game.scene.add(obj.fish);

    obj.meshes.push(mesh);
    game.scene.add(mesh);
//    }
}

function assignUVs( geometry ){
    geometry.computeBoundingBox();

    var max     = geometry.boundingBox.max;
    var min     = geometry.boundingBox.min;

    var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    var faces = geometry.faces;

    for (i = 0; i < geometry.faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a];
      var v2 = geometry.vertices[faces[i].b];
      var v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
      ]);

    }

    geometry.uvsNeedUpdate = true;

}

function CreateBoundingBox(obj) {
    var object3D = obj.mesh;
    var box = null;
    object3D.traverse(function (obj3D) {
        var geometry = obj3D.geometry;
        if (geometry === undefined)  {
	    return;
	}
        geometry.computeBoundingBox();
        if (box === null) {
	    box = geometry.boundingBox;
        } else {
	    box.union(geometry.boundingBox);
        }
    });


    var x = box.max.x - box.min.x; 
    var y = box.max.y - box.min.y; 
    var z = box.max.z - box.min.z;

/*
    obj.bsize_x = (x/2)*obj.mesh.scale.x;
    obj.bsize_y = (y/2)*obj.mesh.scale.y;
    obj.bsize_z = (z/2)*obj.mesh.scale.z;
*/
    obj.bbox = box;

    var bcube = new THREE.Mesh( new THREE.BoxGeometry( x, y, z ), 
				new THREE.MeshNormalMaterial({ visible: false, wireframe: true, color: 0xAA3333}) );
    var bboxCenter = box.center();
    bcube.translateX(bboxCenter.x);
    bcube.translateY(bboxCenter.y);
    bcube.translateZ(bboxCenter.z);
    obj.bcube = bcube;
    object3D.add(bcube);

    bcube.that = obj.mesh.that;

    game.targets.push(bcube);
//    return bcube;
}

function rgbToHex(r, g, b) {
    if(r < 0) r = 0;
    if(g < 0) g = 0;
    return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}


function GetWorldYVector(vector) {
    var world = game.terrain.GetNoise();
    var x = Math.round(vector.x/10)+world.length/2;
    var z = Math.round(vector.z/10)+world.length/2;
    var y = 0;
    if(x < world.length-1) {
	if(world[x] != undefined && z < world[x].length-1) {
	    y = world[x][z]*200;
	}
    } else {
	y = 0;
    }
    return y;
}


function GetWorldY(mesh) {
    var world = game.terrain.GetNoise();
    var x = Math.round(mesh.position.x/10)+world.length/2;
    var z = Math.round(mesh.position.z/10)+world.length/2;
    var y = 0;
    if(x < world.length-1) {
	if(world[x] != undefined && z < world[x].length-1) {
	    y = world[x][z]*200;
	}
    } else {
	y = 0;
    }
    return y;
}


function ReleasePointer() {
   var instructions = document.getElementsByTagName("body")[0];
    instructions.removeEventListener( 'click', instrClick);
    keys_enabled = 0;
    document.exitPointerLock = document.exitPointerLock ||
	document.mozExitPointerLock ||
	document.webkitExitPointerLock;
    document.exitPointerLock();

}

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
function LockPointer() {
    var instructions = document.getElementsByTagName("body")[0];
/*
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if ( havePointerLock ) {
	var element = document.body;
	var pointerlockchange = function ( event ) {
	    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
		$('#info').hide();
		$('#scoreboard').hide();
		keys_enabled = 1;
		return;
	    } else {

		if(!$('#helpboard').is(":visible")) {
		    $('#info').show();
		}
		keys_enabled = 0;
	    }
	}
*/
/*
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
*/
	instructions.addEventListener( 'click', instrClick, false);
  //  }
}

function instrClick( event ) {
    var element = document.body;
    keys_enabled = 1;
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    
    if ( /Firefox/i.test( navigator.userAgent ) ) {
	var fullscreenchange = function ( event ) {
	    if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
		
		document.removeEventListener( 'fullscreenchange', fullscreenchange );
		document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
		element.requestPointerLock();
	    }
	}
	
	document.addEventListener( 'fullscreenchange', fullscreenchange, false );
	document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
	
	element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
	element.requestFullscreen();
    } else {
	element.requestPointerLock();
    }
}

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}
//==============================================================================
// Author: Nergal
// http://webgl.nu
// Date: 2014-11-17
//==============================================================================
function VoxelData() {
    this.x;
    this.y;
    this.z;
    this.color;

    VoxelData.prototype.Create = function(buffer, i, subSample) {
        this.x = (subSample? buffer[i] & 0xFF / 2 : buffer[i++] & 0xFF);
        this.y = (subSample? buffer[i] & 0xFF / 2 : buffer[i++] & 0xFF);
        this.z = (subSample? buffer[i] & 0xFF / 2 : buffer[i++] & 0xFF);
        this.color = buffer[i] & 0xFF;
    };
}
VoxelData.prototype = new VoxelData();
VoxelData.prototype.constructor = VoxelData;

function Vox() {
    this.chunk = undefined;

    var voxColors = [0x00000000, 0xffffffff, 0xffccffff, 0xff99ffff, 0xff66ffff, 0xff33ffff, 0xff00ffff, 0xffffccff, 0xffccccff, 0xff99ccff, 0xff66ccff, 0xff33ccff, 0xff00ccff, 0xffff99ff, 0xffcc99ff, 0xff9999ff,
        0xff6699ff, 0xff3399ff, 0xff0099ff, 0xffff66ff, 0xffcc66ff, 0xff9966ff, 0xff6666ff, 0xff3366ff, 0xff0066ff, 0xffff33ff, 0xffcc33ff, 0xff9933ff, 0xff6633ff, 0xff3333ff, 0xff0033ff, 0xffff00ff,
        0xffcc00ff, 0xff9900ff, 0xff6600ff, 0xff3300ff, 0xff0000ff, 0xffffffcc, 0xffccffcc, 0xff99ffcc, 0xff66ffcc, 0xff33ffcc, 0xff00ffcc, 0xffffcccc, 0xffcccccc, 0xff99cccc, 0xff66cccc, 0xff33cccc,
        0xff00cccc, 0xffff99cc, 0xffcc99cc, 0xff9999cc, 0xff6699cc, 0xff3399cc, 0xff0099cc, 0xffff66cc, 0xffcc66cc, 0xff9966cc, 0xff6666cc, 0xff3366cc, 0xff0066cc, 0xffff33cc, 0xffcc33cc, 0xff9933cc,
        0xff6633cc, 0xff3333cc, 0xff0033cc, 0xffff00cc, 0xffcc00cc, 0xff9900cc, 0xff6600cc, 0xff3300cc, 0xff0000cc, 0xffffff99, 0xffccff99, 0xff99ff99, 0xff66ff99, 0xff33ff99, 0xff00ff99, 0xffffcc99,
        0xffcccc99, 0xff99cc99, 0xff66cc99, 0xff33cc99, 0xff00cc99, 0xffff9999, 0xffcc9999, 0xff999999, 0xff669999, 0xff339999, 0xff009999, 0xffff6699, 0xffcc6699, 0xff996699, 0xff666699, 0xff336699,
        0xff006699, 0xffff3399, 0xffcc3399, 0xff993399, 0xff663399, 0xff333399, 0xff003399, 0xffff0099, 0xffcc0099, 0xff990099, 0xff660099, 0xff330099, 0xff000099, 0xffffff66, 0xffccff66, 0xff99ff66,
        0xff66ff66, 0xff33ff66, 0xff00ff66, 0xffffcc66, 0xffcccc66, 0xff99cc66, 0xff66cc66, 0xff33cc66, 0xff00cc66, 0xffff9966, 0xffcc9966, 0xff999966, 0xff669966, 0xff339966, 0xff009966, 0xffff6666,
        0xffcc6666, 0xff996666, 0xff666666, 0xff336666, 0xff006666, 0xffff3366, 0xffcc3366, 0xff993366, 0xff663366, 0xff333366, 0xff003366, 0xffff0066, 0xffcc0066, 0xff990066, 0xff660066, 0xff330066,
        0xff000066, 0xffffff33, 0xffccff33, 0xff99ff33, 0xff66ff33, 0xff33ff33, 0xff00ff33, 0xffffcc33, 0xffcccc33, 0xff99cc33, 0xff66cc33, 0xff33cc33, 0xff00cc33, 0xffff9933, 0xffcc9933, 0xff999933,
        0xff669933, 0xff339933, 0xff009933, 0xffff6633, 0xffcc6633, 0xff996633, 0xff666633, 0xff336633, 0xff006633, 0xffff3333, 0xffcc3333, 0xff993333, 0xff663333, 0xff333333, 0xff003333, 0xffff0033,
        0xffcc0033, 0xff990033, 0xff660033, 0xff330033, 0xff000033, 0xffffff00, 0xffccff00, 0xff99ff00, 0xff66ff00, 0xff33ff00, 0xff00ff00, 0xffffcc00, 0xffcccc00, 0xff99cc00, 0xff66cc00, 0xff33cc00,
        0xff00cc00, 0xffff9900, 0xffcc9900, 0xff999900, 0xff669900, 0xff339900, 0xff009900, 0xffff6600, 0xffcc6600, 0xff996600, 0xff666600, 0xff336600, 0xff006600, 0xffff3300, 0xffcc3300, 0xff993300,
        0xff663300, 0xff333300, 0xff003300, 0xffff0000, 0xffcc0000, 0xff990000, 0xff660000, 0xff330000, 0xff0000ee, 0xff0000dd, 0xff0000bb, 0xff0000aa, 0xff000088, 0xff000077, 0xff000055, 0xff000044,
        0xff000022, 0xff000011, 0xff00ee00, 0xff00dd00, 0xff00bb00, 0xff00aa00, 0xff008800, 0xff007700, 0xff005500, 0xff004400, 0xff002200, 0xff001100, 0xffee0000, 0xffdd0000, 0xffbb0000, 0xffaa0000,
        0xff880000, 0xff770000, 0xff550000, 0xff440000, 0xff220000, 0xff110000, 0xffeeeeee, 0xffdddddd, 0xffbbbbbb, 0xffaaaaaa, 0xff888888, 0xff777777, 0xff555555, 0xff444444, 0xff222222, 0xff111111];


    Vox.prototype.getChunk = function() {
        return this.chunk;
    };

    Vox.prototype.getMesh = function() {
        return this.chunk.mesh;
    };

    Vox.prototype.readInt = function(buffer, from) {
        return buffer[from]| (buffer[from+1] << 8) |  (buffer[from+2] << 16) | (buffer[from+3] << 24);
    };

    Vox.prototype.LoadModel = function(filename) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", "models/"+filename, true);
        oReq.responseType = "arraybuffer";

        var that = this;
        oReq.onload = function (oEvent) {
            var colors = [];
            var colors2 = undefined;
            var voxelData = [];
            that.chunk = new Chunk();

            console.log("Loaded model: "+oReq.responseURL);
            var arrayBuffer = oReq.response;
            if (arrayBuffer) {
                var buffer = new Uint8Array(arrayBuffer);
                var voxId = that.readInt(buffer, 0);
                var version = that.readInt(buffer, 4);
                // TBD: Check version to support
                var i = 8;
                while(i < buffer.length) {
                    var subSample = false;
                    var sizex = 0, sizey = 0, sizez = 0;
                    var id = String.fromCharCode(parseInt(buffer[i++]))+
                             String.fromCharCode(parseInt(buffer[i++]))+
                             String.fromCharCode(parseInt(buffer[i++]))+
                             String.fromCharCode(parseInt(buffer[i++]));

                    var chunkSize = that.readInt(buffer, i) & 0xFF;
                    i += 4;
                    var childChunks = that.readInt(buffer, i) & 0xFF;
                    i += 4;

                    if(id == "SIZE") {
                        sizex = that.readInt(buffer, i) & 0xFF;
                        i += 4;
                        sizey = that.readInt(buffer, i) & 0xFF;
                        i += 4;
                        sizez = that.readInt(buffer, i) & 0xFF;
                        i += 4;
                        if (sizex > 32 || sizey > 32) {
                            subSample = true;
                        }
                        console.log(filename + " => Create VOX Chunk!");
                        that.chunk.Create(sizex, sizey, sizez);
                        i += chunkSize - 4 * 3;
                    } else if (id == "XYZI") {
                        var numVoxels = Math.abs(that.readInt(buffer, i));
                        i += 4;
                        voxelData = new Array(numVoxels);
                        for (var n = 0; n < voxelData.length; n++) {;
                            voxelData[n] = new VoxelData();
                            voxelData[n].Create(buffer, i, subSample); // Read 4 bytes
                            i += 4;
                        }
                    } else if (id == "RGBA") {
                        console.log(filename + " => Regular color chunk");
                        //colors = new Array[256];
                        colors2 = new Array(256);
                        for (var n = 0; n < 256; n++) {
                            var r = buffer[i++] & 0xFF;
                            var g = buffer[i++] & 0xFF;
                            var b = buffer[i++] & 0xFF;
                            var a = buffer[i++] & 0xFF;
                            // System.out.println("Create new color: R: "+r + " G: "+g + " B: "+b);
                            colors2[n] = {'r': r, 'g': g, 'b': b, 'a': a};
                            //colors[n] = (short) (((r & 0x1f) << 10) | ((g & 0x1f) << 5) | (b & 0x1f));
                        }
                    } else {
                        i += chunkSize;
                    }
                }
                if (voxelData == null || voxelData.length == 0) {
                    return null;
                }

                for (var n = 0; n < voxelData.length; n++) {
                    if(colors2 == undefined) {
                        var c = voxColors[Math.abs(voxelData[n].color-1)];
                        var cRGBA = {
                            b: (c & 0xff0000) >> 16, 
                            g: (c & 0x00ff00) >> 8, 
                            r: (c & 0x0000ff),
                            a: 1
                        };
                        that.chunk.ActivateBlock(voxelData[n].x, voxelData[n].y, voxelData[n].z, cRGBA);
                    } else {
                        that.chunk.ActivateBlock(voxelData[n].x, voxelData[n].y, voxelData[n].z, colors2[Math.abs(voxelData[n].color-1)]);
                    }
                }
                that.chunk;
            }
        };

        oReq.send(null);
    };
}
Vox.prototype = new Vox();
Vox.prototype.constructor = Vox;

//==============================================================================
// Author: Nergal
// Date: 2014-11-17
//==============================================================================

function World() {
    this.width = 0;
    this.height = 0;
    this.name = "Unknown";
    this.map = undefined;
    this.chunkSize = 16;
    this.chunks = 0;
    this.blocks = 0;
    this.chunkList = [];
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

       // for(var cy = 0; cy < this.map[0].length; cy+=this.chunkSize) {
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
                        //if(x < this.map.length && y < this.map.length ) {
                            if(this.map[x][y] == 0) {
                                alpha++;
                            } else {
                                this.blocks++;
                            }
                            chunk[ix][iy++] = this.map[x][y];
                            total++;
                       // }
                    }
                    ix++;
                }
                var cSize = this.blockSize;
                if(total != alpha) {
                    var c = new ChunkWorld();
                    //c.Create(this.chunkSize, cSize, -cx * cSize, cy * cSize, chunk, this.wallHeight);
                    c.Create(this.chunkSize, cSize, cx * cSize, cy * cSize, chunk, this.wallHeight);
                    c.Rebuild();
                    this.chunkList.push(c);
                    
                    // Save to world map
                   // var x = this.chunks%(this.chunkSize);
                   // var z = Math.floor(this.chunks/(this.chunkSize));
                    var z = this.chunks%(this.map.length/this.chunkSize);
                    var x = Math.floor(this.chunks/(this.map.length/this.chunkSize));
                    game.worldMap[x][z] = {'id': this.chunks, 'avgHeight': c.GetAvgHeight()};
                    // TBD: Not map inActive blocks?
                    console.log("Z/X: "+x+"/"+z+ " => "+this.chunks);
                    this.chunks++;
                    if(this.chunks == 15) {
                        //return ;
                    }

                    Log("Add chunk, blocks: "+this.blocks + " Chunks: "+this.chunks);
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

            /*
            var c = document.getElementById("myCanvas");
            var ctx2 = c.getContext("2d");
            ctx2.canvas.width  = that.width;
            ctx2.canvas.height = that.height;
            ctx2.drawImage(image, 0, 0);
            */

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
            
        }
    };
}
World.prototype = new World();
World.prototype.constructor = World;



