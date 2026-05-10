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
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as GUI from '@babylonjs/gui'

//import { CH3_CU_UN_1 } from "./CH3_CU_UN_1";


export class CH3_CU_OW_2 {
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

        const sideCamera = new FreeCamera("SideCamera", new Vector3(-1.8, 10.7, -18.9), this.scene);
        sideCamera.rotation = new Vector3(0, 6 * Math.PI / 10, 0)
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

        script.push("Today's the big day, Helia!")
        script.push("Yes. It's finally time.")
        script.push("...")
        script.push("Oh! Did you notice it?")
        script.push("There's a little something that arrived this morning!")
        script.push("I asked specifically for her face, shape and outfit to be as close as possible to S1-F3's avatar.")
        script.push("What do you think of the result?")
        script.push("...")
        script.push("It really looks like her.")
        script.push("!This is still not Flusselle.")
        script.push("!Currently, it's only a bunch of wires, μ-processors, with an outside designed to look natural.")
        script.push("!She is not there for now.")
        script.push("!But this will be her appearance here.")
        script.push("!The more I look at her...")
        script.push("!The more I lose my bearings.")
        script.push("!It's like watching a doll in the eyes for too long.")
        script.push("Soooo...")
        script.push("Why is it lying on the ground like a trash bag?")
        script.push("We only have one seat in this room, and I need it to work.")
        script.push("You could have just taken a sofa from another room, you know?")
        script.push("No one would bother with how many we have in the office.")
        script.push("Not like it can run away or something.")
        script.push("I will not argue with that.")
        script.push("We will only need it after today's session.")
        script.push("S1-F3's program will be transmited to the avatar via the second pod.")
        script.push("(Raphaël is very confident that Flusselle will succeed with today's test.)")
        script.push("(But I cannot get out of my head the other possibility.)")
        script.push("(Because it's what should happen.)")
        script.push("(I don't know which outcome I prefer.)")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "Raphaël";
        title.text = s;
        title.color = speakerStatus[s];

        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
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


                    else if (script_index == 2) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            se_message.play();
                            speaker_index++;
                            this.Player.rotate(Vector3.Up(), -2 * Math.PI / 6);
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
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
                            portrait.alpha = 1;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000)
                    }

                    else if (script_index == 13) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 2000)
                    }

                    else if (script_index == 16) {
                        narator.isVisible = false;
                        sideCamera.position = new Vector3(1, 10.7, -15);
                        sideCamera.rotation = new Vector3(0, Math.PI, 0);
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
                    
                    else if (script_index == 28) {
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

                        if (script_index == 5) {
                            sideCamera.position = new Vector3(0.1, 10.8, -19.5);
                            sideCamera.rotation = new Vector3(Math.PI / 12, Math.PI, 0)
                        }

                        if (script_index == 19) {
                            portrait.sourceLeft = 74;
                            this.Player.rotate(Vector3.Up(), 2 * Math.PI / 6);
                        }
                        
                        if (script_index == 25) {
                            portrait.sourceLeft = 0;
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
        //const next = new CH3_CU_UN_1(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        //this.scene = next.scene;
    }
}
