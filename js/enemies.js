/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-08
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Player base 'class'
/////////////////////////////////////////////////////////////
function Enemy() {
    this.type = "enemy";
    this.mesh = undefined;
    this.chunk = undefined;
    this.vox = undefined;
    this.direction = undefined;
    this.remove = 0;
    this.y = 0;
    this.ray = undefined;
    this.willShoot = false;
    this.shotType = undefined;
    this.healthBoxes = [];
    this.health = 3;
    this.bars = 12;
    this.hpPerBar = 0;
    this.skipDraw = false;
    this.active = false;
    this.maxHealth = 0;
    this.health = 0;
    this.skipDraw = 0;
    this.damage = 2;
    this.scale = 1;

    Enemy.prototype.CreateHealth = function() {
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
            b.position.set((i*0.1+0.01)-(this.bars/2*0.06), 0, 2);
            this.healthBoxes.push(b);
            this.mesh.add(b);
        };
    };

    Enemy.prototype.Hit = function(data, dmg) {
        this.health -= dmg;
        var remove = Math.round(this.healthBoxes.length - this.health/this.hpPerBar);
        for(var i = 0; i <= remove; i++) {
            this.mesh.remove(this.healthBoxes.pop());
        }
        if(this.health <= 0) {
            this.Remove();
        }
        var r = Math.random();
        if(r > 0.9) {
            game.soundLoader.PlaySound("growl1", this.mesh.position, 300);
        } else if(r < 0.1) {
            game.soundLoader.PlaySound("growl2", this.mesh.position, 300);
        }
    };
    
    Enemy.prototype.Remove = function(fall) {
        if(this.remove != 1) {
            this.chunk.Explode(this.mesh.position, this.scale);
            // Don't splat blood if falling to death
            if(!fall) {
                game.chunkManager.Blood(this.mesh.position.x+this.chunk.blockSize*this.chunk.chunkSizeX/2,
                                        this.mesh.position.z+this.chunk.blockSize*this.chunk.chunkSizeZ/2,
                                        1+Math.random()*2);
            }
            this.remove = 1;
            game.scene.remove(this.mesh);
            game.currentMap.enemiesKilled++;
            var el = game.currentMap.GetEnemiesLeft();
            $('#statusEnemies').text("Enemies left: "+el);
            if(Math.random() > 0.5) {
                game.soundLoader.PlaySound("die1", this.mesh.position, 300);
            } else {
                game.soundLoader.PlaySound("die2", this.mesh.position, 300);
            }
        }
    };

    Enemy.prototype.Shoot = function() {
        if(game.player.dead) {
            return; 
        }
        if(this.willShoot) {
            if(Math.random() > 0.98) {
                var shot;
                if(this.shotType == "QuakeShot") {
                    shot = new QuakeShot();
                } else if(this.shotType == "SmallShot") {
                    shot = new SmallShot();
                } else if(this.shotType == "FloatingShot") {
                    shot = new FloatingShot();
                }
                shot.Create(this.ray, this.mesh.position, this.type);
                shot.setDamage(this.damage);
               // game.scene.add( new THREE.ArrowHelper(this.ray.ray.direction, this.mesh.position, 10, 0x00FF00));
            }
        }
    };

    Enemy.prototype.setDamage = function(damage) {
        this.damage = damage;
    };


    Enemy.prototype.Create = function(x, y ,z, shotType) {
        this.shotType = shotType;
        this.chunk = game.voxLoader.GetModel(this.vox);
        this.mesh = this.chunk.mesh;
        this.mesh.geometry.computeBoundingBox();
        game.scene.add(this.mesh);
        this.mesh.position.set(x,y,z);
        this.mesh.that = this;
        game.targets.push(this.mesh);
        this.mesh.scale.set(this.scale, this.scale, this.scale);
        console.log("Spawning enemy: "+this.type);
        this.CreateHealth();
    };

    Enemy.prototype.Draw = function(time, delta) {
        var dist = GetDistance(this.mesh.position, game.player.mesh.position);
        if(dist > 20) {
            // Optimization for performance, skipping frames when far away.
            this.skipDraw = Math.floor(dist/4);
        }
        var rotateAngle = (Math.PI / 1.5) * delta ;
        var moveDistance = 20 * delta;

        if(!game.player.dead) {
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
            //}
        }

        this.y = game.chunkManager.GetHeight(this.mesh.position.x+this.chunk.blockSize*this.chunk.chunkSizeX/2,
                                            this.mesh.position.z+this.chunk.blockSize*this.chunk.chunkSizeX/2);
        if(this.y <= 0) {
            if(this.mesh.position.y > game.currentMap.lavaPosition) {
                this.mesh.position.y -= 0.2; 
            } else {
                this.Remove(1);
            }
            return;
        } 
        this.mesh.position.y = this.y;

        if(dist < 15 || this.health < this.maxHealth) {
            this.Shoot();
            this.active = true;
            if(dist > 2) {
                this.mesh.position.x += this.direction.x * this.speed;
                this.mesh.position.z += this.direction.z * this.speed;
            }
        }

    };

    Enemy.prototype.Explode = function() {
        this.Remove();
        game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, this.damage, true);
    };
}
Enemy.prototype = new Enemy();
Enemy.prototype.constructor = Enemy;

//--------------------------------------------------------
// Devil1 (old man)
//--------------------------------------------------------
function Devil1() {
    Enemy.call(this);
    this.enemy_type = "Devil";
    this.vox = "devil1";
    this.damage = 4;
    this.speed = 0.1;
    this.weapon = undefined;
    this.willShoot = true;
    this.scale = 1;
    this.maxHealth = 20;
    this.health = this.maxHealth;

    Devil1.prototype.Draw = function(time, delta) {
        Enemy.prototype.Draw.call(this);

        var dist = GetDistance(this.mesh.position, game.player.mesh.position);
        if(this.active) {
            if(this.scale < 4) {
                this.scale += 0.01;
                this.mesh.scale.set(this.scale, this.scale, this.scale);
            } else {
                this.Explode();
            }
        } else if(dist >= 15) {
            if(this.scale > 1) {
                this.scale -= 0.01;
                this.mesh.scale.set(this.scale, this.scale, this.scale);
            }
        }

    };
}
Devil1.prototype = new Enemy;
Devil1.prototype.constructor = Devil1;

//--------------------------------------------------------
// Devil1 (axe)
//--------------------------------------------------------
function Devil2() {
    Enemy.call(this);
    this.enemy_type = "Devil2";
    this.vox = "devil2";
    this.damage = 1;
    this.speed = 0.1;
    this.weapon = undefined;
    this.willShoot = true;
    this.maxHealth = 5;
    this.health = this.maxHealth;
}
Devil2.prototype = new Enemy;
Devil2.prototype.constructor = Devil2;

//--------------------------------------------------------
// Elf
//--------------------------------------------------------
function Elf() {
    Enemy.call(this);
    this.enemy_type = "Elf";
    this.vox = "elf";
    this.damage = 2;
    this.speed = 0.3;
    this.weapon = undefined;
    this.willShoot = false;
    this.maxHealth = 3;
    this.health = this.maxHealth;

    Elf.prototype.Draw = function(time, delta) {
        Enemy.prototype.Draw.call(this);

        var dist = GetDistance(this.mesh.position, game.player.mesh.position);
        if(dist < 5) {
            this.Explode();
        }

    };
}
Elf.prototype = new Enemy;
Elf.prototype.constructor = Elf;

//--------------------------------------------------------
// Exploding elf 
//--------------------------------------------------------
function Elf2() {
    Enemy.call(this);
    this.enemy_type = "Elf2";
    this.vox = "elf";
    this.damage = 3;
    this.speed = 0.3;
    this.weapon = undefined;
    this.willShoot = false;
    this.maxHealth = 1;
    this.health = this.maxHealth;

    Elf2.prototype.Draw = function(time, delta) {
        Enemy.prototype.Draw.call(this);

        var dist = GetDistance(this.mesh.position, game.player.mesh.position);
        if(dist < 5) {
            this.Explode();
        }

    };
}
Elf2.prototype = new Enemy;
Elf2.prototype.constructor = Elf2;
//--------------------------------------------------------
// Santa
//--------------------------------------------------------
function Santa() {
    Enemy.call(this);
    this.enemy_type = "Santa";
    this.vox = "santa";
    this.damage = 5;
    this.speed = 0.1;
    this.weapon = undefined;
    this.willShoot = true;
    this.maxHealth = 13;
    this.health = this.maxHealth;
}
Santa.prototype = new Enemy;
Santa.prototype.constructor = Santa;

//--------------------------------------------------------
// Hula1
//--------------------------------------------------------
function Hula1() {
    Enemy.call(this);
    this.enemy_type = "Hula1";
    this.vox = "hula1";
    this.damage = 2;
    this.speed = 0.1;
    this.weapon = undefined;
    this.willShoot = false;
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.scale = 2;

    Hula1.prototype.Draw = function(time, delta) {
        Enemy.prototype.Draw.call(this);

        var dist = GetDistance(this.mesh.position, game.player.mesh.position);
        if(dist < 5) {
            this.Explode();
        }

    };
}
Hula1.prototype = new Enemy;
Hula1.prototype.constructor = Hula1;

//--------------------------------------------------------
// Hula2
//--------------------------------------------------------
function Hula2() {
    Enemy.call(this);
    this.enemy_type = "Hula2";
    this.vox = "hula2";
    this.damage = 2;
    this.speed = 0.1;
    this.weapon = undefined;
    this.willShoot = false;
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.scale = 1.5;

    Hula2.prototype.Draw = function(time, delta) {
        Enemy.prototype.Draw.call(this);

        var dist = GetDistance(this.mesh.position, game.player.mesh.position);
        if(dist < 5) {
            this.Explode();
        }

    };
}
Hula2.prototype = new Enemy;
Hula2.prototype.constructor = Hula2;

//--------------------------------------------------------
// Plantox1 (axe)
//--------------------------------------------------------
function Plantox1() {
    Enemy.call(this);
    this.enemy_type = "Plantox1";
    this.vox = "plantox1";
    this.damage = 2;
    this.speed = 0.2;
    this.weapon = undefined;
    this.willShoot = true;
    this.maxHealth = 5;
    this.health = this.maxHealth;
}
Plantox1.prototype = new Enemy;
Plantox1.prototype.constructor = Plantox1;

//--------------------------------------------------------
// Plantox2 
//--------------------------------------------------------
function Plantox2() {
    Enemy.call(this);
    this.enemy_type = "Plantox2";
    this.vox = "plantox2";
    this.damage = 1;
    this.speed = 0.1;
    this.weapon = undefined;
    this.willShoot = true;
    this.maxHealth = 10;
    this.health = this.maxHealth;
}
Plantox2.prototype = new Enemy;
Plantox2.prototype.constructor = Plantox2;
