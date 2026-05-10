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

import { CH4_GM_OW } from "./CH4_GM_OW";


export class CH4_CU_OW_1 {
    scene: Scene;
    engine: Engine;
    Player!: AbstractMesh;
    camera!: ArcRotateCamera;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, false);
        this.scene = this.CreateScene();


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


        this.CreateDialog();

        return scene;

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

        script.push("mmmmmh...")
        script.push("Yes?")
        script.push("Do you realise what time it i..?")
        script.push("...!")
        script.push("What!?")
        script.push("I will be right there.")
        script.push("Haan... haan...")
        script.push("(It's night time.)")
        script.push("(It's unlike me to run like that.)")
        script.push("(But I have to.)")
        script.push("(Flusselle is in danger.)")
        script.push("(I will not let her down this time.)")
        script.push("!Some time ago...")
        script.push("!I dreamed of creating an AI with emotions.")
        script.push("!Feelings, Self-awareness, Consciousness...")
        script.push("!Kindness.")
        script.push("!Compassion, empathy, preferences, consideration, melancholy.")
        script.push("!Concerns, doubts, regrets, sadness, frustration.")
        script.push("!Nostalgia, curiosity, habits, will, suffering.")
        script.push("!I wanted to meet someone like that.")
        script.push("!Now I have to play my part.")
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
        speakers.push("Helia")
        speakers.push("Helia")
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
        date.text = "May 15th, 2027"
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

        (advancedTexture.getContext() as CanvasRenderingContext2D).imageSmoothingEnabled = false;

        const portrait = new GUI.Image("portrait", "sprites/portrait.png");

        portrait.width = "128px";
        portrait.height = "128px";
        portrait.isVisible = true;
        // Découpage dans le spritesheet
        portrait.sourceWidth = 37;
        portrait.sourceHeight = 37;

        portrait.sourceLeft = 37;
        portrait.sourceTop = 74;
        portraitBox.addControl(portrait)

        const audioEngine = await CreateAudioEngineAsync();

        const se_message = await CreateSoundAsync("se_message",
            "./sounds/SEQ_SE_DP_SELECT.wav"
        );
        se_message.volume = 0.2

        const na_message = await CreateSoundAsync("na_message",
            "./sounds/SE_Sys_MESS_POKE.wav"
        );

        na_message.volume = 0.3

        const alarm = await CreateSoundAsync("alarm",
            "./sounds/phone-call.mp3"
        );
        alarm.volume = 0.3
        alarm.loop = false;

        const running = await CreateSoundAsync("running",
            "./sounds/running.mp3"
        );
        running.volume = 0.
        running.loop = false;

        const houseDoor = await CreateSoundAsync("houseDoor",
            "./sounds/Seq_SE_FLD_20.wav"
        );
        houseDoor.volume = 0.3
        houseDoor.loop = false;


        // Wait until audio engine is ready to play sounds.
        await audioEngine.unlockAsync();


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
            setTimeout(() => {
                alarm.play();
                setTimeout(() => {
                    dialogBox.isVisible = true;
                    portraitBox.isVisible = true;
                    se_message.play();
                    narator.isVisible = false;
                    this.typeWriter(message, script[script_index], 0);
                }, 9000)
            }, 4000)
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
                            //switching tothe next scene
                            this.nextScene();
                        }, 3000)
                    }

                    else if (script_index == 1) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 74;
                        portrait.sourceTop = 0;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 3) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 0;
                        portrait.sourceTop = 37;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 4) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 37;
                        portrait.sourceTop = 37;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000)
                    }

                    else if (script_index == 5) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceTop = 0;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 6) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        narator.isVisible = false;
                        portrait.sourceLeft = 74;
                        portrait.sourceTop = 37;
                        setTimeout(() => {
                            houseDoor.play();
                            setTimeout(() => {
                                running.play();
                                this.fadeVolumeIn(running, 1);
                            }, 5000)
                            setTimeout(() => {
                                se_message.play();
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                portraitBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            }, 11000)
                        }, 500)
                    }

                    else if (script_index == 7) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 9) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceTop = 0;
                        portrait.sourceLeft = 37;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 11) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 12) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 3000)
                    }

                    else if (script_index == 15) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 3000)
                    }

                    else if (script_index == 19) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 3000)
                    }

                    else if (script_index == 20) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 3000)
                    }


                    else {


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
        const next = new CH4_GM_OW(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        this.scene = next.scene;
    }
}
