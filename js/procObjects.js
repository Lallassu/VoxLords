//==============================================================================
// Author: Nergal
// Date: 2015-01-23
//==============================================================================

function ProcObject() {
    this.id = 0;
    this.type = "Generic";
    this.chunk = undefined;
    this.size = 0.5;

    ProcObject.prototype.Create = function(w,h,d) {
        this.chunk = new Chunk();
        this.chunk.blockSize = this.size;
        this.chunk.Create(w,h,d);
    };


}
ProcObject.prototype = new ProcObject();
ProcObject.prototype.constructor = ProcObject;

function Flower() {
    ProcObject.call(this);
    this.type = "Flower";
    this.size = 0.2;

    Flower.prototype.Create = function(w,h,d, pos) {
        ProcObject.prototype.Create.call(this, w, h, d, pos);
        // Activate and set color for blocks
        // stem
        for(var y = 0; y < h-2; y++) {
            this.chunk.ActivateBlock(Math.ceil((w-1)/2),
                                     y,
                                     Math.ceil((d-1)/2),
                                     {r: 0, g: 200, b: 0, a: 255});
        }
        // Pistill
        var color = Math.random()*200;
        this.chunk.ActivateBlock(Math.ceil((w-1)/2),
                                 h-1,
                                 Math.ceil((d-1)/2),
                                 {r: color+50, g: color+50, b: color+50, a: 255});
        // Leafs
        var col = {r: Math.round(Math.random()*255), g: 0, b: Math.round(Math.random()*255),  a: 255};
        this.chunk.ActivateBlock(Math.ceil((w-1)/2),
                                 h-2,
                                 Math.ceil((d-1)/2)-1,
                                 col);
        this.chunk.ActivateBlock(Math.ceil((w-1)/2)-1,
                                 h-2,
                                 Math.ceil((d-1)/2),
                                 col);
        this.chunk.ActivateBlock(Math.ceil((w-1)/2),
                                 h-2,
                                 Math.ceil((d-1)/2)+1,
                                 col);
        this.chunk.ActivateBlock(Math.ceil((w-1)/2)+1,
                                 h-2,
                                 Math.ceil((d-1)/2),
                                 col);


        this.chunk.Rebuild();
        this.chunk.mesh.rotation.set(0, -Math.PI, 0);
        this.chunk.mesh.position.set(pos.x, pos.y-this.size, pos.z);
        game.scene.add(this.chunk.mesh);

        console.log("Created: "+this.type);
    };
}
Flower.prototype = new ProcObject();
Flower.prototype.constructor = Flower;

function Mushroom() {
    ProcObject.call(this);
    this.type = "Mushroom";
    this.size = 0.5;

    Mushroom.prototype.Create = function(w,h,d, pos) {
        var power = 5;
        ProcObject.prototype.Create.call(this, w, h, d, pos);
        // Activate and set color for blocks
        for(var x = (w/2)-power; x < (w/2)+power; x++) {
            for(var y = 0; y < h; y++) {
                for(var z = (d/2)-power; z < (d/2)+power; z++) {
                    console.log((x*x+y*y+z*z) +" <= "+power*power);
                    if(x*x+y*y+z*z <= (w/2+power)*(w/2+power)) {
                        console.log("ADD CHUNK FOR MUSHROOM");
                        this.chunk.ActivateBlock(x,y,z, {r: Math.round(Math.random()*255), g: Math.round(Math.random()*255), b: Math.round(Math.random()*255), a: 255});
                    }   
                }
            }
        }
        this.chunk.Rebuild();
        this.chunk.mesh.position.set(pos.x, pos.y, pos.z);
        game.scene.add(this.chunk.mesh);

        console.log("Created: "+this.type);
    };
}
Mushroom.prototype = new ProcObject();
Mushroom.prototype.constructor = Mushroom;


function TreeSmall() {
    ProcObject.call(this);
    this.type = "TreeSmall";
    this.size = 0.5;

    TreeSmall.prototype.BuildRing = function(segCount, centre, radius) {
        var power = 5;
        var p2 = power*power*power;
        for( var x = 5+power; x >= x-power; x -= 1) {
            for( var z = 5+power; z >= x-power; z -= 1) {
                if((x*x)+(z*z) <= p2) {
                    this.chunk.ActivateBlock(x,
                                             1,
                                             z,
                                             {r: 195, g: 88, b: 23, a: 255});
                }
            }
        }
    };

    TreeSmall.prototype.Create = function(w,h,d, pos) {
        ProcObject.prototype.Create.call(this, w, h, d, pos);

        // Build stem
        var segCount = 50;
        var radius = 2;
        for(var i = 0; i < 10; i++) {
            var centre = new THREE.Vector3(w/2, i, w/2);
            this.BuildRing(segCount*i, centre, i);
        }

        // Activate and set color for blocks
   //     for(var x = (w/2)-power; x < (w/2)+power; x++) {
   //         for(var y = 0; y < h; y++) {
   //             for(var z = (d/2)-power; z < (d/2)+power; z++) {
   //                 console.log((x*x+y*y+z*z) +" <= "+power*power);
   //                 if(x*x+y*y+z*z <= (w/2+power)*(w/2+power)) {
   //                     this.chunk.ActivateBlock(x,y,z, {r: Math.round(Math.random()*255), g: Math.round(Math.random()*255), b: Math.round(Math.random()*255), a: 255});
   //                 }   
   //             }
   //         }
   //     }
        this.chunk.Rebuild();
        this.chunk.mesh.rotation.set(0, -Math.PI, 0);
        this.chunk.mesh.position.set(pos.x, pos.y, pos.z);
        game.scene.add(this.chunk.mesh);

        console.log("Created: "+this.type);
    };
}
TreeSmall.prototype = new ProcObject();
TreeSmall.prototype.constructor = TreeSmall;


