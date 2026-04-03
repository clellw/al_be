import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3} from "@babylonjs/core"

export class Obstacles {
    public name: string;
    public lemesh: Mesh;

    constructor(name: string, scene: Scene, initialPosition: Vector3, widthincubes: number, heightincubes: number,visible:boolean) {
        //a refaire de la meme maniere que ceului de ground
        
        
        
        
        // largeur d'une tuile en unités monde (10 unités pour 68 tuiles sur le sol principal)
        const tileWorldWidth = 10 / 68;
        const tileWorldHeight = tileWorldWidth; // tuiles carrées en monde

        // On réduit la largeur de collision de 64 px de chaque côté.
        // 1 tuile = 96 px, donc 64 px = 64/96 d'une tuile en unités monde.
        const shrinkPerSideWorld = tileWorldWidth * (64 / 96);

        // Le mesh porte le nom passé au constructeur (ex: "block2")
        // et sa largeur/hauteur correspondent au nombre de tuiles demandé,
        // moins le rétrécissement de 64 px sur chaque bord.
        const ground = MeshBuilder.CreateBox(
            name,
            {
                width: widthincubes * tileWorldWidth - 2 * shrinkPerSideWorld,
                height: heightincubes * tileWorldHeight,
                depth: 0.5
            },
            scene
        );
        ground.position = initialPosition;

        ground.checkCollisions = true;
        ground.isVisible = visible;

        const groundMaterial = new StandardMaterial("groundMaterial", scene);
        groundMaterial.wireframe = true;
        ground.material = groundMaterial;

        // chaque texture PNG fait 96x96 px, on ajuste seulement la capacité
        const tileCapacity = widthincubes * heightincubes;
        const spriteManagergrass_e = new SpriteManager(
            "tilesManager",
            "./sprites/grass_e.png",
            tileCapacity,           // max number of sprites
            96, 
            scene
        );
        const spriteManagergrass_f_c = new SpriteManager(
            "tilesManager",
            "./sprites/grass_f_c.png",
            tileCapacity,           // max number of sprites
            96, 
            scene
        );
        const spriteManagergrass_f_e = new SpriteManager(
            "tilesManager",
            "./sprites/grass_f_e.png",
            tileCapacity,           // max number of sprites
            96, 
            scene
        );
        const spriteManagergrass_f_m = new SpriteManager(
            "tilesManager",
            "./sprites/grass_f_m.png",
            tileCapacity,           // max number of sprites
            96, 
            scene
        );
        const spriteManagerground_c = new SpriteManager(
            "tilesManager",
            "./sprites/ground_c.png",
            tileCapacity,           // max number of sprites
            96, 
            scene
        );
        const spriteManagerground_e = new SpriteManager(
            "tilesManager",
            "./sprites/ground_e.png",
            tileCapacity,           // max number of sprites
            96, 
            scene
        );
        const spriteManagerground_m = new SpriteManager(
            "tilesManager",
            "./sprites/ground_m.png",
            tileCapacity,           // max number of sprites
            96, 
            scene
        );

        // === Création des tuiles selon heightincubes et widthincubes ===
        let tileIndex = 0;
        for (let row = 0; row < heightincubes; row++) {
            // ligne du bas = 0, ligne du haut = heightincubes - 1
            const isBottomRow = row === 0;
            const isTopRow = row === heightincubes - 1;
            const isInnerRow = row > 0 && row < heightincubes - 1;

            for (let col = 0; col < widthincubes; col++) {
                const isLeft = col === 0;
                const isRight = col === widthincubes - 1;

                let manager: SpriteManager;
                let invertU = false;

                if (heightincubes === 1) {
                    // CAS 1 : une seule ligne flottante
                    if (isLeft) {
                        manager = spriteManagergrass_f_e;
                    } else if (isRight) {
                        manager = spriteManagergrass_f_e;
                        invertU = true;
                    } else {
                        manager = spriteManagergrass_f_m;
                    }
                } else if (heightincubes === 2) {
                    // CAS 2 : deux lignes (haut + bas)
                    if (isTopRow) {
                        // ligne du haut : herbe flottante
                        if (isLeft) {
                            manager = spriteManagergrass_f_e;
                        } else if (isRight) {
                            manager = spriteManagergrass_f_e;
                            invertU = true;
                        } else {
                            manager = spriteManagergrass_f_m;
                        }
                    } else {
                        // lignes intérieures : ground_e sur les bords, ground_m au centre
                        if (isLeft) {
                            manager = spriteManagerground_e;
                        } else if (isRight) {
                            manager = spriteManagerground_e;
                            invertU = true; // bord droit miroir
                        } else {
                            manager = spriteManagerground_m;
                        }
                    }
                } else {
                    // CAS 3 : heightincubes >= 3
                    if (isTopRow) {
                        // ligne du haut : comme le cas 2
                        if (isLeft) {
                            manager = spriteManagergrass_f_e;
                        } else if (isRight) {
                            manager = spriteManagergrass_f_e;
                            invertU = true;
                        } else {
                            manager = spriteManagergrass_f_m;
                        }
                    } else if (isBottomRow) {
                        // lignes intérieures : ground_e sur les bords, ground_m au centre
                        if (isLeft) {
                            manager = spriteManagerground_e;
                        } else if (isRight) {
                            manager = spriteManagerground_e;
                            invertU = true; // bord droit miroir
                        } else {
                            manager = spriteManagerground_m;
                        }
                    } else if (isInnerRow) {
                        // lignes intérieures : ground_e sur les bords, ground_m au centre
                        if (isLeft) {
                            manager = spriteManagerground_e;
                        } else if (isRight) {
                            manager = spriteManagerground_e;
                            invertU = true; // bord droit miroir
                        } else {
                            manager = spriteManagerground_m;
                        }
                    } else {
                        // fallback (ne devrait pas arriver)
                        manager = spriteManagerground_m;
                    }
                }

                const tile = new Sprite("tile" + tileIndex++, manager);

                // position de la tuile par rapport au centre initialPosition
                const offsetX = - (widthincubes - 1) * tileWorldWidth / 2 + col * tileWorldWidth;
                const offsetY = - (heightincubes - 1) * tileWorldHeight / 2 + row * tileWorldHeight;

                tile.position.x = initialPosition.x + offsetX;
                tile.position.y = initialPosition.y + offsetY;
                tile.position.z = -0.01;
                tile.size = 0.15;
                tile.cellIndex = 0;
                tile.invertU = invertU;
            }
        }
        
        // Adapter la taille du sprite à peu près à la largeur du mesh (2 unités)
        // Le mesh de collision porte le même nom que celui passé au constructeur (ex: "platform1")
        this.lemesh = ground;
        this.name = name;
    }
}