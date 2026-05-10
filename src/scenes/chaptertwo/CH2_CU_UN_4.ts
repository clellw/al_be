import { Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, CreateAudioEngineAsync, CreateSoundAsync, StaticSound, Animation, Color4 } from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'

import { CH2_CU_OW_3 } from "./CH2_CU_OW_3";

export class CH2_CU_UN_4 {


    scene: Scene;
    engine: Engine;

    lyrina: Sprite;
    flusselle: Sprite;
    krystyna: Sprite;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);

        this.scene = this.CreateScene();
        //Inspector.show(this.scene, {})
        this.engine.runRenderLoop(() => {
            this.scene.render();
        })

        //importing the sprites for the character
        const LManager = new SpriteManager(
            'LManager',
            './sprites/cutscenes/ly-c-st.png',
            1,
            128,
            this.scene
        );

        LManager.texture = new Texture(
            "./sprites/cutscenes/ly-c-st.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        this.lyrina = new Sprite('lyrina', LManager)

        const FManager = new SpriteManager(
            'LManager',
            './sprites/cutscenes/fl-c.png',
            1,
            128,
            this.scene
        );

        FManager.texture = new Texture(
            "./sprites/cutscenes/fl-c.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        this.flusselle = new Sprite('flusselle', FManager)

        const KManager = new SpriteManager(
            'KManager',
            './sprites/cutscenes/ar-c.png',
            1,
            128,
            this.scene
        );

        KManager.texture = new Texture(
            "./sprites/cutscenes/kr-c.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        this.krystyna = new Sprite('krystyna', KManager)


        this.lyrina.size = 0.45;
        this.lyrina.position = new Vector3(0.0, 0, 0)
        this.lyrina.playAnimation(0, 7, true, 100);

        this.flusselle.size = 0.45;
        this.flusselle.position = new Vector3(-0.15, 0, 0)
        this.flusselle.playAnimation(0, 7, true, 100);

        this.krystyna.size = 0.45;
        this.krystyna.position = new Vector3(-0.8, 0, 0)
        this.krystyna.playAnimation(40, 41, true, 150);
        this.krystyna.invertU = true;
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);

        //const sideCamera = new FreeCamera("SideCamera", new Vector3(0, 0.05, 1.2), scene);

        const hemilight = new HemisphericLight(
            "hemilight",
            new Vector3(0, 1, 0),
            this.scene
        );

        hemilight.intensity = 1.;

        //this.CreateEnnemy(scene);
        this.CreateEnvironment(scene);
        this.CreateDialog();


        return scene;
    }

    async CreateEnvironment(scene: Scene): Promise<void> {

        const spriteManager = new SpriteManager(
            "tilesManager",
            "./sprites/grass_m.png",
            100,           // max number of sprites
            96,
            scene
        );

        const spriteManager2 = new SpriteManager(
            "tilesManager",
            "./sprites/ground_u.png",
            200,           // max number of sprites
            96,
            scene
        );

        // Create a few tiles
        for (let i = 0; i < 68; i++) {
            const tile = new Sprite("tile" + i, spriteManager);
            tile.position.x = -67 * 0.147 / 2 + i * 0.147; // space tiles apart
            tile.size = 0.15;
            tile.position.y = -0.17;
            tile.position.z = -0.01;
            tile.cellIndex = 0; // choose tile from sprite sheet
            const tile2 = new Sprite("tile" + i, spriteManager2);
            tile2.position.x = -67 * 0.147 / 2 + i * 0.147; // space tiles apart
            tile2.size = 0.15;
            tile2.position.y = -0.317;
            tile2.position.z = -0.01;
            tile2.cellIndex = 0; // choose tile from sprite sheet
            const tile3 = new Sprite("tile" + i, spriteManager2);
            tile3.invertV = true
            tile3.position.x = -68 * 0.147 / 2 + i * 0.147; // space tiles apart
            tile3.size = 0.15;
            tile3.position.y = -0.464;
            tile3.position.z = -0.01;
            tile3.cellIndex = 0; // choose tile from sprite sheet
        }

        const skybox = Mesh.CreateBox("BackgroundSkybox", 500, scene, undefined, Mesh.BACKSIDE);

        const backgroundManager = new SpriteManager(
            "tilesManager",
            "./sprites/background_forest.jpg",
            100,
            { width: 600, height: 276 },
            scene
        );
        backgroundManager.texture = new Texture(
            "./sprites/background_forest.jpg",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        const background = new Sprite("background", backgroundManager);
        background.position.z = -1;
        background.position.y = 0.4;
        background.position.x = -0.2;
        background.width = 5;
        background.height = 2;
    }


    canSkip = false;

    async CreateDialog(): Promise<void> {

        const sideCamera = new FreeCamera("SideCamera", new Vector3(-0.4, 0.05, 1.2), this.scene);
        // Make camera look toward -Z (scene) so it doesn't look into empty space
        sideCamera.setTarget(new Vector3(sideCamera.position.x, sideCamera.position.y, 0));

        const font = new FontFace('MyCustomFont', 'url(./font/ARCADECLASSIC.TTF)');
        font.load();
        font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            console.log('Font loaded and ready to use in Babylon.js');
        });
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const dialogBox = new GUI.Rectangle();
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
        advancedTexture.addControl(dialogBox);

        const panel = new GUI.StackPanel();
        dialogBox.addControl(panel);

        const title = new GUI.TextBlock();
        title.fontFamily = "MyCustomFont";
        title.paddingLeft = "20px";
        title.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        title.height = "40px";
        title.fontSize = 24;
        panel.addControl(title);

        // Message
        const message = new GUI.TextBlock();
        const script: string[] = [];
        const speakers: string[] = [];

        const speakerStatus: { [key: string]: string } = { "lyrina": "brown", "flusselle": "rgb(0, 157, 255)", "???": "red", "krystyna": "red" };

        script.push("han...  han...")
        script.push("this  is...  kind  of  embarassing,  considering  how  confident  i  was.")
        script.push("but  don't  think  you  will  get  away  with  this!")
        script.push("i  will  make  you  pay  for  what  you  did.")
        script.push("we  only  served  our  cause,  we  didn-")
        script.push("you  do  not  think  for  others  at  all,  do  you?")
        script.push("all  the  person  i  helped  with  this  group  were  starving  to  death,  including  me.")
        script.push("we  all  arrived  in  this  place  in  the  worst  conditions  possible.")
        script.push("and  finding  a  job  with  no  talent  or  school  education  is  like  believing  in  miracles.")
        script.push("what  did  you  want  us  to  do?  wait  for  sweet  death  to  come  greet  us  without  trying  anything?")
        script.push("...")
        script.push("...")
        script.push("no  answers?  maybe  you  now  you  understand  the  suffering  we  have  been  through?")
        script.push("i  know  what  we  did  is  wrong  in  every  way.")
        script.push("but  we  had  to,  we  didn't  have  a  choice!")
        script.push("(...)")
        script.push("(I  will  admit  that  raphael  made  a  great  effort  to  write  a  good  villain  this  time.)")
        script.push("(But  it  will  be  to  no  avail.)")
        script.push("(it  never  will.)")
        script.push("!This is the last part of every day.")
        script.push("!If S1-F3 has improved her abilities, she should be able to make a choice for herself.")
        script.push("!If not, I make the choice for her.")
        script.push("!This cycle repeats itself for the following day.")
        script.push("!And the day after, and the one after, and the next day, and the next day, and the next day.")
        script.push("!But this time...")
        script.push("!I will break it.")
        script.push("ly-lyrina?  what  are  you..?")
        script.push("urgh..!  no..")
        script.push("tsk!  if  that  makes  you  happy  to  end  my  life,  then  so  be  it.")
        script.push("my  friends  will  continue  to  live,  even  without  me.")
        script.push("what  you  are  doing  is  completely  useless!")
        script.push("come  on!  finish  what  you  started  now!")
        script.push("(...)")
        script.push("(this  should  show  raphael  what  i  want  to  tell  him.)")
        script.push("(this  is  all  going  to  end.)")
        script.push("!Nowadays, the research on AI is stuck in a dead end.")
        script.push("!Large Language Models, or LLMs, are the most popular models on the market.")
        script.push("!From the outside, they seem to be all powerful and cryptic.")
        script.push("!But you can perfectly understand their limits when you create them.")
        script.push("!At their core, they are all made of blocks that transform the words they get into arrays of values.")
        script.push("!These values are used to represent the meaning of the words, and create responses according to what they see.")
        script.push("!And to improve them, like all other learning models, you give them more data for their training.")
        script.push("!And how do you improve them if that doesn't work?")
        script.push("!You start stacking up the blocks.")
        script.push("!In the end, they may be able to encapsulate the meaning of words and sentences.")
        script.push("!But they only find correlations between the arrays they have.")
        script.push("!They never understand what they have, or feel anything about it.")
        script.push("!I was dumb enough to think they worked like magic and could develop true feelings.")
        script.push("!But now, hearing the sentence 'AI emotions' makes me laugh with uncomfort.")
        script.push("!It would take a miracle for them to develop anything near what humans feel.")
        script.push("!And I am fed up with these useless attempts.")
        script.push("WAIT!")
        script.push("lyrina...  what  are  you  doing?")
        script.push("please...  stop  this...")
        script.push("(S1-F3...)")
        script.push("(should  I  feel  sad  to  see  her  as  the  culmination  of  all  my  wasted  time...)")
        script.push("(or  mad  for  her  being  yet  another  defect?)")
        script.push("why  are  you  acting  like  this?  you  never  did  that  before...")
        script.push("do  you  know  that  person?")
        script.push("unhand  me.")
        script.push("no,  I  will  not  let  you  do  this.")
        script.push("you  are  going  to  regret  it,  and  i  don't  want  that  for  you.")
        script.push("our  mission  was  initialy  to  arrest  her,  but  we  don't  have  to  kill  her.")
        script.push("and  I  don't  think  we  should  continue  this  mission  anymore.")
        script.push("she  has  been  through  suffering  we  cannot  understand.")
        script.push("it  must  have  been  very  hard  for  her  to  live  like  that.")
        script.push("and  making  her  suffer  for  what  she  didn't  choose,  after  all  she's  been  through...")
        script.push("it's  just  unfair...")
        script.push("..............................")
        script.push("..............................")
        script.push(".....?")
        script.push("wh-?")
        script.push("!What did you just say?")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "krystyna";
        title.text = s;
        title.color = speakerStatus[s];


        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("flusselle")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("krystyna")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")

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

        // block for the shading of the camera
        const block = MeshBuilder.CreateBox("block", { width: 3, height: 50, depth: 0.1 });
        block.position = new Vector3(-0.5, 0.6, 0.15);
        const mat = new StandardMaterial("m");
        mat.alpha = 1.;
        mat.diffuseColor = new Color3(0, 0, 0);
        block.material = mat;
        this.engine.hideLoadingUI();

        const audioEngine = await CreateAudioEngineAsync();

        const se_message = await CreateSoundAsync("se_message",
            "./sounds/SEQ_SE_MESSAGE.wav"
        );
        se_message.volume = 0.2

        const na_message = await CreateSoundAsync("na_message",
            "./sounds/SE_Sys_MESS_POKE.wav"
        );

        na_message.volume = 0.3

        const su_message = await CreateSoundAsync("su_message",
            "./sounds/surprise_sound.mp3"
        );

        su_message.volume = 0.5

        const music = await CreateSoundAsync("music",
            "./sounds/music/Broken Moon.flac"
        );
        music.volume = 0.3
        music.loop = true;

        // Wait until audio engine is ready to play sounds.
        await audioEngine.unlockAsync();


        // Animation: alpha from 1 to 0 over 2 seconds
        const blockanim = new Animation(
            "fadeOut",
            "material.alpha",
            60, // FPS
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const blockkeys = [
            { frame: 0, value: 1 },   // Start fully opaque
            { frame: 120, value: 0 }  // End fully transparent
        ];
        const blockkeysSecond = [
            { frame: 0, value: 0 },   // Start fully opaque
            { frame: 60, value: 0.5 }  // End fully transparent
        ];

        blockanim.setKeys(blockkeys);

        // Attach animation to sphere
        block.animations.push(blockanim);

        const yesButton = GUI.Button.CreateImageButton("next", "", "./sprites/dialogButton.png");
        yesButton.width = "160px";
        yesButton.height = "40px";
        yesButton.thickness = 0;
        yesButton.color = "white";
        yesButton.paddingRight = "20px";
        //yesButton.onPointerUpObservable.add(() => {

        buttonPanel.addControl(yesButton);


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
            this.scene.beginAnimation(block, 0, 120, false, undefined, () => {
                dialogBox.isVisible = true;
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
                            this.nextScene();
                        },2000)
                    }
                    /*
                    else if (script_index == 19) {
                        dialogBox.isVisible = false;
                        music.play();
                        this.scene.beginAnimation(this.krystyna, 0, 120, false, undefined, (() => {
                            setTimeout(() => {
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                                this.flusselle.playAnimation(this.flusselle.cellIndex + 48, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                            }, 300)
                        }))
                    }*/

                    else if (script_index == 25) {
                        narator.color = "white";
                        narator.isVisible = false;
                        setTimeout(() => {
                            block.material!.alpha = 1;
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 1000);
                    }

                    else if (script_index == 26) {
                        sideCamera.position = new Vector3(-0.8, 0.05, 1.2)
                        narator.isVisible = false;
                        this.lyrina.playAnimation(88, 88, false, 100);
                        this.lyrina.position = new Vector3(-0.6, 0, 0)
                        this.flusselle.playAnimation(32, 32, false, 100);
                        this.krystyna.playAnimation(46, 46, false, 100);
                        setTimeout(() => {
                            block.material!.alpha = 0;
                            setTimeout(() => {
                                block.material!.alpha = 1;
                                this.lyrina.playAnimation(89, 89, false, 100);
                                this.lyrina.position = new Vector3(-0.65, 0, 0.1)
                                this.flusselle.playAnimation(40, 40, false, 100);
                                setTimeout(() => {
                                    block.material!.alpha = 0;
                                    setTimeout(() => {
                                        block.material!.alpha = 1;
                                        this.krystyna.playAnimation(56, 56, false, 100);
                                        this.krystyna.invertU = false;
                                        this.lyrina.position = new Vector3(-0.8, 0, 0)
                                        this.lyrina.playAnimation(90, 91, true, 150);
                                        this.flusselle.playAnimation(40, 47, true, 100);
                                        setTimeout(() => {
                                            block.material!.alpha = 0;
                                            setTimeout(() => {
                                                se_message.play();
                                                speaker_index++;
                                                s = speakers[speaker_index];
                                                title.color = speakerStatus[s];
                                                title.text = s;
                                                dialogBox.isVisible = true;
                                                this.typeWriter(message, script[script_index], 0);
                                                this.flusselle.playAnimation(this.flusselle.cellIndex + 16, 63, false, 100, () => { this.flusselle.playAnimation(56, 63, true, 100) });
                                            }, 2000)
                                        }, 500)
                                    }, 500)
                                }, 500)
                            }, 500)
                        }, 1000);
                    }
                    

                    else if (script_index == 35) {
                        narator.color = "white";
                        dialogBox.isVisible = false;
                        blockanim.setKeys(blockkeysSecond);
                        this.scene.beginAnimation(block, 0, 60, false, undefined, () => {
                            setTimeout(() => {
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 200)
                        });
                    }
                    
                    else if (script_index == 49) {
                        narator.isVisible = false;
                        setTimeout(() => {
                            block.material!.alpha = 1;
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 1000);
                    }
                    
                    else if (script_index == 51) {
                        narator.color = "rgb(0, 157, 255)";
                        narator.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            block.material!.alpha = 1;
                            narator.isVisible = true;
                            this.lyrina.playAnimation(92, 93, true, 150);
                            this.flusselle.position = new Vector3(-0.71, 0, 0)
                            this.flusselle.playAnimation(112, 113, true, 150);
                            this.krystyna.playAnimation(58, 58, false, 100);                        
                            sideCamera.position = new Vector3(-0.77, 0.05, 1.2);
                            this.typeWriter(narator, script[script_index], 0);
                        }, 4000);
                    }
                    
                    else if (script_index == 52) {
                        narator.color = "white";
                        narator.isVisible = false;   
                        setTimeout(() => {
                            block.material!.alpha = 0;
                            setTimeout(() => {
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                se_message.play();
                                this.typeWriter(message, script[script_index], 0);
                            }, 2000)
                        }, 500);
                    }
                    
                    else if (script_index == 63) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            this.flusselle.playAnimation(114, 115, true, 150);
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    
                    else if (script_index == 70) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            this.lyrina.playAnimation(94, 95, true, 150);
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    
                    else if (script_index == 71) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }

                    else if (script_index == 72) {
                        narator.isVisible = false;
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            block.material!.alpha = 1;
                            narator.isVisible = true;
                            this.naratorWriterSlow(narator, script[script_index], 1, na_message);
                        }, 1000);
                    }

                    else {
                        if (script_index == 2) {
                            this.krystyna.playAnimation(42, 43, true, 150);
                        }
                        if (script_index == 5) {
                            this.krystyna.playAnimation(44, 45, true, 150);
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 48, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                        }
                        if (script_index == 6) {
                            this.krystyna.playAnimation(42, 43, true, 150);
                        }
                        if (script_index == 8) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 8, 63, false, 100, () => { this.flusselle.playAnimation(56, 63, true, 100) });
                        }
                        if (script_index == 9) {
                            this.krystyna.playAnimation(44, 45, true, 150);
                        }
                        if (script_index == 11) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 16, 79, false, 100, () => { this.flusselle.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 12) {
                            this.krystyna.playAnimation(42, 43, true, 150);
                        }
                        if (script_index == 13) {
                            this.krystyna.playAnimation(40, 41, true, 150);
                        }
                        if (script_index == 14) {
                            this.krystyna.playAnimation(44, 45, true, 150);
                        }
                        if (script_index == 24) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 16, 23, false, 100, () => { this.lyrina.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 28) {
                            this.krystyna.playAnimation(57, 57, false, 100);
                        }

                        if (script[script_index].startsWith("!")) {
                            dialogBox.isVisible = false;
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
                            narator.isVisible = false;
                            this.typeWriter(message, script[script_index], 0);
                        }
                    }
                }
            }

        })
    }

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

    async naratorWriterSlow(narator: GUI.TextBlock, script: string, index: number, na: StaticSound): Promise<void> {
        if (index <= script.length) {
            narator.text += script.charAt(index);
            na.play();
            setTimeout(() => { this.naratorWriterSlow(narator, script, ++index, na) }, 60);
        }
        else {
            setTimeout(() => { this.canSkip = true; }, 100)
        }
    }
    
    async naratorWriterNoSound(narator: GUI.TextBlock, script: string, index: number): Promise<void> {
        if (index <= script.length) {
            narator.text += script.charAt(index);
            setTimeout(() => { this.naratorWriterNoSound(narator, script, ++index) }, 30);
        }
        else {
            setTimeout(() => { this.canSkip = true; }, 100)
        }
    }
    
    nextScene() {
        const next = new CH2_CU_OW_3(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        this.scene = next.scene;
    }
}