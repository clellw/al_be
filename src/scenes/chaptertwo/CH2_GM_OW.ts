import {
    Scene,
    Engine,
    Vector3,
    HemisphericLight,
    SceneLoader,
    ArcRotateCamera,
    AbstractMesh,
    ActionManager,
    ExecuteCodeAction,
    MeshBuilder,
    StandardMaterial,
    CreateSoundAsync,
    Animation,
    StaticSound,
    CreateAudioEngineAsync,
    NodeRenderGraphScreenSpaceCurvaturePostProcessBlock
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as GUI from '@babylonjs/gui'

import { CH2_CU_OW_2 } from "./CH2_CU_OW_2";


export class CH2_GM_OW {
    scene: Scene;
    engine: Engine;
    Player!: AbstractMesh;
    camera!: ArcRotateCamera;
    canMove: boolean;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.canMove = false;
        this.CreateSkybox();


        this.engine.runRenderLoop(() => {
            this.scene.render();
        })

        window.addEventListener("resize", () => {
            this.engine.resize;
        });

    }

    CreateScene(): Scene {
        this.engine = new Engine(this.canvas, true);
        const scene = new Scene(this.engine);


        this.CreateCamera(scene);

        this.CreateMap();

        this.createPlayer();

        return scene;

    }

    CreateCamera(scene: Scene): void {
        this.camera = new ArcRotateCamera("camera", 0.01 + Math.PI / 2, Math.PI / 5, 7, new Vector3(2.1, 0, 3.8), scene);
        this.camera.checkCollisions = true;
        this.camera.angularSensibilityX = 3000;
        this.camera.angularSensibilityY = 3000;
        this.camera.wheelPrecision = 50;
        this.camera.minZ = 0.3;
        this.camera.lowerRadiusLimit = 5;
        this.camera.upperRadiusLimit = 50;
        this.camera.panningSensibility = 0;
    }


    async createPlayer(): Promise<void> {
        const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "mainCharacter_game.glb"
        );
        this.Player = meshes[0];
        this.Player.position = new Vector3(2., 0, 3.55);
        this.Player.rotate(Vector3.Up(), -Math.PI / 2)
        this.Player.scaling = new Vector3(0.23, 0.23, 0.23)
        this.camera.setTarget(this.Player);
        console.log("meshes", meshes);
        console.log("animations", animationGroups);

        for (let i = 0; i < animationGroups.length; i++) {
            animationGroups[i].start(true);
            animationGroups[i].speedRatio = 6;
        }

        const speed = 0.04;

        const keyStatus = {
            z: false,
            s: false,
            q: false,
            d: false,
            Shift: false
        };

        this.scene.actionManager = new ActionManager(this.scene);

        this.scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyDownTrigger,
                (event) => {
                    let key = event.sourceEvent.key;
                    if (key !== "Shift") {
                        key = key.toLowerCase();
                    }
                    if (key in keyStatus) {
                        keyStatus[key as keyof typeof keyStatus] = true;
                    }
                }
            )
        );

        this.scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,
                (event) => {
                    let key = event.sourceEvent.key;
                    if (key !== "Shift") {
                        key = key.toLowerCase();
                    }
                    if (key in keyStatus) {
                        keyStatus[key as keyof typeof keyStatus] = false;
                    }
                }
            )
        );

        let moving = false;

        this.scene.onBeforeRenderObservable.add(() => {

            if (keyStatus.z ||
                keyStatus.s ||
                keyStatus.q ||
                keyStatus.d) {
                moving = true;
                if (this.canMove) {
                    if (keyStatus.z) {
                        this.Player.moveWithCollisions(this.Player.right.scaleInPlace(speed));
                    }
                    else if (keyStatus.s) {
                        //walkAnim.speedRatio = animSpeed;
                        this.Player.moveWithCollisions(this.Player.right.scaleInPlace(-speed));
                    }
                    if (keyStatus.q) {
                        this.Player.rotate(Vector3.Up(), -0.04)
                    }
                    else if (keyStatus.d) {
                        this.Player.rotate(Vector3.Up(), 0.04)
                    }
                }
                /*walkAnim.start(
                    true, 
                    1, 
                    walkAnim.from, 
                    walkAnim.to, 
                    false
                );*/
            }
            else {
                if (moving) {
                    //idleAnim.start(true, 1, idleAnim.from, idleAnim.to, false);
                    moving = false;
                }
            }

            if (moving && this.canMove) {
                for (let i = 0; i < animationGroups.length; i++) {
                    animationGroups[i].start(true, animationGroups[i].from + 50);
                    animationGroups[i].speedRatio = 6;
                }
            }
            else {
                for (let i = 0; i < animationGroups.length; i++) {
                    animationGroups[i].goToFrame(1);
                    animationGroups[i].stop();
                }
            }
        });
    }

    async CreateMap(): Promise<void> {
        const map = await SceneLoader.ImportMeshAsync("", "./models/", "office_gameplay.glb");
        map.meshes.forEach((mesh) => {
            // Enable collisions for each imported mesh
            mesh.checkCollisions = false;
        });
        const light = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.;

        const triggerTransition = MeshBuilder.CreateSphere("triggerTransition", { diameter: 1.5 });
        triggerTransition.visibility = 0.;
        triggerTransition.position = new Vector3(-0.3, 10, -18.6);


        const triggerElUp = MeshBuilder.CreateSphere("triggerElUp", { diameter: 2 });
        triggerElUp.visibility = 0;
        triggerElUp.position = new Vector3(2., 0.5, -2.5);

        const triggerElDown = MeshBuilder.CreateSphere("triggerElDown", { diameter: 2 });
        triggerElDown.visibility = 0;
        triggerElDown.position = new Vector3(2., 10.5, -21.5);

        const triggertv = MeshBuilder.CreateSphere("triggertv", { diameter: 1.5 });
        triggertv.visibility = 0;
        triggertv.position = new Vector3(-0.5, 0.5, -2.5);

        const triggercounter = MeshBuilder.CreateSphere("triggercounter", { diameter: 2 });
        triggercounter.visibility = 0;
        triggercounter.position = new Vector3(4.5, 0.5, -2.);


        const triggerFirstPod = MeshBuilder.CreateSphere("triggerFirstPod", { diameter: 3 });
        triggerFirstPod.visibility = 0;
        triggerFirstPod.position = new Vector3(4.6, 10.5, -20.2);

        const triggerSecondPod = MeshBuilder.CreateSphere("triggerSecondPod", { diameter: 3 });
        triggerSecondPod.visibility = 0;
        triggerSecondPod.position = new Vector3(4.7, 10.5, -15.);

        const triggerBoxes = MeshBuilder.CreateSphere("triggerBoxes", { diameter: 3 });
        triggerBoxes.visibility = 0;
        triggerBoxes.position = new Vector3(-0.8, 10.5, -14.);

        const triggerScreens = MeshBuilder.CreateSphere("triggerScreens", { diameter: 1 });
        triggerScreens.visibility = 0;
        triggerScreens.position = new Vector3(-0.8, 10.5, -17.);

        const audioEngine = await CreateAudioEngineAsync();

        
        const music = await CreateSoundAsync("music",
            "sounds/music/Aether Paradise.mp3",
            {
                volume: 0.,
                loop: true
            }
        );
        music.play();

        const eventKeyStatus = {
            e: false
        };

        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const key = new GUI.Image("key", "./sprites/e-key.png");

        const dialogBox = new GUI.Rectangle();
        dialogBox.width = 0.7;
        dialogBox.height = 0.3;
        dialogBox.paddingBottom = "70px"
        dialogBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        dialogBox.cornerRadius = 15;
        dialogBox.color = "white";
        dialogBox.thickness = 4;
        const gradient = new GUI.LinearGradient();
        gradient.addColorStop(0, "black");
        gradient.addColorStop(1, "gray");
        dialogBox.backgroundGradient = gradient;
        dialogBox.fontFamily = "DejaVu Sans Mono, monospace";
        dialogBox.isVisible = false;
        advancedTexture.addControl(dialogBox);

        const panel = new GUI.StackPanel();
        dialogBox.addControl(panel);

        const title = new GUI.TextBlock();
        title.fontFamily = "DejaVu Sans Mono, monospace";
        title.paddingLeft = "20px";
        title.top = "10px";
        title.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        title.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        title.height = "40px";
        title.text = "Helia";
        title.color = "brown";
        title.fontSize = 24;
        panel.addControl(title);

        const message = new GUI.TextBlock();
        message.fontSize = 27;
        message.height = "70px";
        message.color = "white";
        message.textWrapping = true;
        message.left = 150;
        message.paddingRight = 250;
        message.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(message);

        const buttonPanel = new GUI.StackPanel();
        buttonPanel.isVertical = false;
        buttonPanel.height = "50px";
        buttonPanel.width = "50px";
        buttonPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.addControl(buttonPanel);

        const portraitBox = new GUI.Rectangle();
        portraitBox.width = "140px";
        portraitBox.height = "140px";
        portraitBox.top = "50%";
        portraitBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        portraitBox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        portraitBox.left = "20%";
        portraitBox.cornerRadius = 15;
        portraitBox.color = "white";
        portraitBox.thickness = 4;
        portraitBox.backgroundGradient = gradient;
        portraitBox.isVisible = false;
        advancedTexture.addControl(portraitBox);

        const portrait = new GUI.Image("portrait", "sprites/portrait.png");

        portrait.width = "128px";
        portrait.height = "128px";
        portrait.isVisible = true;
        // Découpage dans le spritesheet
        portrait.sourceWidth = 37;
        portrait.sourceHeight = 37;

        portrait.sourceLeft = 0;
        portrait.sourceTop = 0;
        portraitBox.addControl(portrait)


        key.left = "53%";
        key.top = "35%";
        key.height = "60px";
        key.width = "60px";
        key.alpha = 0.
        key.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        key.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(key);

        (advancedTexture.getContext() as CanvasRenderingContext2D).imageSmoothingEnabled = false;


        const tvscript: string[] = [];

        tvscript.push("Still the same add today also.")
        tvscript.push("...")
        tvscript.push("Did anyone even turn off the TV yesterday?")
        tvscript.push("Since there was only me and Raphaël in the office, I guess not.")
        tvscript.push("/")

        const counterscript: string[] = [];

        counterscript.push("Still no one today.")
        counterscript.push("It's a little unfortunate. The hostess is a really kind person.")
        counterscript.push("Even to the employees, she always says 'Welcome to Xain Corporate's business office! Are you here for a visit?'")
        counterscript.push("Persons like that are getting really rare nowadays.")
        counterscript.push("/")

        const podonescript: string[] = [];

        podonescript.push("RWQFSFASXC...")
        podonescript.push("It's kinda weird that I end up talking to a machine like that.")
        podonescript.push("But this is the last time we work together.")
        podonescript.push("Do not let me down now, understood?")
        podonescript.push("/")

        const podtwoscript: string[] = [];

        podtwoscript.push("So I will never get to know what this one was for.")
        podtwoscript.push("Such a waste of space and money. Our government could take some notes.")
        podtwoscript.push("/")

        const boxscript: string[] = [];

        boxscript.push("I wonder what this room will look like when it will be over.")
        boxscript.push("Will they be removing the boxes first or the pods?")
        boxscript.push("/")

        const screenscript: string[] = [];

        screenscript.push("Why is there a vintage TV? In what situation could it be usefull!?")
        screenscript.push("/")

        //sound effects
        const na_message = await CreateSoundAsync("na_message",
            "./sounds/SEQ_SE_DP_SELECT.wav"
        );

        na_message.volume = 0.3

        const elev_arrived = await CreateSoundAsync("elev_arrived",
            "./sounds/SEQ_SE_FLD_87.wav"
        );
        elev_arrived.volume = 0.4;
        const elev_open = await CreateSoundAsync("elev_open",
            "./sounds/SEQ_SE_FLD_134.wav"
        );
        elev_open.volume = 0.4;
        const elev_move = await CreateSoundAsync("elev_open",
            "./sounds/SEQ_SE_FLD_29.wav"
        );
        elev_move.volume = 0.4;

        this.engine.hideLoadingUI();


        const lightAnim = new Animation(
            "fadelight",
            "intensity",
            60, // FPS
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )

        const lightkeys = [
            { frame: 0, value: 0 },   // Start fully opaque
            { frame: 120, value: 0.7 }  // End fully transparent
        ];
        lightAnim.setKeys(lightkeys);
        light.animations.push(lightAnim);


        setTimeout(() => {
            this.scene.beginAnimation(light, 0, 120, false, undefined, () => {
                this.canMove = true;
                this.fadeVolumeIn(music, 0.1)
            })
        }, 500)


        setTimeout(() => {
            this.scene.actionManager.registerAction(
                new ExecuteCodeAction(ActionManager.OnKeyDownTrigger,
                    (event) => {
                        let key = event.sourceEvent.key;
                        if (key !== "Shift") {
                            key = key.toLowerCase();
                        }
                        if (key in eventKeyStatus) {
                            eventKeyStatus[key as keyof typeof eventKeyStatus] = true;
                        }
                    }
                )
            );

            this.scene.actionManager.registerAction(
                new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,
                    (event) => {
                        let key = event.sourceEvent.key;
                        if (key !== "Shift") {
                            key = key.toLowerCase();
                        }
                        if (key in eventKeyStatus) {
                            eventKeyStatus[key as keyof typeof eventKeyStatus] = false;
                        }
                    }
                )
            );
        }, 1000)

        setTimeout(() => {
            this.scene.registerBeforeRender(() => {
                if (triggerTransition.intersectsMesh(this.Player)) { /*music.stop(); this.switchToTransitionCutsceneCirno();*/
                    key.alpha = Math.min(1, key.alpha + 0.05);
                    if (eventKeyStatus.e && this.canMove) {
                        this.canMove = false;
                        this.fadeVolumeOut(music);
                        na_message.play();
                        this.scene.beginAnimation(light, 50, 0, false, undefined, () => {
                            setTimeout(() => {
                                this.nextScene();
                            }, 500)
                        })
                    }
                }


                else if (triggerElUp.intersectsMesh(this.Player)) { /*music.stop(); this.switchToTransitionCutsceneCirno();*/
                    key.alpha = Math.min(1, key.alpha + 0.05);
                    if (eventKeyStatus.e && this.canMove) {
                        elev_arrived.play()
                        this.canMove = false;
                        this.scene.beginAnimation(light, 120, 0, false, undefined, () => {
                            elev_open.play();
                            setTimeout(() => { elev_move.play() }, 500)
                            light.intensity = 0.;
                            this.Player.position._y = 10;
                            this.Player.position._z = -21;
                            this.Player.position._x = 2;
                            this.Player.moveWithCollisions(this.Player.right.scaleInPlace(0.01));
                            this.Player.moveWithCollisions(this.Player.right.scaleInPlace(-0.01));
                            setTimeout(() => {
                                this.fadeVolumeLow(music, 0.02);
                                elev_arrived.play();
                                setTimeout(() => {
                                    elev_open.play();
                                    this.scene.beginAnimation(light, 0, 50, false, undefined, () => {
                                        this.canMove = true;
                                    })
                                }, 1000)
                            }, 2500)
                        })
                    }
                }
                else if (triggerElDown.intersectsMesh(this.Player)) {
                    key.alpha = Math.min(1, key.alpha + 0.05);
                    if (eventKeyStatus.e && this.canMove) {
                        elev_arrived.play()
                        this.canMove = false;
                        this.scene.beginAnimation(light, 50, 0, false, undefined, () => {
                            elev_open.play();
                            setTimeout(() => { elev_move.play() }, 500)
                            this.fadeVolumeIn(music, 0.1);
                            light.intensity = 0.;
                            this.Player.position._y = 0;
                            this.Player.position._z = -2.2;
                            this.Player.position._x = 2;
                            this.Player.moveWithCollisions(this.Player.right.scaleInPlace(0.01));
                            this.Player.moveWithCollisions(this.Player.right.scaleInPlace(-0.01));
                            setTimeout(() => {
                                elev_arrived.play();
                                setTimeout(() => {
                                    elev_open.play();
                                    this.scene.beginAnimation(light, 0, 120, false, undefined, () => {
                                        this.canMove = true;
                                    })
                                }, 1000)
                            }, 2500)
                        })
                    }
                }

                /*Dialog events*/
                else if (triggertv.intersectsMesh(this.Player)) {
                    key.alpha = Math.min(1, key.alpha + 0.05);
                    if (eventKeyStatus.e) {
                        if (this.canSkip) {
                            portraitBox.isVisible = true;
                            dialogBox.isVisible = true;
                            this.canSkip = false;
                            this.canMove = false;
                            this.naratorWriter(dialogBox, portraitBox, portrait, message, tvscript[this.paragraph], 0, na_message);
                        }
                    }
                }
                else if (triggercounter.intersectsMesh(this.Player)) {
                    key.alpha = Math.min(1, key.alpha + 0.05);
                    if (eventKeyStatus.e) {
                        if (this.canSkip) {
                            portraitBox.isVisible = true;
                            dialogBox.isVisible = true;
                            this.canSkip = false;
                            this.canMove = false;
                            this.naratorWriter(dialogBox, portraitBox, portrait, message, counterscript[this.paragraph], 0, na_message);
                        }
                    }
                }
                else if (triggerFirstPod.intersectsMesh(this.Player)) {
                    key.alpha = Math.min(1, key.alpha + 0.05);
                    if (eventKeyStatus.e) {
                        if (this.canSkip) {
                            portraitBox.isVisible = true;
                            dialogBox.isVisible = true;
                            this.canSkip = false;
                            this.canMove = false;
                            this.naratorWriter(dialogBox, portraitBox, portrait, message, podonescript[this.paragraph], 0, na_message);
                        }
                    }
                }
                else if (triggerSecondPod.intersectsMesh(this.Player)) {
                    key.alpha = Math.min(1, key.alpha + 0.05);
                    if (eventKeyStatus.e) {
                        if (this.canSkip) {
                            portraitBox.isVisible = true;
                            dialogBox.isVisible = true;
                            this.canSkip = false;
                            this.canMove = false;
                            this.naratorWriter(dialogBox, portraitBox, portrait, message, podtwoscript[this.paragraph], 0, na_message);
                        }
                    }
                }
                else if (triggerBoxes.intersectsMesh(this.Player)) {
                    key.alpha = Math.min(1, key.alpha + 0.05);
                    if (eventKeyStatus.e) {
                        if (this.canSkip) {
                            portraitBox.isVisible = true;
                            dialogBox.isVisible = true;
                            this.canSkip = false;
                            this.canMove = false;
                            this.naratorWriter(dialogBox, portraitBox, portrait, message, boxscript[this.paragraph], 0, na_message);
                        }
                    }
                }
                else if (triggerScreens.intersectsMesh(this.Player)) {
                    key.alpha = Math.min(1, key.alpha + 0.05);
                    if (eventKeyStatus.e) {
                        if (this.canSkip) {
                            portraitBox.isVisible = true;
                            dialogBox.isVisible = true;
                            this.canSkip = false;
                            this.canMove = false;
                            this.naratorWriter(dialogBox, portraitBox, portrait, message, screenscript[this.paragraph], 0, na_message);
                        }
                    }
                }
                else {
                    key.alpha = Math.max(0, key.alpha - 0.05);
                }

            });
        }, 2000);


        //blocks for collisions 
        const wall1 = MeshBuilder.CreateBox("wall1");
        wall1.position = new Vector3(6.1, 0, 0);
        wall1.scaling = new Vector3(0.1, 2, 8);
        wall1.checkCollisions = true;
        wall1.isVisible = false;

        const wall2 = MeshBuilder.CreateBox("wall2");
        wall2.position = new Vector3(-2.1, 0, 0);
        wall2.scaling = new Vector3(0.1, 2, 8);
        wall2.checkCollisions = true;
        wall2.isVisible = false;

        const wall3 = MeshBuilder.CreateBox("wall3");
        wall3.position = new Vector3(2, 0, 4.1);
        wall3.scaling = new Vector3(8, 2, 0.1);
        wall3.checkCollisions = true;
        wall3.isVisible = false;

        const wall4 = MeshBuilder.CreateBox("wall4");
        wall4.position = new Vector3(2, 0, -3.1);
        wall4.scaling = new Vector3(8, 2, 0.1);
        wall4.checkCollisions = true;
        wall4.isVisible = false;


        const obs1 = MeshBuilder.CreateBox("obs1");
        obs1.position = new Vector3(4.25, 0, -2.3);
        obs1.scaling = new Vector3(1.5, 1, 1.5);
        obs1.checkCollisions = true;
        obs1.isVisible = false;

        const obs2 = MeshBuilder.CreateBox("obs2");
        obs2.position = new Vector3(4.5, 0, 0.55);
        obs2.scaling = new Vector3(0.3, 1, 0.3);
        obs2.checkCollisions = true;
        obs2.isVisible = false;

        const obs3 = MeshBuilder.CreateBox("obs3");
        obs3.position = new Vector3(0.5, 0, 2.9);
        obs3.scaling = new Vector3(0.3, 1, 0.3);
        obs3.checkCollisions = true;
        obs3.isVisible = false;

        const obs4 = MeshBuilder.CreateBox("obs4");
        obs4.position = new Vector3(-1.4, 0, 2.9);
        obs4.scaling = new Vector3(0.3, 1, 0.3);
        obs4.checkCollisions = true;
        obs4.isVisible = false;

        const obs5 = MeshBuilder.CreateBox("obs5");
        obs5.position = new Vector3(-0.5, 0, 2.9);
        obs5.scaling = new Vector3(0.3, 1, 0.3);
        obs5.checkCollisions = true;
        obs5.isVisible = false;

        const obs6 = MeshBuilder.CreateBox("obs6");
        obs6.position = new Vector3(-0.5, 0, -2.6);
        obs6.scaling = new Vector3(0.8, 1, 0.3);
        obs6.checkCollisions = true;
        obs6.isVisible = false;

        const obs7 = MeshBuilder.CreateBox("obs7");
        obs7.position = new Vector3(-0.5, 0, -1.);
        obs7.scaling = new Vector3(0.8, 1, 0.3);
        obs7.checkCollisions = true;
        obs7.isVisible = false;

        const obs8 = MeshBuilder.CreateBox("obs8");
        obs8.position = new Vector3(-0.8, 0, 0);
        obs8.scaling = new Vector3(1.3, 1, 1.);
        obs8.checkCollisions = true;
        obs8.isVisible = false;

        //room blocks
        const wall5 = MeshBuilder.CreateBox("wall5");
        wall5.position = new Vector3(6.1, 10, -18);
        wall5.scaling = new Vector3(0.1, 2, 8);
        wall5.checkCollisions = true;
        wall5.isVisible = false;

        const wall6 = MeshBuilder.CreateBox("wall6");
        wall6.position = new Vector3(-2.1, 10, -18);
        wall6.scaling = new Vector3(0.1, 2, 8);
        wall6.checkCollisions = true;
        wall6.isVisible = false;

        const wall7 = MeshBuilder.CreateBox("wall7");
        wall7.position = new Vector3(2, 10, -22.1);
        wall7.scaling = new Vector3(8, 2, 0.1);
        wall7.checkCollisions = true;
        wall7.isVisible = false;

        const wall8 = MeshBuilder.CreateBox("wall8");
        wall8.position = new Vector3(2, 10, -13.5);
        wall8.scaling = new Vector3(8, 2, 0.1);
        wall8.checkCollisions = true;
        wall8.isVisible = false;

        const obs9 = MeshBuilder.CreateBox("obs9");
        obs9.position = new Vector3(-1, 10, -15.);
        obs9.scaling = new Vector3(2, 1, 2.);
        obs9.checkCollisions = true;
        obs9.isVisible = false;

        const obs10 = MeshBuilder.CreateBox("obs10");
        obs10.position = new Vector3(-1.7, 10, -18.);
        obs10.scaling = new Vector3(1.5, 1, 3);
        obs10.checkCollisions = true;
        obs10.isVisible = false;

        const obs11 = MeshBuilder.CreateBox("obs11");
        obs11.position = new Vector3(5, 10, -14.7);
        obs11.scaling = new Vector3(2, 1, 1.5);
        obs11.checkCollisions = true;
        obs11.isVisible = false;

        const obs12 = MeshBuilder.CreateBox("obs12");
        obs12.position = new Vector3(4.6, 10, -20.5);
        obs12.scaling = new Vector3(2, 1, 2);
        obs12.checkCollisions = true;
        obs12.isVisible = false;

        const obs13 = MeshBuilder.CreateBox("obs13");
        obs13.position = new Vector3(-0.6, 10, -18.3);
        obs13.scaling = new Vector3(0.4, 1, 0.4);
        obs13.checkCollisions = true;
        obs13.isVisible = false;
    }

    CreateSkybox(): void {
        const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
        const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;
        skyboxMaterial.disableLighting = true;
        /*skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skybox.renderingGroupId = 0;*/
    }

    /*switchToTransitionCutsceneCirno() {
        const next = new TransitionCutsceneCirno(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        this.scene = next.scene;
    }*/


    //writing dialog from the narator

    canSkip = true;
    paragraph = 0;

    async naratorWriter(block: GUI.Rectangle, portraitBox: GUI.Rectangle, portrait: GUI.Image, narator: GUI.TextBlock, script: string, index: number, na: StaticSound): Promise<void> {
        this.canSkip = false;
        if (script.startsWith("/")) {
            this.paragraph = 0;
            block.isVisible = false;
            portraitBox.isVisible = false;
            portrait.sourceLeft = 0;
            portrait.sourceTop = 0;
            this.canMove = true;
            setTimeout(() => { this.canSkip = true; }, 500);
            return;
        }
        if (index == 0) { narator.text = ""; na.play(); }
        if (index <= script.length) {
            if (script.startsWith("Did anyone") || script.startsWith("Will they") || script.startsWith("Why is")) { portrait.sourceLeft = 74; portrait.sourceTop = 0 }
            if (script.startsWith("I tried")) { portrait.sourceLeft = 74; portrait.sourceTop = 74 }
            narator.text += script.charAt(index);
            setTimeout(() => { this.naratorWriter(block, portraitBox, portrait, narator, script, ++index, na) }, 30);
        }
        else {
            this.paragraph++;
            setTimeout(() => { this.canSkip = true; }, 100)
        }
    }

    async fadeVolumeIn(music: StaticSound, target: number): Promise<void> {
        const height = music.volume;
        if (height <= target) {
            music.setVolume(height + 0.01);
            setTimeout(() => { this.fadeVolumeIn(music, target) }, 30);
        }
    }
    
    async fadeVolumeLow(music: StaticSound, target:number): Promise<void> {
        const height = music.volume;
        if(height >= target) {
            music.setVolume(height-0.01);
            setTimeout(() => { this.fadeVolumeLow(music, target) }, 30);
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

    nextScene() {
        const next = new CH2_CU_OW_2(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        this.scene = next.scene;
    }
}