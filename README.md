# VoxLords
Play the game here: http://voxlords.webgl.nu

A little game engine test: http://threejs.webgl.nu 

## Description
VoxLords is a ThreeJS WebGL game with a simple voxel engine. It also provides a implementation for loading .vox files that are created with MagicaVoxel (https://voxel.codeplex.com/).

**The code is free to use but I would appreciate if you give me credit when using it.**

*The code has NOT been polished and is provided "as is". There are a lot of code that are redundant and there are tons of improvements that can be made.*

I haven't had time to create some description of the code layout but if you have any questions, feel free to contact me (nergal@nergal.se).

The game implements the following (and more):
- Voxel engine with chunks 
- Basic greedy algorithm for optimizing chunks
- Sound loader with volume based on length to objects
- Basic block physics
- Voxel explosions
- Reading game maps from PNG image files
- ".vox" file loading into chunks
- etc.. 

## Testing

Install nodejs and run *"cd server; nodejs server.js"*. Then point your browser to *http://localhost:8081*

## Screenshot
![alt tag](https://raw.github.com/lallassu/VoxLords/master/promo.png)

