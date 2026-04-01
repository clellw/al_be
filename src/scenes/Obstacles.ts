import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3} from "@babylonjs/core"

export class Obstacles {
    public name: string;
    public lemesh: Mesh;

    constructor(name: string, scene: Scene, initialPosition: Vector3, sizeintitles: number) {
        //a refaire de la meme maniere que ceului de ground
        
        
        
        
        // largeur d'une tuile en unités monde (10 unités pour 68 tuiles sur le sol principal)
        const tileWorldWidth = 10 / 68;

        // Le mesh porte le nom passé au constructeur (ex: "block2")
        // et sa largeur correspond au nombre de tuiles demandé
        const ground = MeshBuilder.CreateBox(name, {width: sizeintitles * tileWorldWidth, height: 0.1, depth: 0.5}, scene);
        ground.position = initialPosition;
        ground.position.y = -0.18;

        ground.checkCollisions = true;
        ground.isVisible = true;

        const groundMaterial = new StandardMaterial("groundMaterial", scene);
        groundMaterial.wireframe = true;
        ground.material = groundMaterial;
        const spriteManager = new SpriteManager(
            "tilesManager",
            "./sprites/grass_m.png",
            100,           // max number of sprites
            96, 
            scene
        );

        // Create a few tiles, centrés par rapport à initialPosition.x
        for (let i = 0; i < sizeintitles; i++) {
            const tile = new Sprite("tile" + i, spriteManager);
            // même pattern que dans SceneCB, mais décalé par initialPosition.x
            const offset = - (sizeintitles - 1) * tileWorldWidth / 2 + i * tileWorldWidth;
            tile.position.x = initialPosition.x + offset;
            tile.size = 0.15;
            tile.position.y = -0.18;
            tile.position.z = -0.01;
            tile.cellIndex = 0; // choose tile from sprite sheet
        }
        
        // Adapter la taille du sprite à peu près à la largeur du mesh (2 unités)
        // Le mesh de collision porte le même nom que celui passé au constructeur (ex: "platform1")
        this.lemesh = ground;
        this.name = name;
    }
}