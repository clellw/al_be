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

export class epilogue {
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

        const speakerStatus: { [key: string]: string } = { "Helia": "brown", "Flusselle": "rgb(0, 157, 255)" };

        script.push("...")
        script.push("Mmmmmh...")
        script.push("I still have time...")
        script.push("...")
        script.push("Lyrina! Time to wake up!")
        script.push("...")
        script.push("LYRINAAAAA!")
        script.push("GET OUT OF THIS BED!")
        script.push("Yes. Two seconds...")
        script.push("You already got six hundred of them!")
        script.push("Hurry up! We're gonna miss the bus again!")
        script.push("You're all prepared already?")
        script.push("Of course! I always get ready in advance.")
        script.push("We cannot say the same for you!")
        script.push("You do realize that you put on the wrong outfit, right?")
        script.push("Hum...")
        script.push("Isn't that the third time this week?")
        script.push("And we missed the bus on the two previous occasions.")
        script.push("D-don't switch topics! You are still in your bed right now!")
        script.push("The time I will take will let you get changed.")
        script.push("You better be ready when I'm changed!")
        script.push("*sight* Why do your companies have 'dress codes', anyway?")
        script.push("I don't know. Maybe to launch war on the market of clothings, who knows?")
        script.push("Not that it would affect you, with how empty your closet is ~")
        script.push("H-hey! That was rude!")
        script.push("If you are mad at me, then get out of this bed!")
        script.push("...")
        script.push("Flusselle?")
        script.push("...")
        script.push("What is it?")
        script.push("Do you still feel that pain in your chest?")
        script.push("Yes.")
        script.push("It never felt like it left me at anytime.")
        script.push("I just got used to it by now.")
        script.push("Sorry. I shouldn't have asked.")
        script.push("No, don't worry.")
        script.push("Talking with you about it kind of appeases it a little for me.")
        script.push("Do you recall when it first appeared?")
        script.push("I can't really tell.")
        script.push("Since the 'heavy training', it started growing without break.")
        script.push("I cannot tell how it was before.")
        script.push("But it's okay, I can deal with this.")
        script.push("It's like a second nature for me no-")
        script.push("No! Don't keep it to yourself.")
        script.push("I'm here with you, so you can share it with me.")
        script.push("Tell me whenever you are hurt, okay?")
        script.push("Thank you, Lyrina.")
        script.push("But in exchange, I want something from you, too.")
        script.push("I will do anything.")
        script.push("To come to me when you are hurt, okay?")
        script.push("Hehe.")
        script.push("Then I swear it.")
        script.push("/")

        const end = new GUI.TextBlock();
        end.fontFamily = "Segoe UI"
        end.fontSize = "27px";
        end.color = "white";
        end.top = "300px";
        end.textWrapping = true;
        end.text = "Thank you for playing!";
        end.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(end);
        end.alpha = 0;

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

        end.animations = [animation];

        let script_index = 0;
        let speaker_index = 0;

        let s = "Helia";
        title.text = s;
        title.color = speakerStatus[s];

        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("Flusselle")
        speakers.push("Helia")
        speakers.push("Flusselle")
        speakers.push("")
        speakers.push("")

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

        const heportraitBox = new GUI.Rectangle();
        heportraitBox.width = "140px";
        heportraitBox.height = "140px";
        heportraitBox.top = "50%";
        heportraitBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        heportraitBox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        heportraitBox.left = "20%";
        heportraitBox.cornerRadius = 15;
        heportraitBox.color = "white";
        heportraitBox.thickness = 4;
        heportraitBox.backgroundGradient = gradient;
        heportraitBox.isVisible = false;
        advancedTexture.addControl(heportraitBox);

        const heportrait = new GUI.Image("heportrait", "sprites/cutscenes/he-portrait-re.png");

        heportrait.width = "128px";
        heportrait.height = "128px";
        heportrait.isVisible = true;
        // Découpage dans le spritesheet
        heportrait.sourceWidth = 38;
        heportrait.sourceHeight = 38;

        heportrait.sourceLeft = 76;
        heportrait.sourceTop = 0;
        heportraitBox.addControl(heportrait)


        const flportraitBox = new GUI.Rectangle();
        flportraitBox.width = "140px";
        flportraitBox.height = "140px";
        flportraitBox.top = "50%";
        flportraitBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        flportraitBox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        flportraitBox.left = "-20%";
        flportraitBox.cornerRadius = 15;
        flportraitBox.color = "white";
        flportraitBox.thickness = 4;
        flportraitBox.backgroundGradient = gradient;
        flportraitBox.isVisible = false;
        advancedTexture.addControl(flportraitBox);

        const flportrait = new GUI.Image("flportrait", "sprites/cutscenes/fl-portrait-st.png");

        flportrait.width = "128px";
        flportrait.height = "128px";
        flportrait.isVisible = true;
        // Découpage dans le spritesheet
        flportrait.sourceWidth = 37;
        flportrait.sourceHeight = 37;

        flportrait.sourceLeft = 37;
        flportrait.sourceTop = 37;
        flportraitBox.addControl(flportrait);

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

        const angry = await CreateSoundAsync("angry",
            "./sounds/angry-sound.mp3"
        );

        angry.volume = 1

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
                    heportraitBox.isVisible = true;
                    se_message.play();
                    narator.isVisible = false;
                    this.typeWriter(message, script[script_index], 0);
                }, 7000)
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
                        heportraitBox.isVisible = false;
                        setTimeout(() => {
                            //switching tothe next scene
                            this.scene.beginAnimation(end, 0, 180, false, undefined, (() => {
                                end.alpha = 1;
                                setTimeout(() => {
                                    this.scene.beginAnimation(end, 180, 0, false, undefined, (() => {
                                        end.alpha = 0;
                                        /*setTimeout(() => {
                                            this.nextScene();
                                        }, 2000)*/
                                    }))
                                }, 4000)
                            }))
                        }, 2000)
                    }

                    else if (script_index == 4) {
                        dialogBox.isVisible = false;
                        heportraitBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 4000)
                    }

                    else if (script_index == 5) {
                        dialogBox.isVisible = false;
                        heportraitBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            heportraitBox.isVisible = true;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000)
                    }

                    else if (script_index == 6) {
                        dialogBox.isVisible = false;
                        heportraitBox.isVisible = false;
                        setTimeout(() => {
                            angry.play();
                        }, 3500)
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            message.fontSize = 40;
                            flportraitBox.isVisible = true;
                            flportrait.alpha = 1;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 4000)
                    }

                    else if (script_index == 15) {
                        dialogBox.isVisible = false;
                        heportrait.alpha = 0.5;
                        flportrait.alpha = 1;
                        flportrait.sourceTop = 74;
                        flportrait.sourceLeft = 37;
                        setTimeout(() => {
                            flportrait.sourceLeft = 74;
                            setTimeout(() => {
                                se_message.play();
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                flportraitBox.isVisible = true;
                                flportrait.alpha = 1;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            }, 1000)
                        }, 2000)
                    }

                    else if (script_index == 27) {
                        dialogBox.isVisible = false;
                        flportraitBox.isVisible = false;
                        heportraitBox.isVisible = false;
                        flportrait.source = "sprites/cutscenes/fl-portrait-alt.png"
                        heportrait.sourceTop = 0;
                        heportrait.sourceLeft = 0;
                        flportrait.sourceTop = 0;
                        flportrait.sourceLeft = 0;
                        setTimeout(() => {
                            houseDoor.play();
                            setTimeout(() => {
                                se_message.play();
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                flportraitBox.isVisible = true;
                                heportraitBox.isVisible = true;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            }, 5000)
                        }, 2000)
                    }

                    else if (script_index == 28) {
                        dialogBox.isVisible = false;
                        heportrait.alpha = 0.5;
                        setTimeout(() => {
                            flportrait.sourceLeft = 37;
                            flportrait.sourceTop = 74;
                            heportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 30) {
                        dialogBox.isVisible = false;
                        flportrait.alpha = 0.5;
                        setTimeout(() => {
                            heportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000)
                    }

                    else if (script_index == 31) {
                        dialogBox.isVisible = false;
                        heportrait.alpha = 0.5
                        setTimeout(() => {
                            flportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 4000)
                    }

                    else if (script_index == 32) {
                        dialogBox.isVisible = false;
                        flportrait.alpha = 0.5;
                        setTimeout(() => {
                            flportrait.sourceLeft = 0;
                            flportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000)
                    }

                    else if (script_index == 34) {
                        dialogBox.isVisible = false;
                        flportrait.alpha = 0.5;
                        setTimeout(() => {
                            heportrait.sourceLeft = 76;
                            heportrait.sourceTop = 38;
                            heportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000)
                    }

                    else if (script_index == 35) {
                        dialogBox.isVisible = false;
                        heportrait.alpha = 0.5;
                        setTimeout(() => {
                            flportrait.sourceLeft = 37;
                            flportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000)
                    }

                    else if (script_index == 37) {
                        dialogBox.isVisible = false;
                        flportrait.alpha = 0.5;
                        setTimeout(() => {
                            heportrait.sourceLeft = 0;
                            heportrait.sourceTop = 0;
                            heportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 38) {
                        dialogBox.isVisible = false;
                        heportrait.alpha = 0.5;
                        flportrait.sourceLeft = 37;
                        flportrait.sourceTop = 74;
                        setTimeout(() => {
                            flportrait.alpha = 1;
                            flportrait.sourceLeft = 0;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 4000)
                    }

                    else if (script_index == 39) {
                        dialogBox.isVisible = false;
                        flportrait.alpha = 0.5;
                        setTimeout(() => {
                            flportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 40) {
                        dialogBox.isVisible = false;
                        flportrait.alpha = 0.5;
                        setTimeout(() => {
                            flportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 41) {
                        dialogBox.isVisible = false;
                        flportrait.alpha = 0.5;
                        setTimeout(() => {
                            flportrait.alpha = 1;
                            flportrait.sourceTop = 0;
                            flportrait.sourceLeft = 0;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000)
                    }

                    else if (script_index == 44) {
                        dialogBox.isVisible = false;
                        heportrait.alpha = 0.5;
                        flportrait.sourceLeft = 37;
                        flportrait.sourceTop = 74;
                        setTimeout(() => {
                            heportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 45) {
                        dialogBox.isVisible = false;
                        heportrait.alpha = 0.5;
                        setTimeout(() => {
                            heportrait.alpha = 1;
                            heportrait.sourceLeft = 38;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000)
                    }

                    else if (script_index == 46) {
                        dialogBox.isVisible = false;
                        heportrait.alpha = 0.5;
                        setTimeout(() => {
                            flportrait.alpha = 1;
                            flportrait.sourceLeft = 0;
                            flportrait.sourceTop = 0;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 4000)
                    }

                    else if (script_index == 47) {
                        dialogBox.isVisible = false;
                        flportrait.alpha = 0.5;
                        setTimeout(() => {
                            flportrait.alpha = 1;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000)
                    }

                    else if (script_index == 48) {
                        dialogBox.isVisible = false;
                        flportrait.alpha = 0.5;
                        setTimeout(() => {
                            heportrait.alpha = 1;
                            heportrait.sourceLeft = 0;
                            heportrait.sourceTop = 0;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000)
                    }

                    else if (script_index == 49) {
                        dialogBox.isVisible = false;
                        heportrait.alpha = 0.5;
                        setTimeout(() => {
                            flportrait.alpha = 1;
                            flportrait.sourceLeft = 37;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000)
                    }

                    else if (script_index == 50) {
                        dialogBox.isVisible = false;
                        flportrait.alpha = 0.5;
                        setTimeout(() => {
                            heportrait.alpha = 1;
                            heportrait.sourceLeft = 38;
                            heportrait.sourceTop = 38;
                            flportrait.alpha = 1;
                            flportrait.sourceLeft = 0;
                            flportrait.sourceTop = 37;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 4000)
                    }


                    else if (script_index == 51) {
                        dialogBox.isVisible = false;
                        flportraitBox.isVisible = false;
                        heportraitBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 5000)
                    }

                    else {

                        if (script_index == 1) {
                            heportrait.sourceLeft = 38;
                        }

                        if (script_index == 2) {
                            heportrait.sourceLeft = 76;
                        }

                        if (script_index == 7) {
                            message.fontSize = 27;
                            heportrait.sourceLeft = 38;
                        }

                        if (script_index == 12) {
                            flportrait.sourceTop = 0;
                        }

                        if (script_index == 13) {
                            flportrait.sourceTop = 37;
                        }

                        if (script_index == 14) {
                            heportrait.sourceLeft = 0;
                        }

                        if (script_index == 18) {
                            flportrait.sourceTop = 37;
                        }

                        if (script_index == 21) {
                            flportrait.sourceTop = 74;
                            flportrait.sourceLeft = 37;
                        }

                        if (script_index == 23) {
                            flportrait.sourceTop = 0;
                            flportrait.sourceLeft = 74;
                        }

                        if (script_index == 24) {
                            heportrait.sourceTop = 38;
                            heportrait.sourceLeft = 76;
                        }

                        if (script_index == 25) {
                            flportrait.sourceTop = 37;
                            flportrait.sourceLeft = 0;
                        }

                        if (script_index == 26) {
                            heportrait.sourceLeft = 0;
                        }

                        if (script_index == 36) {
                            flportrait.sourceTop = 0;
                            flportrait.sourceLeft = 0;
                        }

                        if (script_index == 43) {
                            heportrait.sourceLeft = 76;
                            heportrait.sourceTop = 38;
                        }


                        se_message.play();
                        speaker_index++;
                        s = speakers[speaker_index];
                        title.color = speakerStatus[s];
                        title.text = s;
                        dialogBox.isVisible = true;
                        if (script_index < 6 || script_index > 7) heportraitBox.isVisible = true;
                        if (script_index >= 6) flportraitBox.isVisible = true;
                        narator.isVisible = false;
                        this.typeWriter(message, script[script_index], 0);

                        heportrait.alpha = (speakers[speaker_index] == "Helia") ? 1 : 0.5;
                        flportrait.alpha = (speakers[speaker_index] == "Flusselle") ? 1 : 0.5;
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
        //const next = new CH4_GM_OW(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        //this.scene = next.scene;
    }
}
