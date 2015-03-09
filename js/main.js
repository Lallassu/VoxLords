//==============================================================================
// Author: Nergal
// Date: 2014-11-17
//==============================================================================
"use strict";

function Game() {
    this.container;
    this.scene;
    this.camera;
    this.renderer;
    this.stats;
    this.clock;
    this.controls;

    // Scene settings
    this.screenWidth = $('#main').innerWidth();
    this.screenHeight = $('#main').innerHeight();
    //this.screenWidth = window.innerWidth;
    //this.screenHeight = window.innerHeight;
    this.viewAngle = 40;
    this.aspect = this.screenWidth/this.screenHeight;
    this.near = 1;
    this.far = 61;
    this.invMaxFps = 1/60;
    this.frameDelta = 0;
    this.updateEnd = 0;
    this.animId = 0;
    this.spectate = 1;

    // Object arrays
    this.objects = [];
    this.engines = [];
    this.targets = [];

    // Game
    this.world = undefined;
    this.rotateY = new THREE.Matrix4().makeRotationY( 0.005 );

    this.worldMap = undefined;
    this.chunkManager = undefined;
    this.player = undefined;
    this.physBlockPool = undefined;
    this.snowPool = undefined;
    this.ammoPool = undefined;
    this.voxLoader = new VoxLoader();
    this.soundLoader = new SoundLoader();
    this.currentMap = undefined;
    this.songMuted = false;

    //==========================================================
    // Update status text such as "God mode ..."
    //==========================================================
    Game.prototype.setStatusCenter = function(text, color) {
        if(text != "") {
            if(color != undefined) {
                $('#statusCenter').css({'color': color});
            }
            $('#statusCenter').text(text);
            $('#statusCenter').fadeIn(600);
        } else {
            $('#statusCenter').text("");
            $('#statusCenter').fadeOut(600);
        }
    };

    //==========================================================
    // Update status text such as objective
    //==========================================================
    Game.prototype.setStatus = function(text, color) {
        if(text != "") {
            if(color != undefined) {
                $('#status').css({'color': color});
            }
            $('#status').text(text);
            $('#status').fadeIn(600);
        } else {
            $('#status').text("");
            $('#status').fadeOut(600);
        }
    };

    //==========================================================
    // Update progressbar for loading map
    //==========================================================
    Game.prototype.updateProgress = function(txt, percent) {
        $('#loading').fadeIn();
        $('#progress').text(txt);
        $('#progress').width(percent);
    };

    //==========================================================
    // InitScene
    //==========================================================
    Game.prototype.initScene = function() {
        this.scene = new THREE.Scene();
        //this.scene.fog = new THREE.FogExp2( 0x000000, 0.0025 );
        this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
        this.scene.add(this.camera);
    };

    //==========================================================
    // Re init
    //==========================================================
    Game.prototype.ReInit = function(mapId) {
        localStorage.setItem("mapId", mapId);
        localStorage.setItem("reload", 1);
        localStorage.setItem("sound", this.soundLoader.muted);
        localStorage.setItem("music", this.songMuted);
        window.location.reload();
    };

    //==========================================================
    // Init other stuff
    //==========================================================
    Game.prototype.Init = function(mapId) {
        localStorage.setItem("mapId", 0);
        localStorage.setItem("reload", 0);
        $('#container').html("");
        $('#container').hide();
        $('#stats').html("");
        $('#menu').html("");
        $('#main').css({"background": "url('gui/gui1/bg"+mapId+".png') no-repeat"});
        $('#main').css({"background-size": "cover"});
        //$('#main').css({"background-position": "center"});
        this.clock = new THREE.Clock();
        this.stats = new Stats();
        $('#stats').append(this.stats.domElement);

        this.initScene();

        // Load models
        this.voxLoader.Add({file: "box_hp.vox", name: "healthbox"});
        this.voxLoader.Add({file: "princess.vox", name: "princess"});
        this.voxLoader.Add({file: "player1.vox", name: "player"});
        this.voxLoader.Add({file: "santa.vox", name: "santa"});
        this.voxLoader.Add({file: "elf.vox", name: "elf"});
        this.voxLoader.Add({file: "devil1.vox", name: "devil1"});
        this.voxLoader.Add({file: "devil2.vox", name: "devil2"});
        this.voxLoader.Add({file: "cage.vox", name: "cage"});
        this.voxLoader.Add({file: "box_explode.vox", name: "bomb"});
        this.voxLoader.Add({file: "box_godmode.vox", name: "godmode"});
        this.voxLoader.Add({file: "castle1.vox", name: "castle"});
        this.voxLoader.Add({file: "weaponbox.vox", name: "weaponbox"});
        this.voxLoader.Add({file: "hula1.vox", name: "hula1"});
        this.voxLoader.Add({file: "hula2.vox", name: "hula2"});
        this.voxLoader.Add({file: "tree1.vox", name: "tree1"});
        this.voxLoader.Add({file: "tree2.vox", name: "tree2"});
        this.voxLoader.Add({file: "tree3.vox", name: "tree3"});
        this.voxLoader.Add({file: "tree4.vox", name: "tree4"});
        this.voxLoader.Add({file: "tree5.vox", name: "tree5"});
        this.voxLoader.Add({file: "tree7.vox", name: "tree7"});
        this.voxLoader.Add({file: "tree8.vox", name: "tree8"});
        this.voxLoader.Add({file: "hell1.vox", name: "hell1"});
        this.voxLoader.Add({file: "hell2.vox", name: "hell2"});
        this.voxLoader.Add({file: "cloud1.vox", name: "cloud1"});
        this.voxLoader.Add({file: "plantox1.vox", name: "plantox1"});
        this.voxLoader.Add({file: "plantox2.vox", name: "plantox2"});
       
        // Load sounds
        this.soundLoader.Add({file: "sound/explosion2.mp3", name: "explode"});
        this.soundLoader.Add({file: "sound/shot2.mp3", name: "shot1"});
        this.soundLoader.Add({file: "sound/runcastle.wav", name: "princess_saved"});
        this.soundLoader.Add({file: "sound/help.wav", name: "princess_help"});
        this.soundLoader.Add({file: "sound/aj.wav", name: "princess_aj"});
        this.soundLoader.Add({file: "sound/saved.wav", name: "princess_castle"});
        this.soundLoader.Add({file: "sound/careful.wav", name: "princess_careful"});
        this.soundLoader.Add({file: "sound/voxaj.wav", name: "vox_aj"});
        this.soundLoader.Add({file: "sound/crate_explode.wav", name: "crate_explode"});
        this.soundLoader.Add({file: "sound/health.mp3", name: "health"});
        this.soundLoader.Add({file: "sound/die1.mp3", name: "die1"});
        this.soundLoader.Add({file: "sound/die2.mp3", name: "die2"});
        this.soundLoader.Add({file: "sound/growl1.mp3", name: "growl1"});
        this.soundLoader.Add({file: "sound/growl2.mp3", name: "growl2"});
        this.soundLoader.Add({file: "sound/jump.wav", name: "jump"});
        this.soundLoader.Add({file: "sound/swoosh.wav", name: "swoosh"});

        this.renderer = new THREE.WebGLRenderer( {antialias: true} );
        this.renderer.setSize(this.screenWidth, this.screenHeight);
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
        this.keyboard = new THREEx.KeyboardState();
        this.container = document.getElementById('container');
        //this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        THREEx.WindowResize(this.renderer, this.camera);

        this.chunkManager = new ChunkManager();
        this.chunkManager.Create();

        $('#statusCenter').html("<font size='20px' style='color: #FFFFFF; ' class=''>Loading, please wait...<br></font><font class='' style='font-size:20px; color: #FFFFFF;'>Walk/jump W-A-S-D-SPACE, click to shoot.<br>Keys 1-3 to choose weapon.</font>");
        $('#statusCenter').show();

        this.LoadScene(mapId);
    };

    Game.prototype.LoadScene = function(mapId) {
        var x = game.voxLoader.PercentLoaded();
        console.log("Loaded: "+x+"%");
        if(x < 100) {
            setTimeout(function() { game.LoadScene(mapId);}, 500);
            return;
        }
        this.SetMap(mapId);
       // $('#status_1').text("Total blocks: "+this.chunkManager.totalBlocks);
       // $('#status_2').text("Active blocks: "+this.chunkManager.activeBlocks);
       // $('#status_3').text("Total chunks: "+this.chunkManager.totalChunks);
       // $('#status_4').text("Active triangles: "+this.chunkManager.activeTriangles);

        setTimeout(function() {
            $('#container').fadeIn(1000);
            $('#menu').hide();
            //if(!this.songMuted) {
            //    document.getElementById("song").volume = 0.4; 
            //}
            game.setStatus("Kill all enemies and save princess Voxilia");
            $('#weapons').fadeIn(1000);
        }, 3000);

        this.physBlockPool = new PhysBlockPool();
        this.physBlockPool.Create(500);

        this.snowPool = new PhysBlockPool();
        this.snowPool.Create(1000);

        this.ammoPool = new AmmoPool();
        this.ammoPool.Create(30);
        this.animate();
    };


    Game.prototype.SetMap = function(id) {
        var map = new Object();
        if(id == 1) {
            map.mapId = 1;
            map.mapFile = "maps/map1.png";
            map.mapName = "UnderWorld: Home of Lord Diablox";
            map.playerPosition = new THREE.Vector3(14, 0.5, 107);
            map.playerModel = "player";
            map.princessModel = "princess";
            map.cageModel = "cage";
            map.cagePosition = new THREE.Vector3(107,6,28);
            map.princessPosition = new THREE.Vector3(107, 6,27);
            map.castlePosition = new THREE.Vector3(88,0.5,106);
            map.castleModel = "castle";
            // Devil2 = axe devil, devil 1 = old man
            map.enemiesBefore = [
                ["Devil2", 29, 1, 79, "SmallShot"],
                ["Devil2", 36, 1, 82, "SmallShot"],
                ["Devil2", 40, 1, 86, "SmallShot"],
                ["Devil2", 14, 1, 11, "SmallShot"],
                ["Devil2", 32, 1, 16, "SmallShot"],
                ["Devil2", 89, 1, 45, "SmallShot"],
                ["Devil2", 82, 1, 39, "SmallShot"],
                ["Devil2", 92, 2.5, 36, "SmallShot"],
                ["Devil1", 64, 1, 1, "SmallShot"],
                ["Devil1", 72, 2, 58, "SmallShot"],
            ];
            map.enemiesAfter = [
                ["Devil2", 95, 2, 64, "SmallShot"],
                ["Devil2", 87, 2, 72, "SmallShot"],
                ["Devil2", 107, 2, 79, "SmallShot"],

                ["Devil1", 96, 1, 90, "SmallShot"],
                ["Devil1", 86, 1, 88, "SmallShot"],

            ];
            map.fogColor = 0xA80000;
            map.clearColor = 0xA80000;
            map.blockSize = 0.5;
            map.wallHeight = 20;
            map.useLava = true;
            map.useWater = false;
            map.waterPosition = 0;
            map.lavaPosition = 0;
            map.objects = function() {
             //   new Tree().Create(54,0.5,65, 1.5, "hell2");
             //   new Tree().Create(113,0.5,95, 1.5, "hell2");
             //   new Tree().Create(113,0.5,95, 1.5, "hell2");
             //   new Tree().Create(107,0.5,59, 1.5, "hell2");
            };
            map.items = function() {
               new HealthBox().Create(new THREE.Vector3(41, 1, 79));
               new HealthBox().Create(new THREE.Vector3(113, 6.5, 31));
               new Godmode().Create(new THREE.Vector3(79, 6.5, 75));
               new Godmode().Create(new THREE.Vector3(61, 6.5, 34));
               new Bomb().Create(new THREE.Vector3(67, 1, 20));
               new Bomb().Create(new THREE.Vector3(22, 1, 26));
               new Bomb().Create(new THREE.Vector3(83, 1, 88));
                //new WeaponBox().Create(new THREE.Vector3(75, 1, 50));
            };
            map.lights = function() {
                console.log("Initiate lights...");
                var ambientLight = new THREE.AmbientLight( 0x330000 );
                game.scene.add( ambientLight );

                var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.9 );
                hemiLight.color.setHSL( 0.6, 1, 0.6 );
                hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
                hemiLight.position.set( 0, 500, 0 );
                game.scene.add( hemiLight );

                var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
                dirLight.color.setHSL( 0.1, 1, 0.95 );
                dirLight.position.set( 10, 10.75, 10 );
                dirLight.position.multiplyScalar( 10 );
                game.scene.add( dirLight );

                //dirLight.castShadow = false;
                dirLight.castShadow = true;

                dirLight.shadowMapWidth = 2048;
                dirLight.shadowMapHeight = 2048;

                var d = 150;

                dirLight.shadowCameraLeft = -d;
                dirLight.shadowCameraRight = d;
                dirLight.shadowCameraTop = d;
                dirLight.shadowCameraBottom = -d;

                dirLight.shadowCameraFar = 3500;
                dirLight.shadowBias = -0.0001;
                dirLight.shadowDarkness = 0.45;
                //dirLight.shadowCameraVisible = true;
            };
        } else if(id == 2)  {
            map.mapId = 2;
            map.mapFile = "maps/map2.png";
            map.mapName = "Island of St. Vox: Home of Lord Plantox";
            map.playerPosition = new THREE.Vector3(16, 0.5, 119);
            map.playerModel = "player";
            map.princessModel = "princess";
            map.cageModel = "cage";
            map.cagePosition = new THREE.Vector3(109,4,32);
            map.princessPosition = new THREE.Vector3(109, 5,32);
            map.castlePosition = new THREE.Vector3(99,5.5,109);
            map.castleModel = "castle";
            // Devil2 = axe devil, devil 1 = old man
            map.enemiesBefore = [
                ["Plantox2", 17, 4.5, 81, "SmallShot"],
                ["Plantox2", 29, 5, 78, "SmallShot"],
                ["Plantox1", 31, 5, 59, "SmallShot"],
                ["Plantox2", 37, 6, 27, "SmallShot"],
                ["Plantox2", 15, 3.5, 15, "SmallShot"],
                ["Plantox2", 34, 2.5, 14, "SmallShot"],
                ["Plantox2", 97, 2, 28, "SmallShot"],
                ["Plantox1", 100, 2, 38, "SmallShot"],
                ["Plantox1", 80, 3, 31, "SmallShot"],

            ];
            map.enemiesAfter = [
                ["Plantox2", 97, 2.5, 57, "SmallShot"],
                ["Plantox1", 75, 3, 56, "FloatingShot"],
                ["Plantox1", 66, 4, 79, "FloatingShot"],
                ["Plantox2", 104, 4, 86, "SmallShot"],
                ["Plantox2", 97, 4, 87, "SmallShot"],
                ["Plantox2", 85, 4, 87, "SmallShot"],
                ["Plantox2", 96, 5, 98, "QuakeShot"],
            ];
            map.fogColor = 0x19bfde;
            map.clearColor = 0x19bfde;
            map.blockSize = 0.5;
            map.wallHeight = 20;
            map.useLava = false,
            map.useWater = true;
            map.waterPosition = 0.2;
            map.lavaPosition = 0;
            map.objects = function() {
                new Cloud().Create("cloud1", false);
                new Cloud().Create("cloud1", false);
                new Cloud().Create("cloud1", false);
                new Cloud().Create("cloud1", false);
                new Cloud().Create("cloud1", false);
                new Cloud().Create("cloud1", false);
                new Cloud().Create("cloud1", false);
                new Cloud().Create("cloud1", false);

                new Tree().Create(28,4,123, 2, "tree5");
                new Tree().Create(89,6,107, 2, "tree2");
                new Tree().Create(109,6,108, 2, "tree2");
                new Tree().Create(14,4,108, 2, "tree2");
                new Tree().Create(27, 3.5,100, 2, "tree1");
                new Tree().Create(30, 4.5, 47, 2, "tree5");
                new Tree().Create(85, 3.5, 43, 2, "tree5");
                new Tree().Create(8, 3, 9, 2, "tree8");
                new Tree().Create(34, 2.5, 14, 2, "tree1");
                new Tree().Create(82, 1.5, 14, 2, "tree1");
                new Tree().Create(112, 2.5, 23, 2, "tree2");
                new Tree().Create(56, 2.5, 90, 2, "tree7");
                new Tree().Create(57, 2, 72, 2, "tree5");
            };
            map.items = function() {
               new HealthBox().Create(new THREE.Vector3(26, 6.5, 114));
               new HealthBox().Create(new THREE.Vector3(8, 4, 6));
               new HealthBox().Create(new THREE.Vector3(122, 4, 9));
               new HealthBox().Create(new THREE.Vector3(65, 4, 79));
               new Godmode().Create(new THREE.Vector3(112, 3.5, 39));
               new WeaponBox().Create(new THREE.Vector3(90, 5, 77));
            };
            map.lights = function() {
                console.log("Initiate lights...");
                var ambientLight = new THREE.AmbientLight( 0x000033 );
                game.scene.add( ambientLight );

                var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.9 );
                hemiLight.color.setHSL( 0.6, 1, 0.6 );
                hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
                hemiLight.position.set( 0, 500, 0 );
                game.scene.add( hemiLight );

                var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
                dirLight.color.setHSL( 0.1, 1, 0.95 );
                dirLight.position.set( 10, 10.75, 10 );
                dirLight.position.multiplyScalar( 10 );
                game.scene.add( dirLight );

                //dirLight.castShadow = false;
                dirLight.castShadow = true;

                dirLight.shadowMapWidth = 2048;
                dirLight.shadowMapHeight = 2048;

                var d = 150;

                dirLight.shadowCameraLeft = -d;
                dirLight.shadowCameraRight = d;
                dirLight.shadowCameraTop = d;
                dirLight.shadowCameraBottom = -d;

                dirLight.shadowCameraFar = 3500;
                dirLight.shadowBias = -0.0001;
                dirLight.shadowDarkness = 0.45;
                //dirLight.shadowCameraVisible = true;
            };
        } else if(id == 3) {
            map.mapId = 3;
            map.mapFile = "maps/map3.png";
            map.mapName = "North Pole: Home of Lord Santox";
            map.playerPosition = new THREE.Vector3(16, 0.5, 119);
            map.playerModel = "player";
            map.princessModel = "princess";
            map.cageModel = "cage";
            map.cagePosition = new THREE.Vector3(62,4,62);
            map.princessPosition = new THREE.Vector3(62, 4, 62);
            map.castlePosition = new THREE.Vector3(109,4,15);
            map.castleModel = "castle";
            map.enemiesBefore = [
                ["Santa", 25, 2, 81, "FloatingShot", 2],
                ["Elf", 30, 2, 75, "SmallShot"],
                ["Elf", 15, 2, 70, "SmallShot"],
                ["Elf", 37, 2, 54, "FloatingShot", 1],
                ["Elf", 53, 4, 51, "SmallShot"],
                ["Elf2", 54, 4, 73, "SmallShot"],
                ["Elf2", 72, 4, 53, "SmallShot"],
                ["Elf2", 64, 4, 38, "SmallShot"],
            ];
            map.enemiesAfter = [
                ["Santa", 108, 4, 26, "FloatingShot", 1],
                ["Santa", 101, 4, 17, "FloatingShot", 1],
                ["Santa", 101, 4, 11, "FloatingShot", 1],
                ["Elf", 88, 4, 29, "SmallShot"],
                ["Elf", 97, 4, 61, "SmallShot"],
                ["Elf", 91, 2, 83, "SmallShot"],
            ];
            map.fogColor = 0xb3f0f4;
            map.clearColor = 0xb3f0f4;
            map.blockSize = 0.5;
            map.wallHeight = 20;
            map.useLava = false,
            map.useWater = true;
            map.waterPosition = 0.2;
            map.lavaPosition = 0;
            map.objects = function() {
                new Cloud().Create("cloud1", true);
                new Cloud().Create("cloud1", true);
                new Cloud().Create("cloud1", true);
                new Cloud().Create("cloud1", true);
                new Cloud().Create("cloud1", true);
                new Cloud().Create("cloud1", true);
                new Cloud().Create("cloud1", true);
                new Cloud().Create("cloud1", true);
            };
            map.items = function() {
               new HealthBox().Create(new THREE.Vector3(27, 4.5, 114));
               new HealthBox().Create(new THREE.Vector3(21, 4.5, 49));
               new HealthBox().Create(new THREE.Vector3(55, 4.5, 28));
               new Godmode().Create(new THREE.Vector3(16, 3.5, 12));
               new Godmode().Create(new THREE.Vector3(21, 3.5, 9));
               new Godmode().Create(new THREE.Vector3(117, 4.5, 60));
               new WeaponBox().Create(new THREE.Vector3(88, 2.5, 52));
               new WeaponBox().Create(new THREE.Vector3(62, 4.5, 66));
               new WeaponBox().Create(new THREE.Vector3(95, 4.5, 23));
               new Bomb().Create(new THREE.Vector3(116, 4.5, 27));

            };
            map.lights = function() {
                console.log("Initiate lights...");
                var ambientLight = new THREE.AmbientLight( 0x000033 );
                game.scene.add( ambientLight );

                var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.9 );
                hemiLight.color.setHSL( 0.6, 1, 0.6 );
                hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
                hemiLight.position.set( 0, 500, 0 );
                game.scene.add( hemiLight );

                var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
                dirLight.color.setHSL( 0.1, 1, 0.95 );
                dirLight.position.set( 10, 10.75, 10 );
                dirLight.position.multiplyScalar( 10 );
                game.scene.add( dirLight );

                //dirLight.castShadow = false;
                dirLight.castShadow = true;

                dirLight.shadowMapWidth = 2048;
                dirLight.shadowMapHeight = 2048;

                var d = 150;

                dirLight.shadowCameraLeft = -d;
                dirLight.shadowCameraRight = d;
                dirLight.shadowCameraTop = d;
                dirLight.shadowCameraBottom = -d;

                dirLight.shadowCameraFar = 3500;
                dirLight.shadowBias = -0.0001;
                dirLight.shadowDarkness = 0.45;
                //dirLight.shadowCameraVisible = true;
            };
        } else if(id == 4) {
            map.mapId = 4;
            map.mapFile = "maps/map4.png";
            map.mapName = "Voxadu Beach: Home of Lord Bolvox";
            map.playerPosition = new THREE.Vector3(16, 0.5, 119);
            map.playerModel = "player";
            map.princessModel = "princess";
            map.cageModel = "cage";
            map.cagePosition = new THREE.Vector3(107,2,21);
            map.princessPosition = new THREE.Vector3(107, 2.5, 21);
            map.castlePosition = new THREE.Vector3(77,3.5,104);
            map.castleModel = "castle";
            // Devil2 = axe devil, devil 1 = old man
            map.enemiesBefore = [
                ["Hula1", 23, 0.5, 67, "SmallShot"],
                ["Hula1", 20, 5, 53, "SmallShot"],
                ["Hula2", 14, 2.5, 21, "FloatingShot"],
                ["Hula2", 30, 2.5, 18, "FloatingShot"],
                ["Hula2", 44, 2, 58, "FloatingShot"],

                ["Hula1", 101, 1, 17, "SmallShot"],
                ["Hula1", 102, 1.5, 22, "SmallShot"],
                ["Hula1", 106, 2.5, 27, "SmallShot"],

            ];
            map.enemiesAfter = [
                ["Hula1", 72, 3.5, 91, "QuakeShot"],
                ["Hula1", 101, 3.5, 93, "FloatingShot"],
                ["Hula1", 93, 3.5, 91, "FloatingShot"],
                ["Hula2", 92, 3.5, 78, "SmallShot"],
                ["Hula2", 98, 3.5, 79, "SmallShot"],
                ["Hula2", 105, 3.5, 78, "SmallShot"],
                ["Hula2", 88, 5, 70, "QuakeShot"],
            ];
            map.fogColor = 0xeddeab;
            map.clearColor = 0xeddeab;
            map.blockSize = 0.5;
            map.wallHeight = 20;
            map.useLava = false,
            map.useWater = true;
            map.waterPosition = 0.2;
            map.lavaPosition = 0;
            map.objects = function() {
                new Tree().Create(8,2,110, 2, "tree1");
                new Tree().Create(45,2,60, 2, "tree1");
                new Tree().Create(59,2,35, 2, "tree1");
                new Tree().Create(17,2,13, 2, "tree1");
                new Tree().Create(33,2,13, 2, "tree1");
                new Tree().Create(110,2.5,16, 2, "tree1");
                new Tree().Create(107,2.5,27, 2, "tree2");
                new Tree().Create(92,3.5,109, 2, "tree2");
                new Tree().Create(86,3.5,107, 2, "tree2");
            };
            map.items = function() {
               new HealthBox().Create(new THREE.Vector3(72, 2, 52));
               new HealthBox().Create(new THREE.Vector3(121, 1, 53));
               new WeaponBox().Create(new THREE.Vector3(92, 4, 97));
               new WeaponBox().Create(new THREE.Vector3(23, 3, 21));
               new Godmode().Create(new THREE.Vector3(101, 1, 39));
               new Godmode().Create(new THREE.Vector3(69, 3.5, 79));
               new Godmode().Create(new THREE.Vector3(25, 2.5, 120));
               new HealthBox().Create(new THREE.Vector3(69, 2.5, 18));
               new Bomb().Create(new THREE.Vector3(30, 1, 75));
               new HealthBox().Create(new THREE.Vector3(15, 3, 13));
            };
            map.lights = function() {
                console.log("Initiate lights...");
                var ambientLight = new THREE.AmbientLight( 0x000033 );
                game.scene.add( ambientLight );

                var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.9 );
                hemiLight.color.setHSL( 0.6, 1, 0.6 );
                hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
                hemiLight.position.set( 0, 500, 0 );
                game.scene.add( hemiLight );

                var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
                dirLight.color.setHSL( 0.1, 1, 0.95 );
                dirLight.position.set( 10, 10.75, 10 );
                dirLight.position.multiplyScalar( 10 );
                game.scene.add( dirLight );

                //dirLight.castShadow = false;
                dirLight.castShadow = true;

                dirLight.shadowMapWidth = 2048;
                dirLight.shadowMapHeight = 2048;

                var d = 150;

                dirLight.shadowCameraLeft = -d;
                dirLight.shadowCameraRight = d;
                dirLight.shadowCameraTop = d;
                dirLight.shadowCameraBottom = -d;

                dirLight.shadowCameraFar = 3500;
                dirLight.shadowBias = -0.0001;
                dirLight.shadowDarkness = 0.45;
                //dirLight.shadowCameraVisible = true;
            };
        } 

        this.currentMap = new MapManager();
        this.currentMap.Create(map);
    };

    Game.prototype.onWindowResize = function() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    };

     //==========================================================
    // Render
    //==========================================================
    Game.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
    };

    //==========================================================
    // Animate
    //==========================================================
    Game.prototype.animate = function() {
        this.animId = requestAnimationFrame(this.animate.bind(this));
        this.render();
        this.update();
    };

    //==========================================================
    // Update
    //==========================================================
    Game.prototype.update = function() {
        var delta = this.clock.getDelta(),
        time = this.clock.getElapsedTime() * 10;

        this.frameDelta += delta;

        while(this.frameDelta >= this.invMaxFps) {
            THREE.AnimationHandler.update(this.invMaxFps);
            this.chunkManager.Draw(time, this.invMaxFps);
            for(var i = 0; i < this.objects.length; i++) {
                if(this.objects[i] != undefined) {
                    if(this.objects[i].remove == 1) { 
                        this.objects.splice(i, 1);
                    } else {
                        this.objects[i].Draw(time, this.invMaxFps, i);
                    }
                }
            }
            for(var i = 0; i < this.targets.length; i++) {
                if(this.targets[i] != undefined) {
                    if(this.targets[i].that.remove == 1) { 
                        this.targets.splice(i, 1);
                    } else if(this.targets[i].that.skipDraw > 0) {
                        this.targets[i].that.skipDraw--;
                        continue;
                    } else {
                        if(this.targets[i].that.type != "player") {
                            this.targets[i].that.Draw(time, this.invMaxFps);
                        }
                    }
                }
            }
            this.frameDelta -= this.invMaxFps;
        }	
        this.stats.update();
    };

    Game.prototype.getDistance = function(v1, v2) {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        var dz = v1.z - v2.z;
        return Math.sqrt(dx*dx+dy*dy+dz*dz);
    };
}
