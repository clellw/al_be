import { Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, PointerEventTypes, Matrix, Animation, Color4, CreateSoundAsync, CreateAudioEngineAsync, StaticSound } from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'
import { Obstaclesinvisibles } from "../Obstaclesinvisibles";
import { Ground } from "../Ground";
import { Projectile } from "./boss/projectile";
import { Lazer } from "./boss/lazer";

export class CH1_GM_UN_BF {

    scene: Scene;
    engine: Engine;
    devpoweractive: boolean;

    constructor(private canvas: HTMLCanvasElement) {
        this.devpoweractive = false;
        this.engine = new Engine(this.canvas, false);
        this.scene = this.CreateScene();
        //Inspector.show(this.scene, {})
        this.engine.runRenderLoop(() => {
            this.scene.render();
        })
    }

    public health = 440;

    CreateScene(): Scene {
        const scene = new Scene(this.engine);

        scene.createDefaultCameraOrLight(true, false, true);

        const hemilight = new HemisphericLight(
            "hemilight",
            new Vector3(0, 1, 0),
            this.scene
        );

        hemilight.intensity = 0.;

        this.CreateMainCharacter(scene);
        this.CreateEnvironment(scene);

        return scene;
    }



    async CreateMainCharacter(scene: Scene): Promise<void> {
        //importing the sprites for the character
        const LManager = new SpriteManager(
            'LManager',
            './sprites/bosses/ly-g.png',
            1,
            128,
            scene
        );
        
        LManager.texture = new Texture(
            "./sprites/bosses/ly-g.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );

        const lyrina = new Sprite('lyrina', LManager)
        lyrina.position = new Vector3(6, 0.2, 0);//debut(7, 0.2, 0)  part 1(-2.48, 0.47, 0) PART 2 (-12.11, 0.4, 0) part 3 (-20.923, 0.495, 0)
        lyrina.size = 0.45;
        lyrina.playAnimation(0, 7, true, 100);

        //creating the movements of the player and the camera
        const keyStatus: { [key: string]: boolean } = { q: false, s: false, ' ': false, z: false };

        scene.actionManager = new ActionManager(scene);

        const sideCamera = new FreeCamera("SideCamera", new Vector3(7, 0.1, 1.8), scene);//z1.9
        // Make camera look toward -Z (scene) so it doesn't look into empty space
        sideCamera.setTarget(new Vector3(sideCamera.position.x, sideCamera.position.y, 0));

        // Player collider sized in world units based on sprite size (not texture pixels)
        const colliderWidth = lyrina.size * 0.15;   // narrower than sprite width
        const colliderHeight = lyrina.size / 2.1;   // close to sprite height
        const colliderDepth = 0.1;                  // thin depth for 2D side view
        const playerCollider = MeshBuilder.CreateBox("playerCollider", { width: colliderWidth, height: colliderHeight, depth: colliderDepth }, scene);
        playerCollider.isVisible = this.devpoweractive;
        playerCollider.material = new StandardMaterial('playerMaterial', scene);
        playerCollider.material.wireframe = true;
        // No engine collisions: we resolve collisions manually with AABB
        playerCollider.position = lyrina.position.clone();

        const fixedCameraY = sideCamera.position.y;
        scene.activeCamera = sideCamera;
        const attackCollider = MeshBuilder.CreateBox("attackCollider", { width: colliderHeight - 0.03, height: colliderWidth + 0.04, depth: colliderDepth }, scene);
        attackCollider.isVisible = false;
        attackCollider.material = new StandardMaterial('playerMaterial', scene);
        attackCollider.checkCollisions = false;

        scene.actionManager.registerAction(new ExecuteCodeAction
            (ActionManager.OnKeyDownTrigger, (event) => {
                let key = event.sourceEvent.key;
                if (key !== "Shift") {
                    key = key.toLowerCase();
                }
                if (key in keyStatus) {
                    keyStatus[key as keyof typeof keyStatus] = true;
                }
            })
        );
        scene.actionManager.registerAction(new ExecuteCodeAction
            (ActionManager.OnKeyUpTrigger, (event) => {
                let key = event.sourceEvent.key;
                if (key !== "Shift") {
                    key = key.toLowerCase();
                }
                if (key in keyStatus) {
                    keyStatus[key as keyof typeof keyStatus] = false;
                }
            })
        );

        // Create and tweak the background material.
        const backgroundManager = new SpriteManager(
            "tilesManager",
            "./sprites/place_holder_bnew.png",
            100,
            { width: 961, height: 550 },
            scene
        );
        const background = new Sprite("background", backgroundManager);
        background.position.z = -1;
        background.position.y = 1;//1.1
        background.width = 6;
        background.height = 3;

        let newAnim = true;
        const speed = 0.02;
        let acceleration = 0;
        const gravity = 0.0009999999;
        const jumpStrength = 0.03;
        let verticalVelocity = 0;
        let isGrounded = false;
        let isLanded = false;
        let falling = false;
        let isAttacking = false;
        let isKnockback = false;
        let knockbackVelocityX = 0;
        let invincibilityFrames = 0;
        const collidables: Mesh[] = [];


        scene.onBeforeRenderObservable.add(() => {
            // décrémente l'invincibilité si active et fait clignoter le joueur
            if (invincibilityFrames > 0) {
                invincibilityFrames--;
                // clignotement simple: visible 3 frames sur 6
                lyrina.isVisible = (invincibilityFrames % 6) >= 3;
            } else {
                // hors invincibilité: toujours visible
                lyrina.isVisible = true;
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

                /*const groundAhead = hasGroundAhead(playerCollider, knockbackVelocityX > 0 ? 1 : -1);
                if (!groundAhead && isGrounded) {
                    playerCollider.position.x = prevX;
                    playerCollider.computeWorldMatrix(true);
                    knockbackVelocityX = 0;
                }*/

                // collision avec les slimes pendant le knockback
                if (knockbackVelocityX !== 0 && isGrounded) {
                    const pBB = playerCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                }

                // amortit progressivement la vitesse de knockback
                knockbackVelocityX *= 0.9;
                if (Math.abs(knockbackVelocityX) < 0.005) {
                    knockbackVelocityX = 0;
                    isKnockback = false;
                }
            }

            if (lyrina.cellIndex != 24) {
                if (keyStatus.z && !isAttacking) {
                    attackCollider.checkCollisions = true;
                    if (isGrounded)
                        lyrina.playAnimation(21, 23, false, 100, () => {
                            isAttacking = false;
                            newAnim = true;
                        });
                    else
                        lyrina.playAnimation(24, 26, false, 100, () => {
                            isAttacking = false;
                            newAnim = true;
                        });
                    isAttacking = true;
                }

                // Jump input: start jump only if grounded (pas de nouveau saut pendant une attaque)
                if (!isAttacking && keyStatus[' '] && isGrounded) {
                    verticalVelocity = jumpStrength;
                    isGrounded = false;
                    lyrina.playAnimation(15, 16, true, 120);
                    newAnim = true;
                }

                // Animation de chute uniquement si on n'est pas en train d'attaquer
                if (!isAttacking && !isGrounded && verticalVelocity < 0 && !falling) {
                    lyrina.playAnimation(18, 19, true, 120);
                    falling = true;
                    newAnim = true;
                }

                // === HORIZONTAL MOVEMENT first (prevents corner-sliding) ===
                // Pendant une attaque (isAttacking == true), on ignore q et s
                // mais on laisse la décélération/friction agir dans le else.
                if (!isAttacking && !isKnockback && (keyStatus.q || keyStatus.s)) {
                    if (!isAttacking && newAnim && isGrounded) {
                        lyrina.playAnimation(9, 13, true, 120);
                        newAnim = false
                    }
                    if (keyStatus.s && !keyStatus.q) {
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
                        }
                        if (invincibilityFrames > 0) {
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                        }
                        if (acceleration > -speed) {
                            acceleration -= 0.004;
                        }
                    }
                    else if (keyStatus.q) {
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
                        }
                        if (invincibilityFrames > 0) {
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                        }
                        if (acceleration < speed) {
                            acceleration += 0.004;
                        }
                    }
                }
                else {
                    if (Math.abs(acceleration) < 0.006) {
                        acceleration = 0;
                    }
                    else if (acceleration > 0 && !isKnockback) {
                        acceleration -= 0.008;
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
                    else if (acceleration < 0 && !isKnockback) {
                        acceleration += 0.008;
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
                    if (!isAttacking && acceleration == 0 && isGrounded) {
                        if (!newAnim) lyrina.playAnimation(0, 7, true, 100);
                        newAnim = true;
                    }
                    if (!isAttacking && verticalVelocity == 0 && isLanded) {
                        lyrina.playAnimation(0, 7, true, 100);
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
            const hitSlimeFromTop = false;
            if (!hitObstacle && dy <= 0) {
                const pBB = playerCollider.getBoundingInfo().boundingBox;
                const playerHalfY = pBB.extendSizeWorld.y;
            }
            if (invincibilityFrames > 0 && !hitObstacle) {
                const pBB = playerCollider.getBoundingInfo().boundingBox;
                const playerHalfY = pBB.extendSizeWorld.y;
            }

            if (!hitObstacle && !hitSlimeFromTop) {
                isGrounded = false;
            }
            lyrina.position.copyFrom(playerCollider.position);
            lyrina.position._y += 0.01
            sideCamera.position.x = playerCollider.position.x;
            // Quand le joueur dépasse y = 1.2, la caméra monte de 1 en hauteur
            if (playerCollider.position.y > 1.3) {
                sideCamera.position.y = fixedCameraY + 1.4;
            } else {
                sideCamera.position.y = fixedCameraY;
            }
            attackCollider.position.copyFrom(lyrina.position);
            if (lyrina.invertU)
                attackCollider.position._x += 0.107;
            else
                attackCollider.position._x -= 0.107;
            attackCollider.position._y -= 0.01;

            if (lyrina.cellIndex == 19 || lyrina.cellIndex == 22) {
                attackCollider.checkCollisions = true;
            }
            else {
                attackCollider.checkCollisions = false;
            }
            background.position.x = lyrina.position._x;
            //console.log(acceleration);
        });



        /****************************************************************************************************/
        //Boss 
        const BManager = new SpriteManager(
            'BManager',
            './sprites/bosses/chapterone/ar-fi.png',
            1,
            128,
            scene
        );
        BManager.texture = new Texture(
            "./sprites/bosses/chapterone/ar-fi.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        const arthur = new Sprite('arthur', BManager)
        arthur.position = new Vector3(5, -0.1, 0);
        arthur.size = 0.45;
        arthur.invertU = true;
        arthur.playAnimation(0, 7, true, 100);

        let bossattacking = false;
        let bossmoving = false;
        let bossmoved = false;

        let bossacting = false;
        let direction = 0;

        let ishurt = false;

        let health = 500;

        const bosscolliderWidth = arthur.size * 0.18;   // narrower than sprite width
        const bosscolliderHeight = arthur.size / 2;   // close to sprite height
        const bosscolliderDepth = 0.1;                  // thin depth for 2D side view
        const bossCollider = MeshBuilder.CreateBox("bossCollider", { width: bosscolliderWidth, height: bosscolliderHeight, depth: bosscolliderDepth }, scene);
        bossCollider.isVisible = false;
        bossCollider.material = new StandardMaterial('playerMaterial', scene);
        bossCollider.material.wireframe = true;
        // No engine collisions: we resolve collisions manually with AABB
        bossCollider.position = arthur.position.clone();


        const battackCollider = MeshBuilder.CreateBox("battackCollider", { width: 0.1, height: 0.15, depth: colliderDepth }, scene);
        battackCollider.isVisible = false;
        battackCollider.material = new StandardMaterial('playerMaterial', scene);
        battackCollider.checkCollisions = false;
        battackCollider.material.wireframe = true;

        battackCollider.position.copyFrom(arthur.position);
        if (arthur.invertU)
            battackCollider.position._x += 0.07;
        else
            battackCollider.position._x -= 0.07;
        battackCollider.position._y += 0.02;

        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");


        const audioEngine = await CreateAudioEngineAsync();
        await audioEngine.unlockAsync();

        const lazersound = await CreateSoundAsync("lazersound",
            "./sounds/bosses/lazer00.wav"
        );
        lazersound.loop = false;
        lazersound.setVolume(0.04);

        const music = await CreateSoundAsync("music",
            "./sounds/music/bosses/Mermaid from the Uncharted Land.mp3"
        );
        music.loop = true;

        music.setVolume(0);
        music.play();

        const mvsound = await CreateSoundAsync("mvsound",
            "./sounds/00d7 - SE_ENESHOT5.wav"
        );
        mvsound.setVolume(0.9);
        mvsound.loop = false;

        lazersound.setVolume(0.1);

        const hbb = new GUI.Rectangle("hbb");
        hbb.left = "500px";
        hbb.top = "250px";
        hbb.width = "500px";
        hbb.height = "200px";
        hbb.thickness = 0;
        hbb.isVisible = true;
        advancedTexture.addControl(hbb)

        const hb = new GUI.Image("hb", "sprites/bosses/chapterone/ar-hb.png");

        hb.width = "308px";
        hb.height = "66px";
        hb.isVisible = true;
        hb.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        hbb.addControl(hb);

        const h = new GUI.Image("h", "sprites/bosses/chapterone/ar-h.png");

        h.width = "308px";
        h.height = "66px";
        h.sourceWidth = 77;
        h.left = 8;
        h.sourceLeft = 2;
        h.width = "308px";
        h.isVisible = true;
        h.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        hbb.addControl(h);

        (advancedTexture.getContext() as CanvasRenderingContext2D).imageSmoothingEnabled = false;

        // Update health bar width based on health percentage
        function updateHealthBar(health: number) {
            h.width = `${308 * (health / 500)}px`;
        }

        const animation = new Animation(
            "fadeOutalpha",
            "color",
            60,
            Animation.ANIMATIONTYPE_COLOR4,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0, value: new Color4(1, 1, 1, 1) },
            { frame: 60, value: new Color4(1, 1, 1, 0) }
        ];

        animation.setKeys(keys);

        function projectileboucle(projectile: Projectile): void {
            // Si le frog est déjà mort, on ne fait plus rien
            if (projectile.isDead) {

                projectile.sprite.dispose();
                projectile.attackCollider.dispose();
                const index = projectiles.indexOf(projectile);
                if (index !== -1) {
                    projectiles.splice(index, 1);
                }
                return;
            }
            else {
                if (projectile.health <= 1) {
                    projectile.isAttacking = false;
                    projectile.sprite.animations = [animation]
                    scene.beginAnimation(projectile.sprite, 0, 60, false, undefined, () => {
                        projectile.isDead = true;
                    })
                }

                projectile.health--;
                projectile.sprite.position._x -= Math.cos(projectile.angle) * projectile.speed;
                projectile.sprite.position._y += Math.sin(projectile.angle) * projectile.speed;
                projectile.attackCollider.position = projectile.sprite.position.clone()
                projectile.attackCollider.checkCollisions = true;
            }
        }

        function lazerboucle(lazer: Lazer): void {
            // Si le frog est déjà mort, on ne fait plus rien
            if (lazer.isDead) {

                lazer.sprite.dispose();
                lazer.attackCollider.dispose();
                const index = lazers.indexOf(lazer);
                if (index !== -1) {
                    lazers.splice(index, 1);
                }
                return;
            }
            else {
                if (lazer.health <= 1) {
                    lazer.isAttacking = false;
                    lazer.sprite.animations = [animation]
                    scene.beginAnimation(lazer.sprite, 0, 60, false, undefined, () => {
                        lazer.isDead = true;
                    })
                }

                lazer.health--;
                lazer.sprite.position._x += (lazer.invert) ? lazer.speed : -lazer.speed;
                lazer.attackCollider.position = lazer.sprite.position.clone()
                lazer.attackCollider.checkCollisions = true;
            }
        }


        const projectiles: Projectile[] = [];
        const lazers: Lazer[] = [];


        scene.onBeforeRenderObservable.add(() => {

            for (const p of projectiles) {
                projectileboucle(p);
            }

            for (const l of lazers) {
                lazerboucle(l);
            }

            if (health <= 0) {
                arthur.playAnimation(32, 32, false, 100);
            }

            else {
                //decision making
                if (bossacting) {
                    bossacting = false;
                    if (!bossmoving && !bossmoved) {
                        bossmoving = true;
                        arthur.playAnimation(24, 25, true, 150);
                        mvsound.play();
                        //mouvement du boss
                        if (arthur.position._x >= 6.5) {
                            direction = 1;
                        }
                        else if (arthur.position._x <= 4) {
                            direction = 0;
                        }
                        else {
                            direction = (arthur.position._x < lyrina.position._x) ? 1 : 0;
                        }

                        setTimeout(() => {
                            bossmoving = false;
                            bossmoved = true;
                            arthur.playAnimation(0, 7, true, 100);
                            setTimeout(() => {
                                bossacting = true;
                            }, Math.random() * 1000 + 300)
                        }, (Math.random() * 1000 + 500))
                    }

                    else {
                        bossattacking = true;
                        bossmoved = false;
                        arthur.invertU = (arthur.position._x < lyrina.position._x) ? true : false;

                        //cac
                        if (Math.abs(arthur.position._x - lyrina.position._x) < 0.5) {
                            arthur.playAnimation(8, 15, false, (health < 150) ? 100 : 200, (() => {
                                setTimeout(() => {
                                    bossattacking = false;
                                    arthur.playAnimation(0, 7, true, 100);
                                    setTimeout(() => {
                                        bossacting = true;
                                    }, Math.random() * 500 + 500)
                                }, 1000)
                            }))
                        }

                        //distance
                        else {
                            arthur.playAnimation(16, 17, true, 150)
                            lazersound.play();

                            if (Math.random() > 0.3) {
                                setTimeout(() => {

                                    if (health >= 375) {
                                        if (Math.random() < 0.5) {

                                            projectiles.push(new Projectile("01", scene, arthur.position.clone(), false,
                                                3 * Math.PI / 8 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                            setTimeout(() => {
                                                projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                    Math.PI / 2 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                setTimeout(() => {
                                                    projectiles.push(new Projectile("03", scene, arthur.position.clone(), false,
                                                        5 * Math.PI / 8 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                }, 100)
                                            }, 100)
                                        }

                                        else {
                                            projectiles.push(new Projectile("01", scene, arthur.position.clone(), false,
                                                4 * Math.PI / 11 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                            setTimeout(() => {
                                                projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                    5 * Math.PI / 11 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                setTimeout(() => {
                                                    projectiles.push(new Projectile("03", scene, arthur.position.clone(), false,
                                                        6 * Math.PI / 11 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                    setTimeout(() => {
                                                        projectiles.push(new Projectile("04", scene, arthur.position.clone(), false,
                                                            7 * Math.PI / 11 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                    }, 100)
                                                }, 100)
                                            }, 100)
                                        }
                                    }

                                    else if (health >= 225) {
                                        if (Math.random() < 0.5) {
                                            projectiles.push(new Projectile("01", scene, arthur.position.clone(), false,
                                                3 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                            setTimeout(() => {
                                                projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                    4 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                setTimeout(() => {
                                                    projectiles.push(new Projectile("03", scene, arthur.position.clone(), false,
                                                        Math.PI / 2 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                    setTimeout(() => {
                                                        projectiles.push(new Projectile("04", scene, arthur.position.clone(), false,
                                                            6 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                        setTimeout(() => {
                                                            projectiles.push(new Projectile("05", scene, arthur.position.clone(), false,
                                                                7 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                        }, 100)
                                                    }, 100)
                                                }, 100)
                                            }, 100)
                                        }

                                        else {
                                            projectiles.push(new Projectile("01", scene, arthur.position.clone(), false,
                                                5 * Math.PI / 13 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                            setTimeout(() => {
                                                projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                    6 * Math.PI / 13 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                setTimeout(() => {
                                                    projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                        7 * Math.PI / 13 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                    setTimeout(() => {
                                                        projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                            8 * Math.PI / 13 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                    }, 100)
                                                }, 100)
                                            }, 100)
                                        }
                                    }

                                    else {
                                        if (Math.random() < 0.5) {
                                            projectiles.push(new Projectile("01", scene, arthur.position.clone(), false,
                                                3 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                            projectiles.push(new Projectile("01", scene, arthur.position.clone(), false,
                                                -3 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                            setTimeout(() => {
                                                projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                    4 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                    -4 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                setTimeout(() => {
                                                    projectiles.push(new Projectile("03", scene, arthur.position.clone(), false,
                                                        Math.PI / 2 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                    projectiles.push(new Projectile("03", scene, arthur.position.clone(), false,
                                                        -Math.PI / 2 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                    setTimeout(() => {
                                                        projectiles.push(new Projectile("04", scene, arthur.position.clone(), false,
                                                            6 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                        projectiles.push(new Projectile("04", scene, arthur.position.clone(), false,
                                                            -6 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                        setTimeout(() => {
                                                            projectiles.push(new Projectile("05", scene, arthur.position.clone(), false,
                                                                7 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                            projectiles.push(new Projectile("05", scene, arthur.position.clone(), false,
                                                                -7 * Math.PI / 10 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                        }, 100)
                                                    }, 100)
                                                }, 100)
                                            }, 100)
                                        }

                                        else {
                                            projectiles.push(new Projectile("01", scene, arthur.position.clone(), false,
                                                6 * Math.PI / 15 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                            setTimeout(() => {
                                                projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                    7 * Math.PI / 15 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                setTimeout(() => {
                                                    projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                        8 * Math.PI / 15 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                    setTimeout(() => {
                                                        projectiles.push(new Projectile("02", scene, arthur.position.clone(), false,
                                                            9 * Math.PI / 15 + ((arthur.invertU) ? Math.PI / 2 : -Math.PI / 2), arthur.invertU))
                                                    }, 100)
                                                }, 100)
                                            }, 100)
                                        }
                                    }
                                }, 500)
                            }

                            else {
                                setTimeout(() => {
                                    lazers.push(new Lazer("01", scene, arthur.position.clone(), false, arthur.invertU,
                                    (health >= 300) ? 0.03 : (health >= 100) ? 0.05 : 0.06))
                                }, 1500)
                            }


                            setTimeout(() => {
                                bossattacking = false;
                                arthur.playAnimation(0, 7, true, 100);
                                setTimeout(() => {
                                    bossacting = true;
                                }, Math.random() * 200 + 1300)
                            }, 3000)
                        }
                    }
                }


                //amoving
                else {
                    if (bossmoving) {
                        arthur.invertU = (direction == 0) ? false : true;
                        arthur.position._x += (direction == 0) ? 0.01 : -0.01;
                    }

                    else if (!bossattacking) {
                        arthur.invertU = (arthur.position._x < lyrina.position._x) ? true : false;
                    }
                }

                if (bossCollider.intersectsMesh(playerCollider) && invincibilityFrames == 0) {
                    isKnockback = true;
                    invincibilityFrames = 120;
                }

                if (battackCollider.intersectsMesh(playerCollider) && battackCollider.checkCollisions && invincibilityFrames == 0) {
                    isKnockback = true;
                    invincibilityFrames = 120;
                }

                for (const p of projectiles) {
                    if (p.attackCollider.intersectsMesh(playerCollider) && p.isAttacking && invincibilityFrames == 0) {
                        isKnockback = true;
                        invincibilityFrames = 120;
                    }
                }
                
                for (const l of lazers) {
                    if (l.attackCollider.intersectsMesh(playerCollider) && l.isAttacking && invincibilityFrames == 0) {
                        isKnockback = true;
                        invincibilityFrames = 120;
                    }
                }
            }

            bossCollider.position = arthur.position.clone();

            battackCollider.position.copyFrom(arthur.position);
            if (arthur.invertU)
                battackCollider.position._x += 0.07;
            else
                battackCollider.position._x -= 0.07;
            battackCollider.position._y += 0.02;

            if (bossCollider.intersectsMesh(attackCollider) && !ishurt && attackCollider.checkCollisions) {
                ishurt = true;
                arthur.color = new Color4(100, 100, 100, 1);
                health -= 100;
                updateHealthBar(health);
                setTimeout(() => {
                    arthur.color = new Color4(1, 1, 1, 1);
                }, 100)
                setTimeout(() => {
                    ishurt = false;
                }, 500)
            }

            if (arthur.cellIndex == 14) battackCollider.checkCollisions = true;
            else battackCollider.checkCollisions = false;
        })

        setTimeout(() => {
            bossacting = true;
            this.fadeVolumeIn(music, 0.3);
        }, 1000)

    }


    async CreateEnvironment(scene: Scene): Promise<void> {

        const obstacleinvisible = new Obstaclesinvisibles("obstacleinvisible", this.scene, new Vector3(7.75, 0.51, 0), 3, 10, false);
        const obstacleinvisible2 = new Obstaclesinvisibles("obstacleinvisible", this.scene, new Vector3(3, 0.51, 0), 3, 10, false);

        const ground = new Ground("block", this.scene, new Vector3(3, -0.28, 0), 120, false);
        const skybox = Mesh.CreateBox("BackgroundSkybox", 500, scene, undefined, Mesh.BACKSIDE);
    }

    async fadeVolumeIn(music: StaticSound, target: number): Promise<void> {
        const height = music.volume;
        if (height <= target) {
            music.setVolume(height + 0.01);
            setTimeout(() => { this.fadeVolumeIn(music, target) }, 20);
        }
    }

    async fadeVolumeOut(music: StaticSound): Promise<void> {
        const height = music.volume;
        if (height >= 0) {
            music.setVolume(height - 0.01);
            setTimeout(() => { this.fadeVolumeOut(music) }, 30);
        }
        else {
            music.stop();
        }
    }
}

