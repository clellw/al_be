import {Scene, Engine, Camera, FreeCamera, Vector3, Animation, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3} from "@babylonjs/core"

export class Projectile {
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
    public angle:number;
    public health:number;

    // Gestion du "saut de réaction" après le saut du joueur

    constructor(id: string, scene: Scene, initialPosition: Vector3, visible:boolean, angle: number, invert: boolean) {
        const pManager = new SpriteManager(
            'pManager',
            './sprites/bosses/chapterone/projectile.png',
            1,
            { width: 22, height: 7 },
            scene
        );
        pManager.texture=new Texture(
            "./sprites/bosses/chapterone/projectile.png",
            scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        const projectile = new Sprite('projectile', pManager);

        projectile.position = initialPosition;
        projectile.position._y += 0.06;
        projectile.position._x += (invert) ? 0.02 : -0.02;
        projectile.height = 0.03;
        projectile.width = 0.1;
        projectile.angle = angle;

        const scolliderWidth = projectile.width;   // narrower than sprite width
        const scolliderHeight = projectile.height;   // close to sprite height
        const scolliderDepth = 0.1;     
        const speed = 0.01;
        const isAttacking = true;
        const pastFirstCycle = false;
        const sattackCollider =  MeshBuilder.CreateBox("attackCollider", {width: scolliderWidth-0.05, height: scolliderHeight-0.05, depth: scolliderDepth+0.01}, scene);
        sattackCollider.isVisible = visible;
        sattackCollider.material = new StandardMaterial('playerMaterial', scene);
        sattackCollider.material.wireframe = true;
        sattackCollider.checkCollisions = true;
        sattackCollider.rotation._z = -angle;
        sattackCollider.position = projectile.position.clone();


        this.sprite = projectile;
        this.spriteManager = pManager;
        this.scolliderWidth = scolliderWidth;
        this.scolliderHeight = scolliderHeight;
        this.scolliderDepth = scolliderDepth;
        this.speed = speed;
        this.isAttacking = isAttacking;
        this.pastFirstCycle = pastFirstCycle;
        this.attackCollider = sattackCollider;
        this.id = id;
        this.degat = 10;
        this.angle = angle;
        this.health = 240;
        this.isDead = false;
    }
}