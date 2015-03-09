//==============================================================================
// Author: Nergal
// Date: 2014-12-03
//==============================================================================

function Shot() {
    this.id = 0;
    this.life = 3;
    this.life_max = 3;
    this.mesh = undefined;
    this.remove = 0;
    this.velocity;
    this.angle;
    this.force = 0;
    this.forceY = 0;
    this.size = 1;
    this.direction = undefined;
    this.ray = undefined;
    this.hitObject = undefined;
    this.distance = undefined;
    this.sound = undefined;
    this.shooter = "";

    Shot.prototype.Remove = function() {
        this.Explode();
        this.life = 0;
        this.remove = 1;
        this.mesh.that.Release(this.mesh);
    };

    Shot.prototype.setDamage = function(damage) {
        this.damage = damage;
    };

    Shot.prototype.Explode = function() {
        if(this.size < 0.3) {
            return;
        }
        var block;
        for(var i = 0; i < 5; i++) {
            block = game.physBlockPool.Get();
            if(block != undefined) {
                block.Create(this.mesh.position.x+Math.random()*1,
                             this.mesh.position.y+Math.random()*1, 
                             this.mesh.position.z+Math.random()*1,
                             this.size/2,
                             0,
                             0,
                             0,
                             2,
                             Math.random()*180,
                             5);
            }
        }

    };

    Shot.prototype.Create = function(ray, pos, shooter) {
        this.shooter = shooter;
        this.life_max = this.life;
        this.ray = ray;
        this.direction = ray.ray.direction;
        
        if(this.sound != undefined) {
            game.soundLoader.PlaySound(this.sound,game.player.mesh.position, 300);
        }

        this.mesh = game.ammoPool.Get();
        if(this.mesh == undefined) {
            console.log("Ammo pool empty!");
            return;
        }
        this.mesh.scale.set(this.size, this.size, this.size);
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.material.color.setHex(this.color);
        this.mesh.material.needsUpdate = true;

        // Check if we hit something, then set how for to it. And when it's hit, "hit" the target.
        var intersects = this.ray.intersectObjects(game.targets);
        if (intersects.length > 0) {
            for(var i=0; i < intersects.length; i++) {
                if(intersects[i].object.that.Hit != undefined &&
                  !(this.shooter == 'player' && intersects[i].object.that.type == 'player')) {
                    this.hitObject = intersects[i].object;
                    break;
                }
            }
        }
        
        game.scene.add(this.mesh);
        game.objects.push(this);
    };

    Shot.prototype.Draw = function(time, delta) {
    };

    Shot.prototype.getColor= function() {
        return parseInt(this.color);
    };
}
Shot.prototype = new Shot();
Shot.prototype.constructor = Shot;

function SmallShot() {
    Shot.call(this);
    this.damage = 1;
    this.size = 0.1;
    this.life = 0.10;
    this.color = 0xFF00FF;
    this.sound = "shot1";
    this.offset = 1;
    this.speed = 2;

    SmallShot.prototype.Draw = function(time,delta) {
       this.life -= 0.01;
       //this.mesh.position.y = this.offset;

       if(this.life <= 0) {
            this.Remove();
            return;
       }

       if(this.hitObject != undefined) {
           var distance = GetDistance(this.mesh.position, this.hitObject.position);
           if(this.distance != undefined) {
               if(this.distance <= 0 || distance > this.distance) {
                   if(this.hitObject.that.Hit != undefined) {
                       //this.hitObject.that.Hit(this.mesh.position, this.damage);
                       this.hitObject.that.Hit(this.shooter, this.damage);

                   } 
                   this.Remove();
                  // this.Explode();
                  // this.remove = 1;
                  // game.scene.remove(this.mesh);
               }
           }
           this.distance = distance;
       } else {
           var height = game.chunkManager.GetHeight(this.mesh.position.x, this.mesh.position.z);
           if(height != undefined) {
               if(height >= this.mesh.position.y+1) {
                   game.chunkManager.ExplodeBombSmall(this.mesh.position.x, this.mesh.position.z);
                   this.Remove();
               }
           }
       }
       

       this.mesh.position.x += this.direction.x * this.speed;
       this.mesh.position.z += this.direction.z * this.speed;
    };
}
SmallShot.prototype = new Shot();
SmallShot.prototype.constructor = SmallShot;

function QuakeShot() {
    Shot.call(this);
    this.damage = 2;
    this.size = 0.3;
    this.life = 0.5;
    this.speed = 0.5;
    this.color = 0x3399FF;
    this.offset = 0.5;
    this.sound = "swoosh";

    QuakeShot.prototype.Draw = function(time,delta) {
       this.life -= 0.01;

       if(this.life <= 0) {
            this.Remove();
            return;
       }

       if(this.hitObject != undefined) {
           var distance = GetDistance(this.mesh.position, this.hitObject.position);
           if(this.distance != undefined) {
               if(this.distance <= 0 || distance > this.distance) {
                   if(this.hitObject.that.Hit != undefined) {
                       //this.hitObject.that.Hit(this.mesh.position, this.damage);
                       this.hitObject.that.Hit(this.shooter, this.damage);

                   } 
                   this.Remove();
                  // this.Explode();
                  // this.remove = 1;
                  // game.scene.remove(this.mesh);
               }
           }
           this.distance = distance;
       }
       var dsx = this.direction.x * this.speed;
       var dsz = this.direction.z * this.speed;

       var height = game.chunkManager.GetHeight(this.mesh.position.x, this.mesh.position.z);
       if(height == undefined) {
           height = 0;
       }
       if(this.life <= this.life_max/1.5) {
           game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, this.damage, false, this.mesh.position.y+2);
       }
       this.mesh.position.x += dsx;
      // if(height != 0) {
      //   this.mesh.position.y = height + this.offset;
      // }
       this.mesh.position.z += dsz;
    };
}
QuakeShot.prototype = new Shot();
QuakeShot.prototype.constructor = QuakeShot;

function FloatingShot() {
    Shot.call(this);
    this.damage = 3;
    this.size = 0.5;
    this.life = 0.5;
    this.color = 0xCC0000;
    this.speed = 0.5;
    this.offset = 1;
    this.sound = "swoosh";

    FloatingShot.prototype.Draw = function(time,delta) {
       this.life -= 0.01;

       if(this.life <= 0) {
            game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, this.damage, false);
            game.soundLoader.PlaySound("explode", this.mesh.position, 300);
            this.Remove();
            return;
       }

       if(this.hitObject != undefined) {
           var distance = GetDistance(this.mesh.position, this.hitObject.position);
           if(this.distance != undefined) {
               if(this.distance <= 0 || distance > this.distance) {
                   if(this.hitObject.that.Hit != undefined) {
                       //this.hitObject.that.Hit(this.mesh.position, this.damage);
                       this.hitObject.that.Hit(this.shooter, this.damage);
                        game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, this.damage, false);
                   } 
                   this.Remove();
                  // this.Explode();
                  // this.remove = 1;
                  // game.scene.remove(this.mesh);
               }
           }
           this.distance = distance;
       }
       var height = game.chunkManager.GetHeight(this.mesh.position.x, this.mesh.position.z);
       if(height == undefined) {
           height = 0;
       }
       this.mesh.position.x += this.direction.x * this.speed;
       this.mesh.position.y = height + this.offset;
       this.mesh.position.z += this.direction.z * this.speed;
    };
}
FloatingShot.prototype = new Shot();
FloatingShot.prototype.constructor = FloatingShot;
