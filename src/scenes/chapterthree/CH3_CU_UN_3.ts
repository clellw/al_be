import { Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, CreateAudioEngineAsync, CreateSoundAsync, StaticSound, Animation, Color4 } from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'

export class CH3_CU_UN_3 {


    scene: Scene;
    engine: Engine;

    lyrina: Sprite;
    flusselle: Sprite;
    mitsuki: Sprite;

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
            './sprites/cutscenes/mi-c.png',
            1,
            128,
            this.scene
        );

        KManager.texture = new Texture(
            "./sprites/cutscenes/mi-c.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        this.mitsuki = new Sprite('mitsuki', KManager)


        this.lyrina.size = 0.45;
        this.lyrina.position = new Vector3(-0.15, 0, 0)
        this.lyrina.playAnimation(0, 7, true, 100);


        this.flusselle.size = 0.45;
        this.flusselle.position = new Vector3(0, 0, 0)
        this.flusselle.playAnimation(0, 7, true, 100);

        this.mitsuki.size = 0.45;
        this.mitsuki.position = new Vector3(0.8, 0, 0)
        this.mitsuki.playAnimation(0, 7, true, 100);
        this.mitsuki.invertU = false;
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
            "./sprites/dirt_m.png",
            100,           // max number of sprites
            96,
            scene
        );
        spriteManager.texture = new Texture(
            "./sprites/dirt_m.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );

        const spriteManager2 = new SpriteManager(
            "tilesManager",
            "./sprites/mud_m.png",
            200,           // max number of sprites
            96,
            scene
        );
        spriteManager2.texture = new Texture(
            "./sprites/mud_m.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
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
            { width: 626, height: 351 },
            scene
        );
        backgroundManager.texture = new Texture(
            "./sprites/background_stage_3.jpg",
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

        const sideCamera = new FreeCamera("SideCamera", new Vector3(-0.3, 0.05, 1.2), this.scene);
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

        const speakerStatus: { [key: string]: string } = { "lyrina": "brown", "flusselle": "rgb(0, 157, 255)", "???": "pink", "mitsuki": "pink" };

        script.push("we  have  been  walking  for  a  long  time...")
        script.push("but  still  nothing,  I'm  afraid.")
        script.push("Let's  not  get  our  hype  down.  I  know  we  will  find  their  chief.")
        script.push("and  since  we  are  together,  nothing  can  stop  us!")
        script.push("...")
        script.push("(I  don't  get  it...  how  is  it  possible...?)")
        script.push("(we  didn't  make  any  progress  in  a  whole  year  of  working  nonstop.)")
        script.push("(so  why  do  I  feel  like  i'm  speaking  with...)")
        script.push("so  we  finally  meet.")
        script.push("I  can  hardly  contain  my  exitment  to  finally  get  to  know  you  both.")
        script.push("my  name  is  mitsuki.  i  am  the  person  in  charge  of  the  revolutionary  union.")
        script.push("(B348T1-M00N?  why  now  of  all  possible  timings?)")
        script.push("!B348T1-M00N, or Mitsuki.")
        script.push("!In chronological order, this is the model directly before Flusselle.")
        script.push("!She was the most promissing one of all, but she ended up not progressing anymore after a while.")
        script.push("!She's the very honest, calm and outgoing archetype.")
        script.push("my  name  is  flusselle,  member  of  a  guild  working  for  the  kingdom's  peace.")
        script.push("mitsuki,  leader  of  the  revolutionary  union...")
        script.push("you  are  under  arrest  for  plotting  against  the  crown  and  conspiracy!")
        script.push("(flusselle...)")
        script.push("...")
        script.push("...ahahahah!")
        script.push("pardon  me.  i  am  not  trying  to  make  fun  of  you.")
        script.push("I  can  see  you  are  good  persons,  acting  for  your  definition  of  reality.")
        script.push("fear  not,  I  do  not  have  any  hostility  towards  the  two  of  you.")
        script.push("in  fact,  in  the  time  being,  my  first  thought  in  mind  is  to  know  more  about  you.")
        script.push("what?  why  would  you  want  to  know  more  about  us?")
        script.push("every  encounter  is  the  opportunity  to  uncover  new  horizons.")
        script.push("the  situation  at  hand  puts  us  on  opposing  sides...")
        script.push("but  in  a  different  context,  we  may  have  been  able  to  create  something  bright  and  shinning.")
        script.push("if  i  grew  up  in  your  place  or  vice  versa,  the  story  would  have  been  different.")
        script.push("I  see  what  you  are  trying  to  say.")
        script.push("and  for  me  too,  you  seem  like  a  good  person,  mitsuki!")
        script.push("thank  you  very  much!  i'm  really  happy  you  understand  my  opinion!")
        script.push("but  i  must  ask  you  a  question.")
        script.push("we  may  be  able  to  get  in  good  spirits  as  individuals.")
        script.push("but  at  the  forefront  of  my  mind,  i  am  the  head  of  a  group  of  persons  important  to  me.")
        script.push("and  you  act  for  your  own  ideals,  doing  what  you  think  is  right.")
        script.push("even  though  we  may  not  want  to  fight,  our  positions  are  set  and  nothing  can  change  them.")
        script.push("so  do  you  want  to  oppose  me  resistance,  like  you  have  been  assigned  to?")
        script.push("...")
        script.push("uh...  I...")
        script.push("(this  is  not  a  bad  idea  for  a  final  test.)")
        script.push("(i  guess  raphael  wants  her  to  refuse  to  fight  mitsuki,  like  she  didn't  want  krystyna  to  be  hurt.)")
        script.push("...")
        script.push("I...")
        script.push("I  am  sorry,  mitsuki.")
        script.push("you  are  not  a  bad  person,  i  can  sense  it.")
        script.push("but  as  i  see  it,  your  revolution  will  bring  desolation  and  sadness  to  this  country.")
        script.push("and  i  cannot  let  that  happen!")
        script.push("(...)")
        script.push("(...eheh.)")
        script.push("(ahahahahah!)")
        script.push("(what  was  i  thinking?  of  course  she  would  fail!)")
        script.push("(i  must  have  hit  my  head  on  a  wall  along  the  way.)")
        script.push("(an  AI  with  emotions?  really  now?  what  was  i-)")
        script.push("(wait...)")
        script.push("(did  she  just  make  a  choice  by  herself?)")
        script.push("(without  my  assistance!?)")
        script.push("i  understand.  you  don't  have  to  apologize  for  anything.")
        script.push("i  should  be  the  one  making  excuses,  for  trying  to  influence  you  when  i  already  made  up  my  mind.")
        script.push("so  be  it.")
        script.push("i  will  not  fail  the  trust  others  have  in  me.")
        script.push("for  i  am  their  leader,  and  the  one  who  will  change  this  country  for  the  better!")
        script.push("lyrina,  with  me!")
        script.push("y-yes!")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "flusselle";
        title.text = s;
        title.color = speakerStatus[s];


        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("???")
        speakers.push("???")
        speakers.push("mitsuki")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("flusselle")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
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
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("flusselle")
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
        narator.color = "black";
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
        const blockkeysSecond = [
            { frame: 0, value: 0 },   // Start fully opaque
            { frame: 60, value: 0.5 }  // End fully transparent
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
            { frame: 0, value: new Vector3(-0.3, 0.05, 1.2) }, // Start position
            //{ frame: 60, value: new Vector3(10, 5, 0) }, // Mid position
            { frame: 60, value: new Vector3(0.3, 0.05, 1.2) } // End position
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
                        blockanim.setKeys(blockkeys);
                        this.scene.beginAnimation(block, 120, 0, false, undefined, () => { block.material!.alpha = 1 });
                    }

                    /*else if (script_index == 19) {
                        dialogBox.isVisible = false;
                        music.play();
                        
                            setTimeout(() => {
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                                this.flusselle.playAnimation(this.flusselle.cellIndex + 48, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                            }, 300)
                    }*/
                   
                    else if (script_index == 34) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();                            
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex - 8, 23, false, 100, () => { this.mitsuki.playAnimation(16, 23, true, 100) });
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 24, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }
                    else if (script_index == 46) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();                            
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 16, 63, false, 100, () => { this.flusselle.playAnimation(56, 63, true, 100) });
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 50) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            blockanim.setKeys(blockkeysSecond);
                            this.scene.beginAnimation(block, 0, 60, false, undefined, () => {
                                setTimeout(() => {
                                    this.lyrina.playAnimation(this.lyrina.cellIndex - 88, 15, false, 100, () => { this.lyrina.playAnimation(8, 15, true, 100) });
                                    se_message.play();                            
                                    speaker_index++;
                                    s = speakers[speaker_index];
                                    title.color = speakerStatus[s];
                                    title.text = s;
                                    dialogBox.isVisible = true;
                                    this.typeWriter(message, script[script_index], 0);
                                }, 500)
                            });
                        }, 1000);
                    }

                    else if (script_index == 56) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {                 
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 24, 55, false, 100, () => { this.lyrina.playAnimation(48, 55, true, 100) });
                            this.scene.beginAnimation(block, 60, 0, false, undefined, () => {
                                block.material!.alpha = 0;
                                setTimeout(() => {
                                    se_message.play();                            
                                    speaker_index++;
                                    s = speakers[speaker_index];
                                    title.color = speakerStatus[s];
                                    title.text = s;
                                    dialogBox.isVisible = true;
                                    this.typeWriter(message, script[script_index], 0);
                                }, 500)
                            });
                        }, 1000);
                    }
                    
                    else if (script_index == 61) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex + 16, 39, false, 100, () => { this.mitsuki.playAnimation(32, 39, true, 100) });
                            se_message.play();                            
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else {
                        if (script_index == 2) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 8, 15, false, 100, () => { this.flusselle.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 3) {                            
                            this.lyrina.invertU = true;
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 96, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 16, 31, false, 100, () => { this.flusselle.playAnimation(24, 31, true, 100) });
                        }
                        if (script_index == 5) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 24, 79, false, 100, () => { this.lyrina.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 8) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 24, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 72, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 9) {
                            this.scene.beginAnimation(sideCamera, 0, 60, false, undefined);
                            this.flusselle.invertU = true;
                        }
                        if (script_index == 10) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 48, 7, false, 100, () => { this.flusselle.playAnimation(0, 7, true, 100) });
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 96, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                        }
                        if (script_index == 15) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 96, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 18) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 96, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                        }
                        if (script_index == 19) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 24, 79, false, 100, () => { this.lyrina.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 20) {
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex + 16, 23, false, 100, () => { this.mitsuki.playAnimation(16, 23, true, 100) });
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 72, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 21) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 96, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 48, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex + 8, 31, false, 100, () => { this.mitsuki.playAnimation(24, 31, true, 100) });
                        }
                        if (script_index == 22) {
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex - 16, 15, false, 100, () => { this.mitsuki.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 26) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 8, 47, false, 100, () => { this.flusselle.playAnimation(40, 47, true, 100) });
                        }
                        if (script_index == 27) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 96, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex + 8, 23, false, 100, () => { this.mitsuki.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 28) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 8, 55, false, 100, () => { this.flusselle.playAnimation(48, 55, true, 100) });
                        }
                        if (script_index == 29) {                            
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex - 8, 15, false, 100, () => { this.mitsuki.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 31) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 40, 15, false, 100, () => { this.flusselle.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 32) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 16, 31, false, 100, () => { this.flusselle.playAnimation(24, 31, true, 100) });
                        }
                        if (script_index == 33) {
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex + 16, 31, false, 100, () => { this.mitsuki.playAnimation(24, 31, true, 100) });
                        }
                        if (script_index == 36) {
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex - 16, 7, false, 100, () => { this.mitsuki.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 41) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 24, 79, false, 100, () => { this.flusselle.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 47) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 96, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                        }
                        if (script_index == 48) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 56, 7, false, 100, () => { this.flusselle.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 51) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 24, 39, false, 100, () => { this.lyrina.playAnimation(32, 39, true, 100) });
                        }
                        if (script_index == 52) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 8, 47, false, 100, () => { this.lyrina.playAnimation(40, 47, true, 100) });
                        }
                        if (script_index == 53) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 32, 15, false, 100, () => { this.lyrina.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 54) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 16, 31, false, 100, () => { this.lyrina.playAnimation(24, 31, true, 100) });
                        }
                        if (script_index == 57) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 48, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                        }
                        if (script_index == 59) {
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex + 16, 23, false, 100, () => { this.mitsuki.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 62) {
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex + 8, 47, false, 100, () => { this.mitsuki.playAnimation(40, 47, true, 100) });
                        }
                        if (script_index == 63) {
                            this.mitsuki.playAnimation(this.mitsuki.cellIndex + 8, 55, false, 100, () => { this.mitsuki.playAnimation(48, 55, true, 100) });
                        }
                        if (script_index == 64) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 104, 111, false, 100, () => { this.flusselle.playAnimation(104, 111, true, 100) });
                        }
                        if (script_index == 65) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 16, 87, false, 100, () => { this.lyrina.playAnimation(80, 87, true, 100) });
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