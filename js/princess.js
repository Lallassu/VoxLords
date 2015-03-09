//==============================================================================
// Author: Nergal
// Date: 2015-01-31
//==============================================================================

function Princess() {
    this.scale = 1;
    this.remove = 0;
    this.mesh = undefined;
    this.type = "item";
    this.model = undefined;
    this.chunk = undefined;
    this.mesh = undefined;
    this.saved = false;
    this.direction = undefined;
    this.ray = undefined;
    this.speed = 0.2;
    this.dead = false;
    this.health = 5;
    this.bars = 12;
    this.hpPerBar = 0;
    this.healthBoxes = [];
    this.helpTime = 0;
    this.inCastle = false;
    this.skipDraw = 0;

    Princess.prototype.CreateHealth = function() {
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
    Princess.prototype.Saved = function() {
        this.saved = true;
        this.CreateHealth();
        game.soundLoader.PlaySound("princess_saved", this.mesh.position, 300);
    };

    Princess.prototype.Walk = function() {
        if(this.saved && !game.player.dead) {
            var dist = GetDistance(this.mesh.position, game.player.mesh.position);
            if(dist > 2) {
                var playerPos = game.player.mesh.position.clone();
                this.mesh.lookAt(new THREE.Vector3(playerPos.x, 360, playerPos.z));

                var initialPosition = this.mesh.position.clone() ;
                initialPosition.y += this.mesh.geometry.boundingBox.max.y+0.5;
                var rotationMatrix = new THREE.Matrix4() ;
                rotationMatrix.extractRotation( this.mesh.matrix ) ;
                var rotationVector = new THREE.Vector3( 0, -1, -0.05 ) ;
                rotationVector.applyMatrix4(rotationMatrix) ;
                var ray = new THREE.Raycaster( initialPosition, rotationVector );
                this.ray = ray;
                this.direction = ray.ray.direction;
                this.mesh.position.x += this.direction.x * this.speed;
                this.mesh.position.z += this.direction.z * this.speed;
                 
                // Check if we are close to the castle
                if(!this.inCastle) {
                    var ppos = this.mesh.position;
                    var cpos = game.currentMap.castlePosition;
                    if(ppos.x >= cpos.x-5 && ppos.x <= cpos.x+5 &&
                       ppos.z >= cpos.z-5 && ppos.z <= cpos.z+5) {
                        this.inCastle = true;
                        game.soundLoader.PlaySound("princess_castle", this.mesh.position, 300);
                        game.setStatus("Voxilia saved.");
                        game.setStatusCenter("Vox - HERO of Voxadu!", "#00FF00");
                        game.scene.remove(this.mesh);
                        this.remove = 1;
                        game.scene.remove(game.player.mesh);
                        game.player.remove = 1;
                        setTimeout(function() {
                            if(game.currentMap.id == 4) {
                                $('#statusCenter').html("<p class='vox_font'>VOX DEFEATED ALL LORDS OF VOXADU!</p><p class='vox_font'>All hail Prince Vox!</p>");
                            } else {
                                var prevId = game.currentMap.id;
                                game.ReInit(prevId+1); 
                            }
                        }, 2500);
                    }
                }
            }
        }
    };

    Princess.prototype.Hit = function(data, dmg) {
        if(this.saved) {
            if(game.player.godMode) {
                return;
            }
            if(Math.random() < 0.5) {
                game.soundLoader.PlaySound("princess_careful", this.mesh.position, 300);
            } else {
                game.soundLoader.PlaySound("princess_aj", this.mesh.position, 300);
            }
            this.health -= dmg;
            var remove = Math.round(this.healthBoxes.length - this.health/this.hpPerBar);
            for(var i = 0; i <= remove; i++) {
                this.mesh.remove(this.healthBoxes.pop());
            }
            if(this.health <= 0) {
                this.Remove();
            }
        }
    };

    Princess.prototype.Remove = function() {
        if(this.inCastle) {
            return;
        }
        game.setStatusCenter("Princess died, Vox failed!", "#FF0000");
        $('#statusCenter').fadeIn(1000);
        game.player.mesh.lookAt(new THREE.Vector3(this.mesh.x, 360, this.mesh.z));
        game.player.falling = true; // workaround to disable controls
        setTimeout(function() {
            game.player.Die();
        }, 3000);
        this.remove = 1;
        this.dead = true;
        this.chunk.Explode(this.mesh.position);
        game.chunkManager.Blood(this.mesh.position.x, this.mesh.position.z, 1+Math.random()*3);
        game.scene.remove(this.mesh);
    };

    Princess.prototype.Create = function(pos) {
        this.chunk = game.voxLoader.GetModel("princess");
        game.scene.add(this.chunk.mesh);
        this.chunk.mesh.position.set(pos.x, pos.y+0.2, pos.z);
        this.mesh = this.chunk.mesh;

        this.mesh.geometry.computeBoundingBox();
        this.mesh.that = this;
        game.targets.push(this.mesh);
    };

    Princess.prototype.Draw = function(time, delta) {
       // this.mesh.rotation.z = (time/10);
        var dist = GetDistance(this.mesh.position, game.player.mesh.position);
        if(dist > 20) {
            // Optimization for performance, skipping frames when far away.
            this.skipDraw = Math.floor(dist/5);
        }
        this.helpTime += delta;
        if(dist < 10 && !this.saved) {
            if(this.helpTime > 10) {
                game.soundLoader.PlaySound("princess_help", this.mesh.position, 300);
                game.setStatus("Shoot the cage to save Voxilia");
                this.helpTime = 0;
            }
        }
        var playerPos = game.player.mesh.position.clone();
        this.mesh.lookAt(new THREE.Vector3(playerPos.x, 360, playerPos.z));
        this.Walk();
        this.y = game.chunkManager.GetHeight(this.mesh.position.x, this.mesh.position.z);
        if(this.y <= 0 && !game.player.godMode) {
            if(this.mesh.position.y > game.currentMap.lavaPosition) {
                this.mesh.position.y -= 0.2; 
            } else {
                this.Remove();
            }
            return;
        } 
        this.mesh.position.y = this.y;//-0.2;
    };
}
Princess.prototype = new Princess();
Princess.prototype.constructor = Princess;

