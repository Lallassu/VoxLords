/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2015-01-19
/////////////////////////////////////////////////////////////
function Loader() {
    Loader.prototype.total = 0;
    Loader.prototype.loaded = 0;
    Loader.prototype.percentLoaded = 0;

    Loader.prototype.PercentLoaded = function() {
        return Math.round((Loader.prototype.loaded/Loader.prototype.total)*100);
    };

    Loader.prototype.Loaded = function() {
        Loader.prototype.loaded++;
//        $('#info_load_percent').text(this.PercentLoaded()+'%');
//        $('#info_load').width(this.PercentLoaded()+'%');
    };
}

/////////////////////////////////////////////////////////////
// Sounds
/////////////////////////////////////////////////////////////
function SoundLoader() {
    Loader.call(this);
    this.sounds = new Array();
    this.context;
    this.muted = false;

    SoundLoader.prototype.StopSound = function(name) {
        var source = this.sounds[name].context;
        source.stop = source.noteOff;
        source.stop(0);
    };

    SoundLoader.prototype.PlaySound = function(name, position, radius) {
        if(this.muted) {
            return;
        }   
        var source = this.sounds[name].context.createBufferSource();
        source.buffer = this.sounds[name].buffer;
        var gainNode = this.sounds[name].context.createGain();
        source.connect(gainNode);
        gainNode.connect(this.sounds[name].context.destination);

        if(position != undefined) {
            var vector = game.camera.localToWorld(new THREE.Vector3(0,0,0));	    
            var distance = position.distanceTo( vector );
            if ( distance <= radius ) {
                var vol = 1 * ( 1 - distance / radius );
                gainNode.gain.value = vol;
                source.start(0);
            } else {
                gainNode.gain.value = 0;
            }
        } else {
            gainNode.gain.value = 1;
            source.start(0);	    
        }
    };

    SoundLoader.prototype.Add = function(args) {
        this.sounds[args.name] = new Object();
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if(this.context == undefined) {
            this.context = new AudioContext();
        }
        //var context = new AudioContext();
        var loader = new BufferLoader(this.context,
                                      [args.file],
                                      this.Load.bind(this, args.name));
                                      this.sounds[args.name].context = this.context;
                                      Loader.prototype.total++;
                                      loader.load();
    };

    SoundLoader.prototype.Load = function(name, buffer) {
        this.sounds[name].buffer = buffer[0];
        this.Loaded();
    };
}
SoundLoader.prototype = new Loader();
SoundLoader.prototype.constructor = SoundLoader;

/////////////////////////////////////////////////////////////
// Vox models
/////////////////////////////////////////////////////////////
function VoxLoader() {
    Loader.call(this);
    this.models = new Array();

    VoxLoader.prototype.GetModel = function(name) {
        return this.models[name].chunk.Clone();
    };

    VoxLoader.prototype.Add = function(args) {
        this.models[args.name] = new Object();
        this.models[args.name].args = args;
        Loader.prototype.total++;

        var vox = new Vox();
        vox.LoadModel(args.file, this.Load.bind(this), args.name);
        this.models[args.name].vox = vox;
    };
    
    VoxLoader.prototype.Load = function(vox, name) {
        console.log("Voxel: "+name+" loaded!");
        this.models[name].vox = vox;
        this.models[name].chunk = vox.getChunk();
        this.models[name].chunk.Rebuild();
        this.models[name].mesh = vox.getMesh();
        this.models[name].mesh.geometry.center();
        this.Loaded();
    };

}
VoxLoader.prototype = new Loader();
VoxLoader.prototype.constructor = VoxLoader;
