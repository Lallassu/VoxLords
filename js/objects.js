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

////////////////////////////////////////////////////////////
// Cloud
/////////////////////////////////////////////////////////////
function Cloud() {
    Object3D.call(this);
    this.chunk = undefined;
    this.scale = 2;
    this.remove = 0;
    this.speed = 0;
    this.snow = true;
    
    Cloud.prototype.Draw = function(time, delta) {
        this.mesh.position.z += this.speed;
        if(this.mesh.position.z > 200) {
            this.mesh.position.z = -200;
            this.mesh.position.x = Math.random()*120;
            this.mesh.position.y = 10+Math.random()*2;
        }
        if(this.snow) {
            if(this.mesh.position.z > 20 && this.mesh.position.z < 170) {
                var block = game.snowPool.Get();
                if(block != undefined) {
                    block.Create(this.mesh.position.x+Math.random()*5, this.mesh.position.y, this.mesh.position.z+Math.random()*5,
                                 0.2,
                                 255,
                                 255,
                                 255,
                                 20,
                                 Math.random()*180,
                                 1);
                }
            }
        }
    };

    Cloud.prototype.Create = function(type, snow) {
        this.snow = snow;
        this.chunk = game.voxLoader.GetModel(type);
        for(var x = 0; x < this.chunk.chunkSizeX; x++) {
            for(var y = 0; y < this.chunk.chunkSizeY; y++) {
                for(var z = 0; z < this.chunk.chunkSizeZ; z++) {
                    this.chunk.blocks[x][y][z].r = 255;
                    this.chunk.blocks[x][y][z].g = 255;
                    this.chunk.blocks[x][y][z].b = 255;
                }
            }
        }
        this.chunk.Rebuild();
        this.mesh = this.chunk.mesh;
        this.mesh.geometry.computeBoundingBox();
        this.mesh.that = this;
        game.targets.push(this.mesh);
        var scale = 1+Math.random()*2;
        this.mesh.scale.set(scale,scale,scale);
        game.scene.add(this.mesh);
        this.speed = 0.05+Math.random()*0.1;
        this.mesh.position.z = -200;
        this.mesh.position.x = Math.random()*120;
        this.mesh.position.y = 10+Math.random()*2;
       // this.mesh.material.color.setHex(0x000000);
       // this.mesh.material.needsUpdate = true;
    };
}
Cloud.prototype = new Object3D();
Cloud.prototype.constructor = Cloud;

/////////////////////////////////////////////////////////////
// Tree
/////////////////////////////////////////////////////////////
function Tree() {
    Object3D.call(this);
    this.chunk = undefined;
    this.scale = 2;
    this.remove = 0;
    this.origy = 0;
    
    Tree.prototype.Draw = function(time, delta) {
        var y = game.chunkManager.GetHeight(this.mesh.position.x+this.chunk.blockSize*this.chunk.chunkSizeX/2,
                                            this.mesh.position.z+this.chunk.blockSize*this.chunk.chunkSizeX/2);
        
        // Explode tree if ground breaks.
         if(y < this.origy) {
           // this.Hit(0,0);
         }
    };

    Tree.prototype.Hit = function(data, dmg) {
        this.chunk.Explode(this.mesh.position, this.scale);
        this.remove = 1;
        game.scene.remove(this.mesh);
        console.log("TREE HIT!");
    };

    Tree.prototype.Create = function(x,y,z, scale, type) {
        this.chunk = game.voxLoader.GetModel(type);
        this.mesh = this.chunk.mesh;
        this.mesh.geometry.computeBoundingBox();
        this.mesh.position.set(x,y,z);
        this.mesh.that = this;
        game.targets.push(this.mesh);
        this.mesh.scale.set(scale,scale,scale);
        game.scene.add(this.mesh);
        this.origy = y;
    };
}
Tree.prototype = new Object3D();
Tree.prototype.constructor = Tree;

/////////////////////////////////////////////////////////////
// Lava
/////////////////////////////////////////////////////////////
function Lava() {
    Object3D.call(this);

    Lava.prototype.Create = function(scene) {
        var width = 400;
        var depth = 400;
        var geometry = new THREE.PlaneGeometry( width, depth, 64 - 1, 64- 1 );
        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        geometry.dynamic = true;

        var i, j, il, jl;
        for ( i = 0, il = geometry.vertices.length; i < il; i ++ ) {
            geometry.vertices[ i ].y = 0.4 * Math.sin( i/2 );
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        var texture = THREE.ImageUtils.loadTexture( "textures/lava3.png" );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 30, 30 );

        //var material = new THREE.MeshBasicMaterial( { color: 0x00CCFF, map: texture, transparent: false, opacity: 1} );
        var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 0.8} );

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(50, game.currentMap.lavaPosition, 50);
        //mesh.receiveShadow = true;
        this.mesh = mesh;
        scene.add(this.mesh);
    };

    Lava.prototype.Draw = function(time, delta, i) {
        for ( var i = 0, l = this.mesh.geometry.vertices.length; i < l; i ++ ) {
         //   this.mesh.geometry.vertices[ i ].y = 0.1 * Math.sin( i / 5 + ( time + i ) / 7 );    
            this.mesh.geometry.vertices[ i ].y = 0.2 * Math.sin( i / 5 + ( time + i ) / 4 );
        }
        this.mesh.geometry.verticesNeedUpdate = true;
    };
}
Lava.prototype = new Object3D();
Lava.prototype.constructor = Lava;



/////////////////////////////////////////////////////////////
// Water
/////////////////////////////////////////////////////////////
function Water() {
    Object3D.call(this);

    Water.prototype.Create = function(scene) {
        var width = 400;
        var depth = 400;
        var geometry = new THREE.PlaneGeometry( width, depth, 64 - 1, 64 - 1 );
        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        geometry.dynamic = true;

        var i, j, il, jl;
        for ( i = 0, il = geometry.vertices.length; i < il; i ++ ) {
            geometry.vertices[ i ].y = 0.4 * Math.sin( i/2 );
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        var texture = THREE.ImageUtils.loadTexture( "textures/water2.png" );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 30, 30 );

        var material = new THREE.MeshBasicMaterial( { color: 0x00CCFF, map: texture, transparent: true, opacity: 0.5} );
        //var material = new THREE.MeshBasicMaterial( { map: texture, transparent: false, opacity: 1} );

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(50, game.currentMap.waterPosition, 50);
        //mesh.receiveShadow = true;
        this.mesh = mesh;
        scene.add(this.mesh);
    };

    Water.prototype.Draw = function(time, delta, i) {
        for ( var i = 0, l = this.mesh.geometry.vertices.length; i < l; i ++ ) {
           // this.mesh.geometry.vertices[ i ].y = 0.1 * Math.sin( i / 5 + ( time + i ) / 7 );    
            this.mesh.geometry.vertices[ i ].y = 0.2 * Math.sin( i / 5 + ( time + i ) / 4 );
        }
        this.mesh.geometry.verticesNeedUpdate = true;
    };
}
Water.prototype = new Object3D();
Water.prototype.constructor = Water;
