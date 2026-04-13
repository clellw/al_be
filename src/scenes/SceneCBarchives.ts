import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, PointerEventTypes, Matrix} from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'
import { Slime } from "./Slime";
import { Platforme } from "./Platforme";
import { Ground } from "./Ground";
import { Obstacles } from "./Obstacles";
import { Obstaclesflying } from "./Obstaclesflying";
import { Slimerouge } from "./Slimerouge";
import { Guepe } from "./Guepe";
import { Frog } from "./Frog";
import { Nuage } from "./Nuage";
export class SceneCB {
    
    scene: Scene;
    engine: Engine;
    devpoweractive: boolean;

    constructor(private canvas:HTMLCanvasElement){
        this.devpoweractive = true;
        this.engine = new Engine(this.canvas, false);
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

        // --- ÉDITION D'OBSTACLES VOLANTS À LA SOURIS ---
        // Permet de cliquer sur un obstacle volant (ex: obstaclevolant2),
        // de le déplacer à la souris et d'afficher dans la console les
        // coordonnées Vector3 à utiliser dans le code.
        let draggedObstacle: Mesh | null = null;
        let draggedObstacleLastPos: Vector3 | null = null;

        scene.onPointerObservable.add((pointerInfo) => {
            if (this.devpoweractive){
                switch (pointerInfo.type) {
                    case PointerEventTypes.POINTERDOWN: {
                        const pick = pointerInfo.pickInfo;
                        if (pick && pick.hit && pick.pickedMesh) {
                            const mesh = pick.pickedMesh as Mesh;
                            // On ne déplace que les meshes dont le nom commence par "obstaclevolant"
                            if (mesh.name.startsWith("obstacle")||mesh.name.startsWith("platform")) {
                                draggedObstacle = mesh;
                                draggedObstacleLastPos = mesh.position.clone();
                            }
                        }
                        break;
                    }
                    case PointerEventTypes.POINTERMOVE: {
                        if (draggedObstacle && scene.activeCamera) {
                            // Ray depuis la souris
                            const ray = scene.createPickingRay(
                                scene.pointerX,
                                scene.pointerY,
                                Matrix.Identity(),
                                scene.activeCamera as Camera
                            );
                            const dirZ = ray.direction.z;
                            // On projette le rayon sur le plan z = position.z de l'obstacle
                            if (Math.abs(dirZ) > 1e-6) {
                                const t = (draggedObstacle.position.z - ray.origin.z) / dirZ;
                                if (t > 0) {
                                    const hit = ray.origin.add(ray.direction.scale(t));

                                    // déplacement du mesh
                                    const oldPos = draggedObstacle.position.clone();
                                    draggedObstacle.position.x = hit.x;
                                    draggedObstacle.position.y = hit.y;

                                    // déplacement des sprites associés (tiles) avec le même delta
                                    const dx = draggedObstacle.position.x - oldPos.x;
                                    const dy = draggedObstacle.position.y - oldPos.y;
                                    const meta: any = (draggedObstacle as any).metadata;
                                    if (meta && Array.isArray(meta.tiles)) {
                                        for (const tile of meta.tiles) {
                                            tile.position.x += dx;
                                            tile.position.y += dy;
                                        }
                                    }

                                    draggedObstacleLastPos = draggedObstacle.position.clone();
                                }
                            }
                        }
                        break;
                    }
                    case PointerEventTypes.POINTERUP: {
                        if (draggedObstacle) {
                            const p = draggedObstacle.position;
                            console.log(
                                `Nouvelle position pour ${draggedObstacle.name}: new Vector3(${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`
                            );
                            draggedObstacle = null;
                            draggedObstacleLastPos = null;
                        }
                        break;
                    }
                }
            }
        });//fin d edition

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
        playerCollider.isVisible = this.devpoweractive;
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
            "./sprites/place_holder_bnew.png",
            100,           
            {width:961, height:550}, 
            scene
        );
        const background = new Sprite("background", backgroundManager);
        background.position.z = -1;
        background.position.y = 1.1;
        background.width = 6;
        background.height = 3;

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
        let isKnockback = false;
        let knockbackVelocityX = 0;
        let invincibilityFrames = 0;
        const collidables: Mesh[] = [];

        
        const slime1 = new Slime('slime1', scene, new Vector3(0.5, 0, 0));
        const slime2 = new Slime('slime2', scene, new Vector3(-1, 2, 0));
        const slime3 = new Slime('slime3', scene, new Vector3(2, 2, 0));
        const slime4 = new Slime('slime4', scene, new Vector3(2, 5, 0));
        const slimerouge1 = new Slimerouge('slimerouge1', scene, new Vector3(-15, 0, 0));
        const slimerouge2 = new Slimerouge('slimerouge2', scene, new Vector3(-14, 0, 0));
        // on place la guêpe dans la zone visible près du joueur
        const guepe1 = new Guepe('guepe1', scene, new Vector3(-1.5, 0.01, 0),this.devpoweractive);

        const frog1 = new Frog('frog1', scene, new Vector3(4, 0, 0),this.devpoweractive);
        const frog2 = new Frog('frog2', scene, new Vector3(-0.5, 0, 0),this.devpoweractive);

        const slimes = [slime1, slime2, slime3,slime4, slimerouge1, slimerouge2, frog1, frog2];
        const guepes = [guepe1];

        let lastHitSlime: Slime | null | Slimerouge | Guepe = null;
        
        // Compteur global pour déclencher le saut des frogs
        // après un saut du joueur.
        const frogs = [frog1, frog2];

        // Détecte s'il y a du sol "devant" un collider de slime, dans une direction donnée
        const hasGroundAhead = (slimeCollider: Mesh, dir: number): boolean => {
            const sBB = slimeCollider.getBoundingInfo().boundingBox;
            const xFront = dir > 0 ? sBB.maximumWorld.x + 0.01 : sBB.minimumWorld.x - 0.01;
            const yProbe = sBB.minimumWorld.y - 0.05;

            for (const obstacle of collidables) {
                const oBB = obstacle.getBoundingInfo().boundingBox;
                const obstacleTop = oBB.maximumWorld.y;

                const withinX = xFront >= oBB.minimumWorld.x && xFront <= oBB.maximumWorld.x;
                const closeY = Math.abs(obstacleTop - yProbe) < 0.08;
                if (withinX && closeY) {
                    return true;
                }
            }
            return false;
        };

        function frogboucle(frog: Frog): void {
            // Si le frog est déjà mort, on ne fait plus rien
            if (frog.isDead) {
                return;
            }

            // Dégâts reçus depuis l'attaque du joueur
            if (frog.attackCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                frog.slimeHealth -= 2;
                frog.isSuffering = true;
                // on (ré)initialise un petit timer de souffrance
                frog.waittime = 20;
                // pas de frame spéciale de "hit" : on garde l'animation idle (0..5)
                frog.sprite.playAnimation(0, 3, true, 100);
                frog.actionTime = 0;
                frog.isAttacking = false;
            }

            // mort du guepe
            if (frog.slimeHealth <= 0 && !frog.isDead) {
                frog.isDead = true;
                frog.attackCollider.checkCollisions = false;
                frog.sprite.dispose();
                frog.slimeCollider.dispose();
                frog.attackCollider.dispose();
                slimes.splice(slimes.indexOf(frog), 1);
                return;
            }

            if (frog.isSuffering) {
                const prevX = frog.slimeCollider.position.x;
                if(frog.sprite.position.x < lyrina.position.x) {
                    frog.slimeCollider.position.x -= 0.01;
                    
                }
                else {
                    frog.slimeCollider.position.x += 0.01;
                    frog.sprite.invertU = true;
                }
                frog.slimeCollider.computeWorldMatrix(true);
                // faire clignoter la guepe comme le joueur pendant quelques frames
                if (frog.waittime > 0) {
                    frog.waittime--;
                    // clignotement simple: visible 3 frames sur 6
                    frog.sprite.isVisible = (frog.waittime % 6) >= 3;
                } else {
                    frog.isSuffering = false;
                    frog.sprite.isVisible = true;
                }
                frog.slimeCollider.computeWorldMatrix(true);
                // empêcher un slime touché de traverser les autres slimes
                for (const other of slimes) {
                    if (other === frog) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        frog.slimeCollider.position.x = prevX;
                        frog.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
                for (const obstacle of collidables) {
                    const oBB = obstacle.getBoundingInfo().boundingBox;
                    const sBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        frog.slimeCollider.position.x = prevX;
                        frog.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
            } else {
                // faire en sorte de sauter 20 frames apres que le joueur est sauté n'importe où dans la scene,
                // pour donner l'impression que les frogs réagissent au saut du joueur.

                // 1) Gestion du délai avant le saut
                if (frog.jumpDelay > 0) {
                    frog.jumpDelay--;
                    // Quand le délai arrive à 0, on applique une impulsion vers le haut
                    if (frog.jumpDelay === 0 && frog.IsGrounded) {
                        frog.verticalVelocity = 0.05; // force du saut
                        frog.IsGrounded = false;
                    }
                }

                // 2) Animation : frame 4 pendant le saut, 0..3 au sol
                if (!frog.IsGrounded || Math.abs(frog.verticalVelocity) > 0.0001) {
                    // en l'air : pose de saut (frame 4)
                    frog.sprite.playAnimation(4, 4, true, 100);
                } else if(frog.sprite.cellIndex==4){
                    // au sol : idle 0..3
                    frog.sprite.playAnimation(0, 3, true, 160);
                }
            }

            // === PHYSIQUE VERTICALE de la frog (même logique que le joueur/slimes) ===
            frog.verticalVelocity -= gravity;
            const fdy = frog.verticalVelocity;
            const prevY = frog.slimeCollider.position.y;
            frog.slimeCollider.position.y += fdy;
            frog.slimeCollider.computeWorldMatrix(true);

            let frogHitObstacle = false;
            for (const obstacle of collidables) {
                const oBB = obstacle.getBoundingInfo().boundingBox;
                const fBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                const obstacleTop = oBB.maximumWorld.y;
                const obstacleBottom = oBB.minimumWorld.y;
                const obstacleLeft = oBB.minimumWorld.x;
                const obstacleRight = oBB.maximumWorld.x;
                const frogHalfY = fBB.extendSizeWorld.y;
                const overlapsX = fBB.maximumWorld.x >= obstacleLeft && fBB.minimumWorld.x <= obstacleRight;

                // Atterrissage sur le haut d'un obstacle
                if (fdy <= 0 && overlapsX && fBB.minimumWorld.y <= obstacleTop && fBB.maximumWorld.y >= obstacleTop) {
                    frog.slimeCollider.position.y = obstacleTop + frogHalfY;
                    frog.slimeCollider.computeWorldMatrix(true);
                    frog.verticalVelocity = 0;
                    frog.IsGrounded = true;
                    frogHitObstacle = true;
                    break;
                }
                // Collision par le dessous (tête de la frog sous une plateforme)
                else if (fdy > 0 && overlapsX && fBB.maximumWorld.y >= obstacleBottom && fBB.minimumWorld.y <= obstacleBottom) {
                    frog.slimeCollider.position.y = obstacleBottom - frogHalfY;
                    frog.slimeCollider.computeWorldMatrix(true);
                    frog.verticalVelocity = 0;
                    frog.IsGrounded = false;
                    frogHitObstacle = true;
                    break;
                }
            }

            if (!frogHitObstacle) {
                frog.IsGrounded = false;
            }
            // empêche un slime qui tombe de traverser un autre slime (collision verticale)
            if (fdy <= 0) {
                for (const other of slimes) {
                    if (other === frog) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        // replace le slime à son ancienne hauteur et annule la chute
                        frog.slimeCollider.position.y = prevY;
                        frog.slimeCollider.computeWorldMatrix(true);
                        frog.verticalVelocity = 0;
                        frog.IsGrounded = true;
                        break;
                    }
                }

            }
            // garder les sprites alignés avec le collider
            frog.sprite.position.copyFrom(frog.slimeCollider.position);
            frog.attackCollider.position.copyFrom(frog.sprite.position);
            frog.attackCollider.checkCollisions = true;
        }
        function guepeboucle(guepe: Guepe): void {
            // Si le guepe est déjà mort, on ne fait plus rien
            if (guepe.isDead) {
                return;
            }

            // Dégâts reçus depuis l'attaque du joueur
            if (guepe.attackCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                guepe.guepeHealth -= 2;
                guepe.isSuffering = true;
                // on (ré)initialise un petit timer de souffrance
                guepe.waittime = 20;
                // pas de frame spéciale de "hit" : on garde l'animation idle (0..5)
                guepe.sprite.playAnimation(0, 5, true, 100);
                guepe.actionTime = 0;
                guepe.isAttacking = false;
            }

            // mort du guepe
            if (guepe.guepeHealth <= 0 && !guepe.isDead) {
                guepe.isDead = true;
                guepe.attackCollider.checkCollisions = false;
                guepe.sprite.dispose();
                guepe.slimeCollider.dispose();
                guepe.attackCollider.dispose();
                guepes.splice(guepes.indexOf(guepe), 1);
                return;
            }

            if (guepe.isSuffering) {
                // faire clignoter la guepe comme le joueur pendant quelques frames
                if (guepe.waittime > 0) {
                    guepe.waittime--;
                    // clignotement simple: visible 3 frames sur 6
                    guepe.sprite.isVisible = (guepe.waittime % 6) >= 3;
                } else {
                    guepe.isSuffering = false;
                    guepe.sprite.isVisible = true;
                }
                const prevX = guepe.slimeCollider.position.x;
                guepe.slimeCollider.computeWorldMatrix(true);
            } else {
                // juste animer la guepe sans déplacement pour l'instant
                if( !guepe.isAttacking && invincibilityFrames <= 0) {
                    guepe.sprite.playAnimation(0, 5, false, 50, () => {  
                        guepe.sprite.playAnimation(0, 5, true, 100);
                    });
                    guepe.waittime = 20;
                    guepe.actionTime = 0;
                    guepe.isAttacking = true;
                }
                if(guepe.isAttacking) {
                    const prevX = guepe.slimeCollider.position.x;
                    guepe.slimeCollider.computeWorldMatrix(true);
                    if (invincibilityFrames > 0) {
                        const sBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                        const pBB = playerCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            guepe.slimeCollider.position.x = prevX;
                            guepe.slimeCollider.computeWorldMatrix(true);
                        }
                    }
                }
                else{
                    guepe.sprite.playAnimation(0, 5, true, 100);
                }
            }

            // garder les colliders alignés avec le sprite
            guepe.slimeCollider.position.copyFrom(guepe.sprite.position);
            guepe.slimeCollider.position.y-=0.02;
            guepe.attackCollider.position.copyFrom(guepe.sprite.position);
            guepe.attackCollider.position.y-=0.02;
            guepe.attackCollider.checkCollisions = true;
        }
        function slimeboucle(slime: Slime): void {
            // Si le slime est déjà mort, on ne fait plus rien
            if (slime.isDead) {
                return;
            }
            if(slime.slimeCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                slime.slimeHealth -= 2;
                // frame 39 = dernière case de la spritesheet rouge (4 colonnes x 10 lignes)
                slime.sprite.playAnimation(39, 39, false, 500, () => {  
                    slime.sprite.playAnimation(0, 5, true, 100);
                    slime.waittime = 20;
                    slime.actionTime = 0;
                    slime.isAttacking = false;
                })
            }
            // mort du slime vert
            if (slime.slimeHealth <= 0 && !slime.isDead) {
                slime.isDead = true;
                slime.attackCollider.checkCollisions = false;
                slime.sprite.dispose();
                slime.slimeCollider.dispose();
                slime.attackCollider.dispose();
                slimes.splice(slimes.indexOf(slime), 1);
                return;
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
                for (const obs of collidables) {
                    const oBB = obs.getBoundingInfo().boundingBox;
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
            const prevY = slime.slimeCollider.position.y;
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

            // empêche un slime qui tombe de traverser un autre slime (collision verticale)
            if (sdy1 <= 0) {
                for (const other of slimes) {
                    if (other === slime) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        // replace le slime à son ancienne hauteur et annule la chute
                        slime.slimeCollider.position.y = prevY;
                        slime.slimeCollider.computeWorldMatrix(true);
                        slime.verticalVelocity = 0;
                        slime.IsGrounded = true;
                        break;
                    }
                }

            }

            //detectiondistance
            if(slime.sprite.cellIndex != 39) {
                // Ne déclenche pas une nouvelle attaque si le joueur est en invincibilité
                // et seulement si le joueur est proche en X **et** en Y.
                const dxGreen = Math.abs(playerCollider.position.x - slime.slimeCollider.position.x);
                const dyGreen = Math.abs(playerCollider.position.y - slime.slimeCollider.position.y);
                // Portée horizontale ~0.5, portée verticale plus courte (~0.25)
                if(dxGreen < 0.6 && dyGreen < 0.3 && !slime.isAttacking && slime.pastFirstCycle && invincibilityFrames <= 0) {
                    slime.sprite.playAnimation(16, 38, false, 50, () => {  
                        slime.sprite.playAnimation(0, 5, true, 100);
                        slime.isAttacking = false;
                    });
                    slime.waittime = 10;
                    slime.actionTime = 0;
                    slime.isAttacking = true;
                }
                if(slime.isAttacking) {
                    const prevX = slime.slimeCollider.position.x;
                    if(slime.sprite.position.x < lyrina.position.x) {
                        slime.slimeCollider.position.x += slime.speed;
                        slime.sprite.invertU = true;
                    }
                    else {
                        slime.slimeCollider.position.x -= slime.speed;
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
                    // collision slime ↔ joueur pendant l'attaque
                    // Pendant les invincibility frames du joueur, le slime ne
                    // doit pas le traverser : on le bloque comme un mur.
                    const testing=1;
                    if (testing==1) {
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const pBB = playerCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
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
                            slime.speed =  Math.random() * (0.002 - 0.003) + 0.003;
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

                        // empêche les slimes de traverser le joueur (collision AABB)
                        {
                            const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.005;
                            const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                            const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                            if (overlapX && overlapY) {
                                slime.slimeCollider.position.x = prevX;
                                slime.slimeCollider.computeWorldMatrix(true);
                            }
                        }

                        slime.actionTime--;
                        if(slime.actionTime == 0) {
                            slime.waittime = Math.floor(Math.random() * (15 - 8 + 1)) + 8;
                            slime.sprite.playAnimation(0, 5, true, 100);
                            slime.pastFirstCycle = true;
                        }
                    }
                }
            }
            slime.sprite.position.copyFrom(slime.slimeCollider.position);
            slime.attackCollider.position.copyFrom(slime.sprite.position);
            slime.sprite.position.y += 0.019;
            if(slime.sprite.cellIndex >= 16 && slime.sprite.cellIndex <= 37) {
                slime.attackCollider.checkCollisions = true;
            }
            else {
                slime.attackCollider.checkCollisions = false;
            }
        }
        //BOUCLE SLIME ROUGE
        function slimerougeboucle(slime: Slimerouge): void {
            // Si le slime rouge est déjà mort, on ne fait plus rien
            if (slime.isDead) {
                slimes.splice(slimes.indexOf(slime), 1);
                return;
            }
            if(slime.slimeCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                slime.slimeHealth -= 2;
                slime.sprite.playAnimation(39, 39, false, 500, () => {  
                    slime.sprite.playAnimation(0, 5, true, 100);
                    slime.waittime = 20;
                    slime.actionTime = 0;
                    slime.isAttacking = false;
                })
            }
            // mort du slime rouge
            if (slime.slimeHealth <= 0 && !slime.isDead) {
                slime.isDead = true;
                slime.attackCollider.checkCollisions = false;
                slime.sprite.dispose();
                slime.slimeCollider.dispose();
                slime.attackCollider.dispose();
                return;
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
                for (const obstacle of collidables) {
                    const oBB = obstacle.getBoundingInfo().boundingBox;
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
            const prevY = slime.slimeCollider.position.y;
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

            // empêche un slime qui tombe de traverser un autre slime (collision verticale)
            if (sdy1 <= 0) {
                for (const other of slimes) {
                    if (other === slime) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        // replace le slime à son ancienne hauteur et annule la chute
                        slime.slimeCollider.position.y = prevY;
                        slime.slimeCollider.computeWorldMatrix(true);
                        slime.verticalVelocity = 0;
                        slime.IsGrounded = true;
                        break;
                    }
                }

            }
            //iiiiiiiiIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
            //detectiondistance
            if(slime.sprite.cellIndex != 39) {
                // Ne déclenche pas une nouvelle attaque si le joueur est en invincibilité
                // Utilise maintenant la vraie distance horizontale entre le joueur et le slime rouge
                const dxRed = Math.abs(playerCollider.position.x - slime.slimeCollider.position.x);
                if(dxRed < 0.4 && !slime.isAttacking && invincibilityFrames <= 0) {
                    // la spritesheet a 40 frames (0..39). On utilise 16..38 pour l'attaque.
                    slime.sprite.playAnimation(16, 38, false, 50, () => {  
                        slime.sprite.playAnimation(0, 5, true, 100);
                        slime.isAttacking = false;
                    });
                    slime.waittime = 10;
                    slime.actionTime = 0;
                    slime.isAttacking = true;
                }
                if(slime.isAttacking) {
                    const prevX = slime.slimeCollider.position.x;
                    if(slime.sprite.position.x < lyrina.position.x) {
                        slime.slimeCollider.position.x += slime.speed;
                        slime.sprite.invertU = true;
                    }
                    else {
                        slime.slimeCollider.position.x -= slime.speed;
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
                    // collision slime ↔ joueur pendant l'attaque
                    // Pendant les invincibility frames du joueur, le slime ne
                    // doit pas le traverser : on le bloque comme un mur.
                    if (invincibilityFrames > 0) {
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const pBB = playerCollider.getBoundingInfo().boundingBox;
                        const eps = 0.005;
                        const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                        }
                    }
                }
                else {
                    // Déplacement continu sans hasard : la direction ne change
                    // que si le slime est bloqué ou s'il arrive au bord du vide.
                    // On lance l'animation de marche (6..15) si on n'est pas déjà dessus.
                    if (slime.sprite.cellIndex < 6 || slime.sprite.cellIndex > 15) {
                        slime.sprite.playAnimation(6, 15, true, 100);
                    }

                    // initialisation direction si nécessaire
                    if (slime.dir === 0) {
                        slime.dir = 1;
                    }

                    const prevX = slime.slimeCollider.position.x;
                    slime.slimeCollider.position.x += (slime.dir > 0 ? 1 : -1) * slime.speed;
                    slime.sprite.invertU = slime.dir > 0;
                    slime.slimeCollider.computeWorldMatrix(true);

                    let blocked = false;

                    // empêche les slimes de se traverser entre eux (collision AABB)
                    for (const other of slimes) {
                        if (other === slime) continue;
                        const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            blocked = true;
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                            break;
                        }
                    }

                    // empêche les slimes de traverser le joueur (collision AABB)
                    {
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const pBB = playerCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            blocked = true;
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                        }
                    }

                    // collision avec le décor (obstacles/plateformes) pendant le déplacement
                    for (const obstacle of collidables) {
                        const oBB = obstacle.getBoundingInfo().boundingBox;
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            blocked = true;
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                            break;
                        }
                    }

                    const groundAhead = hasGroundAhead(slime.slimeCollider, slime.dir > 0 ? 1 : -1);

                    // changement de direction seulement si bloqué ou bord du vide
                    if (blocked || !groundAhead) {
                        slime.dir *= -1;
                    }
                }
            }
            slime.sprite.position.copyFrom(slime.slimeCollider.position);
            slime.attackCollider.position.copyFrom(slime.sprite.position);
            slime.sprite.position.y += 0.019;
            if(slime.sprite.cellIndex >= 16 && slime.sprite.cellIndex <= 38) {
                slime.attackCollider.checkCollisions = true;
            }
            else {
                slime.attackCollider.checkCollisions = false;
            }
        }
        //BOUCLE PRINCIPALE JOUEUR
        scene.onBeforeRenderObservable.add(()=>{
            // décrémente l'invincibilité si active et fait clignoter le joueur
            if (invincibilityFrames > 0) {
                invincibilityFrames--;
                // clignotement simple: visible 3 frames sur 6
                lyrina.isVisible = (invincibilityFrames % 6) >= 3;
            } else {
                // hors invincibilité: toujours visible
                lyrina.isVisible = true;
            }

            for (const slime of slimes) {
                if((invincibilityFrames <= 0 && playerCollider.intersectsMesh(slime.attackCollider, false) && slime.attackCollider.checkCollisions)||(invincibilityFrames <= 0 && playerCollider.intersectsMesh(slime.attackCollider, false) && !slime.IsGrounded)) {
                    lyrina.playAnimation(24, 24, false, 500, () => {  
                        lyrina.playAnimation(0, 5, true, 100);
                        isAttacking = false;
                        isKnockback = false;
                        knockbackVelocityX = 0;
                    })
                    this.health -= slime.degat;
                    {
                        const dx = playerCollider.position.x - slime.slimeCollider.position.x;
                        // lance un knockback continu plutôt qu'un téléport
                        isKnockback = true;
                        knockbackVelocityX = (dx >= 0) ? 0.04 : -0.04;
                        // 120 frames d'invincibilité après avoir été touché
                        invincibilityFrames = 120;
                        lastHitSlime = slime;
                    }
                }
            }
            for (const guepe of guepes) {
                if(invincibilityFrames <= 0 && playerCollider.intersectsMesh(guepe.attackCollider, false) && guepe.attackCollider.checkCollisions) {
                    lyrina.playAnimation(24, 24, false, 500, () => {  
                        lyrina.playAnimation(0, 5, true, 100);
                        isAttacking = false;
                        isKnockback = false;
                        knockbackVelocityX = 0;
                    })
                    this.health -= guepe.degat;
                    {
                        const dx = playerCollider.position.x - guepe.slimeCollider.position.x;
                        // lance un knockback continu plutôt qu'un téléport
                        isKnockback = true;
                        knockbackVelocityX = (dx >= 0) ? 0.04 : -0.04;
                        // 120 frames d'invincibilité après avoir été touché
                        invincibilityFrames = 120;
                        lastHitSlime = guepe;
                    }
                }
            }

            // Populate collidables once (utilisé aussi pendant le knockback)
            if (collidables.length === 0) {
                const block = scene.getMeshByName('block') as Mesh;
                const block2 = scene.getMeshByName('block2') as Mesh;
                const block3 = scene.getMeshByName('block3') as Mesh;
                const block4 = scene.getMeshByName('block4') as Mesh;
                //const platform = scene.getMeshByName('platform') as Mesh;
                const platform1 = scene.getMeshByName('platform1') as Mesh;
                const platform2 = scene.getMeshByName('platform2') as Mesh;
                const obstaclevolant1 = scene.getMeshByName('obstaclevolant1') as Mesh;
                const obstaclevolant2 = scene.getMeshByName('obstaclevolant2') as Mesh;
                const obstaclevolant3 = scene.getMeshByName('obstaclevolant3') as Mesh;
                if (block2) collidables.push(block2);
                if (block) collidables.push(block);
                if (block3) collidables.push(block3);
                if (block4) collidables.push(block4);
                //if (platform) collidables.push(platform);
                if (platform1) collidables.push(platform1);
                if (platform2) collidables.push(platform2);
                if (obstaclevolant1) collidables.push(obstaclevolant1);
                if (obstaclevolant2) collidables.push(obstaclevolant2);
                if (obstaclevolant3) collidables.push(obstaclevolant3);
            }

            // Knockback animé du joueur (comme les slimes)
            if (isKnockback) {
                const prevX = playerCollider.position.x;
                playerCollider.position.x += knockbackVelocityX;
                playerCollider.computeWorldMatrix(true);

                // collision avec le décor pendant le knockback
                for (const obs of collidables) {
                    const oBB = obs.getBoundingInfo().boundingBox;
                    const pBB = playerCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    if (pBB.maximumWorld.x > oBB.minimumWorld.x + eps && pBB.minimumWorld.x < oBB.maximumWorld.x - eps &&
                        pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                        playerCollider.position.x = prevX;
                        playerCollider.computeWorldMatrix(true);
                        knockbackVelocityX = 0;
                        break;
                    }
                }

                // collision avec les slimes pendant le knockback
                if (knockbackVelocityX !== 0 && isGrounded) {
                    const pBB = playerCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlappingSlimes: Slime[] = [];
                    for (const slime of slimes) {
                        // ici ignorer le slime qui a provoqué la collision
                        if (slime === lastHitSlime) {
                            continue;
                        }
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const overlapX = pBB.maximumWorld.x > sBB.minimumWorld.x + eps && pBB.minimumWorld.x < sBB.maximumWorld.x - eps;
                        const overlapY = pBB.maximumWorld.y > sBB.minimumWorld.y + eps && pBB.minimumWorld.y < sBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            overlappingSlimes.push(slime);
                        }
                    }

                    for (const guepe of guepes) {
                        // ici ignorer le guepe qui a provoqué la collision
                        if (guepe === lastHitSlime) {
                            continue;
                        }
                        const sBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                        const overlapX = pBB.maximumWorld.x > sBB.minimumWorld.x + eps && pBB.minimumWorld.x < sBB.maximumWorld.x - eps;
                        const overlapY = pBB.maximumWorld.y > sBB.minimumWorld.y + eps && pBB.minimumWorld.y < sBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            overlappingSlimes.push(guepe);
                        }
                    }

                    if (invincibilityFrames > 0) {
                        // Pendant l'invincibilité : si on touche au moins un slime,
                        // on s'arrête net contre lui (on annule le knockback).
                        if (overlappingSlimes.length > 0) {
                            playerCollider.position.x = prevX;
                            playerCollider.computeWorldMatrix(true);
                            knockbackVelocityX = 0;
                            isKnockback = false;
                        }
                    } else {
                        // Hors invincibilité : comportement spécial du knockback
                        // quand on percute exactement un seul slime.
                        if (overlappingSlimes.length === 1) {
                            const onlySlime = overlappingSlimes[0];
                            const dxHit = playerCollider.position.x - onlySlime.slimeCollider.position.x;
                            const dir = dxHit >= 0 ? 1 : -1;
                            // force un knockback "plein pot" dans la bonne direction
                            knockbackVelocityX = dir * 0.06;
                        }
                    }
                }

                // amortit progressivement la vitesse de knockback
                knockbackVelocityX *= 0.9;
                if (Math.abs(knockbackVelocityX) < 0.005) {
                    knockbackVelocityX = 0;
                    isKnockback = false;
                    lastHitSlime = null;
                }
            }

            if(lyrina.cellIndex != 24) {
                if (keyStatus.z && !isAttacking) {
                    attackCollider.checkCollisions = true;
                    if(isGrounded)
                        lyrina.playAnimation(18,20,false,100,() => {
                            isAttacking = false;
                            newAnim = true;
                        });
                    else
                        lyrina.playAnimation(21,23,false,100,() => {
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

                    // Déclenche un saut "de réaction" des frogs
                    // 20 frames après le saut du joueur.
                    for (const frog of frogs) {
                        frog.jumpDelay = 20;      // délai en frames
                        frog.jumpTime = 0;        // on réinitialise le saut
                        frog.baseY = frog.sprite.position.y; // hauteur de base
                    }
                }

                // Animation de chute uniquement si on n'est pas en train d'attaquer
                if (!isAttacking && !isGrounded && verticalVelocity < 0 && !falling){
                    lyrina.playAnimation(16,17,true,120);
                    falling = true;
                    newAnim = true;
                }

                // === HORIZONTAL MOVEMENT first (prevents corner-sliding) ===
                // Pendant une attaque (isAttacking == true), on ignore q et s
                // mais on laisse la décélération/friction agir dans le else.
                if(!isAttacking && !isKnockback && (keyStatus.q||keyStatus.s)){
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
                        {
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            for (const slime of slimes) {
                                const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                                const overlapX = pBB.maximumWorld.x > sBB.minimumWorld.x + eps && pBB.minimumWorld.x < sBB.maximumWorld.x - eps;
                                const overlapY = pBB.maximumWorld.y > sBB.minimumWorld.y + eps && pBB.minimumWorld.y < sBB.maximumWorld.y - eps;
                                if (overlapX && overlapY) {
                                    playerCollider.position.x = prevX;
                                    playerCollider.computeWorldMatrix(true);
                                    acceleration = 0;
                                    break;
                                }
                            }
                        }
                        if(invincibilityFrames>0){
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            for (const guepe of guepes) {
                                const gBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                                const overlapX = pBB.maximumWorld.x > gBB.minimumWorld.x + eps && pBB.minimumWorld.x < gBB.maximumWorld.x - eps;
                                const overlapY = pBB.maximumWorld.y > gBB.minimumWorld.y + eps && pBB.minimumWorld.y < gBB.maximumWorld.y - eps;
                                if (overlapX && overlapY) {
                                    playerCollider.position.x = prevX;
                                    playerCollider.computeWorldMatrix(true);
                                    acceleration = 0;
                                    break;
                                }
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
                            const eps = 0.0005;
                            if (pBB.maximumWorld.x > oBB.minimumWorld.x && pBB.minimumWorld.x < oBB.maximumWorld.x &&
                                pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                                playerCollider.position.x = prevX;
                                playerCollider.computeWorldMatrix(true);
                                acceleration = 0;
                                break;
                            }
                        }
                        {
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            for (const slime of slimes) {
                                const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                                const overlapX = pBB.maximumWorld.x > sBB.minimumWorld.x + eps && pBB.minimumWorld.x < sBB.maximumWorld.x - eps;
                                const overlapY = pBB.maximumWorld.y > sBB.minimumWorld.y + eps && pBB.minimumWorld.y < sBB.maximumWorld.y - eps;
                                if (overlapX && overlapY) {
                                    playerCollider.position.x = prevX;
                                    playerCollider.computeWorldMatrix(true);
                                    acceleration = 0;
                                    break;
                                }
                            }
                        }
                        if(invincibilityFrames>0){
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            for (const guepe of guepes) {
                                const gBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                                const overlapX = pBB.maximumWorld.x > gBB.minimumWorld.x + eps && pBB.minimumWorld.x < gBB.maximumWorld.x - eps;
                                const overlapY = pBB.maximumWorld.y > gBB.minimumWorld.y + eps && pBB.minimumWorld.y < gBB.maximumWorld.y - eps;
                                if (overlapX && overlapY) {
                                    playerCollider.position.x = prevX;
                                    playerCollider.computeWorldMatrix(true);
                                    acceleration = 0;
                                    break;
                                }
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
                    else if(acceleration>0 && !isKnockback){
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
                    else if(acceleration<0 && !isKnockback){
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
            }

            // === VERTICAL PHYSICS after horizontal (prevents corner-sliding) ===
            // S'applique même pendant l'animation de hit (cellIndex 24)
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

            // Empêche le joueur de traverser les slimes en tombant dessus
            // (collision verticale joueur -> slimes quand il arrive par le haut)
            let hitSlimeFromTop = false;
            if (!hitObstacle && dy <= 0) {
                const pBB = playerCollider.getBoundingInfo().boundingBox;
                const playerHalfY = pBB.extendSizeWorld.y;

                for (const slime of slimes) {
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const slimeTop = sBB.maximumWorld.y;
                    const slimeLeft = sBB.minimumWorld.x;
                    const slimeRight = sBB.maximumWorld.x;
                    const overlapsX = pBB.maximumWorld.x >= slimeLeft && pBB.minimumWorld.x <= slimeRight;

                    if ((overlapsX && pBB.minimumWorld.y <= slimeTop && pBB.maximumWorld.y >= slimeTop && !slime.isAttacking)) {
                        playerCollider.position.y = slimeTop + playerHalfY;
                        playerCollider.computeWorldMatrix(true);
                        if (verticalVelocity < -0.005) isLanded = true;
                        verticalVelocity = 0;
                        isGrounded = true;
                        falling = false;
                        hitSlimeFromTop = true;
                        break;
                    }
                }
            }
            if (invincibilityFrames > 0 && !hitObstacle) {
                const pBB = playerCollider.getBoundingInfo().boundingBox;
                const playerHalfY = pBB.extendSizeWorld.y;
                for (const guepe of guepes) {
                    const gBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                    const guepeTop = gBB.maximumWorld.y;
                    const guepeLeft = gBB.minimumWorld.x;
                    const guepeRight = gBB.maximumWorld.x;
                    const guepeBottom = gBB.minimumWorld.y;
                    const overlapsX = pBB.maximumWorld.x >= guepeLeft && pBB.minimumWorld.x <= guepeRight;
                    if ((dy<=0 && overlapsX && pBB.minimumWorld.y <= guepeTop && pBB.maximumWorld.y >= guepeTop)) {
                        playerCollider.position.y = guepeTop + playerHalfY;
                        playerCollider.computeWorldMatrix(true);
                        if (verticalVelocity < -0.005) isLanded = true;
                        verticalVelocity = 0;
                        isGrounded = true;
                        falling = false;
                        hitSlimeFromTop = true;
                        break;
                    }
                    else if (dy>0 && overlapsX && pBB.maximumWorld.y >= guepeBottom && pBB.minimumWorld.y <= guepeBottom) {
                        playerCollider.position.y = guepeBottom - playerHalfY;
                        playerCollider.computeWorldMatrix(true);
                        verticalVelocity = 0;
                        isGrounded = false;
                        hitSlimeFromTop = true;
                        break;
                    }
                }
            }

            if (!hitObstacle && !hitSlimeFromTop) {
                isGrounded = false;
            }
            lyrina.position.copyFrom(playerCollider.position);
            sideCamera.position.x = playerCollider.position.x;
            // Quand le joueur dépasse y = 1.1, la caméra monte de 1 en hauteur
            if (playerCollider.position.y > 1.1) {
                sideCamera.position.y = fixedCameraY + 1;
            } else {
                sideCamera.position.y = fixedCameraY;
            }
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
            slimeboucle(slime4);
            slimerougeboucle(slimerouge1);
            slimerougeboucle(slimerouge2);
            guepeboucle(guepe1);
            frogboucle(frog1);
            frogboucle(frog2);
        })
    }

    async CreateEnvironment(scene:Scene): Promise<void> {
        const ground = MeshBuilder.CreateBox('block', {width: 10, height: 0.1, depth: 0.5}, this.scene);
        ground.position = new Vector3(0,-0.18,0);
        ground.checkCollisions = true;
        ground.isVisible = this.devpoweractive;

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
        platform.isVisible = false;

        const ground2 = new Ground("block2", this.scene, new Vector3(-11, -0.18, 0), 68,this.devpoweractive);
        const ground3 = new Ground("block3", this.scene, new Vector3(-22, -0.18, 0), 68,this.devpoweractive);
        const ground4 = new Ground("block4", this.scene, new Vector3(7, -0.18, 0), 20,this.devpoweractive);

        const obstaclevolant = new Obstaclesflying("obstaclevolant1", this.scene, new Vector3(0, 10.5, 0), 3, 5,this.devpoweractive);
        //celui la
        const obstaclevolant2 = new Obstaclesflying("obstaclevolant2", this.scene, new Vector3(-0.02, 0.37, -0.01), 15, 3,this.devpoweractive);
        const obstaclevolant3 = new Obstaclesflying("obstaclevolant3", this.scene, new Vector3(-1, 10.5, 0), 3, 5,this.devpoweractive);
        const obstaclevolant4 = new Obstaclesflying("obstaclevolant4", this.scene, new Vector3(-3, 1.1, 0), 10, 1,this.devpoweractive);
        const obstaclevolant5 = new Obstaclesflying("obstaclevolant5", this.scene, new Vector3(-5.5, 0.5, 0), 10, 2,this.devpoweractive);
        const obstaclevolant6 = new Obstaclesflying("obstaclevolant6", this.scene, new Vector3(-10, 0.5, 0), 10, 5,this.devpoweractive);

        const obstacle = new Obstacles("obstacle1", this.scene, new Vector3(-12, 0.5, 0), 3, 1,this.devpoweractive);
        const obstacle2 = new Obstacles("obstacle2", this.scene, new Vector3(-12.5, 0.5, 0), 3, 2,this.devpoweractive);
        const obstacle3 = new Obstacles("obstacle3", this.scene, new Vector3(-13, 0.5, 0), 3, 3,this.devpoweractive);
        const obstacle4 = new Obstacles("obstacle4", this.scene, new Vector3(-16, 0.5, 0), 10, 1,this.devpoweractive);
        const obstacle5 = new Obstacles("obstacle5", this.scene, new Vector3(-20, 0.5, 0), 10, 2,this.devpoweractive);
        const obstacle6 = new Obstacles("obstacle6", this.scene, new Vector3(-24, 0.5, 0), 10, 5,this.devpoweractive);

        const platform1 = new Platforme("platform1", this.scene, new Vector3(-2, 0.35, 0),this.devpoweractive);
        const platform2 = new Platforme("platform2", this.scene, new Vector3(-2.5, 0.9, 0),this.devpoweractive);

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