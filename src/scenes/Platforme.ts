import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3} from "@babylonjs/core"

export class Platforme {
    public name: string;
    public lemesh: Mesh;

    constructor(name: string, scene: Scene, initialPosition: Vector3) {
        const PlatManager = new SpriteManager(
            'PlatManager',
            './sprites/platform_1.png',
            1,
            { width: 204, height: 48 },
            scene
        );

        const platform = new Sprite(name, PlatManager);
        platform.position = initialPosition;
        // Adapter la taille du sprite à peu près à la largeur du mesh (2 unités)
        platform.width = 2/6;
        platform.height = (2 * (48 / 204))/6; // conserve le ratio 204x48 px de l'image
        // Le mesh de collision porte le même nom que celui passé au constructeur (ex: "platform1")
        this.lemesh = MeshBuilder.CreateBox(name, {width: platform.width, height: platform.height, depth: 0.5}, scene);
        this.lemesh.position = initialPosition;
        this.lemesh.checkCollisions = true;
        const platformMaterial = new StandardMaterial("platformMaterial", scene);
        platformMaterial.wireframe = true;
        this.lemesh.material = platformMaterial;
        this.name = name;
    }
}