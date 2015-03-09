//==============================================================================
// Author: Nergal
// Date: 2014-12-03
//==============================================================================

function Item() {
    this.scale = 1;
    this.remove = 0;
    this.mesh = undefined;
    this.type = "item";
    this.model = undefined;
    this.speed = 5;
    this.chunk = undefined;
    this.mesh = undefined;
    this.skipDraw = 0;

    Item.prototype.Explode = function() {
        game.chunkManager.ExplodeBomb(this.mesh.position.x, this.mesh.position.z, this.damage, false);
        this.chunk.Explode(this.mesh.position);
        game.scene.remove(this.mesh);
    };

    Item.prototype.Remove = function() {
        if(this.remove != 1) {
            this.Explode();
            this.remove = 1;
        }
    };

    Item.prototype.Create = function(pos) {
        this.chunk = game.voxLoader.GetModel(this.model);
        this.mesh = this.chunk.mesh;
       // this.mesh.geometry.computeBoundingBox();
       // this.mesh.geometry.center();
        game.scene.add(this.mesh);
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.that = this;
        game.targets.push(this.mesh);
       // var bbox = new THREE.BoundingBoxHelper( this.mesh, 0xFF0000 );
       // bbox.update();
       // this.mesh.add(new THREE.AxisHelper(5));
       // this.mesh.add( bbox );
    };

    Item.prototype.Draw = function(time, delta) {
        if(game.player != undefined) {
            var dist = GetDistance(this.mesh.position, game.player.mesh.position);
            if(dist > 20) {
                // Optimization for performance, skipping frames when far away.
                this.skipDraw = Math.floor(dist/3);
            }
        }
        this.mesh.rotation.z = (time/this.speed);
    };
}
Item.prototype = new Item();
Item.prototype.constructor = Item;

//--------------------------------------------------------------------------
// Healthbox
//--------------------------------------------------------------------------
function HealthBox() {
    Item.call(this);
    this.speed = 5;
    this.type = "healthbox";
    this.model = "healthbox";

    HealthBox.prototype.Remove = function() {
        this.remove = 1;
        this.chunk.Explode(this.mesh.position);
        game.soundLoader.PlaySound("health", this.mesh.position, 300);
    };

    HealthBox.prototype.Hit = function() {
        this.Remove();
        game.player.AddHealth();
    };
}
HealthBox.prototype = new Item();
HealthBox.prototype.constructor = HealthBox;

//--------------------------------------------------------------------------
//Godmode 
//--------------------------------------------------------------------------
function Godmode() {
    Item.call(this);
    this.speed = 5;
    this.type = "godmode";
    this.model = "godmode";

    Godmode.prototype.Remove = function() {
        this.chunk.Explode(this.mesh.position);
        game.soundLoader.PlaySound("crate_explode", this.mesh.position, 300);
        this.remove = 1;
    };

    Godmode.prototype.Hit = function() {
        game.player.godMode = true;
        this.Remove();
    };
}
Godmode.prototype = new Item();
Godmode.prototype.constructor = Godmode();

//--------------------------------------------------------------------------
// Bomb Explode 
// spin faster when hit and then explode!
//--------------------------------------------------------------------------
function Bomb() {
    Item.call(this);
    this.type = "bomb";
    this.speed = 10;
    this.hit = false;
    this.model = "bomb";
    this.damage = 5;

    Bomb.prototype.Remove = function() {
        this.Explode();
        this.remove = 1;
        game.soundLoader.PlaySound("explode", this.mesh.position, 300);
    };

    Bomb.prototype.Hit = function() {
        this.hit = true;
    };

    Bomb.prototype.Draw = function(time, delta) {
        if(this.hit) {
            this.speed -= 0.1;
        }
        if(this.speed <= 1) {
            this.Remove();
        } else {
           this.mesh.rotation.z = (time/this.speed);
        }
    };

}
Bomb.prototype = new Item();
Bomb.prototype.constructor = Bomb();

//--------------------------------------------------------------------------
// Weapon crate
//--------------------------------------------------------------------------
function WeaponBox() {
    Item.call(this);
    this.type = "bomb";
    this.speed = 10;
    this.hit = false;
    this.model = "weaponbox";
    this.damage = 10;

    WeaponBox.prototype.Remove = function() {
        this.Explode();
        this.remove = 1;
        game.soundLoader.PlaySound("explode", this.mesh.position, 300);
    };

    WeaponBox.prototype.Hit = function() {
        this.hit = true;
    };

    WeaponBox.prototype.Draw = function(time, delta) {
        if(this.hit) {
            this.speed -= 0.1;
        }
        if(this.speed <= 1) {
            this.Remove();
        } else {
           this.mesh.rotation.z = (time/this.speed);
        }
    };

}
WeaponBox.prototype = new Item();
WeaponBox.prototype.constructor = WeaponBox();
