import {Scene, Engine, Camera, FreeCamera, Vector3, Animation, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3} from "@babylonjs/core"

export class Lazer {
    public id: string;
    public spriteManager: SpriteManager;
    public attackCollider: Mesh;
    public sprite: Sprite;
    public scolliderWidth: number;
    public scolliderHeight: number;
    public scolliderDepth: number;
    public speed: number;
    public isAttacking: boolean;
    public pastFirstCycle: boolean;
    public degat:number;
    public isDead: boolean;
    public health:number;
    public invert: boolean;

    // Gestion du "saut de réaction" après le saut du joueur

    constructor(id: string, scene: Scene, initialPosition: Vector3, visible:boolean, invert: boolean, speed: number) {
        const pManager = new SpriteManager(
            'pManager',
            './sprites/bosses/chapterone/lazer.png',
            1,
            { width: 64, height: 13 },
            scene
        );
        pManager.texture=new Texture(
            "./sprites/bosses/chapterone/lazer.png",
            scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        const lazer = new Sprite('lazer', pManager);

        lazer.position = initialPosition;
        lazer.position._y += 0.06;
        lazer.position._x += (invert) ? 0.02 : -0.02;
        lazer.height = 0.04;
        lazer.width = 0.2;

        const scolliderWidth = lazer.width;   // narrower than sprite width
        const scolliderHeight = lazer.height;   // close to sprite height
        const scolliderDepth = 0.1;     
        const isAttacking = true;
        const pastFirstCycle = false;
        const sattackCollider =  MeshBuilder.CreateBox("attackCollider", {width: scolliderWidth-0.05, height: scolliderHeight-0.05, depth: scolliderDepth+0.01}, scene);
        sattackCollider.isVisible = visible;
        sattackCollider.material = new StandardMaterial('playerMaterial', scene);
        sattackCollider.material.wireframe = true;
        sattackCollider.checkCollisions = true;
        sattackCollider.rotation._z = (invert) ? Math.PI : 0;
        sattackCollider.position = lazer.position.clone();

        lazer.angle = (invert) ? Math.PI : 0;


        this.sprite = lazer;
        this.spriteManager = pManager;
        this.scolliderWidth = scolliderWidth;
        this.scolliderHeight = scolliderHeight;
        this.scolliderDepth = scolliderDepth;
        this.speed = speed;
        this.isAttacking = isAttacking;
        this.pastFirstCycle = pastFirstCycle;
        this.attackCollider = sattackCollider;
        this.id = id;
        this.degat = 35;
        this.health = 240;
        this.isDead = false;

        this.invert = invert;
    }
}