/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-08
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Player base 'class'
/////////////////////////////////////////////////////////////
function MapManager() {
    this.mapName = "Unknown";
    this.mapFile = "map1.png";
    this.startPosition = undefined; 
    this.playerModel = "player.vox";
    this.princessModel = "princess.vox";
    this.cageModel = "cage.vox";
    this.cagePosition = undefined;
    this.castleModel = "castle.vox";
    this.castlePosition = undefined;
    this.voxModels = [];
    this.enemiesBefore = []; 
    this.enemiesAfter = []; 
    this.percentLoaded = 0;
    this.clearColor = 0x000000;
    this.fogColor = 0x000000;
    this.blockSize = 0.5;
    this.wallHeight = 20;
    this.useLava = true;
    this.useWater = false;
    this.enemiesKilled = 0;
    this.princess = undefined;
    this.waterPosition = 0;
    this.lavaPosition = 0;
    this.id = 0;

    MapManager.prototype.GetTotalEnemies = function() {
        return this.enemiesBefore.length;
    };

    MapManager.prototype.GetEnemiesLeft = function() {
        return (this.enemiesBefore.length - this.enemiesKilled);
    };

    MapManager.prototype.Create = function(args) {
        this.mapName = args.mapName;
        this.mapFile = args.mapFile;
        this.playerPosition = args.playerPosition;
        this.playerModel = args.playerModel;
        this.princessPosition = args.princessPosition;
        this.princessModel = args.princessModel;
        this.cageModel = args.cageModel;
        this.cagePosition = args.cagePosition;
        this.castleModel = args.castleModel;
        this.castlePosition = args.castlePosition;
        this.enemiesBefore = args.enemiesBefore;
        this.enemiesAfter = args.enemiesAfter;
        this.fogColor = args.fogColor;
        this.clearColor = args.clearColor;
        this.blockSize = args.blockSize;
        this.wallHeight = args.wallHeight;
        this.useLava = args.useLava;
        this.useWater = args.useWater;
        this.waterPosition = args.waterPosition;
        this.lavaPosition = args.lavaPosition;
        this.id = args.mapId;

        game.scene.fog = new THREE.Fog( this.fogColor, 40, 60 );
        game.renderer.setClearColor(this.clearColor, 1);

        // Init lights
        args.lights();

        // Spawn items
        args.items();
        if(args.objects != undefined) {
            args.objects();
        }

        this.SpawnWorld();
        this.BuildWorldChunks();
    };

    MapManager.prototype.BuildWorldChunks = function() {
        var x = game.chunkManager.PercentLoaded();
        console.log("World loaded: "+x+"%");
        if(x < 100 || game.chunkManager.maxChunks == 0) {
            var that = this;
            setTimeout(function() { that.BuildWorldChunks(); }, 500);
            return;
        }
        game.chunkManager.BuildAllChunks();

        this.SpawnPrincess();
        this.SpawnCage();
        this.SpawnEnemiesBefore();
        this.SpawnCastle();


        if(this.useLava) {
            var lava = new Lava();
            lava.Create(game.scene); 
            game.objects.push(lava);
        }
        if(this.useWater) {
            var water = new Water();
            water.Create(game.scene); 
            game.objects.push(water);
        }
        this.SpawnPlayer();
        $('#statusEnemies').fadeIn(600);
        $('#statusEnemies').text("Enemies left: "+this.GetEnemiesLeft());
        game.setStatusCenter(this.mapName, "#FF0000");
        $('#statusCenter').fadeIn(1000);
        setTimeout(function() {
            $('#statusCenter').fadeOut(2000);
        }, 3000);
        $('#loading').hide();
    };

    MapManager.prototype.Loaded = function(type) {
        // TBD: Update percent loaded on site.
        // $('#loaded').text("Loading "+ type + "("+ this.percentLoaded + "%)");
    };

    MapManager.prototype.SpawnEnemiesBefore = function() {
        // For each in this.enemies
        for(var i = 0; i < this.enemiesBefore.length; i++) {
            console.log("Spawning enemy: "+this.enemiesBefore[i][0]);
            var enemy = new window[this.enemiesBefore[i][0]]();
            enemy.Create(this.enemiesBefore[i][1], this.enemiesBefore[i][2], this.enemiesBefore[i][3], this.enemiesBefore[i][4]);
            if(this.enemiesBefore[i][5] != undefined) {
                enemy.setDamage(this.enemiesBefore[i][5]);
            }
        }
    };

    MapManager.prototype.SpawnEnemiesAfter = function() {
        // For each in this.enemies
        for(var i = 0; i < this.enemiesAfter.length; i++) {
            console.log("Spawning enemy: "+this.enemiesAfter[i][0]);
            var enemy = new window[this.enemiesAfter[i][0]]();
            enemy.Create(this.enemiesAfter[i][1], this.enemiesAfter[i][2], this.enemiesAfter[i][3], this.enemiesAfter[i][4]);
            if(this.enemiesAfter[i][5] != undefined) {
                enemy.setDamage(this.enemiesAfter[i][5]);
            }
        }
    };

    MapManager.prototype.SpawnWorld = function() {
        console.log("Spawning world.");
        // Load top
        game.world = new World();
       // game.world.Load("maps/test5.png", 20, 0.5); // 10924 triangles
        game.world.Load(this.mapFile, this.wallHeight, this.blockSize); // 10924 triangles
        // TBD: Fix so that we don't depend on timeout.
    };

    MapManager.prototype.SpawnPrincess = function() {
        console.log("Spawning princess.");
        this.princess = new Princess();
        this.princess.Create(this.princessPosition);
    };

    MapManager.prototype.SpawnCastle = function() {
        console.log("Spawning castle.");
        var castle = game.voxLoader.GetModel(this.castleModel);
        game.scene.add(castle.mesh);
        castle.mesh.scale.set(5,5,5);
        castle.mesh.that = castle;
        castle.mesh.position.set(this.castlePosition.x, this.castlePosition.y, this.castlePosition.z);
    };

    MapManager.prototype.SpawnCage = function() {
        console.log("Spawning cage.");
        var cage = game.voxLoader.GetModel(this.cageModel);
        game.scene.add(cage.mesh);
        cage.mesh.that = cage;
        cage.Draw = function() { return; };
        cage.princess = this.princess;
        cage.isHit = false;
        cage.Hit = function(pos) {
            if(game.currentMap.GetEnemiesLeft() != 0) {
                game.setStatus("Kill all enemies before rescuing the princess.");
                return;
            }
            //pos.z += 4;
            if(!this.isHit) {
                this.princess.Saved(); 
                this.Explode(new THREE.Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z));
                this.isHit = true;
                game.currentMap.SpawnEnemiesAfter();
                game.setStatus("Transport Voxilia to the castle.");
                $('#statusEnemies').hide();
            }
        };
        game.targets.push(cage.mesh);

        cage.mesh.position.set(this.cagePosition.x, this.cagePosition.y, this.cagePosition.z);
    };

    MapManager.prototype.SpawnPlayer = function() {
        game.player = new Player();
        game.player.Create(this.playerModel, this.playerPosition);
    };
    
}
MapManager.prototype = new MapManager();
MapManager.prototype.constructor = MapManager;

