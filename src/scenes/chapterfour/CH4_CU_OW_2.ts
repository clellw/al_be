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
    AbstractSpatialAudio,
    NormalizeRadians,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as GUI from '@babylonjs/gui'

import { CH4_CU_UN_1 } from "./CH4_CU_UN_1";


export class CH4_CU_OW_2 {
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
        this.Player.position = new Vector3(0, 10, -19.5);
        this.Player.scaling = new Vector3(0.23, 0.23, 0.23)
        this.Player.rotate(Vector3.Up(), Math.PI / 3);
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

        const vessel = await SceneLoader.ImportMeshAsync("", "./models/", "vessel_empty.glb");
        vessel.meshes.forEach((mesh) => {
            // Enable collisions for each imported mesh
            mesh.checkCollisions = false;
        });
        vessel.meshes[0].scaling = new Vector3(0.23, 0.23, 0.23);
        vessel.meshes[0].rotate(Vector3.Up(), Math.PI / 2);
        vessel.meshes[0].position = new Vector3(0, 9.88, -21.5);

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

        const sideCamera = new FreeCamera("SideCamera", new Vector3(2, 10.7, -16), this.scene);
        sideCamera.rotation = new Vector3(0, -8 * Math.PI / 10, 0)
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

        script.push("I'm here, what happened?")
        script.push("Nothing good.")
        script.push("The databases, clusters and servers of the entire office got corrupted by S1-F3.")
        script.push("I don't know how it's even possible.")
        script.push("I cannot even trace were the program is!")
        script.push("Like it's travelling from one part of the folders to another to destroy everything!")
        script.push("Is there a way to stop her?")
        script.push("The commands are not responding at all.")
        script.push("No, it's like the commands are not even trying to control her.")
        script.push("And to top it all of, the most corrupted files are the previous models we worked on.")
        script.push("They are the first things it attacked.")
        script.push("We have one solution.")
        script.push("Go to the control room and shut down the whole building's power.")
        script.push("This will prevent it from doing anything.")
        script.push("Will we be able to retrieve Flusselle afterward?")
        script.push("S1-F3 is a complete menace right now.")
        script.push("Even if we save the program, nothing will prevent it from crashing out again.")
        script.push("And if we don't act, it could get even worse than during the heavy training.")
        script.push("We may have to give up on it completely.")
        script.push("I'm sorry, Heli-")
        script.push("No, don't be sorry.")
        script.push("I will go see her.")
        script.push("WHAT!?")
        script.push("My decision is taken. Prepare my dive.")
        script.push("You don't understand! It's complete chaos in there!")
        script.push("The whole simulation is messed up! All its files are in the claws of S1-F3!")
        script.push("I don't have any control on it anymore!")
        script.push("You may not even be able to dive in, or even get back safely!")
        script.push("It's okay.")
        script.push("This is a risk I am willing to take.")
        script.push("I don't want Flusselle to suffer.")
        script.push("I will need your help with this.")
        script.push("If we don't save her, it's all our work that will be for nothing.")
        script.push("We will lose everything, our jobs included.")
        script.push("No, I don't care if I get unemployed.")
        script.push("I want Flusselle to be safe.")
        script.push("Didn't you want to finally meet her after all our failures?")
        script.push("I will try to get the simulation to a stable state.")
        script.push("Thank you.")
        script.push("But once inside, you will have little room for error.")
        script.push("I want you to get back.")
        script.push("Don't worry. I do not intend to get stuck there.")
        script.push("!I will not fail.")
        script.push("Ready?")
        script.push("Ready.")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "Helia";
        title.text = s;
        title.color = speakerStatus[s];

        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
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

        portrait.sourceLeft = 0;
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

        const typing = await CreateSoundAsync("typing",
            "./sounds/typing.mp3"
        );

        typing.volume = 0.5

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
            { frame: 100, value: 0.2 }  // End fully transparent
        ];
        lightAnim.setKeys(lightkeys);
        light.animations.push(lightAnim);

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
                dialogBox.isVisible = true;
                portraitBox.isVisible = true;
                se_message.play();
                narator.isVisible = false;
                this.typeWriter(message, script[script_index], 0);
        }, 2000)


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
                        }, 2000)
                    }

                    else if (script_index == 4) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        typing.play();
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            portrait.alpha = 0.5;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }
                    
                    else if (script_index == 11) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            typing.play();
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            portrait.alpha = 0.5;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }
                    
                    else if (script_index == 14) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 74;
                        portrait.sourceTop = 37;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            portrait.alpha = 1;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }
                    
                    else if (script_index == 15) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 74;
                        portrait.sourceTop = 37;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            portrait.alpha = 0.5;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 19) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 0;
                        portrait.sourceTop = 0;
                        sideCamera.position = new Vector3(6, 10.7, -17);
                        sideCamera.rotation = new Vector3(0, -3 * Math.PI / 4, 0);
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            portrait.alpha = 0.5;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }
                    
                    else if (script_index == 27) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 0;
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
                    
                    else if (script_index == 31) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 0;
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
                    
                    else if (script_index == 34) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 0;
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
                    
                    else if (script_index == 37) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            portrait.alpha = 0.5;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 6000)
                    }
                    
                    else if (script_index == 40) {
                        dialogBox.isVisible = false;
                        typing.play();
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
                        }, 3000)
                    }

                    else if (script_index == 42) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        this.scene.beginAnimation(light, 100, 0, false, undefined, () => {
                            light.intensity = 0;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        })
                    }
                    
                    else if (script_index == 43) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            portrait.alpha = 0.5;
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000)
                    }

                    else {

                        if(script_index == 2) {
                            this.scene.beginAnimation(light, 0, 100, false, undefined)
                        }

                        if (script_index == 18) {
                            this.Player.rotate(Vector3.Up(), 3 * Math.PI / 5);
                        }
                        
                        if (script_index == 23) {
                            sideCamera.position = new Vector3(2, 10.7, -16);
                            sideCamera.rotation = new Vector3(0, -8 * Math.PI / 10, 0)
                        }

                        if (script_index == 32) {
                            portrait.sourceLeft = 37;
                        }
                        
                        if (script_index == 36) {
                            this.Player.rotate(Vector3.Up(), -3 * Math.PI / 5);
                            portrait.sourceLeft = 37;
                        }
                        
                        if (script_index == 38) {
                            portrait.sourceLeft = 0;
                        }
                        
                        if (script_index == 41) {
                            this.Player.rotate(Vector3.Up(), 3 * Math.PI / 5);
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
        const next = new CH4_CU_UN_1(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        this.scene = next.scene;
    }
}
