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

import { CH3_GM_OW } from "./CH3_GM_OW";


export class CH3_CU_OW_1 {
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

        script.push("...")
        script.push("...")
        script.push("So it's finally time.")
        script.push("(Why is my chest so heavy?)")
        script.push("(I should not concern myself with that.)")
        script.push("!We've been working on Flusselle's learning for four months straight.")
        script.push("!But we've never reached an improvement rate as brutal until one month ago.")
        script.push("!And today, it's the final test.")
        script.push("!If Flusselle ends up showing good results, her training will be considered over.")
        script.push("!And all our work will finally pay off.")
        script.push("!But that is not what concerns me.")
        script.push("!Flusselle is the one single thing that terrifies me the most right now.")
        script.push("!It all started from that one moment...")
        script.push("!Flusselle only said me to stop what I was doing.")
        script.push("!I only wanted to free myself from this cycle I trapped myself in.")
        script.push("!It had nothing to do with killing someone, or provoking anything.")
        script.push("!But from that moment on, every session was a success without even pushing it.")
        script.push("!Since then, I cannot help but wonder if I am the one responsible for Flusselle's progress.")
        script.push("!But I don't think that's the case.")
        script.push("!Every time I see her, I tell myself...")
        script.push("!'What I have in front of me is not supposed to exist.'")
        script.push("!'It's a mixed bag of programming mistakes and false hopes.'")
        script.push("!And I don't believe myself when I say that.")
        script.push("!I cannot understand what it is.")
        script.push("!And trying to do so makes me each time a little more uncomfortable.")
        script.push("!But at the same time...")
        script.push("!Something in me wants to clear the clouds in my head that start gathering when I see her.")
        script.push("!I'm unable to put words on what Flusselle is, or what she is supposed to represent.")
        script.push("!The closest thing I can think of is...")
        script.push("!A monster.")
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
        date.text = "June 20th, 2027"
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

        const houseDoor = await CreateSoundAsync("houseDoor",
            "./sounds/Seq_SE_FLD_20.wav"
        );
        houseDoor.volume = 0.3
        houseDoor.loop = false;

        const chapter = new GUI.TextBlock();
        chapter.fontFamily = "Segoe UI"
        chapter.fontSize = "27px";
        chapter.color = "white";
        chapter.top = "200px";
        chapter.textWrapping = true;
        chapter.text = "Chapter Three";
        chapter.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(chapter);
        chapter.alpha = 0;

        const description = new GUI.TextBlock();
        description.fontFamily = "Segoe UI"
        description.fontSize = "29px";
        description.color = "white";
        description.top = "240px";
        description.textWrapping = true;
        description.text = "What I have in front of Me...";
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
        paragraph.text = "Voices unheard by anyone sound louder when they reach your ears.";
        paragraph.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        paragraph.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(paragraph);
        paragraph.alpha = 0;

        const memory = new GUI.Image("memory", "images/flashback.png");

        memory.width = "574px";
        memory.height = "296px";
        memory.isVisible = true;
        memory.alpha = 0;
        advancedTexture.addControl(memory)

        // Wait until audio engine is ready to play sounds.
        await audioEngine.unlockAsync();

        (advancedTexture.getContext() as CanvasRenderingContext2D).imageSmoothingEnabled = false;

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

        memory.animations = [animation];

        animation.setKeys(keys);

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
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            se_message.play();
                            narator.isVisible = false;
                            this.typeWriter(message, script[script_index], 0);
                        }, 8000)
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
                        narator.isVisible = false;
                        setTimeout(() => {
                            //switching tothe next scene
                            this.nextScene();
                        }, 3000)
                    }

                    else if (script_index == 2 || script_index == 3 || script_index == 4) {
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
                        }, 2000)
                    }

                    else if (script_index == 5) {
                        houseDoor.play();
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
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
                                        setTimeout(() => {
                                            narator.isVisible = true;
                                            this.naratorWriter(narator, script[script_index], 1, na_message);
                                        }, 3000);
                                    }, 4000)
                                });
                            }, 4000)
                        }, 500);
                    }

                    else if (script_index == 10 || script_index == 11 || script_index == 22 || script_index == 25 || script_index == 27 || script_index == 28 || script_index == 29) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            if (script_index == 29) narator.color = "rgb(0, 157, 255)";
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 2000)
                    }

                    else if (script_index == 12) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            this.scene.beginAnimation(memory, 0, 180, false, undefined)
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }, 500);
                    }

                    else if (script_index == 17) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            this.scene.beginAnimation(memory, 180, 0, false, undefined, (() => { memory.alpha = 0 }))
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 1000)
                        }, 500);
                    }

                    else if (script_index == 19) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        narator.isVisible = false;
                        setTimeout(() => {
                            bus.play();
                            setTimeout(() => {
                                this.scene.beginAnimation(cameraBlock, 0, 120, false, undefined, () => {
                                    narator.isVisible = true;
                                    narator.color = "rgb(211, 121, 121)";
                                    this.naratorWriter(narator, script[script_index], 1, na_message);
                                })
                            }, 1000)
                        }, 2000)
                    }

                    else if (script_index == 23) {
                        narator.isVisible = false;
                        narator.color = "white";
                        setTimeout(() => {
                            bus.stop();
                            cameraBlock.material!.alpha = 1;
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 3000)
                    }


                    else {

                        if (script_index == 1) {
                            portrait.sourceLeft = 74;
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
        const next = new CH3_GM_OW(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        this.scene = next.scene;
    }
}
