import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, PointerEventTypes, Matrix} from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'
import { Slime } from "./Slime";
import { Platforme } from "./Platforme";
import { Ground } from "./Ground";
import { Obstacles } from "./Obstacles";
import { Obstaclesflying } from "./Obstaclesflying";
import { Obstaclesinvisibles } from "./Obstaclesinvisibles";
import { Slimerouge } from "./Slimerouge";
import { Guepe } from "./Guepe";
import { Frog } from "./Frog";
import { Nuage } from "./Nuage";
import { Frogpurple } from "./Frogpurple";
import {Guepepurple} from "./Guepepurple";
export class SceneNiveau1 {
    
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
        

        //const sphere = MeshBuilder.CreateSphere('sphere', {diameter:3, segments:5}, this.scene);

        //sphere.material = new StandardMaterial('material');
        //sphere.material.wireframe = true;

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
                            const meta: any = mesh.metadata;
                            const isDecor = mesh.name.startsWith("obstacle") || mesh.name.startsWith("platform");
                            const isSimpleGuepe = meta && meta.kind === "guepe";

                            // On déplace le décor et les guêpes simples, mais pas les guêpes violettes.
                            if (isDecor || isSimpleGuepe) {
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
                                    if (meta && meta.kind === "guepe") {
                                        const ownerSprite = meta.ownerSprite as Sprite | undefined;
                                        const ownerCollider = meta.ownerCollider as Mesh | undefined;

                                        if (ownerSprite) {
                                            ownerSprite.position.x += dx;
                                            ownerSprite.position.y += dy;
                                        }

                                        if (ownerCollider) {
                                            ownerCollider.position.x += dx;
                                            ownerCollider.position.y += dy;
                                        }
                                    }

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
        lyrina.position = new Vector3(7, 0.2, 0);//debut(7, 0.2, 0)  part 1(-2.48, 0.47, 0) PART 2 (-12.11, 0.4, 0) part 3 (-20.923, 0.495, 0)
        lyrina.size = 0.4;
        lyrina.playAnimation(0, 7, true, 100);
        
        //creating the movements of the player and the camera
        const keyStatus: { [key: string]: boolean } = { q: false, s: false, ' ': false, z: false };
        
        scene.actionManager = new ActionManager(scene);

        const sideCamera = new FreeCamera("SideCamera", new Vector3(0, 0.3, 2.2), scene);//z1.9
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
        background.position.y = 1;//1.1
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

       
        const slime1 = new Slime('slime1', scene, new Vector3(6, 0, -0.0099),this.devpoweractive);
        const slime2 = new Slime('slime2', scene, new Vector3(3.8, 1, -0.0099),this.devpoweractive);
        const slime3 = new Slime('slime3', scene, new Vector3(2.48, 1, -0.0099),this.devpoweractive);
        const slime4 = new Slime('slime4', scene, new Vector3(-1.4, -0.1, -0.0099),this.devpoweractive);
        const slime5 = new Slime('slime5', scene, new Vector3(-1.6, -0.1, -0.0099),this.devpoweractive);
        const slimerouge1 = new Slimerouge('slimerouge1', scene, new Vector3(-6.69, 0.23, -0.0099),this.devpoweractive);
        const slimerouge2 = new Slimerouge('slimerouge2', scene, new Vector3(-7.89, 0.50, -0.0099),this.devpoweractive);
        const slimerouge3 = new Slimerouge('slimerouge3', scene, new Vector3(-9.39, 0.19, -0.0099),this.devpoweractive);
        const slimerouge4 = new Slimerouge('slimerouge4', scene, new Vector3(-12.35, -0.06, -0.0099),this.devpoweractive);
        const slimerouge5 = new Slimerouge('slimerouge5', scene, new Vector3(-13.95, -0.06, -0.0099),this.devpoweractive);
        // on place la guêpe dans la zone visible près du joueur
        const guepe1 = new Guepe('guepe1', scene, new Vector3(-4.06, 0.99, -0.0099),this.devpoweractive);
        const guepe2 = new Guepe('guepe2', scene, new Vector3(-5.3, 1.88, -0.0099),this.devpoweractive);
        const guepe3 = new Guepe('guepe3', scene, new Vector3(-5.3, 1.51, -0.0099),this.devpoweractive);
        const guepe4 = new Guepe('guepe4', scene, new Vector3(-5.3, 1.15, -0.0099),this.devpoweractive);
        const guepe5 = new Guepe('guepe5', scene, new Vector3(-13.5, 1, -0.0099),this.devpoweractive);//le deplaceur
        //aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa(axe: 0 verti, 1 horiz,distance,debut)
        const guepepurple1 = new Guepepurple('guepepurple1', scene, new Vector3(-0.88, 0.98, -0.0099),this.devpoweractive,0,0.17,true);
        const guepepurple2 = new Guepepurple('guepepurple2', scene, new Vector3(-0.45, 1.15, -0.0099),this.devpoweractive,1,0.17,false);
        const guepepurple3 = new Guepepurple('guepepurple3', scene, new Vector3(-1.15, 0.98, -0.0099),this.devpoweractive,0,0.17,true);
        const guepepurple4 = new Guepepurple('guepepurple4', scene, new Vector3(-1.6, 1.15, -0.0099),this.devpoweractive,1,0.17,true);
        //frog create
        const frog1 = new Frog('frog1', scene, new Vector3(-3.52, -0.11, -0.0099),this.devpoweractive);
        const frog2 = new Frog('frog2', scene, new Vector3(-4.52, -0.11, -0.0099),this.devpoweractive);
        //const frogpurple1 = new Frogpurple('frogpurple1', scene, new Vector3(-3.52, -50, -0.0099),this.devpoweractive);
        //const frogpurple2 = new Frogpurple('frogpurple2', scene, new Vector3(8, 0, -0.0099),this.devpoweractive);
        const slimerouge13 = new Slimerouge('slimerouge13', scene, new Vector3(-16.669, 0.049, -0.0099),this.devpoweractive);
        const slimerouge15 = new Slimerouge('slimerouge15', scene, new Vector3(-16.922, 0.3, -0.0099),this.devpoweractive);
        const slimerouge17 = new Slimerouge('slimerouge17', scene, new Vector3(-17.746, 0.3, -0.0099),this.devpoweractive);
        const slimerouge19 = new Slimerouge('slimerouge19', scene, new Vector3(-18.785, 0.995, -0.0099),this.devpoweractive);
        const slime11 = new Slime('slime11', scene, new Vector3(-18.182, 0.3,-0.0099),this.devpoweractive);
        const slime10 = new Slime('slime10', scene, new Vector3(-18.47, 0.3, -0.0099),this.devpoweractive);
        const slime9 = new Slime('slime9', scene, new Vector3(-18.782, 0.3, -0.0099),this.devpoweractive);
        const slime8 = new Slime('slime8', scene, new Vector3(-18.614, 0.3, -0.0099),this.devpoweractive);
        const slime7 = new Slime('slime7', scene, new Vector3(-18.318, 0.3, -0.0099),this.devpoweractive);
        const slime6 = new Slime('slime6', scene, new Vector3(-19.92, 1.38, -0.0099),this.devpoweractive);
        const guepe41 = new Guepe('guepe41', scene, new Vector3(-19.138, 0.861, -0.0099),this.devpoweractive);
        const guepe43 = new Guepe('guepe43', scene, new Vector3(-19.391, 0.859, -0.0099),this.devpoweractive);
        const slimerouge45 = new Slimerouge('slimerouge45', scene, new Vector3(-19.9, 0.3, -0.0099),this.devpoweractive);
        const slimerouge47 = new Slimerouge('slimerouge47', scene, new Vector3(-19.752, 0.3, -0.0099),this.devpoweractive);
        const slimerouge49 = new Slimerouge('slimerouge49', scene, new Vector3(-19.287, 0.3, -0.0099),this.devpoweractive);
        const slime_38 = new Slime('slime_38', scene, new Vector3(-20.6, 0.2, -0.0099),this.devpoweractive);
        const guepe_40 = new Guepe('guepe_40', scene, new Vector3(-21.393, 1.155, -0.0099),this.devpoweractive);
        const guepe_42 = new Guepe('guepe_42', scene, new Vector3(-21.389, 0.69, -0.0099),this.devpoweractive);
        const guepe_44 = new Guepe('guepe_44', scene, new Vector3(-21.391, 0.927, -0.0099),this.devpoweractive);
        const guepe_edit41 = new Guepe('guepe_edit41', scene, new Vector3(-22.231, 0.408, -0.01),this.devpoweractive);
        const guepe_edit43 = new Guepe('guepe_edit43', scene, new Vector3(-23.03, 0.672, -0.01),this.devpoweractive);
        const guepe_edit45 = new Guepe('guepe_edit45', scene, new Vector3(-23.815, 0.947, -0.01),this.devpoweractive);
        const guepepurple_edit51 = new Guepepurple('guepepurple_edit51', scene, new Vector3(-24.67, 0.919, -0.01),this.devpoweractive,0,0.17,true);
        const guepepurple_edit53 = new Guepepurple('guepepurple_edit53', scene, new Vector3(-25.489, 1.782, -0.01),this.devpoweractive,1,0.4,true);
        const guepepurple_edit57 = new Guepepurple('guepepurple_edit57', scene, new Vector3(-26.71, 1.572, -0.01),this.devpoweractive,0,0.17,true);
        const guepepurple_edit61 = new Guepepurple('guepepurple_edit61', scene, new Vector3(-26.708, 1.352, -0.01),this.devpoweractive,0,0.17,true);
        const guepepurple_edit63 = new Guepepurple('guepepurple_edit63', scene, new Vector3(-26.71, 1.786, -0.01),this.devpoweractive,0,0.17,true);
        const guepepurple_edit49 = new Guepepurple('guepepurple_edit49', scene, new Vector3(-28.153, 2.39, -0.01),this.devpoweractive,0,0.17,true);
        const guepepurple_edit54 = new Guepepurple('guepepurple_edit54', scene, new Vector3(-28.153, 1.797, -0.01),this.devpoweractive,0,0.17,false);
        const guepe_edit49 = new Guepe('guepe_edit49', scene, new Vector3(-28.827, 1.922, -0.01),this.devpoweractive);
        const guepe_edit51 = new Guepe('guepe_edit51', scene, new Vector3(-29.572, 2.131, -0.01),this.devpoweractive);
        const guepepurple_edit52 = new Guepepurple('guepepurple_edit52', scene, new Vector3(-30.322, 2.133, -0.01),this.devpoweractive,0,0.17,true);
        const guepepurple_edit55 = new Guepepurple('guepepurple_edit55', scene, new Vector3(-30.75, 2.135, -0.01),this.devpoweractive,0,0.17,true);
        const guepepurple_edit58 = new Guepepurple('guepepurple_edit58', scene, new Vector3(-31.164, 2.129, -0.01),this.devpoweractive,0,0.17,true);
        const guepepurple_edit56 = new Guepepurple('guepepurple_edit56', scene, new Vector3(-31.837, 2.033, -0.01),this.devpoweractive,0,0.17,true);
        const guepepurple_edit62 = new Guepepurple('guepepurple_edit62', scene, new Vector3(-32.716, 1.159, -0.01),this.devpoweractive,0,0.17,false);
        const guepepurple_edit64 = new Guepepurple('guepepurple_edit64', scene, new Vector3(-32.915, 1.159, -0.01),this.devpoweractive,0,0.17,false);
        const guepepurple_edit66 = new Guepepurple('guepepurple_edit66', scene, new Vector3(-32.514, 1.165, -0.01),this.devpoweractive,0,0.17,false);
        const frog_edit58 = new Frog('frog_edit58', scene, new Vector3(-35.65, 0.1, -0.0099),this.devpoweractive);
        const frog_edit60 = new Frog('frog_edit60', scene, new Vector3(-36.065, 0.197, -0.0099),this.devpoweractive);
        const frogpurple_edit62 = new Frogpurple('frogpurple_edit62', scene, new Vector3(-36.971, -0.106, -0.0099),this.devpoweractive);
        const frogpurple_edit64 = new Frogpurple('frogpurple_edit64', scene, new Vector3(-37.164, -0.1, -0.0099),this.devpoweractive);
        const frog_edit62 = new Frog('frog_edit62', scene, new Vector3(-38.054, 0.184, -0.0099),this.devpoweractive);
        const frog_edit64 = new Frog('frog_edit64', scene, new Vector3(-39.543, 0.182, -0.0099),this.devpoweractive);
        const frog_edit65 = new Frog('frog_edit65', scene, new Vector3(-40.913, 0.143, -0.0099),this.devpoweractive);
        const frogpurple_edit67 = new Frogpurple('frogpurple_edit67', scene, new Vector3(-41.83, 0.604, -0.0099),this.devpoweractive);
        const frogpurple_edit69 = new Frogpurple('frogpurple_edit69', scene, new Vector3(-42.537, 0.849, -0.0099),this.devpoweractive);


        const slimes = [slime1, slime2, slime3, slime4, slime5, slimerouge1, slimerouge2, slimerouge3, slimerouge4, slimerouge5, frog1, frog2, frog_edit58, frog_edit60, frog_edit62, frog_edit64, frog_edit65,  frogpurple_edit62, frogpurple_edit64, frogpurple_edit67, frogpurple_edit69, slimerouge13, slimerouge15, slimerouge17, slimerouge19, slime11, slime10, slime9, slime8, slime7, slime6, slime_38, slimerouge45, slimerouge47, slimerouge49];
        const guepes = [guepe1, guepe2, guepe3, guepe4,guepe41,guepe43, guepe5, guepepurple1, guepepurple2, guepepurple3, guepepurple4, guepe_40, guepe_42, guepe_44, guepe_edit41, guepe_edit43, guepe_edit45, guepepurple_edit51, guepepurple_edit53, guepepurple_edit57, guepepurple_edit61, guepepurple_edit63, guepepurple_edit49, guepepurple_edit54, guepe_edit49, guepe_edit51, guepepurple_edit52, guepepurple_edit55, guepepurple_edit58, guepepurple_edit56, guepepurple_edit62, guepepurple_edit64, guepepurple_edit66];
        const frogs = [frog1, frog2, frog_edit58, frog_edit60, frog_edit62, frog_edit64, frog_edit65];
        const frogspurple = [ frogpurple_edit62, frogpurple_edit64, frogpurple_edit67, frogpurple_edit69];
        let lastHitSlime: Slime | null | Slimerouge | Guepe = null;
        
        // Compteur global pour déclencher le saut des frogs
        // après un saut du joueur.
        

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

        function frogpurpleboucle(frog: Frogpurple): void {
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
                        frog.verticalVelocity = 0.06; // force du saut
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

        function guepepurpleboucle(guepe: Guepepurple): void {
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
                const prevY = guepe.slimeCollider.position.y;
                guepe.slimeCollider.computeWorldMatrix(true);
            } else {
                // juste animer la guepe sans déplacement pour l'instant
                if( !guepe.isAttacking && invincibilityFrames <= 0) {
                    guepe.sprite.playAnimation(0, 5, false, 50, () => {  
                        guepe.sprite.playAnimation(0, 5, true, 100);
                        guepe.isAttacking = false;
                    });
                    guepe.waittime = 20;
                    guepe.actionTime = 0;
                    guepe.isAttacking = true;
                }
                if(guepe.isAttacking) {
                    if(guepe.axe==0){
                        const prevY = guepe.slimeCollider.position.y;
                        const prevX = guepe.slimeCollider.position.x;
                        if(guepe.slimeCollider.position.y >= guepe.initialPositiony + guepe.distance){
                            guepe.isgoinigup=false;
                        }
                        else if(guepe.slimeCollider.position.y <= guepe.initialPositiony - guepe.distance){
                            guepe.isgoinigup=true;
                        }
                        if((guepe.slimeCollider.position.y < guepe.initialPositiony + guepe.distance) && guepe.isgoinigup) {
                            guepe.slimeCollider.position.y += 0.003;
                        }
                        else if(guepe.slimeCollider.position.y > guepe.initialPositiony - guepe.distance && !guepe.isgoinigup){
                            guepe.slimeCollider.position.y -= 0.003;
                        }
                        guepe.slimeCollider.computeWorldMatrix(true);
                        if (invincibilityFrames > 0) {
                            const sBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                            const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                            if (overlapX && overlapY) {
                                guepe.slimeCollider.position.x = prevX;
                                guepe.slimeCollider.position.y = prevY;
                                guepe.slimeCollider.computeWorldMatrix(true);
                            }
                        }
                    }
                    else if(guepe.axe==1){
                        const prevY = guepe.slimeCollider.position.y;
                        const prevX = guepe.slimeCollider.position.x;
                        if(guepe.slimeCollider.position.x >= guepe.initialPositionx + guepe.distance){
                            guepe.isgoinigup=false;
                        }
                        else if(guepe.slimeCollider.position.x <= guepe.initialPositionx - guepe.distance){
                            guepe.isgoinigup=true;
                        }
                        if((guepe.slimeCollider.position.x < guepe.initialPositionx + guepe.distance) && guepe.isgoinigup) {
                            guepe.slimeCollider.position.x += 0.003;
                        }
                        else if(guepe.slimeCollider.position.x > guepe.initialPositionx - guepe.distance && !guepe.isgoinigup){
                            guepe.slimeCollider.position.x -= 0.003;
                        }
                        guepe.slimeCollider.computeWorldMatrix(true);
                        if (invincibilityFrames > 0) {
                            const sBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                            const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                            if (overlapX && overlapY) {
                                guepe.slimeCollider.position.x = prevX;
                                guepe.slimeCollider.position.y = prevY;
                                guepe.slimeCollider.computeWorldMatrix(true);
                            }
                        }
                    }
                }
                else{
                    guepe.sprite.playAnimation(0, 5, true, 100);
                }
            }

            // garder les colliders alignés avec le sprite
            guepe.sprite.position.copyFrom(guepe.slimeCollider.position);
            guepe.attackCollider.position.copyFrom(guepe.sprite.position);
            guepe.sprite.position.y+=0.02;
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
                if(dxGreen < 0.8 && dyGreen < 0.3 && !slime.isAttacking && slime.pastFirstCycle && invincibilityFrames <= 0) {
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
                            //console.log(slime.dir < 0.5);
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
                        const groundAhead = hasGroundAhead(slime.slimeCollider,slime.dir < 0.5 ? 1 : -1);
                        if (!groundAhead) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
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
                const dyRed = Math.abs(playerCollider.position.y - slime.slimeCollider.position.y);
                if(dxRed < 0.4 && dyRed < 0.3 && !slime.isAttacking && invincibilityFrames <= 0) {
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
                    
                    const groundAhead = hasGroundAhead(slime.slimeCollider, slime.sprite.position.x < lyrina.position.x ? 1 : -1);
                    if (!groundAhead) {
                        slime.slimeCollider.position.x = prevX;
                        slime.slimeCollider.computeWorldMatrix(true);
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
            //ACTIVATION DES COLLISION ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ
            // Populate collidables once (utilisé aussi pendant le knockback)
            if (collidables.length === 0) {
                for (const m of scene.meshes) {
                    if (!(m instanceof Mesh)) {
                        continue;
                    }

                    // Ajoute automatiquement tous les colliders de décor.
                    const isLevelCollider =
                        m.name.startsWith('block') ||
                        m.name.startsWith('platform') ||
                        m.name.startsWith('obstacle');

                    if (isLevelCollider) {
                        collidables.push(m);
                    }
                }
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
                
                const groundAhead = hasGroundAhead(playerCollider, knockbackVelocityX > 0 ? 1 : -1);
                if (!groundAhead && isGrounded) {
                    playerCollider.position.x = prevX;
                    playerCollider.computeWorldMatrix(true);
                    knockbackVelocityX = 0;
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
                    // Déclenche un saut "de réaction" des frogs
                    // 20 frames après le saut du joueur.
                    for (const frog of frogspurple) {
                        frog.jumpDelay = 1;      // délai en frames
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
                        //isGrounded = true;
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
                        //isGrounded = true;
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
            // Quand le joueur dépasse y = 1.2, la caméra monte de 1 en hauteur
            if (playerCollider.position.y > 1.3) {
                sideCamera.position.y = fixedCameraY + 1.4;
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
            //console.log(acceleration);
        });
        //GESTION MONSTRES
        scene.onBeforeRenderObservable.add(() => {
            for (const slime of slimes) {
                if (slime instanceof Slime) {
                    slimeboucle(slime);
                } else if (slime instanceof Slimerouge) {
                    slimerougeboucle(slime);
                } else if (slime instanceof Frog) {
                    frogboucle(slime);
                } else if (slime instanceof Frogpurple) {
                    frogpurpleboucle(slime);
                }
            }

            for (const guepe of guepes) {
                if (guepe instanceof Guepe) {
                    guepeboucle(guepe);
                } else if (guepe instanceof Guepepurple) {
                    guepepurpleboucle(guepe);
                }
            }
        })
    }

    async CreateEnvironment(scene:Scene): Promise<void> {

        const obstacleinvisible = new Obstaclesinvisibles("obstacleinvisible", this.scene, new Vector3(7.75, 0.51, 0), 3, 10,this.devpoweractive);

        const ground1 = new Ground("block1", this.scene, new Vector3(3, -0.28, 0), 120,this.devpoweractive);
        const ground2 = new Ground("block2", this.scene, new Vector3(-16.2, -0.28, 0), 68,this.devpoweractive);
        //const ground3 = new Ground("block3", this.scene, new Vector3(-22, -0.18, 0), 68,this.devpoweractive);
        //const ground4 = new Ground("block4", this.scene, new Vector3(7, -0.18, 0), 30,this.devpoweractive);

        const obstacle2 = new Obstacles("obstacle2", this.scene, new Vector3(4, -0.1, -0.0101), 7, 2,this.devpoweractive);
        const obstacle3 = new Obstacles("obstacle3", this.scene, new Vector3(3.242, 0.05, -0.0101), 6, 4,this.devpoweractive);
        const obstacle4 = new Obstacles("obstacle4", this.scene, new Vector3(2.48, -0.1, -0.0101), 7, 2,this.devpoweractive);
        const obstacle5 = new Obstacles("obstacle5", this.scene, new Vector3(-0.13, -0.16, -0.0101), 3, 1,this.devpoweractive);
        const obstacle6 = new Obstacles("obstacle6", this.scene, new Vector3(-1.91, -0.16, -0.0101), 3, 1,this.devpoweractive);
        const obstacle7 = new Obstacles("obstacle7", this.scene, new Vector3(-12.1, -0.1, -0.0101), 4, 3,this.devpoweractive);
        const obstacle8 = new Obstacles("obstacle8", this.scene, new Vector3(-14.2, -0.1, -0.0101), 4, 3,this.devpoweractive);
        //aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa(largeur,hauteur)
        const obstaclevolant = new Obstaclesflying("obstaclevolant1", this.scene, new Vector3(-1.02, 0.46, -0.0101), 15, 3,this.devpoweractive);
        const obstaclevolant2 = new Obstaclesflying("obstaclevolant2", this.scene, new Vector3(-50, 0.37, -0.0101), 15, 3,this.devpoweractive);
        const obstaclevolant4 = new Obstaclesflying("obstaclevolant4", this.scene, new Vector3(-4.06, 0.74, -0.0101), 10, 1,this.devpoweractive);
        const obstaclevolant5 = new Obstaclesflying("obstaclevolant5", this.scene, new Vector3(-6.58, 0.05, -0.0101), 7, 1,this.devpoweractive);
        const obstaclevolant6 = new Obstaclesflying("obstaclevolant6", this.scene, new Vector3(-8, 0.35, -0.0101), 7, 1,this.devpoweractive);
        const obstaclevolant7 = new Obstaclesflying("obstaclevolant7", this.scene, new Vector3(-9.5, 0, -0.0101), 7, 1,this.devpoweractive);

        const platform1 = new Platforme("platform1", this.scene, new Vector3(0.76, 0.39, 0),this.devpoweractive);
        const platform2 = new Platforme("platform2", this.scene, new Vector3(-2.5, 0.3, 0),this.devpoweractive);
        const platform3 = new Platforme("platform3", this.scene, new Vector3(-4.6, 1.3, 0),this.devpoweractive);
        const platform4 = new Platforme("platform4", this.scene, new Vector3(-10.5, 0.5, 0),this.devpoweractive);
        const platform5 = new Platforme("platform5", this.scene, new Vector3(-10.5, -0.18, 0),this.devpoweractive);
        const platform6 = new Platforme("platform6", this.scene, new Vector3(-12.85, 0.33, 0),this.devpoweractive);
        const platform7 = new Platforme("platform7", this.scene, new Vector3(-13.45, 0.33, 0),this.devpoweractive);
        const platform_edit30 = new Platforme("platform_edit30", this.scene, new Vector3(-20.984, 0.65, 0),this.devpoweractive);
        const platform_edit32 = new Platforme("platform_edit32", this.scene, new Vector3(-20.825, 1, 0),this.devpoweractive);
        const platform_edit34 = new Platforme("platform_edit34", this.scene, new Vector3(-20.825, 0.3, 0),this.devpoweractive);

        const obstacle_edit34 = new Obstacles("obstacle_edit34", this.scene, new Vector3(-18.63, 0.822, -0.0101), 5, 1,this.devpoweractive);
        const obstacle_edit24 = new Obstacles("obstacle_edit24", this.scene, new Vector3(-17.702, -0.034, -0.0101), 6, 4,this.devpoweractive);
        const obstacle_edit26 = new Obstacles("obstacle_edit26", this.scene, new Vector3(-18.46, -0.11, -0.0101), 7, 3,this.devpoweractive);
        const obstacle_edit28 = new Obstacles("obstacle_edit28", this.scene, new Vector3(-17.088, -0.112, -0.0101), 5, 3,this.devpoweractive);
        const obstacle_edit30 = new Obstacles("obstacle_edit30", this.scene, new Vector3(-16.258, -0.188, -0.0101), 9, 2,this.devpoweractive);
        const obstacle_edit22 = new Obstacles("obstacle_edit22", this.scene, new Vector3(-19.293, -0.037, -0.0101), 7, 4,this.devpoweractive);
        const obstacle_edit29 = new Obstacles("obstacle_edit29", this.scene, new Vector3(-20.051, -0.186, -0.0101), 6, 2,this.devpoweractive);
        const obstaclevolant_edit33 = new Obstaclesflying("obstaclevolant_edit33", this.scene, new Vector3(-19.965, 1.124, -0.0101), 6, 2,this.devpoweractive);
        const obstaclevolant_edit39 = new Obstaclesflying("obstaclevolant_edit39", this.scene, new Vector3(-18.555, 0.676, -0.0101), 6, 1,this.devpoweractive);
        const platform_edit36 = new Platforme("platform_edit36", this.scene, new Vector3(-21.848, 0.068, 0),this.devpoweractive);
        const platform_edit38 = new Platforme("platform_edit38", this.scene, new Vector3(-22.696, 0.362, 0),this.devpoweractive);
        const platform_edit40 = new Platforme("platform_edit40", this.scene, new Vector3(-23.488, 0.665, 0),this.devpoweractive);
        const platform_edit42 = new Platforme("platform_edit42", this.scene, new Vector3(-24.21, 0.936, 0),this.devpoweractive);
        const obstaclevolant_edit44 = new Obstaclesflying("obstaclevolant_edit44", this.scene, new Vector3(-25.479, 1.141, -0.0101), 8, 1,this.devpoweractive);
        const platform_edit46 = new Platforme("platform_edit46", this.scene, new Vector3(-26.296, 1.648, 0),this.devpoweractive);
        const platform_edit48 = new Platforme("platform_edit48", this.scene, new Vector3(-27.071, 1.185, 0),this.devpoweractive);
        const platform_edit50 = new Platforme("platform_edit50", this.scene, new Vector3(-27.548, 1.493, 0),this.devpoweractive);
        const platform_edit52 = new Platforme("platform_edit52", this.scene, new Vector3(-28.548, 1.514, 0),this.devpoweractive);
        const platform_edit54 = new Platforme("platform_edit54", this.scene, new Vector3(-29.177, 1.885, 0),this.devpoweractive);
        const platform_edit56 = new Platforme("platform_edit56", this.scene, new Vector3(-30.003, 2.177, 0),this.devpoweractive);
        const block_edit58 = new Ground("block_edit58", this.scene, new Vector3(-22.813, -0.28, 0), 9,this.devpoweractive);
        const block_edit60 = new Ground("block_edit60", this.scene, new Vector3(-24.597, -0.28, 0), 9,this.devpoweractive);
        const block_edit62 = new Ground("block_edit62", this.scene, new Vector3(-26.442, -0.28, 0), 9,this.devpoweractive);
        const block_edit50 = new Ground("block_edit50", this.scene, new Vector3(-28.222, -0.28, 0), 9,this.devpoweractive);
        const block_edit52 = new Ground("block_edit52", this.scene, new Vector3(-29.944, -0.28, 0), 9,this.devpoweractive);
        const block_edit54 = new Ground("block_edit54", this.scene, new Vector3(-32.122, -0.28, 0), 12,this.devpoweractive);
        const obstacle_edit57 = new Obstacles("obstacle_edit57", this.scene, new Vector3(-22.459, -0.122, -0.0101), 4, 2,this.devpoweractive);
        const platform_edit61 = new Platforme("platform_edit61", this.scene, new Vector3(-31.478, 2.173, 0),this.devpoweractive);
        const platform_edit63 = new Platforme("platform_edit63", this.scene, new Vector3(-30.59, 1.708, 0),this.devpoweractive);
        const platform_edit65 = new Platforme("platform_edit65", this.scene, new Vector3(-30.923, 1.708, 0),this.devpoweractive);
        const obstacle_edit69 = new Obstacles("obstacle_edit69", this.scene, new Vector3(-32.487, 0.114, -0.0101), 7, 5,this.devpoweractive);
        const platform_edit58 = new Platforme("platform_edit58", this.scene, new Vector3(-32.185, 2.173, 0),this.devpoweractive);
        const platform_edit62 = new Platforme("platform_edit62", this.scene, new Vector3(-33.118, 0.37, 0),this.devpoweractive);
        const platform_edit64 = new Platforme("platform_edit64", this.scene, new Vector3(-33.48, 0.258, 0),this.devpoweractive);
        const platform_edit66 = new Platforme("platform_edit66", this.scene, new Vector3(-33.839, 0.132, 0),this.devpoweractive);
        const platform_edit68 = new Platforme("platform_edit68", this.scene, new Vector3(-34.175, -0.012, 0),this.devpoweractive);
        const platform_edit70 = new Platforme("platform_edit70", this.scene, new Vector3(-34.512, -0.137, 0),this.devpoweractive);
        const block_edit72 = new Ground("block_edit72", this.scene, new Vector3(-36.861, -0.28, 0), 32,this.devpoweractive);
        const obstacle_edit65 = new Obstacles("obstacle_edit65", this.scene, new Vector3(-36.074, -0.085, -0.0101), 6, 2,this.devpoweractive);
        const platform_edit67 = new Platforme("platform_edit67", this.scene, new Vector3(-36.695, 0.343, 0),this.devpoweractive);
        const platform_edit69 = new Platforme("platform_edit69", this.scene, new Vector3(-37.439, 0.337, 0),this.devpoweractive);
        const obstacle_edit71 = new Obstacles("obstacle_edit71", this.scene, new Vector3(-38.048, -0.085, -0.0101), 6, 2,this.devpoweractive);
        const obstaclevolant_edit73 = new Obstaclesflying("obstaclevolant_edit73", this.scene, new Vector3(-39.92, -0.08, -0.0101), 7, 1,this.devpoweractive);
        const obstaclevolant_edit70 = new Obstaclesflying("obstaclevolant_edit70", this.scene, new Vector3(-41.238, -0.073, -0.0101), 7, 1,this.devpoweractive);
        const platform_edit72 = new Platforme("platform_edit72", this.scene, new Vector3(-41.828, 0.428, 0),this.devpoweractive);
        const platform_edit74 = new Platforme("platform_edit74", this.scene, new Vector3(-42.176, 0.225, 0),this.devpoweractive);
        const platform_edit76 = new Platforme("platform_edit76", this.scene, new Vector3(-42.54, 0.653, 0),this.devpoweractive);
        const platform_edit78 = new Platforme("platform_edit78", this.scene, new Vector3(-42.914, 0.434, 0),this.devpoweractive);
        const platform_edit80 = new Platforme("platform_edit80", this.scene, new Vector3(-43.385, 0.219, 0),this.devpoweractive);
        const block_edit82 = new Ground("block_edit82", this.scene, new Vector3(-45.203, -0.28, 0), 28,this.devpoweractive);
        
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