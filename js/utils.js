//==============================================================================
// Author: Nergal
// Date: 2014-06-12
//==============================================================================
// Rotate an object around an arbitrary axis in object space
function rotateAroundObjectAxis(object, axis, radians) {
    var rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
}

// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
    var rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}

function GetDistance(v1, v2) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;
    return Math.sqrt(dx*dx+dy*dy+dz*dz);
}

function UniqueArr(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}

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

function CreateBoundingBox2(obj) {
    var object3D = obj.mesh;
    var box = null;
    object3D.geometry.computeBoundingBox();
    box = geometry.boundingBox;


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
                
                game.scene.add(bcube);
    var bboxCenter = box.center();
    bcube.translateX(bboxCenter.x);
    bcube.translateY(bboxCenter.y);
    bcube.translateZ(bboxCenter.z);
    obj.bcube = bcube;
    object3D.add(bcube);

    bcube.that = obj.mesh.that;
//    return bcube;
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

function rgbToHex2(r, g, b) {
    if(r < 0) r = 0;
    if(g < 0) g = 0;
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
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
    element.requestPointerLock();
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
  console.log("URL: "+url);
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
          console.log("ERROR FOR URL: "+url);
        console.log('decodeAudioData error', error);
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
