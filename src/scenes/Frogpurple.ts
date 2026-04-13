import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3} from "@babylonjs/core"

export class Frogpurple {
    public id: string;
    public spriteManager: SpriteManager;
    public attackCollider: Mesh;
    public sprite: Sprite;
    public slimeCollider: Mesh;
    public scolliderWidth: number;
    public scolliderHeight: number;
    public scolliderDepth: number;
    public verticalVelocity: number;
    public IsGrounded: boolean;
    public slimeHealth: number;
    public waittime: number;
    public actionTime: number;
    public dir: number;
    public speed: number;
    public isAttacking: boolean;
    public pastFirstCycle: boolean;
    public degat:number;
    public isDead: boolean;
    public isSuffering: boolean;
    // Gestion du "saut de réaction" après le saut du joueur
    public jumpDelay: number;   // compte à rebours avant le saut (en frames)
    public jumpTime: number;    // temps passé dans l'animation de saut
    public baseY: number;       // hauteur de base avant le saut

    constructor(id: string, scene: Scene, initialPosition: Vector3,visible:boolean) {
        const SlimeManager = new SpriteManager(
            'SlimeManager',
            './sprites/frogpurple.png',
            1,
            { width: 20, height: 20 },
            scene
        );
        SlimeManager.texture=new Texture(
            "./sprites/frogpurple.png",
            scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        const slime = new Sprite('slime', SlimeManager);
        slime.playAnimation(0, 3, true, 100);

        slime.position = initialPosition;
        slime.size = 0.2;//0.2

        const scolliderWidth = slime.size * 0.7;   // narrower than sprite width
        const scolliderHeight = slime.size /1.4;   // close to sprite height
        const scolliderDepth = 0.1;                  // thin depth for 2D side view
        const slimeCollider = MeshBuilder.CreateBox("slimeCollider", {width: scolliderWidth+0.01, height: scolliderHeight+0.01, depth: scolliderDepth}, scene);
        slimeCollider.isVisible = false;
        slimeCollider.material = new StandardMaterial('slimeMaterial', scene);
        slimeCollider.checkCollisions = true;
        // Use ellipsoid collisions for smoother contact; align bottom of ellipsoid to feet
        slimeCollider.ellipsoid = new Vector3(scolliderWidth/2, scolliderHeight/2, scolliderDepth/2);
        slimeCollider.ellipsoidOffset = new Vector3(0, 0, 0);
        slimeCollider.position = slime.position.clone();
        const verticalVelocity = 0;
        const IsGrounded = true;
        const slimeHealth = 40;
        const waittime = 10;
        const actionTime = 0;
        const dir = 1;
        const speed = 0.005;
        const isAttacking = false;
        const pastFirstCycle = false;
        const sattackCollider =  MeshBuilder.CreateBox("attackCollider", {width: scolliderHeight+0.02, height: scolliderWidth, depth: scolliderDepth}, scene);
        sattackCollider.isVisible = visible;
        sattackCollider.material = new StandardMaterial('playerMaterial', scene);
        sattackCollider.material.wireframe = true;
        sattackCollider.checkCollisions = false;
        this.sprite = slime;
        this.spriteManager = SlimeManager;
        this.slimeCollider = slimeCollider;
        this.scolliderWidth = scolliderWidth;
        this.scolliderHeight = scolliderHeight;
        this.scolliderDepth = scolliderDepth;
        this.verticalVelocity = verticalVelocity;
        this.IsGrounded = IsGrounded;
        this.slimeHealth = slimeHealth;
        this.waittime = waittime;
        this.actionTime = actionTime;
        this.dir = dir;
        this.speed = speed;
        this.isAttacking = isAttacking;
        this.pastFirstCycle = pastFirstCycle;
        this.attackCollider = sattackCollider;
        this.id = id;
        this.degat = 40;
        this.isDead = false;
        this.isSuffering = false;
        this.jumpDelay = 0;
        this.jumpTime = 0;
        this.baseY = slime.position.y;
    }
}