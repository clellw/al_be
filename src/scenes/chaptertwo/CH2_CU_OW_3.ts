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

//import { CH2_CU_UN_1 } from "./CH1_CU_UN_1";


export class CH2_CU_OW_3 {
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

        script.push("Hey! Good job out there!")
        script.push("See? What did I tell you? A lot more interesting, wasn't it?")
        script.push("...")
        script.push("I never would have thought you to force things like that! That was a superb idea!")
        script.push("Putting S1-F3 in such a dilema, it was really incredible!")
        script.push("And if it didn't interrupt you, it would have reacted to the death scene it witnessed! Really fantastic!")
        script.push("...")
        script.push("This is the first time we get our model to make an ethical choice.")
        script.push("It modified a lot of parameters in very little time, and it seems like we hit the jackpot!")
        script.push("Look at the loss function it got out of that! simply splendid!")
        script.push("...")
        script.push("Helia? What's wrong?")
        script.push("N-nothing!")
        script.push("I m-may just be a little exhausted from what I did in there.")
        script.push("Yeah! You really went all out!")
        script.push("Well don't worry. Because tonight, we pop the champain for this breakthrough!")
        script.push("N-no, thank you.")
        script.push("What? But this is huge! We deserve that after all that time.")
        script.push("is it because you don't like champaign?")
        script.push("No, it's just...")
        script.push("I'm very worn out from today.")
        script.push("I really want to lay on my pillow.")
        script.push("All right. I understand.")
        script.push("We can do this another time!")
        script.push("...")
        script.push("!What the hell just happened?")
        script.push("!Is it because I tried to kill-.")
        script.push("!no, not even kill! It was not human!")
        script.push("!How did S1-F3...")
        script.push("!We had some progress with our previous programs.")
        script.push("!But they never reached the point to make any of the decisions we wanted them to do.")
        script.push("!I could have tried what I did before at any time, the result would have been disapointing, like always.")
        script.push("!So...")
        script.push("!Why?")
        script.push("!...No, it's not only that.")
        script.push("!Not only did it make the decision by itself, but...")
        script.push("!Maybe that was just a little offset from Flusselle's usual behaviour.")
        script.push("!Maybe we just had a little bit of luck to help us this time.")
        script.push("!Programs cannot feel anything.")
        script.push("!But why...")
        script.push("!It did not feel like I was talking with a simple chat bot.")
        script.push("!It's like I could sense something from her...")
        script.push("!But...")
        script.push("!I have to get this straight somehow.")
        script.push("!What I felt...")
        script.push("!It didn't feel electronic, mechanical or anything.")
        script.push("!It didn't feel human either.")
        script.push("!What the hell was that?")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "Raphaël";
        title.text = s;
        title.color = speakerStatus[s];
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
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
        endTitle.text = "End of Chapter Two";
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
                        narator.isVisible = false;
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

                    else if (script_index == 11) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            portrait.sourceTop = 37;
                            portrait.alpha = 0.5;
                            setTimeout(() => {
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                portraitBox.isVisible = true;
                                se_message.play();
                                this.typeWriter(message, script[script_index], 0);
                            }, 2000);
                        }

                        else if (script_index == 20) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                portraitBox.isVisible = true;
                                se_message.play();
                                this.typeWriter(message, script[script_index], 0);
                            }, 2000);
                        }

                        else if (script_index == 16) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            portrait.sourceTop = 0;
                            portrait.alpha = 1;
                            sideCamera.position = new Vector3(2, 10.7, -17)
                            sideCamera.rotation = new Vector3(0, -6 * Math.PI / 5, 0)
                            setTimeout(() => {
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                portraitBox.isVisible = true;
                                se_message.play();
                                this.typeWriter(message, script[script_index], 0);
                            }, 2000);
                        }

                        else if (script_index == 25) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            this.scene.beginAnimation(light, 200, 0, false, undefined, () => {
                                setTimeout(() => {
                                    narator.isVisible = true;
                                    this.naratorWriter(narator, script[script_index], 1, na_message);
                                }, 3000)
                            });
                        }

                        else if (script_index == 26) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }

                        else if (script_index == 29) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }

                        else if (script_index == 33) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }

                        else if (script_index == 34) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }

                        else if (script_index == 36) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }

                        else if (script_index == 39) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }

                        else if (script_index == 40) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }

                        else if (script_index == 43) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }

                        else if (script_index == 45) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }
                        else if (script_index == 46) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }
                        else if (script_index == 47) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 2000)
                        }

                        else {

                            if (script_index == 12) {
                                this.Player.rotate(Vector3.Up(), -4 * Math.PI / 9);
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
                                if (script_index <= 20) portraitBox.isVisible = true;
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
        //const next = new CH1_CU_UN_1(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        //this.scene = next.scene;
    }
}
