/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-08
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Player base 'class'
/////////////////////////////////////////////////////////////
function Player() {
    this.type = "player";
    this.mesh = undefined;
    this.chunk = undefined;
    this.jump = 0;
    this.velocityY = 0;
    this.gravity = 0.06;

    this.t_delta = 0;
    this.camera_obj = 0;
    this.attached_camera = 0;
    this.keyboard = undefined;
    this.dead = false;
    this.falling = false;
    this.wf = false; // wireframe temp
    this.wf_delta = 0;
    this.remove = 0;
    this.model = "";
    this.pos = 0;
    this.hpPerBar = 0;
    this.bars = 12;
    this.health = 20;
    this.healthBoxes = [];
    this.godMode = false;
    this.loaded = false;
    this.bulletPos = undefined;
    this.weapon = 1;
    this.destruction_mode = false;

    Player.prototype.AddHealth = function() {
        this.health = 20;
        for(var i = 0; i < this.healthBoxes.length; i++) {
            this.mesh.remove(this.healthBoxes.pop());
        }
        this.CreateHealth();
    };

    Player.prototype.CreateHealth = function() {
        this.hpPerBar = this.health/this.bars;
        for(var i=0; i < this.bars; i++) {
            var geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            var color;
            switch(i) {
                case 0:
                    color = 0x880000;
                    break;
                case 1:
                    color = 0x980000;
                    break;
                case 2: 
                    color = 0xB80000;
                    break;
                case 3:
                    color = 0xF80000;
                    break;
                case 4:
                    color = 0xFF6600;
                    break;
                case 5:
                    color = 0xFF9900;
                    break;
                case 6:
                    color = 0xFFCC00;
                    break;
                case 7:
                    color = 0xFFFF00;
                    break;
                case 8:
                    color = 0x99FF33;
                    break;
                default:
                    color = 0x00FF00;
            }
            var mat = new THREE.MeshBasicMaterial({'color': color});
            var b = new THREE.Mesh(geo, mat);
            b.position.set((i*0.1+0.01)-(this.bars/2*0.1), 0, 2);
            this.healthBoxes.push(b);
            this.mesh.add(b);
        };
    };

    Player.prototype.Hit = function(shooter, dmg) {
        if(shooter == "player") {
            return;
        }
        if(this.godMode) { 
            return;
        }

        game.soundLoader.PlaySound("vox_aj", this.mesh.position, 300);
        this.health -= dmg;
        var remove = Math.round(this.healthBoxes.length - this.health/this.hpPerBar);
        for(var i = 0; i <= remove; i++) {
            this.mesh.remove(this.healthBoxes.pop());
        }
        if(this.health <= 0) {
            this.Die();
        }
    };

    Player.prototype.Remove = function(data) {
        scene.remove(this.mesh);
    };

    Player.prototype.Create = function(model, pos) {
        var that = this;
        this.model = model;
        this.pos = pos;
        this.keyboard = new THREEx.KeyboardState();
        this.chunk = game.voxLoader.GetModel(model);
        this.mesh = this.chunk.mesh;
        
        game.scene.add(this.mesh);
        // that.mesh.position.set(0,(santa.getChunk().chunkSizeY*santa.getChunk().blockSize)/2 - 0.5,0);

        this.camera_obj = new THREE.Object3D(); 

        this.mesh.add(this.camera_obj);
        this.camera_obj.add(game.camera);
        this.attached_camera = 1;

        //game.camera.position.set(0, 15, 4);
        //game.camera.rotation.set(-Math.PI/2, 0, Math.PI);

        this.mesh.position.set(pos.x,pos.y-0.5,pos.z);
        game.camera.position.set(0, 15, 7);
        //this.mesh.rotation.set(Math.PI/2, Math.PI, 0);
        game.camera.rotation.set(-Math.PI/2.6, 0, Math.PI);

           // var axisHelper = new THREE.AxisHelper( 5 );
           // this.mesh.add( axisHelper );

        this.mesh.that = this;
        game.targets.push(this.mesh);
        game.objects.push(this);
        this.CreateHealth();
        this.mesh.geometry.computeBoundingBox();
        this.mesh.geometry.center();
     //   var bbox = new THREE.BoundingBoxHelper( this.mesh, 0xFF0000 );
        //bbox.update();
     //   this.mesh.add( bbox );
 //       this.mesh.rotation.set(Math.PI/2, Math.PI, 0);
        this.loaded = true;
        

        // Add bullet position
     //   var b = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5, 0.5),
     //                    new THREE.MeshBasicMaterial({color: 0x00FF00}));
        this.bulletPos = new THREE.Object3D();
        this.bulletPos.position.set(0, -0.8, 0.5);
        this.mesh.add(this.bulletPos);

        // TBD: fix this bug! This is just a workaround for player 
        var that = this;
        setTimeout(function() {
            that.AddBindings();
            LockPointer();
        }, 1500);
        console.log("Player loaded...");
    };


    Player.prototype.Draw = function(time, delta) {
        var rotateAngle = (Math.PI / 1.5) * delta ;
        var moveDistance = 10 * delta;
        if(this.destruction_mode) {
            this.godMode = true;
        }
        if(this.godMode) {
            if(this.wf_delta < 10) {
                if(!this.destruction_mode) {
                    this.wf_delta += delta;
                }
                game.setStatusCenter("GOD MODE "+(10-Math.round(this.wf_delta)) + " sec.", "#FF00FF");
            } else {
                this.godMode = false;
                this.wf_delta = 0;
                game.setStatusCenter("");
            }
        }


        if ( this.keyboard.pressed("v") ) {
            if(this.wf) {
                this.wf = false;
            } else {
                this.wf = true;
            }
           var chunk = game.chunkManager.GetChunk(this.mesh.position.x, this.mesh.position.z);
           console.log("ACTIVE BLOCKS: "+chunk.NoOfActiveBlocks());
          // var id = chunk.cid - Math.sqrt(game.world.map.length);
          // if(id >= 0  && id < game.chunkManager.worldChunks.length) {
          //     game.chunkManager.worldChunks[id].SetWireFrame(true);
          // }
           chunk.SetWireFrame(this.wf);
           var c = game.chunkManager.GetWorldChunkID(this.mesh.position.x, this.mesh.position.z);
           //game.chunkManager.worldChunks[chunk.cid-1].SetWireFrame(true);
       //   console.log("C: "+c.id);
       //    var right = c.id + Math.sqrt(game.world.map.length);
       //    var left = c.id - Math.sqrt(game.world.map.length);
       //    var up = c.id - 1;
       //    var down = c.id +1;
       //    game.chunkManager.worldChunks[up].SetWireFrame(this.wf);
       //   game.chunkManager.worldChunks[down].SetWireFrame(this.wf);
       //    game.chunkManager.worldChunks[left].SetWireFrame(this.wf);
       //    game.chunkManager.worldChunks[right].SetWireFrame(this.wf);
       //    console.log("R: "+right + " L: "+left + " Up: "+up + " Down: "+down);
        }

        // Only allow movement when alive
        if(!this.dead && !this.falling) {
            if ( this.keyboard.pressed("space") ) {
                if(!this.jump) {
                    this.jump = true;
                    this.velocityY = 1;
                    game.soundLoader.PlaySound("jump", this.mesh.position, 300);
                }
            }
            if ( this.keyboard.pressed("P") ) {
                if(this.wf_delta < 0.2) {
                    return;
                }
                this.wf_delta = 0;
                var power = 2+Math.random()*5;
                var blood = Math.random() > 0.5 ? true : false;
                game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, 2+Math.random()*5, blood);
                console.log("Free blocks: "+game.physBlockPool.Free());
            }
            if ( this.keyboard.pressed("B") ) {
                if(this.wf_delta < 0.2) {
                    return;
                }
                this.wf_delta = 0;
                game.chunkManager.Blood(this.mesh.position.x, this.mesh.position.z, 1+Math.random()*3);
            }
            if ( this.keyboard.pressed("m") ){
                console.log("MESH Position: ");
                console.log(this.mesh.position);
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
            if ( this.keyboard.pressed("K") ) {
                this.Die();
            }
            if ( this.keyboard.pressed("O") ) {
                this.Respawn();
            }

            // WEAPONS
            // TBD: Some function handling this.
            if ( this.keyboard.pressed("1") ) {
                this.weapon = 1;
                $('#weapon1').fadeTo(0, 1);
                $('#weapon2').fadeTo(0, 0.3);
                $('#weapon3').fadeTo(0, 0.3);
            }
            if ( this.keyboard.pressed("2") ) {
                this.weapon = 2;
                $('#weapon1').fadeTo(0, 0.3);
                $('#weapon2').fadeTo(0, 1);
                $('#weapon3').fadeTo(0, 0.3);
            }
            if ( this.keyboard.pressed("3") ) {
                this.weapon = 3;
                $('#weapon1').fadeTo(0, 0.3);
                $('#weapon2').fadeTo(0, 0.3);
                $('#weapon3').fadeTo(0, 1);
            }

            if ( this.keyboard.pressed("L") ) {
                if(Math.random() > 0.5) {
                    var enemy = new Devil1();
                    enemy.Create(100-Math.random()*50, 1, 100-Math.random()*50, "SmallShot");
                } else {
                    var enemy = new Devil2();
                    enemy.Create(100-Math.random()*50, 1, 100-Math.random()*50, "SmallShot");
                }
            }
            if ( this.keyboard.pressed("D") ) {
                this.mesh.translateX(-moveDistance);
            }
        }

        this.UpdatePos(time);
    };


    Player.prototype.Die = function(fall) {
        if(this.godMode) {
            return;
        }
        if(fall) {
            $('#statusCenter').text("Vox slipped and died!");
            $('#statusCenter').fadeIn(1000);
            $('#weapons').fadeOut(1000);
        } else {
            game.chunkManager.Blood(this.mesh.position.x, this.mesh.position.z, 2+Math.random()*1);
        }
        $('#statusCenter').text("Vox were killed!");
        $('#statusCenter').fadeIn(1000);
        this.chunk.Explode(this.mesh.position);
        this.dead = true;
        this.remove = 1;
        setTimeout(function() {
            game.ReInit(game.currentMap.id);
        }, 3500);
    };

    Player.prototype.UpdatePos = function(time) {       
        var y = 0;
        if(!this.dead) {
            y = game.chunkManager.GetHeight(this.mesh.position.x+this.chunk.blockSize*this.chunk.chunkSizeX/2,
                                            this.mesh.position.z+this.chunk.blockSize*this.chunk.chunkSizeX/2);
        }
        if(this.jump && time != 0) {
            this.velocityY -= this.gravity;
            this.mesh.position.y += this.velocityY;
            if(this.mesh.position.y < game.currentMap.lavaPosition-0.5) {
                if(!this.dead) {
                    this.Die(1);
                }
            }
            if(this.mesh.position.y < y) {
                this.mesh.position.y = y;
                this.velocityY = 0;
                this.jump = false;
            }
            return;
        }

        if(this.godMode) { 
            this.mesh.position.y = y;
            return; 
        }

        if(y <= 0) {
            if(this.mesh.position.y > game.currentMap.lavaPosition) { 
                this.falling = true;
                this.mesh.position.y -= 0.3; 
                //     if(!this.dead) {
           //         this.mesh.remove(this.camera_obj);
           //         game.scene.add(this.camera_obj);
           //         this.camera_obj.position.set(this.mesh.position.x, 2, this.mesh.position.z);
           //         this.camera_obj.rotateOnAxis(new THREE.Vector3(1,0,0), 30);
           //         this.dead = true;
           //     }
                //this.camera_obj.translateY(-0.1);
                //    this.camera_obj.lookAt(this.mesh.position);
                //this.camera_obj.position.x = this.
//                this.camera_obj.translateY(0.01);
            } else {
                if(!this.dead) {
                    this.Die(1);
                }
            }
        } else {
            this.mesh.position.y = y;//-this.chunk.blockSize;
        }
    };

    Player.prototype.OnMouseMove = function(jevent) {
        var event = jevent.originalEvent; // jquery convert
        if(this.attached_camera == 1) {
            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX ||0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            var	x = movementX*0.001;
            var	y = movementY*0.001;
            
            var xAxis = new THREE.Vector3(0,0,1);
            rotateAroundObjectAxis(this.mesh, xAxis, -(Math.PI / 2)*x);
            //this.UpdatePos(-1);
        }
    };



    Player.prototype.OnMouseUp = function(event) {
        if(this.dead) {
            return;
        }
        var mouseButton = event.keyCode || event.which;
        if(mouseButton != 1) {
            return;
        }

        this.mesh.updateMatrixWorld();
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition( this.bulletPos.matrixWorld );


        var rotationMatrix = new THREE.Matrix4() ;
        rotationMatrix.extractRotation( this.mesh.matrix ) ;
        var rotationVector = new THREE.Vector3( 0, -1, 0 ) ;
        rotationVector.applyMatrix4(rotationMatrix) ;
        var ray = new THREE.Raycaster( vector, rotationVector );

       // game.scene.add( new THREE.ArrowHelper(ray.ray.direction, this.mesh.position, 50, 0x00FF00));
       // game.scene.add( new THREE.ArrowHelper(ray.ray.direction, initialPosition, 30, 0x00FF00));
        
        this.mouseDown = 0;
        
        var shot;
        if(this.weapon === 1){
            shot = new SmallShot();
        } else if(this.weapon == 2) {
            shot = new QuakeShot();
        } else if(this.weapon == 3) {
            shot = new FloatingShot();
        }
        shot.Create(ray, vector, this.type);

        //this.UpdatePos(-1);
    };

    Player.prototype.Respawn = function() {
        // TBD: Better solution
        this.Create(this.model, this.pos);
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

