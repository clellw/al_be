import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3} from "@babylonjs/core"

export class Objettest {
    public name: string;
    public lemesh: Mesh;

    constructor(name: string, scene: Scene) {
        this.lemesh = MeshBuilder.CreateBox('platform', {width: 2, height: 0.4, depth: 0.5}, scene);
        this.lemesh.position = new Vector3(0.5, 0.35, 0);
        const platformMaterial = new StandardMaterial("platformMaterial", scene);
        platformMaterial.wireframe = true;
        this.lemesh.material = platformMaterial;
        this.name = name;
    }
}