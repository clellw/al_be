import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, FollowCamera, ActionManager, ExecuteCodeAction, StandardMaterial, Mesh} from "@babylonjs/core"

export class FirstScene {
    
    scene: Scene;
    engine: Engine;

    constructor(private canvas:HTMLCanvasElement){
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.engine.runRenderLoop(()=>{
            this.scene.render();
        })
    }


    CreateScene():Scene {
        const scene = new Scene(this.engine);

        const hemilight = new HemisphericLight(
            "hemilight", 
            new Vector3(0,1,0), 
            this.scene
        );

        hemilight.intensity = 1.0;

        const sphere = MeshBuilder.CreateSphere('sphere', {diameter:10, segments:5}, this.scene);

        sphere.material = new StandardMaterial('material');
        sphere.material.wireframe = true;

        this.CreateCharacter(scene);
        scene.collisionsEnabled = true;
        this.CreateEnvironment(scene);
        return scene;
    }

    async CreateCharacter(scene:Scene): Promise<void> {

        //importing the sprites for the character
        const LManager = new SpriteManager(
            'LManager',
            './sprites/spritesheet_L.png',
            1,
            336,
            scene
        );
        const lyrina = new Sprite('lyrina', LManager)
        lyrina.size = 0.4;
        lyrina.playAnimation(0, 7, true, 100);

        //creating the movements of the player and the camera
        const keyStatus: { [key: string]: boolean } = { q: false, s: false, ' ': false };
        
        scene.actionManager = new ActionManager(scene);

        const sideCamera = new FreeCamera("SideCamera", new Vector3(0, 0.5, 2.3), scene);
        // Make camera look toward -Z (scene) so it doesn't look into empty space
        sideCamera.setTarget(new Vector3(sideCamera.position.x, sideCamera.position.y, 0));

        // Player collider sized in world units based on sprite size (not texture pixels)
        const colliderWidth = lyrina.size * 0.25;   // narrower than sprite width
        const colliderHeight = lyrina.size /1.71;   // close to sprite height
        const colliderDepth = 0.1;                  // thin depth for 2D side view
        const playerCollider = MeshBuilder.CreateBox("playerCollider", {width: colliderWidth, height: colliderHeight, depth: colliderDepth}, scene);
        playerCollider.isVisible = true;
        playerCollider.material = new StandardMaterial('playerMaterial', scene);
        playerCollider.material.wireframe = true;
        playerCollider.checkCollisions = true;
        // Use ellipsoid collisions for smoother contact; align bottom of ellipsoid to feet
        playerCollider.ellipsoid = new Vector3(colliderWidth/2, colliderHeight/2, colliderDepth/2);
        playerCollider.ellipsoidOffset = new Vector3(0, 0, 0);
        playerCollider.position = lyrina.position.clone();
        const fixedCameraY = sideCamera.position.y;
        scene.activeCamera = sideCamera;

        
        scene.actionManager.registerAction(new ExecuteCodeAction
            (ActionManager.OnKeyDownTrigger,(event)=>{
                let key = event.sourceEvent.key;
                if(key !== "Shift"){
                    key = key.toLowerCase();
                }
                if(key in keyStatus){
                    keyStatus[key as keyof typeof keyStatus] = true;
                }
            })
        );
        scene.actionManager.registerAction(new ExecuteCodeAction
            (ActionManager.OnKeyUpTrigger,(event)=>{
                let key = event.sourceEvent.key;
                if(key !== "Shift"){
                    key = key.toLowerCase();
                }
                if(key in keyStatus){
                    keyStatus[key as keyof typeof keyStatus] = false;
                }
            })
        );

        // Create and tweak the background material.
        const backgroundManager = new SpriteManager(
            "tilesManager",
            "./sprites/place_holder_b.jpg",
            100,           
            {width:961, height:501}, 
            scene
        );
        const background = new Sprite("background", backgroundManager);
        background.position.z = -1;
        background.position.y = 1;
        background.width = 6;
        background.height = 2.9;

        let newAnim = true;
        const speed=0.07;
        let acceleration=0;
        const gravity = 0.0049999999;
        const jumpStrength = 0.09;
        let verticalVelocity = 0;
        let isGrounded = false;
        let isLanded = false;
        let falling=false;
        scene.onBeforeRenderObservable.add(()=>{
            // Jump input: start jump only if grounded
            if (keyStatus[' '] && isGrounded) {
                verticalVelocity = jumpStrength;
                isGrounded = false;
                lyrina.playAnimation(14,15,true,120);
                newAnim = true;
            }

            if(!isGrounded && verticalVelocity <0 && !falling){
                lyrina.playAnimation(16,17,true,120);
                falling = true;
            }

            // Apply vertical physics (gravity affects verticalVelocity)
            verticalVelocity -= gravity;
            const prevY = playerCollider.position.y;
            playerCollider.moveWithCollisions(new Vector3(0, verticalVelocity, 0));
            const actualDeltaY = playerCollider.position.y - prevY;

            // Grounded detection: if moving down but blocked, snap to ground and zero vertical
            if (verticalVelocity < 0 && actualDeltaY > verticalVelocity * 0.5) {
                isGrounded = true;
                if(verticalVelocity < -0.005) isLanded = true;
                verticalVelocity = 0;
            } else if (verticalVelocity > 0 && actualDeltaY < verticalVelocity * 0.5) {
                // Hit ceiling: stop upward motion
                verticalVelocity = 0;
            } else {
                isGrounded = false;
                falling = false;
            }
            
            if(keyStatus.q||keyStatus.s){
                if(newAnim && isGrounded) {
                    lyrina.playAnimation(9, 13, true, 120);
                    newAnim = false
                }
                if(keyStatus.s && !keyStatus.q){
                    lyrina.invertU = false;
                    playerCollider.moveWithCollisions(new Vector3(acceleration, 0, 0));
                    if(acceleration>-speed){
                        acceleration-=0.004;
                    }
                }
                else if(keyStatus.q ){
                    lyrina.invertU = true;
                    playerCollider.moveWithCollisions(new Vector3(acceleration, 0, 0));
                    if(acceleration<speed){
                        acceleration+=0.004;
                    }
                }
            }
            else{
                if(Math.abs(acceleration)<0.006){
                    acceleration=0;
                }
                else if(acceleration>0){
                    acceleration-=0.008;
                    playerCollider.moveWithCollisions(new Vector3(acceleration, 0, 0));
                }
                else if(acceleration<0){
                    acceleration+=0.008;
                    playerCollider.moveWithCollisions(new Vector3(acceleration, 0, 0));
                }
                if(acceleration==0 && isGrounded){
                    if(!newAnim)lyrina.playAnimation(0,7,true,100);
                    newAnim = true;
                }
                if(verticalVelocity==0 && isLanded){
                    lyrina.playAnimation(0,7,true,100);
                    isLanded = false;
                }
            }
            lyrina.position.copyFrom(playerCollider.position);
            sideCamera.position.x = playerCollider.position.x;
            background.position.x = lyrina.position._x;
            console.log(acceleration);
        });
    }

    async CreateEnvironment(scene:Scene): Promise<void> {

        const ground = MeshBuilder.CreateBox('block', {width: 10, height: 0.1, depth: 0.5}, this.scene);
        ground.position = new Vector3(0,-0.18,0);
        ground.checkCollisions = true;
        ground.isVisible = false;
        const spriteManager = new SpriteManager(
            "tilesManager",
            "./sprites/grass_m.png",
            100,           // max number of sprites
            96, 
            scene
        );

        // Create a few tiles
        for (let i = 0; i < 68; i++) {
            const tile = new Sprite("tile" + i, spriteManager);
            tile.position.x = -67 * 0.147 / 2 + i * 0.147; // space tiles apart
            tile.size = 0.15;
            tile.position.y = -0.18;
            tile.position.z = -0.01;
            tile.cellIndex = 0; // choose tile from sprite sheet
        }

        const skybox = Mesh.CreateBox("BackgroundSkybox", 500, scene, undefined, Mesh.BACKSIDE);
    
        
    }
}