import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3} from "@babylonjs/core"

export class Ground {
    public name: string;
    public lemesh: Mesh;
    public tiles: Sprite[];

    constructor(name: string, scene: Scene, initialPosition: Vector3, sizeintitles: number, visible:boolean) {
        // largeur d'une tuile en unités monde (10 unités pour 68 tuiles sur le sol principal)
        const tileWorldWidth = 10 / 68;

        // Le mesh porte le nom passé au constructeur (ex: "block2")
        // et sa largeur correspond au nombre de tuiles demandé
        const ground = MeshBuilder.CreateBox(name, {width: (sizeintitles * tileWorldWidth)-0.15, height: 0.1, depth: 0.5}, scene);
        ground.position = initialPosition;
        ground.position.y = initialPosition.y;

        ground.checkCollisions = true;
        ground.isVisible = visible;

        const groundMaterial = new StandardMaterial("groundMaterial", scene);
        groundMaterial.wireframe = true;
        ground.material = groundMaterial;
        const middleTilesManager = new SpriteManager(
            "tilesManagerMiddle",
            "./sprites/grass_m.png",
            10000,           // max number of sprites
            96,
            scene
        );
        const edgeTilesManager = new SpriteManager(
            "tilesManagerEdge",
            "./sprites/grass_c.png",
            10000,
            96,
            scene
        );
        const underTilesManager = new SpriteManager(
            "tilesManagerMiddle",
            "./sprites/ground_u.png",
            10000,           // max number of sprites
            96,
            scene
        );

        this.tiles = [];
        (ground as Mesh).metadata = { kind: "ground", tiles: this.tiles };

        // Create a few tiles, centrés par rapport à initialPosition.x
        for (let i = 0; i < sizeintitles; i++) {
            let invertu = false;
            const isEdgeTile = i === 0 || i === sizeintitles - 1;
            const tile = new Sprite("tile" + i, isEdgeTile ? edgeTilesManager : middleTilesManager);
            
            // même pattern que dans SceneCB, mais décalé par initialPosition.x
            const offset = - (sizeintitles - 1) * tileWorldWidth / 2 + i * tileWorldWidth;
            tile.position.x = initialPosition.x + offset;
            tile.size = 0.1501;
            tile.position.y = initialPosition.y;

            if (i === sizeintitles-1) {
                console.log("première tuile, on inverse l'UV pour que le bord 'côté extérieur' soit à gauche");
                invertu = true; // première tuile à gauche : on inverse l'UV pour que le bord "côté extérieur" soit à gauche
            }
            tile.position.z = -0.01;
            tile.cellIndex = 0; // choose tile from sprite sheet
            tile.invertU = invertu;
            this.tiles.push(tile);

            const tileu =  new Sprite("tileu" + i, underTilesManager);
            tileu.position.x = initialPosition.x + offset;
            tileu.size = 0.1501;
            tileu.position.y = initialPosition.y - 0.147;
            
            tileu.position.z = -0.01;
            tileu.cellIndex = 0; 
            this.tiles.push(tileu);
            
            const tileu2 =  new Sprite("tileu2" + i, underTilesManager);
            tileu2.position.x = initialPosition.x + offset;
            tileu2.size = 0.1501;
            tileu2.position.y = initialPosition.y - 0.2941;
            tileu2.invertV = true;
            
            tileu2.position.z = -0.01;
            tileu2.cellIndex = 0; 
            this.tiles.push(tileu2);
        }
        
        // Adapter la taille du sprite à peu près à la largeur du mesh (2 unités)
        // Le mesh de collision porte le même nom que celui passé au constructeur (ex: "platform1")
        this.lemesh = ground;
        this.name = name;
    }
}