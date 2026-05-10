import { Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, CreateAudioEngineAsync, CreateSoundAsync, StaticSound, Animation } from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'

export class CH1_CU_UN_4 {


    scene: Scene;
    engine: Engine;

    lyrina: Sprite;
    flusselle: Sprite;
    arthur: Sprite;

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

        const AManager = new SpriteManager(
            'AManager',
            './sprites/cutscenes/moron-down.png',
            1,
            128,
            this.scene
        );

        AManager.texture = new Texture(
            "./sprites/cutscenes/moron-down.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        this.arthur = new Sprite('arthur', AManager)

        this.lyrina.size = 0.45;
        this.lyrina.position = new Vector3(0.0, 0, 0)
        this.lyrina.playAnimation(0, 7, true, 100);

        this.flusselle.size = 0.45;
        this.flusselle.position = new Vector3(-0.15, 0, 0)
        this.flusselle.playAnimation(0, 7, true, 100);

        this.arthur.size = 0.45;
        this.arthur.position = new Vector3(-0.7, -0.015, 0)
        this.arthur.playAnimation(0, 0, false, 10);
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
            "./sprites/place_holder_bnew.png",
            100,
            { width: 961, height: 550 },
            scene
        );
        const background = new Sprite("background", backgroundManager);
        background.position.z = -1;
        background.position.y = 1.1;
        background.width = 6;
        background.height = 3;
    }

    canSkip = false;

    async CreateDialog(): Promise<void> {

        const sideCamera = new FreeCamera("SideCamera", new Vector3(-0.35, 0.05, 1.2), this.scene);
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

        const speakerStatus: { [key: string]: string } = { "lyrina": "brown", "flusselle": "rgb(0, 157, 255)" };

        script.push("well,  that's  taken  care  of.")
        script.push("(can't  he  keep  a  tiny  bit  of  dignity  now  that  he's  on  the  ground?)")
        script.push("...")
        script.push("we  now  need  to  report  the  status  of  the  mission  to  the  guild.")
        script.push("Our  superiors  will  come  and  take  the  outlaw  to  the  court.")
        script.push("do  you  want  to  do  the  status  report  flusselle?")
        script.push("...")
        script.push("I...")
        script.push("I  don't...  know...")
        script.push("...")
        script.push("this  guy  needs  to  face   the  consequences  for  his  actions.")
        script.push("I  know  what  has  be  done.  I  know  it.")
        script.push("but...  I...")
        script.push("...")
        script.push("(another  attempt  in  the  dust...)")
        script.push("!'An AI with emotions.'")
        script.push("!Such a simple paradox is our wall to break.")
        script.push("!The AIs of our time are only able to mimick emotions in the sentences they pronounce.")
        script.push("!For our programs to progress, Raphaël and I had to instruct them in a specific way.")
        script.push("!During their learning, they are strictly forbidden to take any ethical decisions whatsoever.")
        script.push("!But by making them act and think in situations that entail these decisions...")
        script.push("!If they are unable to make a choice with instructions and ethics alone...")
        script.push("!We hope they can develop other instincts to help them make these decisions.")
        script.push("!Like feelings...")
        script.push("!If they manage to make these decisions, then we would know the emotions have overwritten the instructions.")
        script.push("!But this objective feels out of reach as we are right now.")
        script.push("(although  i  have  to  say...)")
        script.push("(we  are  definitely  not  helping  her  with  villains  like  that.)")
        script.push("...")
        script.push("don't  worry  flusselle.  i  will  take  care  of  the  report  myself.")
        script.push("th-thank  you  lyrina.")
        script.push("I  really  shouldn't  let  you  take  care  of  this  every  time.")
        script.push("are  you  sure  this  is  not  bothering  you?")
        script.push("...")
        script.push("no,  it's  not.")
        script.push("!I wonder who I am lying to right now.")
        script.push("!This job is a waste of time.")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "flusselle";
        title.text = s;
        title.color = speakerStatus[s];


        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
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
        block.position = new Vector3(0, 0.6, 0.15);
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
            "./sounds/music/Time Gear Remix.mp3"
        );
        music.volume = 0.
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
                        dialogBox.isVisible = false;
                        this.scene.beginAnimation(block, 120, 0, false, undefined, () => { block.material!.alpha = 1 });
                    }



                    else if (script_index == 15) {
                        narator.color = "white";
                        dialogBox.isVisible = false;
                        blockanim.setKeys(blockkeysSecond);
                        this.scene.beginAnimation(block, 0, 60, false, undefined, () => {
                            setTimeout(() => {
                                music.play();
                                this.fadeVolumeIn(music, 0.3);
                                narator.isVisible = true;
                                this.naratorWriter(narator, script[script_index], 1, na_message);
                            }, 200)
                        });
                    }


                    else if (script_index == 26) {
                        this.fadeVolumeOut(music);
                        narator.color = "black";
                        narator.isVisible = false;
                        this.scene.beginAnimation(block, 60, 0, false, undefined, () => {
                            block.material!.alpha = 0
                            //music.play();
                            setTimeout(() => {
                                dialogBox.isVisible = true; 
                                se_message.play();
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                narator.isVisible = false;
                                this.typeWriter(message, script[script_index], 0);
                            }, 200)
                        });
                    }


                    else if (script_index == 36) {
                        narator.color = "white";
                        narator.isVisible = false;
                        setTimeout( () => {
                            block.material!.alpha = 1;
                            narator.isVisible = true;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }, 1500);
                    }

                    else {
                        if (script_index == 1) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 56, 63, false, 100, () => { this.lyrina.playAnimation(56, 63, true, 100) });
                        }
                        if (script_index == 2) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + -40, 23, false, 100, () => { this.lyrina.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 3) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 16, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 5) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 8, 15, false, 100, () => { this.lyrina.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 6) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 72, 79, false, 100, () => { this.flusselle.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 8) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 8, 87, false, 100, () => { this.flusselle.playAnimation(80, 87, true, 100) });
                        }
                        if (script_index == 9) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 8, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 10) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 80, 7, false, 100, () => { this.flusselle.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 11) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 56, 63, false, 100, () => { this.flusselle.playAnimation(56, 63, true, 100) });
                        }
                        if (script_index == 12) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 16, 79, false, 100, () => { this.flusselle.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 14) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 16, 23, false, 100, () => { this.lyrina.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 27) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 40, 63, false, 100, () => { this.lyrina.playAnimation(56, 63, true, 100) });
                        }
                        if (script_index == 28) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + -40, 23, false, 100, () => { this.lyrina.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 29) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 8, 15, false, 100, () => { this.lyrina.playAnimation(8, 15, true, 100) });
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 24, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                        }
                        if (script_index == 30) {
                            this.flusselle.invertU = true;
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 40, 15, false, 100, () => { this.flusselle.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 31) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 8, 23, false, 100, () => { this.flusselle.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 32) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 8, 15, false, 100, () => { this.flusselle.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 33) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 8, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 34) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 24, 31, false, 100, () => { this.lyrina.playAnimation(24, 31, true, 100) });
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

    async fadeVolumeIn(music: StaticSound, target: number): Promise<void> {
        const height = music.volume;
        if(height <= target) {
            music.setVolume(height+0.01);
            setTimeout(() => { this.fadeVolumeIn(music, target) }, 30);
        }
    }


    async fadeVolumeOut(music: StaticSound): Promise<void> {
        const height = music.volume;
        if(height >= 0) {
            music.setVolume(height-0.01);
            setTimeout(() => { this.fadeVolumeOut(music) }, 30);
        }
        else {
            music.stop();
        }
    }
}