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


export class CH1_CU_OW_2 {
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
        this.Player.position = new Vector3(2., 10, -20);
        this.Player.scaling = new Vector3(0.23, 0.23, 0.23)
        this.Player.rotate(Vector3.Up(), Math.PI / 6);
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

        const sideCamera = new FreeCamera("SideCamera", new Vector3(1, 10.7, -15), this.scene);
        sideCamera.rotation = new Vector3(0, Math.PI, 0);
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

        script.push("Oh, hi Helia. Did you have a good night?")
        script.push("And you, did you have a night in the first place?")
        script.push("Progress never sleeps, especially when you have humanity's next step in sight.")
        script.push("Maybe not progress, but I'm confident that humans need to sleep at least 7 hours for them to...")
        script.push("Anyway, ready for your dive of the day?")
        script.push("Why do I even bother to talk with you?")
        script.push("!This is my colleague, Raphaël.")
        script.push("!The embodiment of everything you can expect from an engineer.")
        script.push("!Nonetheless, he's a real genious in his domain.")
        script.push("!He pushed the fields of virtual realities and neural networks to their limits in the past years.")
        script.push("!His inventions are only used by our own company. They are not public yet.")
        script.push("!And one of them is where I spend all my time working.")
        script.push("All the signals are green. We can start when you are ready.")
        script.push("Good. Then let's not waste more time.")
        script.push("Time to get to work.")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "Raphaël";
        title.text = s;
        title.color = speakerStatus[s];

        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
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
        portrait.alpha = 0.5;
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
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            //switching tothe next scene
                            this.nextScene();
                        }, 1000)
                    }

                    
                    else if (script_index == 14) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.sourceLeft = 37;
                        portrait.sourceTop = 74;
                        this.scene.beginAnimation(light, 200, 0, false, undefined, () => {
                            setTimeout(() => {
                                dialogBox.isVisible = true;
                                portraitBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            }, 200)
                        });
                    }

                    else {
                        
                        if (script_index == 3) {
                            sideCamera.position = new Vector3(-1.8, 10.7, -18.9)
                            sideCamera.rotation = new Vector3(0, 6*Math.PI/10, 0)
                            portrait.sourceLeft= 37;
                        }
                        
                        if (script_index == 5) {
                            portrait.sourceLeft= 74;
                        }
                        
                        if (script_index == 6) {
                            sideCamera.position = new Vector3(3, 10.7, -18.4)
                            sideCamera.rotation = new Vector3(0, 3*Math.PI/2, 0)
                        }
                        
                        if (script_index == 10) {
                            sideCamera.position = new Vector3(3, 12.5, -17.2)
                            sideCamera.rotation = new Vector3(Math.PI/6, 4*Math.PI/5, 0)
                        }
                        
                        if (script_index == 13) {
                            portrait.sourceLeft= 0;
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
                        
                        portrait.alpha = (speakers[speaker_index] == "Helia")?1:0.5;
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
