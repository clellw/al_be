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
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as GUI from '@babylonjs/gui'

import { CH1_CU_UN_1 } from "./CH1_CU_UN_1";


export class CH1_CU_OW_3 {
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
        this.Player.position = new Vector3(4, 10, -19);
        this.Player.scaling = new Vector3(0.23, 0.23, 0.23);
        this.Player.rotate(Vector3.Up(), Math.PI / 2);
        console.log("meshes", meshes);
        console.log("animations", animationGroups);

        for (let i = 0; i < animationGroups.length; i++) {
            animationGroups[i].goToFrame(1);
            animationGroups[i].stop();
        }
    }

    async CreateMap(): Promise<void> {
        const map = await SceneLoader.ImportMeshAsync("", "./models/", "office_gameplay.glb");
        map.meshes.forEach((mesh) => {
            // Enable collisions for each imported mesh
            mesh.checkCollisions = false;
        });

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

        const sideCamera = new FreeCamera("SideCamera", new Vector3(6, 10.7, -17), this.scene);
        sideCamera.rotation = new Vector3(0, -3 * Math.PI / 4, 0);
        // Make camera look toward -Z (scene) so it doesn't look into empty space

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

        script.push("*Yaaaaaaaawn*")
        script.push("Welcome back! How did it went?")
        script.push("You saw what I saw. Still no progress.")
        script.push("Still unlucky, but tomorrow will be more promissing. Don't you agree?")
        script.push("(And 316. I'm tired of hearing that same exact sentence every day.)")
        script.push("(And I'm bored to notice that number go up every time.)")
        script.push("!A little more than a year, And we barely see any progress.")
        script.push("!Raphaël has to be the biggest optimist of today to keep saying this.")
        script.push("!It would be frustrating to call it quit after so long...")
        script.push("!But it would only be fair to just give up at some point.")
        script.push("!S1-F3 is our latest program, and she has lasted three whole months.")
        script.push("!For each model before, we kept working them for less than a month.")
        script.push("!Raphaël surely wants S1-F3 to be the final attempt, pushing it to the limit.")
        script.push("Do you want to go eat something after I finish?")
        script.push("Sorry, I want to go to bed *early* tonight.")
        script.push("I know you finish your work every new moon.")
        script.push("I will try not to take it personally.")
        script.push("I will go home now. see you tomorrow.")
        script.push("!We have been going on for far to long.")
        script.push("!If S1-F3 is going to be the last one, I don't see how it can succeed.")
        script.push("!I will not waste anymore time in here.")
        script.push("!This job has been a waste of time from the very beginning.")
        script.push("!If Raphaël is not going to put a stop to this...")
        script.push("!Then I will end it myself.")
        script.push("...")
        script.push("Yes, I understand.")
        script.push("We will try all we can to make progress.")
        script.push("...Yes.")
        script.push("Thank you.")
        script.push("...")
        script.push("Time's ticking louder more than ever.")
        script.push("If it goes on like this, the results will remain the same...")
        script.push("And we will lose everything we set our mind to.")
        script.push("What can I do?")
        script.push("Is there even a solution I can...")
        script.push("Wait...")
        script.push("Maybe...")
        script.push("All the different Learning models find their performance from their training.")
        script.push("If I can make it learn on a big amount of data in no time...")
        script.push("...")
        script.push("That has to work.")
        script.push("We will meet each other very soon.")
        script.push("Flusselle.")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "Helia";
        title.text = s;
        title.color = speakerStatus[s];

        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")

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
        portrait.alpha = 1;
        // Découpage dans le spritesheet
        portrait.sourceWidth = 37;
        portrait.sourceHeight = 37;

        portrait.sourceLeft = 74;
        portrait.sourceTop = 74;
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

        const elev_arrived = await CreateSoundAsync("elev_arrived",
            "./sounds/SEQ_SE_FLD_87.wav"
        );
        elev_arrived.volume = 0.4;
        const elev_open = await CreateSoundAsync("elev_open",
            "./sounds/SEQ_SE_FLD_134.wav"
        );
        elev_open.volume = 0.4;
        // Wait until audio engine is ready to play sounds.
        await audioEngine.unlockAsync();


        const light = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.;

        const lightAnim = new Animation(
            "fadelight",
            "intensity",
            60, // FPS
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )

        const lightkeys = [
            { frame: 0, value: 0 },   // Start fully opaque
            { frame: 480, value: 0.7 }  // End fully transparent
        ];
        lightAnim.setKeys(lightkeys);
        light.animations.push(lightAnim);
        const endTitle = new GUI.TextBlock();
        
                endTitle.fontSize = 35;
                endTitle.alpha = 0;
                endTitle.fontSize = "27px";
                endTitle.color = "white";
                endTitle.top = "300px";
                endTitle.textWrapping = true;
                endTitle.text = "End of Chapter One";
                endTitle.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                advancedTexture.addControl(endTitle);
        
                const animation = new Animation(
                    "fadeInalpha",
                    "alpha",
                    60,
                    Animation.ANIMATIONTYPE_FLOAT,
                    Animation.ANIMATIONLOOPMODE_CONSTANT
                );
        
                const keys = [
                    { frame: 0, value: 0 }, // noir
                    { frame: 240, value: 1 } // normal
                ];
        
                animation.setKeys(keys);
        
                endTitle.animations = [animation];

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
            this.scene.beginAnimation(light, 0, 200, false, undefined, () => {
                dialogBox.isVisible = true;
                portraitBox.isVisible = true;
                se_message.play();
                narator.isVisible = false;
                this.typeWriter(message, script[script_index], 0);
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
                        setTimeout(() => {
                            this.scene.beginAnimation(endTitle, 0, 240, false, undefined, () => {
                                setTimeout(() => {
                                    this.scene.beginAnimation(endTitle, 240, 0, false, undefined, (() => {
                                        endTitle.alpha = 0;
                                        /*setTimeout(() => {
                                            this.nextScene();
                                        }, 2000)*/
                                    }))
                                }, 4000)
                            })
                        }, 500)
                    }


                    else if (script_index == 18) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 37;
                        portrait.sourceTop = 74;
                        this.scene.beginAnimation(light, 200, 0, false, undefined, () => {
                            setTimeout(() => {
                                elev_open.play();
                                setTimeout(() => {
                                    narator.isVisible = true;
                                    this.naratorWriter(narator, script[script_index], 1, na_message);

                                }, 2000)
                            }, 200)
                        });
                    }

                    else if (script_index == 20) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 1000)
                    }
                    
                    else if (script_index == 23) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 2000)
                    }
                    
                    else if (script_index == 24) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 5000)
                    }
                    
                    else if (script_index == 30) {
                        dialogBox.isVisible = false;
                        sideCamera.rotation = new Vector3(-Math.PI/18, -Math.PI/2, 0);
                        sideCamera.position = new Vector3(3, 10.5, -18.3)
                        this.Player.moveWithCollisions(this.Player.up.scaleInPlace(50));
                        this.scene.beginAnimation(light, 0, 100, false, undefined, () => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        })
                    }
                    
                    else if (script_index == 33) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        },1500);
                    }

                    else if (script_index == 35 || script_index == 37 || script_index == 39 || script_index == 42) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            se_message.play();
                            this.typeWriter(message, script[script_index], 0);
                        },1500);
                    }
                    
                    else if (script_index == 41) {
                        dialogBox.isVisible = false;
                        this.scene.beginAnimation(light, 100, 0, false, undefined, () => {
                            setTimeout(() => {
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            }, 500)
                        })
                    }

                    else {

                        if (script_index == 2) {
                            this.Player.rotate(Vector3.Up(), -4 * Math.PI / 9)
                            portrait.sourceLeft = 0;
                            portrait.sourceTop = 0;
                        }

                        if (script_index == 4) {
                            portrait.sourceLeft = 37;
                            portrait.sourceTop = 74;
                        }

                        if (script_index == 5) {
                            portrait.sourceLeft = 74;
                            portrait.sourceTop = 0;
                        }

                        if (script_index == 6) {
                            sideCamera.position = new Vector3(2, 17, -18.4)
                            sideCamera.rotation = new Vector3(Math.PI / 2, 0, Math.PI)
                        }

                        if (script_index == 12) {
                            sideCamera.position = new Vector3(1, 10.7, -16)
                            sideCamera.rotation = new Vector3(0, 6 * Math.PI / 5, 0)
                        }

                        if (script_index == 14) {
                            portrait.sourceLeft = 0;
                            portrait.sourceTop = 0;
                        }

                        if (script_index == 15) {
                            portrait.sourceLeft = 74;
                            portrait.sourceTop = 0;
                        }

                        if (script_index == 17) {
                            elev_arrived.play();
                            this.Player.rotate(Vector3.Up(), -5 * Math.PI / 9)
                            this.Player.position = new Vector3(2, 10, -21)
                            sideCamera.position = new Vector3(2, 10.7, -18)
                            sideCamera.rotation = new Vector3(0, Math.PI, 0)
                            portrait.sourceLeft = 0;
                            portrait.sourceTop = 0;
                        }

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
                            if(script_index<=20) portraitBox.isVisible = true;
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
        const next = new CH1_CU_UN_1(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        this.scene = next.scene;
    }
}
