//==============================================================================
// Author: Nergal
// Date: 2014-12-03
//==============================================================================

function PhysBlock() {
    this.opacity = 1.0;
    this.color = '0xFFFFFF';
    this.life = 3;
    this.mesh = undefined;
    this.remove = 0;
    this.velocity;
    this.angle;
    this.force = 0;
    this.forceY = 0;

    PhysBlock.prototype.Init = function() {
        var geo = new THREE.BoxGeometry(1,1,1);
        var mat = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            ambient: 0x996633,
            specular: 0x050505,
            shininess: 100
        });
        this.mesh = new THREE.Mesh(geo, mat);
        game.scene.add(this.mesh);
        this.mesh.visible = false;
        this.mesh.castShadow = true;
    };

    PhysBlock.prototype.Create2 = function(x,y,z,size, r, g, b, life, angle,force) {
        this.angle = angle*Math.PI/180; // to rad
        if(force > 3 ) { force = 3; }
        this.force = force;
        this.forceY = force;
        
        this.velocity = {x: (Math.random() * force)-(force/2),
                         //y: (Math.random() * force)-(force/2),
                         y: (Math.random() * force),
                         z: (Math.random() * force)-(force/2)};
        this.life = life+Math.random()*1;
        size = (size-Math.random()*size/1.5);

        var col = rgbToHex(Math.round(r), Math.round(g), Math.round(b));
        this.mesh.material.color.setHex(col);
        this.mesh.material.ambient.setHex(col);
        this.mesh.material.needsUpdate = true;
        this.mesh.scale.set(size,size,size);
        this.mesh.position.set(x,y,z);
        this.mesh.castShadow = true;
        this.mesh.visible = true;
        
        game.objects.push(this);
    };

    PhysBlock.prototype.Create = function(x,y,z,size, r, g, b, life, angle,force) {
        this.angle = angle*Math.PI/180; // to rad
        if(force > 3 ) { force = 3; }
        this.force = force;
        this.forceY = force;
        this.velocity = {x: this.force*Math.cos(this.angle),
                         y: this.force*Math.sin(this.angle),
                         z: this.force*Math.cos(this.angle)};
        this.life = life+Math.random()*1;
        size = (size-Math.random()*size/1.5);

        var col = rgbToHex(Math.round(r), Math.round(g), Math.round(b));
        this.mesh.material.color.setHex(col);
        this.mesh.material.needsUpdate = true;
        this.mesh.scale.set(size,size,size);
        this.mesh.position.set(x,y,z);
        this.mesh.visible = true;

        game.objects.push(this);
    };

    PhysBlock.prototype.Draw = function(time, delta) {
       this.life -= 0.01;
       //this.mesh.material.alpha -= 0.1;
       if(this.life <= 0 || this.mesh.position.y < game.currentMap.lavaPosition) {
            this.mesh.visible = false;
            this.remove = 1;
            this.life = 0;
            return;
       }
       var height = game.chunkManager.GetHeight(this.mesh.position.x, this.mesh.position.z);
       if(height == undefined) {
            height = 0;
       }

       if(height == 0 || height < this.mesh.position.y ||this.mesh.position.y < -1) {
            this.mesh.position.x += this.force*this.velocity.x*delta;
            this.mesh.position.y += this.forceY*this.velocity.y*delta;
            this.mesh.position.z += this.force*this.velocity.z*delta;
            this.mesh.rotation.set(this.velocity.x*time*(this.life/150)*this.life/2,
                                   this.velocity.y*time*(this.life/150)*this.life/2,
                                   this.velocity.z*time*(this.life/150)*this.life/2);
       }
       if(this.force > 0.4) {
            this.force -= 0.04;
       }
       this.forceY -= 0.07;
       
    };

    PhysBlock.prototype.getColor= function() {
        return parseInt(this.color);
    };
}
PhysBlock.prototype = new PhysBlock();
PhysBlock.prototype.constructor = PhysBlock;
