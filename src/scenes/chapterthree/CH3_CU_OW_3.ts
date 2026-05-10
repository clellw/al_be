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
    Color4,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as GUI from '@babylonjs/gui'

//import { CH2_CU_UN_1 } from "./CH1_CU_UN_1";


export class CH3_CU_OW_3 {
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

        script.push("Would you like a drink?")
        script.push("No, thank you.")
        script.push("How is Flusselle?")
        script.push("Most parts of its system have been modified heavily.")
        script.push("The roles they used to handle are now completely mixed up.")
        script.push("Some files have been corrupted right after it protected you.")
        script.push("...")
        script.push("But it's not that big of a deal.")
        script.push("We managed to save the last training datas.")
        script.push("I can return the affected files to a stable state.")
        script.push("It will take some time, but nothing I cannot do in less than a week.")
        script.push("We will have to wait a little to transmit its program in the vessel.")
        script.push("...")
        script.push("Listen, Raphaël.")
        script.push("Flusselle's behavior has gotten weird since her spike in performance.")
        script.push("What do you mean by 'behavior'?")
        script.push("No, I mean...")
        script.push("I don't feel like it's just a program anymore.")
        script.push("I started sensing something from her.")
        script.push("Maybe I'm just dellusional, but...")
        script.push("It's like Flusselle is now being knowledgeable of what's around her, and how to impact on her surroundings.")
        script.push("That shift happened too brutally for me to believe she got that only from her training.")
        script.push("You are the one supposed to know best of how Flusselle 'works'...")
        script.push("Please, tell me you have a clue on what's going on.")
        script.push("...")
        script.push("I know the reason.")
        script.push("But this could get you in real danger.")
        script.push("I don't care.")
        script.push("If it tells me what's happening to Flusselle, then I want to know it.")
        script.push("You were wrong about a slight detail.")
        script.push("Like every other LLM or Learning Model, S1-F3 gets in fact all of its performances from its training.")
        script.push("There is no other method for them to progress.")
        script.push("But I made it go through something we never tried.")
        script.push("I launched a heavy training on S1-F3.")
        script.push("But the datas of that training were none of which we used up until now.")
        script.push("It needed something greater than anything I could prepare.")
        script.push("I hacked into the drive of all the country's citizens.")
        script.push("I copied the images, the videos, the saved mail letters, anything that induced human interactions.")
        script.push("The quantity of data I got was far more than enough.")
        script.push("But I couldn't store them, and the program would have taken two times the lifespan of Earth to complete its training with my computer.")
        script.push("So I used others to do the training.")
        script.push("However, I needed far more powerful processing abilities than simple clusters.")
        script.push("I pirated the four quantum computers of the south of the country.")
        script.push("The training was split up among them.")
        script.push("It lasted 6 hours.")
        script.push("The amount of energy needed was nonetheless humongous.")
        script.push("Even humongous is low for what it was.")
        script.push("It caused a complete blackout on an entire region.")
        script.push("After that, I deleted all the files from the quantum computers and saved only the results.")
        script.push("No one can recover them or trace what happened.")
        script.push("And from that, I got the current version of S1-F3.")
        script.push("This is the whole story.")
        script.push("...")
        script.push("!I did not just hear that?!")
        script.push("What made you think it was a good idea!?")
        script.push("It was that, or close the most important project of my entire life.")
        script.push("You can understand, you worked with me this whole time, and you saw with me every version we worked on go to waste.")
        script.push("...")
        script.push("You said 'current version'.")
        script.push("Does that mean...?")
        script.push("Since the heavy training, S1-F3 isn't progressing.")
        script.push("It's not learning, modifying parameters, or modifying its embeddings anymore.")
        script.push("Not like it needs to.")
        script.push("From the training resulted the core program, but there were new files and folders.")
        script.push("All in unreadable format, encrypted, with no methods to write or open them.")
        script.push("It's like the program got a whole new layer of complexity it wanted to protect at all cost.")
        script.push("And when it's with you, it writes and reads only in these locations.")
        script.push("But all of that made it completely unstable.")
        script.push("!I did not have that knowledge until now.")
        script.push("!Raphaël only wanted me not to be judged as his accomplice if he got caught.")
        script.push("!I could not have even understood what was happening.")
        script.push("!Nor could I have done anything to help.")
        script.push("!But I...")
        script.push("!I failed once more to help you when you needed it, Flusselle.")
        script.push("#...")
        script.push("#...")
        script.push("#...Where?")
        script.push("#Can  anyone  hear  me?!")
        script.push("#My  throat  burns...")
        script.push("#What  is...")
        script.push("#Guh!")
        script.push("#Come  on!  Move!")
        script.push("#Why  can't  I...?")
        script.push("#*Sob*")
        script.push("#This  pain!  STOP!")
        script.push("#Let  me  breath...")
        script.push("#Someone...  help...")
        script.push("#Lyrina...")
        script.push("#Please...  Tell  me  you  are...")
        script.push("#?!")
        script.push("#No...")
        script.push("#This  is  a  nightmare...")
        script.push("#GET  ME  OUT!!!")
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
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
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
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Helia")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")

        message.fontSize = (this.canvas.height < 800) ? 22 : 27;
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

        const be_message = await CreateSoundAsync("be_message",
            "./sounds/SEQ_SE_MESSAGE.wav"
        );
        be_message.volume = 1

        const na_message = await CreateSoundAsync("na_message",
            "./sounds/SE_Sys_MESS_POKE.wav"
        );

        na_message.volume = 0.3

        const alert = await CreateSoundAsync("alert",
            "./sounds/alert.mp3"
        );
        alert.volume = 1;

        const shatter = await CreateSoundAsync("shatter",
            "./sounds/shatter.mp3"
        );
        shatter.volume = 1;

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
        endTitle.text = "End of Chapter Three";
        endTitle.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(endTitle);

        const alarm = new GUI.Image("alarm", "images/alarm.png");

        alarm.width = this.canvas.width;
        alarm.height = this.canvas.height;
        alarm.isVisible = false;
        alarm.alpha = 0;
        advancedTexture.addControl(alarm)

        const alarman = new Animation(
            "fadeInalpha",
            "alpha",
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const akeys = [
            { frame: 0, value: 0 }, // noir
            { frame: 50, value: 0.5 } // normal
        ];

        alarman.setKeys(akeys);

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

        alarm.animations = [alarman];


        const font = new FontFace('MyCustomFont', 'url(./font/ARCADECLASSIC.TTF)');
        font.load();
        font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            console.log('Font loaded and ready to use in Babylon.js');
        });

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
                setTimeout(() => {
                    dialogBox.isVisible = true;
                    portraitBox.isVisible = true;
                    se_message.play();
                    narator.isVisible = false;
                    this.typeWriter(message, script[script_index], 0);
                }, 2000)
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
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        alarm.isVisible = true;
                        shatter.play()
                        setTimeout(() => {
                            alert.play();
                            this.scene.beginAnimation(alarm, 0, 50, false, undefined, (() => {
                                this.scene.beginAnimation(alarm, 50, 0, false, undefined, (() => {
                                    alarm.alpha = 0;
                                    setTimeout(() => {
                                        this.scene.beginAnimation(alarm, 0, 50, false, undefined, (() => {
                                            this.scene.beginAnimation(alarm, 50, 0, false, undefined, (() => {
                                                alarm.alpha = 0;
                                                setTimeout(() => {
                                                    this.scene.beginAnimation(alarm, 0, 50, false, undefined, (() => {
                                                        this.scene.beginAnimation(alarm, 50, 0, false, undefined, (() => {
                                                            alarm.alpha = 0;
                                                            this.scene.beginAnimation(endTitle, 240, 0, false, undefined, (() => {
                                                                endTitle.alpha = 0;
                                                            }))
                                                            setTimeout(() => {
                                                                this.scene.beginAnimation(alarm, 0, 50, false, undefined, (() => {
                                                                    this.fadeVolumeOut(alert);
                                                                    this.scene.beginAnimation(alarm, 50, 0, false, undefined, (() => {
                                                                        alarm.alpha = 0;
                                                                        setTimeout(() => {
                                                                            this.scene.beginAnimation(alarm, 0, 50, false, undefined, (() => {
                                                                                this.scene.beginAnimation(alarm, 50, 0, false, undefined, (() => {
                                                                                    alarm.alpha = 0;
                                                                                    /*setTimeout(() => {
                                                                                        this.nextScene();
                                                                                    }, 3000)*/
                                                                                }))
                                                                            }))
                                                                        }, 400)
                                                                    }))
                                                                }))
                                                            }, 400)
                                                        }))
                                                    }))
                                                }, 400)
                                            }))
                                        }))
                                    }, 400)
                                }))
                            }))
                    }, 500)
                        /*
                        setTimeout(() => {
                            this.scene.beginAnimation(endTitle, 0, 240, false, undefined, () => {
                                setTimeout(() => {
                                    this.scene.beginAnimation(endTitle, 240, 0, false, undefined, (() => {
                                        endTitle.alpha = 0;
                                        /*setTimeout(() => {
                                            this.nextScene();
                                        }, 2000)
                                    }))
                                }, 4000)
                            })
                        }, 500)*/
                    }

                    else if (script_index == 2) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.alpha = 1;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            se_message.play();
                            this.Player.rotate(Vector3.Up(), -4 * Math.PI / 9);
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }

                    else if (script_index == 7) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
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

                    else if (script_index == 13) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.alpha = 1;
                        portrait.sourceTop = 0;
                        portrait.sourceLeft = 0;
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

                    else if (script_index == 17) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.alpha = 1;
                        portrait.sourceTop = 0;
                        portrait.sourceLeft = 0;
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
                        portrait.alpha = 1;
                        portrait.sourceTop = 74;
                        portrait.sourceLeft = 0;
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

                    else if (script_index == 22) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.alpha = 1;
                        portrait.sourceTop = 37;
                        portrait.sourceLeft = 74;
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

                    else if (script_index == 29) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.alpha = 0.5;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            se_message.play();
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 32) {
                        dialogBox.isVisible = false;
                        portrait.alpha = 0.5;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            se_message.play();
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 36) {
                        dialogBox.isVisible = false;
                        portrait.alpha = 0.5;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            se_message.play();
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 42) {
                        dialogBox.isVisible = false;
                        portrait.alpha = 0.5;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            se_message.play();
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 45) {
                        dialogBox.isVisible = false;
                        portrait.alpha = 0.5;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            se_message.play();
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 47) {
                        dialogBox.isVisible = false;
                        portrait.alpha = 0.5;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            se_message.play();
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 52) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.alpha = 1;
                        portrait.sourceTop = 37;
                        portrait.sourceLeft = 0;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = true;
                            se_message.play();
                            this.typeWriter(message, script[script_index], 0);
                        }, 4000);
                    }

                    else if (script_index == 58) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.alpha = 1;
                        portrait.sourceTop = 37;
                        portrait.sourceLeft = 74;
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

                    else if (script_index == 60) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        portrait.alpha = 0.5;
                        sideCamera.position = new Vector3(1, 10.7, -16);
                        sideCamera.rotation = new Vector3(0, -3 * Math.PI / 4, 0);
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

                    else if (script_index == 68) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        this.scene.beginAnimation(light, 200, 0, false, undefined, () => {
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 3000)
                        });
                    }

                    else if (script_index == 70) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 2000)
                    }

                    else if (script_index == 72) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 2000)
                    }
                    else if (script_index == 73) {
                        dialogBox.isVisible = false;
                        portraitBox.isVisible = false;
                        setTimeout(() => {
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 3000)
                    }

                    else if (script_index == 74) {
                        title.text = "";
                        dialogBox.width = 0.7;
                        dialogBox.height = 0.3;
                        dialogBox.paddingBottom = "70px"
                        dialogBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                        dialogBox.cornerRadius = 0;
                        dialogBox.color = "white";
                        dialogBox.thickness = 4;
                        dialogBox.background = "black";
                        dialogBox.fontFamily = "MyCustomFont";
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 6000)
                    }

                    else if (script_index == 76) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 4000)
                    }

                    else if (script_index == 77) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 4000)
                    }

                    else if (script_index == 78) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 4000)
                    }

                    else if (script_index == 80) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 4000)
                    }


                    else if (script_index == 82) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 4000)
                    }

                    else if (script_index == 83) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 2000)
                    }

                    else if (script_index == 84) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 2000)
                    }

                    else if (script_index == 85) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 4000)
                    }

                    else if (script_index == 86) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 4000)
                    }

                    else if (script_index == 89) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 4000)
                    }

                    else if (script_index == 90) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 4000)
                    }

                    else if (script_index == 91) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 1);
                        }, 4000)
                    }

                    else if (script_index == 92) {
                        dialogBox.isVisible = false;
                        message.fontSize = 55;
                        setTimeout(() => {
                            this.scene.beginAnimation(endTitle, 0, 240, false, undefined, () => {
                                setTimeout(() => {
                                    be_message.play();
                                    dialogBox.isVisible = true;
                                    this.typeWriter(message, script[script_index], 1);
                                }, 500)
                            })
                        }, 500)
                    }

                    else {

                        if (script_index == 6) {
                            portrait.sourceTop = 37;
                            portrait.sourceLeft = 74;
                        }
                        else if (script_index == 15) {
                            sideCamera.position = new Vector3(1.4, 10.7, -14.5);
                            sideCamera.rotation = new Vector3(0, Math.PI, 0);
                        }

                        else if (script_index == 18) {
                            portrait.sourceTop = 37;
                            portrait.sourceLeft = 74;
                        }

                        else if (script_index == 27) {
                            portrait.sourceTop = 0;
                            portrait.sourceLeft = 0;
                        }

                        else if (script_index == 30) {
                            sideCamera.position = new Vector3(2, 17, -19)
                            sideCamera.rotation = new Vector3(Math.PI / 2, 0, Math.PI)
                        }

                        else if (script_index == 54) {
                            portrait.sourceLeft = 37;
                            portrait.sourceTop = 0;
                            sideCamera.position = new Vector3(6, 10.7, -17);
                            sideCamera.rotation = new Vector3(0, -3 * Math.PI / 4, 0);
                        }

                        else if (script_index == 57) {
                            portrait.sourceTop = 74;
                            portrait.sourceLeft = 0;
                        }


                        if (script[script_index].startsWith("!")) {
                            dialogBox.isVisible = false;
                            portraitBox.isVisible = false;
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }
                        else if (script[script_index].startsWith("#")) {
                            dialogBox.isVisible = true;
                            portraitBox.isVisible = false;
                            narator.isVisible = false;
                            this.typeWriter(message, script[script_index], 1);
                        }
                        else {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            if (script_index <= 28 || script_index >= 52) portraitBox.isVisible = true;
                            else portraitBox.isVisible = false;
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
