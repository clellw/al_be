import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3} from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'
import { Objettest } from "./Objettest";
import { Slime } from "./Slime";
export class SceneCB {
    
    scene: Scene;
    engine: Engine;

    constructor(private canvas:HTMLCanvasElement){
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        //Inspector.show(this.scene, {})
        this.engine.runRenderLoop(()=>{
            this.scene.render();
        })
    }

    public health = 440;

    CreateScene(): Scene {
        const scene = new Scene(this.engine);

        scene.createDefaultCameraOrLight(true, false,true);

        const hemilight = new HemisphericLight(
            "hemilight", 
            new Vector3(0,1,0), 
            this.scene
        );

        hemilight.intensity = 0.;
        

        const sphere = MeshBuilder.CreateSphere('sphere', {diameter:3, segments:5}, this.scene);

        sphere.material = new StandardMaterial('material');
        sphere.material.wireframe = true;

        this.CreateMainCharacter(scene);
        //this.CreateEnnemy(scene);
        this.CreateEnvironment(scene);
        this.CreateDialog(scene);


        return scene;
    }

    async CreateMainCharacter(scene:Scene): Promise<void> {

        //importing the sprites for the character
        const LManager = new SpriteManager(
            'LManager',
            './sprites/spritesheet_lyrina.png',
            1,
            336,
            scene
        );
        const lyrina = new Sprite('lyrina', LManager)
        lyrina.size = 0.4;
        lyrina.playAnimation(0, 7, true, 100);
        
        //creating the movements of the player and the camera
        const keyStatus: { [key: string]: boolean } = { q: false, s: false, ' ': false, z: false };
        
        scene.actionManager = new ActionManager(scene);

        const sideCamera = new FreeCamera("SideCamera", new Vector3(0, 0.3, 1.9), scene);
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
        // No engine collisions: we resolve collisions manually with AABB
        playerCollider.position = lyrina.position.clone();

        const fixedCameraY = sideCamera.position.y;
        scene.activeCamera = sideCamera;
        const attackCollider =  MeshBuilder.CreateBox("attackCollider", {width: colliderHeight-0.03, height: colliderWidth+0.04, depth: colliderDepth}, scene);
        attackCollider.isVisible = false;
        attackCollider.material = new StandardMaterial('playerMaterial', scene);
        attackCollider.checkCollisions = false;
        
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
        const speed=0.03;
        let acceleration=0;
        const gravity = 0.0019999999;
        const jumpStrength = 0.05;
        let verticalVelocity = 0;
        let isGrounded = false;
        let isLanded = false;
        let falling=false;
        let isAttacking = false;
        const collidables: Mesh[] = [];

        
        const slime1 = new Slime('slime1', scene, new Vector3(0.5, 0, 0));
        const slime2 = new Slime('slime2', scene, new Vector3(-1, 0, 0));
        const slime3 = new Slime('slime3', scene, new Vector3(2, 0, 0));
        const slimes = [slime1, slime2, slime3];

        function slimeboucle(slime: Slime): void {
            if(slime.slimeCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                slime.slimeHealth -= 2;
                slime.sprite.playAnimation(39, 39, false, 500, () => {  
                    slime.sprite.playAnimation(0, 5, true, 100);
                    slime.waittime = 20;
                    slime.actionTime = 0;
                    slime.isAttacking = false;
                })
            }
            if(slime.sprite.cellIndex == 39) {
                const prevX = slime.slimeCollider.position.x;
                if(slime.sprite.position.x < lyrina.position.x) {
                    slime.slimeCollider.position.x -= 0.005;
                    slime.sprite.invertU = true;
                }
                else {
                    slime.slimeCollider.position.x += 0.005;
                }
                slime.slimeCollider.computeWorldMatrix(true);

                // empêcher un slime touché de traverser les autres slimes
                for (const other of slimes) {
                    if (other === slime) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        slime.slimeCollider.position.x = prevX;
                        slime.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
            }

            // === VERTICAL PHYSICS du slime (même logique que le joueur) ===
            slime.verticalVelocity -= gravity;
            const sdy1 = slime.verticalVelocity;
            slime.slimeCollider.position.y += sdy1;
            slime.slimeCollider.computeWorldMatrix(true);

            let slime1HitObstacle = false;
            for (const obstacle of collidables) {
                const oBB = obstacle.getBoundingInfo().boundingBox;
                const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                const obstacleTop = oBB.maximumWorld.y;
                const obstacleBottom = oBB.minimumWorld.y;
                const obstacleLeft = oBB.minimumWorld.x;
                const obstacleRight = oBB.maximumWorld.x;
                const slimeHalfY = sBB.extendSizeWorld.y;
                const overlapsX = sBB.maximumWorld.x >= obstacleLeft && sBB.minimumWorld.x <= obstacleRight;

                // Atterrissage sur le haut d'un obstacle
                if (sdy1 <= 0 && overlapsX && sBB.minimumWorld.y <= obstacleTop && sBB.maximumWorld.y >= obstacleTop) {
                    slime.slimeCollider.position.y = obstacleTop + slimeHalfY;
                    slime.slimeCollider.computeWorldMatrix(true);
                    slime.verticalVelocity = 0;
                    slime.IsGrounded = true;
                    slime1HitObstacle = true;
                    break;
                }
                // Collision par le dessous (tête du slime sous une plateforme)
                else if (sdy1 > 0 && overlapsX && sBB.maximumWorld.y >= obstacleBottom && sBB.minimumWorld.y <= obstacleBottom) {
                    slime.slimeCollider.position.y = obstacleBottom - slimeHalfY;
                    slime.slimeCollider.computeWorldMatrix(true);
                    slime.verticalVelocity = 0;
                    slime.IsGrounded = false;
                    slime1HitObstacle = true;
                    break;
                }
            }
            if (!slime1HitObstacle) {
                slime.IsGrounded = false;
            }

            //detectiondistance
            if(slime.sprite.cellIndex != 39) {
                if(Math.abs(playerCollider.position.x) - Math.abs(slime.slimeCollider.position.x) < 0.5 && !slime.isAttacking && slime.pastFirstCycle) {
                    slime.sprite.playAnimation(16, 38, false, 50, () => {  
                        slime.sprite.playAnimation(0, 5, true, 100);
                        slime.isAttacking = false;
                    });
                    slime.waittime = 20;
                    slime.actionTime = 0;
                    slime.isAttacking = true;
                }
                if(slime.isAttacking) {
                    const prevX = slime.slimeCollider.position.x;
                    if(slime.sprite.position.x < lyrina.position.x) {
                        slime.slimeCollider.position.x += 0.002;
                        slime.sprite.invertU = true;
                    }
                    else {
                        slime.slimeCollider.position.x -= 0.002;
                        slime.sprite.invertU = false;
                    }
                    slime.slimeCollider.computeWorldMatrix(true);

                    // collision entre slimes pendant l'attaque
                    for (const other of slimes) {
                        if (other === slime) continue;
                        const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                            break;
                        }
                    }
                }
                else {
                    if(slime.waittime > 0) {
                        slime.waittime--;
                    }
                    else {
                        if(slime.actionTime == 0) {
                            slime.actionTime = Math.floor(Math.random() * (180 - 60 + 1)) + 60;
                            slime.sprite.playAnimation(6,15, true, 100);
                            slime.dir = Math.random();
                            slime.speed =  Math.random() * (0.002 - 0.003) + 0.002;
                            console.log(slime.dir < 0.5);
                        }
                        // tentative de déplacement horizontal
                        const prevX = slime.slimeCollider.position.x;
                        if(slime.dir < 0.5) {
                            slime.slimeCollider.position.x += slime.speed;
                            slime.sprite.invertU = true;
                        }
                        else {
                            slime.slimeCollider.position.x -= slime.speed;
                            slime.sprite.invertU = false;
                        }
                        slime.slimeCollider.computeWorldMatrix(true);

                        // empêche les slimes de se traverser entre eux (collision AABB)
                        for (const other of slimes) {
                            if (other === slime) continue;
                            const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                            const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                            const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                            if (overlapX && overlapY) {
                                slime.slimeCollider.position.x = prevX;
                                slime.slimeCollider.computeWorldMatrix(true);
                                break;
                            }
                        }

                        slime.actionTime--;
                        if(slime.actionTime == 0) {
                            slime.waittime = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
                            slime.sprite.playAnimation(0, 5, true, 100);
                            slime.pastFirstCycle = true;
                        }
                    }
                }
            }
            slime.sprite.position.copyFrom(slime.slimeCollider.position);
            slime.attackCollider.position.copyFrom(slime.sprite.position);
            slime.sprite.position.y += 0.019;
            if(slime.sprite.cellIndex >= 23 && slime.sprite.cellIndex <= 34) {
                slime.attackCollider.checkCollisions = true;
            }
            else {
                slime.attackCollider.checkCollisions = false;
            }
        }

        scene.onBeforeRenderObservable.add(()=>{
            if(playerCollider.intersectsMesh(slime2.attackCollider, false) && slime2.attackCollider.checkCollisions) {
                lyrina.playAnimation(24, 24, false, 500, () => {  
                    lyrina.playAnimation(0, 5, true, 100);
                    isAttacking = false;
                })
                this.health -= 20;
                playerCollider.position.x -= 0.1;
            }
            //duplislime
            if(playerCollider.intersectsMesh(slime1.attackCollider, false) && slime1.attackCollider.checkCollisions) {
                lyrina.playAnimation(24, 24, false, 500, () => {  
                    lyrina.playAnimation(0, 5, true, 100);
                    isAttacking = false;
                })
                this.health -= 20;
                playerCollider.position.x -= 0.1;
            }
            //duplislime2
            if(playerCollider.intersectsMesh(slime2.attackCollider, false) && slime2.attackCollider.checkCollisions) {
                lyrina.playAnimation(24, 24, false, 500, () => {  
                    lyrina.playAnimation(0, 5, true, 100);
                    isAttacking = false;
                })
                this.health -= 20;
                playerCollider.position.x -= 0.1;
            }
            if(lyrina.cellIndex != 24) {
                if (keyStatus.z && !isAttacking) {
                    attackCollider.checkCollisions = true;
                    if(isGrounded)
                        lyrina.playAnimation(18,20,false,170,() => {
                            isAttacking = false;
                            newAnim = true;
                        });
                    else
                        lyrina.playAnimation(21,23,false,170,() => {
                            isAttacking = false;
                            newAnim = true;
                        });
                    isAttacking = true;
                }

                // Jump input: start jump only if grounded (pas de nouveau saut pendant une attaque)
                if (!isAttacking && keyStatus[' '] && isGrounded) {
                    verticalVelocity = jumpStrength;
                    isGrounded = false;
                    lyrina.playAnimation(14,15,true,120);
                    newAnim = true;
                }

                // Animation de chute uniquement si on n'est pas en train d'attaquer
                if (!isAttacking && !isGrounded && verticalVelocity < 0 && !falling){
                    lyrina.playAnimation(16,17,true,120);
                    falling = true;
                    newAnim = true;
                }

                // Populate collidables once
                if (collidables.length === 0) {
                    const block = scene.getMeshByName('block') as Mesh;
                    const platform = scene.getMeshByName('platform') as Mesh;
                    if (block) collidables.push(block);
                    if (platform) collidables.push(platform);
                }

                // === HORIZONTAL MOVEMENT first (prevents corner-sliding) ===
                // Pendant une attaque (isAttacking == true), on ignore q et s
                // mais on laisse la décélération/friction agir dans le else.
                if(!isAttacking && (keyStatus.q||keyStatus.s)){
                    if(!isAttacking && newAnim && isGrounded) {
                        lyrina.playAnimation(9, 13, true, 120);
                        newAnim = false
                    }
                    if(keyStatus.s && !keyStatus.q){
                        lyrina.invertU = false;
                        const prevX = playerCollider.position.x;
                        playerCollider.position.x += acceleration;
                        playerCollider.computeWorldMatrix(true);
                        for (const obs of collidables) {
                            const oBB = obs.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            if (pBB.maximumWorld.x > oBB.minimumWorld.x && pBB.minimumWorld.x < oBB.maximumWorld.x &&
                                pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                                playerCollider.position.x = prevX;
                                playerCollider.computeWorldMatrix(true);
                                acceleration = 0;
                                break;
                            }
                        }
                        if(acceleration>-speed){
                            acceleration-=0.004;
                        }
                    }
                    else if(keyStatus.q ){
                        lyrina.invertU = true;
                        const prevX = playerCollider.position.x;
                        playerCollider.position.x += acceleration;
                        playerCollider.computeWorldMatrix(true);
                        for (const obs of collidables) {
                            const oBB = obs.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            if (pBB.maximumWorld.x > oBB.minimumWorld.x && pBB.minimumWorld.x < oBB.maximumWorld.x &&
                                pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                                playerCollider.position.x = prevX;
                                playerCollider.computeWorldMatrix(true);
                                acceleration = 0;
                                break;
                            }
                        }
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
                        const prevX = playerCollider.position.x;
                        playerCollider.position.x += acceleration;
                        playerCollider.computeWorldMatrix(true);
                        for (const obs of collidables) {
                            const oBB = obs.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            if (pBB.maximumWorld.x > oBB.minimumWorld.x && pBB.minimumWorld.x < oBB.maximumWorld.x &&
                                pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                                playerCollider.position.x = prevX;
                                playerCollider.computeWorldMatrix(true);
                                acceleration = 0;
                                break;
                            }
                        }
                    }
                    else if(acceleration<0){
                        acceleration+=0.008;
                        const prevX = playerCollider.position.x;
                        playerCollider.position.x += acceleration;
                        playerCollider.computeWorldMatrix(true);
                        for (const obs of collidables) {
                            const oBB = obs.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            if (pBB.maximumWorld.x > oBB.minimumWorld.x && pBB.minimumWorld.x < oBB.maximumWorld.x &&
                                pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                                playerCollider.position.x = prevX;
                                playerCollider.computeWorldMatrix(true);
                                acceleration = 0;
                                break;
                            }
                        }
                    }
                    if(!isAttacking && acceleration==0 && isGrounded){
                        if(!newAnim)lyrina.playAnimation(0,7,true,100);
                        newAnim = true;
                    }
                    if(!isAttacking && verticalVelocity==0 && isLanded){
                        lyrina.playAnimation(0,7,true,100);
                        newAnim = true;
                        isLanded = false;
                    }
                }

                // === VERTICAL PHYSICS after horizontal (prevents corner-sliding) ===
                verticalVelocity -= gravity;
                const dy = verticalVelocity;
                playerCollider.position.y += dy;
                playerCollider.computeWorldMatrix(true);

                let hitObstacle = false;
                for (const obstacle of collidables) {
                    const oBB = obstacle.getBoundingInfo().boundingBox;
                    const pBB = playerCollider.getBoundingInfo().boundingBox;
                    const obstacleTop = oBB.maximumWorld.y;
                    const obstacleBottom = oBB.minimumWorld.y;
                    const obstacleLeft = oBB.minimumWorld.x;
                    const obstacleRight = oBB.maximumWorld.x;
                    const playerHalfY = pBB.extendSizeWorld.y;
                    const overlapsX = pBB.maximumWorld.x >= obstacleLeft && pBB.minimumWorld.x <= obstacleRight;

                    if (dy <= 0 && overlapsX && pBB.minimumWorld.y <= obstacleTop && pBB.maximumWorld.y >= obstacleTop) {
                        playerCollider.position.y = obstacleTop + playerHalfY;
                        playerCollider.computeWorldMatrix(true);
                        if (verticalVelocity < -0.005) isLanded = true;
                        verticalVelocity = 0;
                        isGrounded = true;
                        falling = false;
                        hitObstacle = true;
                        break;
                    } else if (dy > 0 && overlapsX && pBB.maximumWorld.y >= obstacleBottom && pBB.minimumWorld.y <= obstacleBottom) {
                        playerCollider.position.y = obstacleBottom - playerHalfY;
                        playerCollider.computeWorldMatrix(true);
                        verticalVelocity = 0;
                        isGrounded = false;
                        hitObstacle = true;
                        break;
                    }
                }
                if (!hitObstacle) {
                    isGrounded = false;
                }
            }
            lyrina.position.copyFrom(playerCollider.position);
            sideCamera.position.x = playerCollider.position.x;
            attackCollider.position.copyFrom(lyrina.position);
            if(lyrina.invertU)
                attackCollider.position._x +=0.107;
            else
                attackCollider.position._x -=0.107;
            attackCollider.position._y -=0.01;

            if(lyrina.cellIndex == 19 || lyrina.cellIndex == 22) {
                attackCollider.checkCollisions = true;
            }
            else {
                attackCollider.checkCollisions = false;
            }
            background.position.x = lyrina.position._x;
            console.log(acceleration);
        });
        //GESTION MONSTRES
        scene.onBeforeRenderObservable.add(() => {
            slimeboucle(slime1);
            slimeboucle(slime2);
            slimeboucle(slime3);
        })
    }

    async CreateEnvironment(scene:Scene): Promise<void> {
        const ground = MeshBuilder.CreateBox('block', {width: 10, height: 0.1, depth: 0.5}, this.scene);
        ground.position = new Vector3(0,-0.18,0);
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

        // Create a few tiles
        for (let i = 0; i < 68; i++) {
            const tile = new Sprite("tile" + i, spriteManager);
            tile.position.x = -67 * 0.147 / 2 + i * 0.147; // space tiles apart
            tile.size = 0.15;
            tile.position.y = -0.18;
            tile.position.z = -0.01;
            tile.cellIndex = 0; // choose tile from sprite sheet
        }

        // Test platform above the ground
        const platform = MeshBuilder.CreateBox('platform', {width: 2, height: 0.4, depth: 0.5}, this.scene);
        platform.position = new Vector3(0, 0.35, 0);
        const platformMaterial = new StandardMaterial("platformMaterial", scene);
        platformMaterial.wireframe = true;
        platform.material = platformMaterial;

        const platformclass = new Objettest("platform", scene);

        const skybox = Mesh.CreateBox("BackgroundSkybox", 500, scene, undefined, Mesh.BACKSIDE);
    
        
    }

    /*async CreateEnnemy(scene:Scene): Promise<void> {
        
    }*/

    async CreateDialog(scene:Scene): Promise<void> {
        const font = new FontFace('MyCustomFont', 'url(./font/ARCADECLASSIC.TTF)');
        font.load();
        font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            console.log('Font loaded and ready to use in Babylon.js');
        });
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        /*const dialogBox = new GUI.Rectangle();
        dialogBox.width = 0.7;
        dialogBox.height = 0.3;
        dialogBox.paddingBottom = "70px"
        dialogBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        dialogBox.cornerRadius = 0;
        dialogBox.color = "white";
        dialogBox.thickness = 4;
        dialogBox.background = "black";
        dialogBox.fontFamily = "MyCustomFont";
        advancedTexture.addControl(dialogBox);

        const panel = new GUI.StackPanel();
        dialogBox.addControl(panel);

        const title = new GUI.TextBlock();
        title.text = "lyrina";
        title.paddingLeft = "20px";
        title.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        title.height = "40px";
        title.color = "gray";
        title.fontSize = 24;
        panel.addControl(title);

        // Message
        const message = new GUI.TextBlock();
        message.text = "Is it hard to  communicate  with  this? seems  like  it is  for  now. I could  stubornly figure out how to  write  every  dialog. seems  like  a  chore  though.";
        message.fontSize = 27;
        message.height = "70px";
        message.color = "white";
        message.textWrapping = true;
        panel.addControl(message);

         const buttonPanel = new GUI.StackPanel();
        buttonPanel.isVertical = false;
        buttonPanel.height = "50px";
        buttonPanel.width = "50px";
        buttonPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.addControl(buttonPanel);

        const block = MeshBuilder.CreateBox("block", {width:1, height:0.5, depth:0.1});
        block.position = new Vector3(0,0,-0.5);
        const mat = new StandardMaterial("m");
        mat.alpha = 0.2;
        mat.diffuseColor = new Color3(0,0,0);
        block.material = mat;

        const yesButton = GUI.Button.CreateImageButton("next", "","./sprites/dialogButton.png");
        yesButton.width = "160px";
        yesButton.height = "40px";
        yesButton.thickness = 0;
        yesButton.color = "white";
        yesButton.paddingRight = "20px";
        yesButton.onPointerUpObservable.add(() => {
            console.log("User clicked Next");
            //dialogBox.isVisible = false; // Hide dialog
            message.text = "I hope it works without any issue. could be annoying very fast if it didn't.";
            mat.alpha = 0.5;
        });
        buttonPanel.addControl(yesButton);*/
        
        const healthbar = new GUI.Image("healthbar", "./sprites/healthbar_l.png");

        healthbar.paddingLeft = "4%";
        healthbar.paddingTop = "5%";
        healthbar.height = "25%";
        healthbar.width = "30%";
        healthbar.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        healthbar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(healthbar);

        const health_g = new GUI.Image("healthbar", "./sprites/health_g.png");
        health_g.paddingLeft = "14.35%";
        health_g.paddingTop = "20.4%";
        health_g.height = "18.9%";
        health_g.width = "28.2%";
        health_g.sourceLeft = 0; //crop image ; 440 crops all the healthbar
        health_g.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        health_g.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(health_g);
        let part = 2;

        scene.onBeforeRenderObservable.add(() => {
            health_g.sourceLeft = 440 - this.health;
            if(part == 2 && this.health <= 220) {
                health_g.source = "./sprites/health_o.png";
                part = 1;
            }
                        
            if(part == 1 && this.health <= 80) {
                health_g.source = "./sprites/health_r.png";
                part = 0;
            }
        })
    }
}