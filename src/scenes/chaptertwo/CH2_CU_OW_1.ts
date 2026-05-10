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
    FreeCamera,
    Texture,
    Color3,
    CubeTexture,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as GUI from '@babylonjs/gui'

import { CH2_GM_OW } from "./CH2_GM_OW";


export class CH2_CU_OW_1 {
    scene: Scene;
    engine: Engine;
    Player!: AbstractMesh;
    camera!: ArcRotateCamera;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, false);
        this.scene = this.CreateScene();
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


        this.CreateMap();

        this.createPlayer();

        this.CreateDialog();

        return scene;

    }

    async createPlayer(): Promise<void> {
        const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "mainCharacter_game.glb"
        );
        this.Player = meshes[0];
        this.Player.position = new Vector3(3, 0, -3);
        this.Player.rotate(Vector3.Up(), Math.PI);
        this.Player.scaling = new Vector3(1.3, 1.3, 1.3);
        console.log("meshes", meshes);
        console.log("animations", animationGroups);

        for (let i = 0; i < animationGroups.length; i++) {
            animationGroups[i].goToFrame(1);
            animationGroups[i].stop();
        }
    }

    async CreateMap(): Promise<void> {
        const bus = await SceneLoader.ImportMeshAsync("", "./models/", "bus.glb");

        const building = await SceneLoader.ImportMeshAsync("", "./models/", "building.glb");
        building.meshes[0].position = new Vector3(50, 50, 0);

        /*
        const music = await CreateSoundAsync("music",
            "audio/02.RescueTeamBase.mp3",
            {
                volume: 0.15,
                loop: true
            }
        );
        music.play();*/

        //camera block

        this.engine.hideLoadingUI();
    }

    async CreateDialog(): Promise<void> {

        const sideCamera = new FreeCamera("SideCamera", new Vector3(-14, 3, -3), this.scene);
        sideCamera.rotation = new Vector3(0, Math.PI / 2, 0);
        // Make camera look toward -Z (scene) so it doesn't look into empty space

        const cameraBlock = MeshBuilder.CreateBox("block1");
        cameraBlock.scaling = new Vector3(0.1, 40, 40);
        cameraBlock.position = new Vector3(-10, 0, 0)
        const mat = new StandardMaterial("m");
        mat.alpha = 1.;
        mat.diffuseColor = new Color3(0, 0, 0);
        cameraBlock.material = mat;

        const cameraBlock2 = MeshBuilder.CreateBox("block2");
        cameraBlock2.scaling = new Vector3(0.01, 20, 20);
        cameraBlock2.position = new Vector3(45.3, 52, -1)
        cameraBlock2.material = mat;

        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
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
        title.fontSize = 24;
        panel.addControl(title);

        // Message
        const message = new GUI.TextBlock();
        const script: string[] = [];
        const speakers: string[] = [];

        const speakerStatus: { [key: string]: string } = { "Helia": "brown", "Raphaël": "rgb(158, 116, 45)" };

        script.push("Let me SLEEP! You stupid clock!")
        script.push("Urgh... so annoying...")
        script.push("...")
        script.push("Well, now that I'm out of the bed, I better get going.")
        script.push("I have a lot on my list today.")
        script.push("!When I first witnessed the potential of AIs...")
        script.push("!I was completely amazed.")
        script.push("!I was younger, so I didn't understand how it worked.")
        script.push("!But it felt like magic at the time.")
        script.push("!Then it came to me.")
        script.push("!An idea everyone could have when they think of AI...")
        script.push("!But it made me wonder and dream nights and days.")
        script.push("!'What if an AI could talk like humans?'")
        script.push("!With time, this interrogation became...")
        script.push("!'Can an AI have emotions?'")
        script.push("!'Feelings? Self-awareness? Consciousness? Unconsciousness? Dreams?'")
        script.push("!I craved to meet an AI like that.")
        script.push("!Get to know it, learn what it likes, share my time with it.")
        script.push("!This is what made me learn and work towards becoming an engineer.")
        script.push("!I felt so happy when Raphaël proposed me to work on what I wanted.")
        script.push("!Even if his intentions were not the same as me, It didn't matter.")
        script.push("!I finally got the chance to work for my dream.")
        script.push("!What was I thinking?")
        script.push("!I feel dumb now for thinking that this idea was something else than a dream.")
        script.push("!Some may think AIs will be just like us in the future.")
        script.push("!But for anyone who knows a little of its topic...")
        script.push("!'An AI with emotions'...")
        script.push("!Is the dumbest thing ever.")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "Helia";
        title.text = s;
        title.color = speakerStatus[s];

        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")

        message.fontSize = 27;
        message.height = "70px";
        message.color = "white";
        message.textWrapping = true;
        message.left = 150;
        message.paddingRight = 250;
        message.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(message);


        const narator = new GUI.TextBlock();

        narator.fontSize = 27;
        narator.height = "70px";
        narator.color = "white";
        narator.textWrapping = true;
        narator.paddingBottom = 400;
        //narator.paddingRight = 250;
        //narator.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        narator.fontFamily = "Andale Mono, monospace";
        narator.text = ""
        narator.isVisible = true;
        advancedTexture.addControl(narator);

        const date = new GUI.TextBlock();

        date.fontSize = 27;
        date.height = "70px";
        date.color = "rgb(76, 207, 15)";
        date.textWrapping = true;
        date.paddingBottom = 200;
        date.fontFamily = "Courier";
        date.text = "May 16th, 2027"
        date.isVisible = true;
        date.alpha = 0.;
        advancedTexture.addControl(date);


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

        portrait.sourceLeft = 37;
        portrait.sourceTop = 0;
        portraitBox.addControl(portrait);

        (advancedTexture.getContext() as CanvasRenderingContext2D).imageSmoothingEnabled = false;

        const audioEngine = await CreateAudioEngineAsync();

        const se_message = await CreateSoundAsync("se_message",
            "./sounds/SEQ_SE_DP_SELECT.wav"
        );
        se_message.volume = 0.2

        const na_message = await CreateSoundAsync("na_message",
            "./sounds/SE_Sys_MESS_POKE.wav"
        );

        na_message.volume = 0.3

        const bus = await CreateSoundAsync("bus",
            "./sounds/bus_noise.mp3"
        );
        bus.volume = 0.3;
        bus.loop = true;

        const alarm = await CreateSoundAsync("alarm",
            "./sounds/alarm-clock.mp3"
        );
        alarm.volume = 0.3
        alarm.loop = false;

        const alarmbreak = await CreateSoundAsync("alarm",
            "./sounds/alarm-break.mp3"
        );
        alarmbreak.volume = 0.5
        alarmbreak.loop = false;

        const houseDoor = await CreateSoundAsync("houseDoor",
            "./sounds/Seq_SE_FLD_20.wav"
        );
        houseDoor.volume = 0.3
        houseDoor.loop = false;

        // Wait until audio engine is ready to play sounds.
        await audioEngine.unlockAsync();

        const chapter = new GUI.TextBlock();
        chapter.fontFamily = "Segoe UI"
        chapter.fontSize = "27px";
        chapter.color = "white";
        chapter.top = "200px";
        chapter.textWrapping = true;
        chapter.text = "Chapter Two";
        chapter.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(chapter);
        chapter.alpha = 0;

        const description = new GUI.TextBlock();
        description.fontFamily = "Segoe UI"
        description.fontSize = "29px";
        description.color = "white";
        description.top = "240px";
        description.textWrapping = true;
        description.text = "What  I  Must  do...";
        description.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(description);
        description.alpha = 0;

        const paragraph = new GUI.TextBlock();
        paragraph.fontFamily = "Segoe UI"
        paragraph.fontSize = "24px";
        paragraph.color = "gray";
        paragraph.top = "280px";
        paragraph.textWrapping = true;
        paragraph.paddingRight = 600;
        paragraph.paddingLeft = 600;
        paragraph.text = "A track leading to the sunset gave away under my feet. Individuals are heavier when they go by pair?";
        paragraph.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        paragraph.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(paragraph);
        paragraph.alpha = 0;


        const light = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this.scene);
        light.intensity = 1.;

        const blockAnim = new Animation(
            "fadealpha",
            "material.alpha",
            60, // FPS
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )

        const blockkeys = [
            { frame: 0, value: 1 },
            { frame: 120, value: 0 }
        ];
        blockAnim.setKeys(blockkeys);
        cameraBlock.animations.push(blockAnim);

        const dateAnim = new Animation(
            "fadealpha",
            "alpha",
            60, // FPS
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )

        cameraBlock2.animations.push(blockAnim);

        dateAnim.setKeys(blockkeys);
        date.animations = []
        date.animations.push(dateAnim);
        const animation = new Animation(
            "fadeInalpha",
            "alpha",
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0, value: 0 }, // noir
            { frame: 180, value: 1 } // normal
        ];

        animation.setKeys(keys);

        chapter.animations = [animation];
        description.animations = [animation];
        paragraph.animations = [animation];

        const keyStatus: { [key: string]: boolean } = { e: false };

        this.scene.actionManager = new ActionManager(this.scene);

        this.scene.actionManager.registerAction(new ExecuteCodeAction
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
        this.scene.actionManager.registerAction(new ExecuteCodeAction
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


        setTimeout(() => {
            this.scene.beginAnimation(date, 120, 0, false, undefined, () => {
                setTimeout(() => {
                    this.scene.beginAnimation(date, 0, 120, false, undefined, () => {
                        alarm.play();
                        setTimeout(() => {
                            alarmbreak.play();
                            alarm.stop();
                            setTimeout(() => {
                                dialogBox.isVisible = true;
                                portraitBox.isVisible = true;
                                se_message.play();
                                narator.isVisible = false;
                                this.typeWriter(message, script[script_index], 0);
                            }, 2000)
                        }, 3700)
                    })
                }, 3000)
            })
        }, 500)


        this.scene.onBeforeRenderObservable.add(() => {
            if (keyStatus["e"]) {
                console.log("User pressed Enter");
                if (this.canSkip) {
                    this.canSkip = false;
                    script_index++;
                    message.text = "";
                    narator.text = "";

                    if (script[script_index].startsWith("/")) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            //switching to the next scene
                            this.nextScene();
                        }, 3000)
                    }

                    else if (script_index == 5) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        houseDoor.play();
                        setTimeout(() => {
                            this.scene.beginAnimation(chapter, 0, 180, false, undefined)
                            setTimeout(() => {
                                this.scene.beginAnimation(description, 0, 180, false, undefined)
                            }, 2000)
                            setTimeout(() => {
                                this.scene.beginAnimation(paragraph, 0, 180, false, undefined, () => {
                                    setTimeout(() => {
                                        this.scene.beginAnimation(chapter, 180, 0, false, undefined, () => { chapter.alpha = 0 })
                                        this.scene.beginAnimation(description, 180, 0, false, undefined, () => { description.alpha = 0 })
                                        this.scene.beginAnimation(paragraph, 180, 0, false, undefined, () => { paragraph.alpha = 0 })
                                        bus.play();
                                        setTimeout(() => {
                                            this.scene.beginAnimation(cameraBlock, 0, 120, false, undefined, () => {
                                                setTimeout(() => {
                                                    narator.isVisible = true;
                                                    narator.color = "rgb(211, 121, 121)";
                                                    this.naratorWriter(narator, script[script_index], 1, na_message);
                                                }, 3000);
                                            })
                                        }, 2000)
                                    }, 4000)
                                });
                            }, 4000)
                        }, 500);
                    }


                    else if (script_index == 9 || script_index == 12 || script_index == 16 || script_index == 19) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 3000)
                    }


                    else if (script_index == 22) {
                        narator.isVisible = false;
                        narator.color = "red";
                        setTimeout(() => {
                            narator.isVisible = true;
                            bus.stop();
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 4000)
                    }

                    else if (script_index == 23) {
                        narator.isVisible = false;
                        narator.color = "white";
                        setTimeout(() => {
                            this.scene.beginAnimation(cameraBlock, 120, 0, false, undefined, () => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            })
                        }, 2000)
                    }

                    else if (script_index == 27) {
                        narator.isVisible = false;
                        narator.color = "red";
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 3000);
                    }


                    else {
                        if (script_index == 1) {
                            portrait.sourceLeft = 74;
                            portrait.sourceTop = 0;
                        }

                        if (script_index == 3) {
                            portrait.sourceLeft = 37;
                            portrait.sourceTop = 74;
                        }

                        if (script_index == 4) {
                            portrait.sourceLeft = 0;
                            portrait.sourceTop = 0;
                        }

                        if (script_index == 20) {
                            portrait.sourceLeft = 74;
                            portrait.sourceTop = 74;
                        }

                        if (script_index == 22) {
                            portrait.sourceLeft = 74;
                            portrait.sourceTop = 0;
                        }

                        /*
                        if (script_index == 10) {
                            sideCamera.position = new Vector3(3, 12.5, -17.2)
                            sideCamera.rotation = new Vector3(Math.PI/6, 4*Math.PI/5, 0)
                        }*/



                        if (script[script_index].startsWith("!")) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }
                        else {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            narator.isVisible = false;
                            this.typeWriter(message, script[script_index], 0);
                        }

                        portrait.alpha = (speakers[speaker_index] == "Helia") ? 1 : 0.5;
                    }
                }
            }

        })
    }

    CreateSkybox(): void {
        const skybox = MeshBuilder.CreateBox("skyBox", { size: 100.0 }, this.scene);
        const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skybox.renderingGroupId = 0;
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

    canSkip = false;
    paragraph = 0;


    async typeWriter(message: GUI.TextBlock, script: string, line_index: number): Promise<void> {
        if (line_index <= script.length) {
            message.text += script.charAt(line_index);
            setTimeout(() => { this.typeWriter(message, script, ++line_index) }, 20);
        }
        else {
            setTimeout(() => { this.canSkip = true; }, 100)
        }
    }

    async naratorWriter(narator: GUI.TextBlock, script: string, index: number, na: StaticSound): Promise<void> {
        if (index <= script.length) {
            narator.text += script.charAt(index);
            na.play();
            setTimeout(() => { this.naratorWriter(narator, script, ++index, na) }, 30);
        }
        else {
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
        const next = new CH2_GM_OW(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        this.scene = next.scene;
    }
}
