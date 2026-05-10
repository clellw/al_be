import { Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, CreateAudioEngineAsync, CreateSoundAsync, StaticSound, Animation, Color4 } from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'

export class CH2_CU_UN_3 {


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
        this.krystyna.color = new Color4(0, 0, 0, 1);


        this.lyrina.size = 0.45;
        this.lyrina.position = new Vector3(0.0, 0, 0)
        this.lyrina.playAnimation(0, 7, true, 100);


        this.flusselle.size = 0.45;
        this.flusselle.position = new Vector3(-0.15, 0, 0)
        this.flusselle.playAnimation(0, 7, true, 100);

        this.krystyna.size = 0.45;
        this.krystyna.position = new Vector3(-1.1, 0, 0)
        this.krystyna.playAnimation(0, 7, true, 100);
        const animation = new Animation(
            "fadeInColor",
            "color",
            60,
            Animation.ANIMATIONTYPE_COLOR4,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0, value: new Color4(0, 0, 0, 1) }, // noir
            { frame: 60, value: new Color4(1, 1, 1, 1) } // normal
        ];

        animation.setKeys(keys);

        this.krystyna.animations = [animation];
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
        background.width = 5;
        background.height = 2;
    }


    canSkip = false;

    async CreateDialog(): Promise<void> {

        const sideCamera = new FreeCamera("SideCamera", new Vector3(0, 0.05, 1.2), this.scene);
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

        const speakerStatus: { [key: string]: string } = { "lyrina": "brown", "flusselle": "rgb(0, 157, 255)", "???": "red", "blk.chrysanthemum": "red" };

        script.push("the  leader  should  be  around  this  area.")
        script.push("(I  want  to  get  this  over  with  fast,  but...)")
        script.push("...")
        script.push("flusselle,  why  are  you  so  silent?")
        script.push("oh,  sorry!  this  is  unlike  me.")
        script.push("but  we  have  next  to  no  information  about  the  leader,  and...")
        script.push("I  don't  know  if  I  will  be  strong  enough  to  defeat  him.")
        script.push("(where's  that  coming  from?  is  this  what  raphael  thought  was  interesting  this  time?)")
        script.push("(you  are  not  making  my  plan  easier,  S1-F3.)")
        script.push("don't  worry,  we  are  together  so  this  will  be  fine.")
        script.push("lyrina...  thank  yo-")
        script.push("oh  my!  what  an  inspiring  duo  I'm  witnessing!")
        script.push("who's  there?")
        script.push("you  must  know  me,  or  rather,  you  want  to  figure  out  who  i  am.")
        script.push("I'm  flattered  for  your  interest  in  me.  I  hope  we  will  only  continue  onward  from  there.")
        script.push("stop  this  nonsense  of  a  monologue  and  state  your  name!")
        script.push("since  you  want  to  know  it,  I  must  oblige  to  your  request.")
        script.push("I  am  very  proud  to  present  my  name  to  thy  both  who  came  here.")
        script.push("you  are  getting  the  dearest  salutations  of  the  famous  thief...")
        script.push("the  black  chrysanthemum!")
        script.push("black...  chrysanthemum?")
        script.push("(that's...  kind  of  a  cool  name!)")
        script.push("(that's  such  a  stupid  name...)")
        script.push("(But  I  recognize  her...)")
        script.push("(KR1-ST1.)")
        script.push("!This is a program we developed before S1-F3.")
        script.push("!We often make them interact with the newer programs to not waste them.")
        script.push("!And since they could have little brims of feelings from their learning, they could be useful to the new programs.")
        script.push("!This one's name was Krystyna, and she's one of the first we developed.")
        script.push("!She was the most energetic and happy of all.")
        script.push("!It made me very sad when we had to stop her learning, since she wasn't improving anymore.")
        script.push("!Sad, but also betrayed.")
        script.push("(I  don't  know  why  raphael  made  her  a  magical  girl  thief.)")
        script.push("I  think  I  know  the  reason  you're  here.")
        script.push("My  own  actions  must  have  brought  the  hammer  of  judgement  over  my  head.")
        script.push("(yup.  still  the  same  as  always.)")
        script.push("right  now  this  isn't  about  judgement,  but  about  your  arrest.")
        script.push("you  cannot  escape  us,  so  follow  us  without  any  resistance.")
        script.push("oh,  I'm  happy  you  got  your  confidence  back!")
        script.push("you  were  struggling  to  find  motivation  just  before.  I  was  sad  just  watching  you!")
        script.push("she's  got  a  real  sense  of  repartie.")
        script.push("do  not  forget  which  side  you  are  on,  lyrina.  stay  focused.")
        script.push("(she's  right.  I  want  to  finnish  this  quick.)")
        script.push("Awww.  do  we  really  have  to  do  this?  you  are  both  so  kind  and  cute!")
        script.push("If  it  cannot  be  avoided,  then  let  me  show  you  the  extend  of  my  strength!")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "lyrina";
        title.text = s;
        title.color = speakerStatus[s];


        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("???")
        speakers.push("flusselle")
        speakers.push("???")
        speakers.push("???")
        speakers.push("lyrina")
        speakers.push("???")
        speakers.push("???")
        speakers.push("???")
        speakers.push("blk.chrysanthemum")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("blk.chrysanthemum")
        speakers.push("blk.chrysanthemum")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("blk.chrysanthemum")
        speakers.push("blk.chrysanthemum")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("blk.chrysanthemum")
        speakers.push("blk.chrysanthemum")

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

        blockanim.setKeys(blockkeys);

        // Attach animation to sphere
        block.animations.push(blockanim);

        const camanim = new Animation(
            "cameraMove",
            "position", // Property to animate
            60, // FPS
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        // Define keyframes
        const camkeys = [
            { frame: 0, value: new Vector3(0, 0.05, 1.2) }, // Start position
            //{ frame: 60, value: new Vector3(10, 5, 0) }, // Mid position
            { frame: 60, value: new Vector3(-0.5, 0.05, 1.2) } // End position
        ];

        camanim.setKeys(camkeys);

        // Attach animation to camera
        sideCamera.animations.push(camanim);

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
                    }

                    else {
                        if (script_index == 3) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 48, 55, false, 100, () => { this.lyrina.playAnimation(48, 55, true, 100) });
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 48, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                        }
                        if (script_index == 4) {
                            this.flusselle.invertU = true;
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 32, 23, false, 100, () => { this.flusselle.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 5) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 48, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 32, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                        }
                        if (script_index == 6) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 24, 79, false, 100, () => { this.flusselle.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 7) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 48, 55, false, 100, () => { this.lyrina.playAnimation(48, 55, true, 100) });
                        }
                        if (script_index == 8) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 32, 23, false, 100, () => { this.lyrina.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 9) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 24, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 8, 15, false, 100, () => { this.lyrina.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 10) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 40, 15, false, 100, () => { this.flusselle.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 11) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 8, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 40, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                        }
                        if (script_index == 12) {
                            this.flusselle.invertU = false;
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 48, 7, false, 100, () => { this.flusselle.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 13) {
                            this.scene.beginAnimation(sideCamera, 0, 60, false, undefined);
                        }
                        if (script_index == 14) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 56, 63, false, 100, () => { this.lyrina.playAnimation(56, 63, true, 100) });
                        }
                        if (script_index == 15) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 16, 23, false, 100, () => { this.flusselle.playAnimation(16, 23, true, 100) });
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 8, 71, false, 100, () => { this.lyrina.playAnimation(64, 71, true, 100) });
                        }
                        if (script_index == 16) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 16, 7, false, 100, () => { this.flusselle.playAnimation(0, 7, true, 100) });
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 64, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 18) {
                            this.krystyna.invertU = true;
                            this.krystyna.playAnimation(48, 48, false, 100);
                        }
                        if(script_index == 20) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 16, 39, false, 100, () => { this.flusselle.playAnimation(32, 39, true, 100) });
                        }
                        if(script_index == 21) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 16, 23, false, 100, () => { this.flusselle.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 22) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 56, 63, false, 100, () => { this.lyrina.playAnimation(56, 63, true, 100) });
                        }
                        if (script_index == 23) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 56, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                            this.krystyna.playAnimation(0, 7, true, 100);
                        }
                        if (script_index == 34) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 16, 7, false, 100, () => { this.flusselle.playAnimation(0, 7, true, 100) });
                            this.krystyna.playAnimation(this.krystyna.cellIndex + 8, 15, false, 100, () => { this.krystyna.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 35) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 24, 31, false, 100, () => { this.lyrina.playAnimation(24, 31, true, 100) });
                        }
                        if (script_index == 36) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 24, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 38) {
                            this.krystyna.playAnimation(this.krystyna.cellIndex + 8, 23, false, 100, () => { this.krystyna.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 39) {
                            this.krystyna.playAnimation(this.krystyna.cellIndex - 16, 7, false, 100, () => { this.krystyna.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 40) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 8, 15, false, 100, () => { this.lyrina.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 41) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 104, 111, false, 100, () => { this.flusselle.playAnimation(104, 111, true, 100) });
                        }
                        if (script_index == 42) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 72, 87, false, 100, () => { this.lyrina.playAnimation(80, 87, true, 100) });
                        }
                        if (script_index == 43) {
                            this.krystyna.playAnimation(this.krystyna.cellIndex + 24, 31, false, 100, () => { this.krystyna.playAnimation(24, 31, true, 100) });
                        }
                        if (script_index == 44) {
                            this.krystyna.playAnimation(this.krystyna.cellIndex + 8, 39, false, 100, () => { this.krystyna.playAnimation(32, 39, true, 100) });
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
}