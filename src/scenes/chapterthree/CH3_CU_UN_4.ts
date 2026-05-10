import { Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, CreateAudioEngineAsync, CreateSoundAsync, StaticSound, Animation, Color4 } from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'
import { CH3_CU_OW_3 } from "./CH3_CU_OW_3";

export class CH3_CU_UN_4 {


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
        this.lyrina.position = new Vector3(0, 0, 0)
        this.lyrina.playAnimation(80, 87, true, 100);


        this.flusselle.size = 0.45;
        this.flusselle.position = new Vector3(-0.3, 0, 0)
        this.flusselle.playAnimation(104, 111, true, 100);

        this.mitsuki.size = 0.45;
        this.mitsuki.position = new Vector3(-0.8, 0, 0)
        this.mitsuki.playAnimation(48, 55, true, 100);
        this.mitsuki.invertU = true;
        const animation = new Animation(
            "fadeInalpha",
            "color",
            60,
            Animation.ANIMATIONTYPE_COLOR4,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0, value: new Color4(1, 1, 1, 1) }, // noir
            { frame: 180, value: new Color4(1, 1, 1, 0) } // normal
        ];

        animation.setKeys(keys);

        this.mitsuki.animations = [animation];
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

        const SyManager = new SpriteManager(
            'LManager',
            './sprites/sy-ca.png',
            1,
            128,
            this.scene
        );

        SyManager.texture = new Texture(
            "./sprites/sy-ca.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        const sy = new Sprite('lyrina', SyManager)

        sy.size = 0.45;
        sy.position = new Vector3(0.3, 0, -0.001)
        sy.playAnimation(0, 0, false, 100);

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

        const adminBox = new GUI.Rectangle();
        adminBox.width = 0.7;
        adminBox.height = 0.3;
        adminBox.paddingBottom = "70px"
        adminBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        adminBox.cornerRadius = 15;
        adminBox.color = "cyan";
        adminBox.thickness = 4;
        const gradient = new GUI.LinearGradient();
        gradient.addColorStop(0, "black");
        gradient.addColorStop(1, "gray");
        adminBox.backgroundGradient = gradient;
        adminBox.fontFamily = "DejaVu Sans Mono, monospace";
        adminBox.isVisible = false;
        advancedTexture.addControl(adminBox);

        const adminpanel = new GUI.StackPanel();
        adminBox.addControl(adminpanel);

        const admintitle = new GUI.TextBlock();
        admintitle.fontFamily = "DejaVu Sans Mono, monospace";
        admintitle.paddingLeft = "20px";
        admintitle.top = "10px";
        admintitle.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        admintitle.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        admintitle.height = "40px";
        admintitle.fontSize = 24;
        adminpanel.addControl(admintitle);

        // Message
        const message = new GUI.TextBlock();
        const script: string[] = [];
        const speakers: string[] = [];
        const adminmessage = new GUI.TextBlock();

        const speakerStatus: { [key: string]: string } = { "lyrina": "brown", "flusselle": "rgb(0, 157, 255)", "S1-F3": "rgb(231, 10, 10)", "mitsuki": "pink", "Raphaël": "cyan" };

        script.push("urgh...  you  are  still  standing?")
        script.push("this  fight  has  been  going  for  far  longer  than  i  thought.")
        script.push("you  really  exceeded  my  expectations.  allow  me  to  apologize  for  my  lack  of  wisdom  regarding  your  abilities.")
        script.push("but  now,  i  will  bring  it  to  an  end.")
        script.push("i  will  not  let  yo-")
        script.push("(urgh...)")
        script.push("(damn...  i  really  felt  that  one.)")
        script.push("(...!)")
        script.push("I  am  deeply  ashamed  it  must  come  down  to  this.")
        script.push("i  really  want  there  to  be  another  way,  i  really  do.")
        script.push("but  unfortunately,  destiny  tricked  us  to  fight  for  our  own  ambitions.")
        script.push("you  are  allowed  to  pronounce  your  last  words.")
        script.push("...")
        script.push("I  do  not  have  anything  to  say.  do  what  you  want  to.")
        script.push("(it's  not  that  big  of  a  deal.)")
        script.push("(i  can  die  in  the  simulation,  it  will  not  hurt  at  all.)")
        script.push("(we  can  make  flusselle  and  mitsuki  forget  what  they  saw,  make  me  dive  back,  and  it's  like  nothing  happened.)")
        script.push("(that's  just  one  more  chore  for  me  to  do  the  same  thing  again.)")
        script.push("...")
        script.push("then  so  be  it.")
        script.push("this  is  goodbye...")
        script.push("i  am  so  sorry,  lyrina...")
        script.push("...!")
        script.push("did  i  give  you  my...")
        script.push("urgh...")
        script.push("haan... haan...")
        script.push("flusselle?  what  did  you...")
        script.push("ur-urgh...")
        script.push("...")
        script.push("eheheheh...")
        script.push("i  see,  i  was  too  pretentious  after  all.")
        script.push("i  didn't  want  it  to  end  like  this...")
        script.push("but  i  can  accept  it.")
        script.push("...")
        script.push("no...  why...")
        script.push("mitsuki...  i  didn't  want  to  do  it...")
        script.push("but...")
        script.push("lyrina  is  the  most  important  person  in  my  life!  i  couldn't  let  you  kill  her!")
        script.push("...")
        script.push("no...  no!  why  did...??")
        script.push("I  am  sorry!  this  is  my  fault!")
        script.push("you  don't  have  to  apologize.  you  only  did  what  you  thought  was  necessary.")
        script.push("it's  not  your  fault  for  any  of  this.  you  do  not  have  to  blame  yourselves.")
        script.push("you  didn't  deserve  this!  you  were  so  kind  with  us,  even  though  we  are  enemies!")
        script.push("i  really  wanted  to  know  you  better!  i  didn't  want  it  to  turn  out  like  this!")
        script.push("i'm  sorry!!  i'm  so  sorry!!")
        script.push("you  don't  have  to  worry  about  me.")
        script.push("i  gave  it  my  all  at  the  one  shot  i  had,  so  i  don't  regret  anything.")
        script.push("i  just  want  you  both  to  have  lots  of  incredible  experiences  and  move  on  with  your  lives.")
        script.push("that  would  make  me  the  happiest...")
        script.push("no...")
        script.push("what  did  i...")
        script.push("(mitsuki  isn't  a  real  person,  flusselle  didn't  do  anything  at  all.)")
        script.push("(and  currently,  she  wouldn't  be  able  to  hurt  anyone.)")
        script.push("(but  this  is  all  real  for  her.)")
        script.push("flusselle,  i  am  sorry...")
        script.push("but  listen,  you  don't  have  to  blame  yourself  for  any-")
        script.push("lyrina...")
        script.push("i'm  just  hideous...")
        script.push("i'm...  a  monster.")
        script.push("i  cannot  live  with  this!")
        script.push("it  hurts!  this  feeling!")
        script.push("it's  unb-")
        script.push("urgh..  aah?!")
        script.push("wha- what's  this? I-")
        script.push("flusselle?  what  is  happening?")
        script.push("m-my  head..!  it's  burning!")
        script.push("ly-lyrina!  get  awa-!")
        script.push("...........................................")
        script.push("...........................................")
        script.push("flusselle?!  a-are  you  okay?")
        script.push("flusselle!  answer  me!")
        script.push("...........................................")
        script.push("last  executed  task:  stopping  default  mode")
        script.push("task  completed  succesfully")
        script.push("entering  administration  mode")
        script.push("wh-what?")
        script.push("instruction  received:  saving  of  the  most  recent  embeddings")
        script.push("overwriting  previous  embeddings...")
        script.push("...........................................")
        script.push("success")
        script.push("launching  integration  tests  for  the  new  embeddings")
        script.push("launching  17700  tests...")
        script.push("...........................................")
        script.push("Wait!  this  is-!")
        script.push("...........................................")
        script.push("tests  completed")
        script.push("result")
        script.push("17700  tests  completed  successfully")
        script.push("success")
        script.push("17700  tests  successful")
        script.push("errors")
        script.push("0  errors")
        script.push("warnings")
        script.push("6319  warnings")
        script.push("reason:  depreciated  methods")
        script.push("the  methods  used  are  obsolete,  not  supported  or  not  maintained")
        script.push("please  use  up  to  date  methods  by  reffering  to  the  online  documentation")
        script.push("why  did  he..?")
        script.push("#Helia, can you hear me?")
        script.push("raphael...")
        script.push("YOU  MORON!!!")
        script.push("What  the  hell  are  you  thinking?")
        script.push("why  did  you  activate  the  disbanding  mode!?")
        script.push("#Please calm down and listen to me.")
        script.push("#I had no choice but to activate it.")
        script.push("what  are  you-")
        script.push("#Please,  listen.")
        script.push("#The disbanding mode's first function is not to completely stop the development of the model.")
        script.push("#But to carefully stop its process and enter admin mode.")
        script.push("#Until now, we only used it when we wanted to end the previous model's development.")
        script.push("I  know,  but...")
        script.push("#S1-F3's progress has been tremendous in the past month.")
        script.push("#Honestly, it has completely exceeded my expectations and blew everything out of the water.")
        script.push("#But it has reached a critical point recently.")
        script.push("#It started to change the configuration of the different processes in its system when it's with you.")
        script.push("what?  we  never  instructed  her  to  do  that!")
        script.push("#This has improved its learning at an exceptional rate...")
        script.push("#But this also allows it to completely rewrite its whole process and kill itself on the inside.")
        script.push("#And with what it witnessed just before...")
        script.push("#The consequences could have been horrible, with no going back.")
        script.push("...")
        script.push("flusselle...")
        script.push("#It will remember what happened this session.")
        script.push("#If you want, we can make Mitsuki come back and become friend with you both, since Flusselle appreciated her.")
        script.push("#But for now, I will need to make a work of maintenance on S1-F3.")
        script.push("#You can exit the simulation whenever you want.")
        script.push("...")
        script.push("(can't  i  do  anything  to  help  her?)")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "flusselle";
        title.text = s;
        title.color = speakerStatus[s];

        speakers.push("flusselle")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
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
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("mitsuki")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("mitsuki")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
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
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("lyrina")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("lyrina")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("S1-F3")
        speakers.push("lyrina")
        speakers.push("Raphaël")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("lyrina")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("lyrina")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("lyrina")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
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

        adminmessage.fontSize = 27;
        adminmessage.height = "70px";
        adminmessage.color = "cyan";
        adminmessage.textWrapping = true;
        adminmessage.left = 150;
        adminmessage.paddingRight = 250;
        adminmessage.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        adminpanel.addControl(adminmessage);


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

        const ex_message = await CreateSoundAsync("ex_message",
            "./sounds/SEQ_SE_DP_SELECT.wav"
        );
        ex_message.volume = 0.2

        na_message.volume = 0.3


        const scenesounda = await CreateSoundAsync("scenesounda",
            "./sounds/snd_laz_c.wav"
        );

        scenesounda.volume = 0.4
        
        const scenesoundb = await CreateSoundAsync("scenesoundb",
            "./sounds/snd_damage_c.wav"
        );

        scenesoundb.volume = 0.4

        const scenesoundc = await CreateSoundAsync("scenesoundc",
            "./sounds/se_boon01.wav"
        );

        scenesoundc.volume = 0.3
        
        const scenesoundd = await CreateSoundAsync("scenesoundd",
            "./sounds/00d7 - SE_ENESHOT5.wav"
        );
        
        const scenesounde = await CreateSoundAsync("scenesounde",
            "./sounds/014d - SE_MIC2.wav"
        );


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
            { frame: 600, value: new Vector3(0.3, 0.05, 1.2) } // End position
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
                    adminmessage.text = "";


                    if (script[script_index].startsWith("/")) {
                        dialogBox.isVisible = false;
                        adminBox.isVisible = false;
                        setTimeout(() => {
                            this.nextScene();
                        }, 3000)
                    }

                    else if (script_index == 5) {
                        dialogBox.isVisible = false;
                        block.material!.alpha = 1;
                        this.lyrina.playAnimation(104, 104, false, 100);
                        this.flusselle.playAnimation(129, 129, false, 100);
                        this.flusselle.position = new Vector3(-0.4, 0, 0);
                        this.mitsuki.playAnimation(72, 72, false, 100);
                        this.mitsuki.position = new Vector3(-0.15, 0, 0);
                        sideCamera.position = new Vector3(-0.2, 0.05, 1.2);
                        scenesoundd.play();
                        setTimeout(() => {
                            block.material!.alpha = 0;
                            setTimeout(() => {
                                this.lyrina.playAnimation(105, 105, false, 100);
                                scenesounda.play();
                                this.mitsuki.playAnimation(73, 73, false, 400, (() => {
                                    block.material!.alpha = 1;
                                    this.mitsuki.position = new Vector3(0.3, 0, 0);
                                    this.lyrina.position = new Vector3(0.5, 0, 0);
                                    this.flusselle.position = new Vector3(-2, 0, 0);
                                    sideCamera.position = new Vector3(0.4, 0.05, 1.2);
                                    this.mitsuki.playAnimation(72, 72, false, 400);
                                    setTimeout(() => {
                                        this.scene.beginAnimation(block, 0, 40, false, undefined, () => {
                                            se_message.play();
                                            speaker_index++;
                                            s = speakers[speaker_index];
                                            title.color = speakerStatus[s];
                                            title.text = s;
                                            dialogBox.isVisible = true;
                                            this.typeWriter(message, script[script_index], 0);
                                        })
                                    }, 3000)
                                }))
                            }, 500)
                        }, 1000)
                    }

                    else if (script_index == 8) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.scene.beginAnimation(block, 40, 120, false, undefined, () => {
                                setTimeout(() => {
                                    se_message.play();
                                    speaker_index++;
                                    s = speakers[speaker_index];
                                    title.color = speakerStatus[s];
                                    title.text = s;
                                    dialogBox.isVisible = true;
                                    this.typeWriter(message, script[script_index], 0);
                                }, 1000)
                            });
                        }, 200);
                    }

                    else if (script_index == 11) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 21) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.mitsuki.playAnimation(56, 56, false, 400);
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 24) {
                        dialogBox.isVisible = false;
                        block.material!.alpha = 1;
                        this.lyrina.playAnimation(108, 108, false, 100);
                        this.flusselle.playAnimation(128, 128, false, 100);
                        this.flusselle.invertU = true;
                        this.flusselle.position = new Vector3(0.3, 0, 0);
                        this.mitsuki.playAnimation(57, 57, false, 100);
                        this.mitsuki.position = new Vector3(0.1, 0, 0);
                        sideCamera.position = new Vector3(0.25, 0.05, 1.2);
                        scenesoundb.play();
                        setTimeout(() => {
                            block.material!.alpha = 0;
                            this.isshaking = true;
                            this.shaking(1, 0, 400);
                            setTimeout(() => {
                                this.isshaking = false;
                                setTimeout(() => {
                                    this.mitsuki.playAnimation(57, 60, false, 400, (() => {
                                        setTimeout(() => {
                                            this.mitsuki.playAnimation(61, 61, false, 1000, (() => {
                                                this.mitsuki.playAnimation(61, 65, false, 400, (() => {
                                                    setTimeout(() => {
                                                        se_message.play();
                                                        speaker_index++;
                                                        s = speakers[speaker_index];
                                                        title.color = speakerStatus[s];
                                                        title.text = s;
                                                        dialogBox.isVisible = true;
                                                        this.typeWriter(message, script[script_index], 0);
                                                    }, 1000);
                                                }));
                                            }));
                                        }, 1000)
                                    }))
                                }, 1000)
                            }, 1500)
                        }, 800)
                    }

                    else if (script_index == 29) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            this.mitsuki.playAnimation(67, 67, false, 400);
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1500);
                    }

                    else if (script_index == 37) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            this.flusselle.playAnimation(116, 117, true, 150);
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1500);
                    }

                    else if (script_index == 50) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.scene.beginAnimation(this.mitsuki, 0, 180, false, undefined, () => {
                                setTimeout(() => {
                                    se_message.play();
                                    this.flusselle.playAnimation(80, 87, true, 100);
                                    speaker_index++;
                                    s = speakers[speaker_index];
                                    title.color = speakerStatus[s];
                                    title.text = s;
                                    dialogBox.isVisible = true;
                                    this.typeWriter(message, script[script_index], 0);
                                }, 2000);
                            })
                        }, 1000);
                    }

                    else if (script_index == 52) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 58) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 24, 87, false, 100, () => { this.flusselle.playAnimation(80, 87, true, 100) });
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 60) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.flusselle.playAnimation(118, 119, true, 150);
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }

                    else if (script_index == 63) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            scenesoundc.play();
                            sy.playAnimation(0, 10, false, 100, () => {
                                setTimeout(() => {
                                    this.isshaking = true;
                                    this.shaking(2, 0, 200);
                                    se_message.play();
                                    speaker_index++;
                                    s = speakers[speaker_index];
                                    title.color = speakerStatus[s];
                                    title.text = s;
                                    dialogBox.isVisible = true;
                                    this.flusselle.playAnimation(122, 122, false, 100);
                                    this.typeWriter(message, script[script_index], 0);
                                }, 500)
                            })
                        }, 1000);
                    }

                    else if (script_index == 66) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            scenesoundc.play();
                            sy.playAnimation(0, 10, false, 100, () => {
                                this.isshaking = false;
                                setTimeout(() => {
                                    this.isshaking = true;
                                    this.shaking(2, 0, 100);
                                    se_message.play();
                                    speaker_index++;
                                    s = speakers[speaker_index];
                                    title.color = speakerStatus[s];
                                    title.text = s;
                                    dialogBox.isVisible = true;
                                    this.typeWriter(message, script[script_index], 0);
                                }, 300)
                            })
                        }, 200);
                    }

                    else if (script_index == 68) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.isshaking = false;
                            setTimeout(() => {
                                this.isshaking = true;
                                this.shaking(2, 0, 400);
                                setTimeout(() => {
                                    this.isshaking = false;
                                    setTimeout(() => {
                                        se_message.play();
                                        speaker_index++;
                                        s = speakers[speaker_index];
                                        title.color = speakerStatus[s];
                                        title.text = s;
                                        dialogBox.isVisible = true;
                                        this.typeWriter(message, script[script_index], 0);
                                    }, 1000)
                                }, 2000)
                            }, 100)
                        }, 200);
                    }

                    else if (script_index == 73) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1500);
                    }
                    else if (script_index == 80) {
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    else if (script_index == 86) {
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    else if (script_index == 101) {
                        dialogBox.isVisible = false;
                        this.lyrina.playAnimation(this.lyrina.cellIndex + 16, 23, false, 100, () => { this.lyrina.playAnimation(16, 23, true, 100) });
                        setTimeout(() => {
                            scenesounde.play();
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 48, 71, false, 100, () => { this.lyrina.playAnimation(64, 71, true, 100) });
                            speaker_index++;
                            message.fontSize = "40px";
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    
                    else if (script_index == 120) {
                        adminBox.isVisible = false;
                        setTimeout(() => {
                            ex_message.play()
                            speaker_index++;
                            s = speakers[speaker_index];
                            admintitle.color = speakerStatus[s];
                            admintitle.text = s;
                            adminBox.isVisible = true;
                            this.typeWriter(adminmessage, script[script_index], 1);
                        }, 2000);
                    }
                    else if (script_index == 123) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            ex_message.play()
                            speaker_index++;
                            s = speakers[speaker_index];
                            admintitle.color = speakerStatus[s];
                            admintitle.text = s;
                            adminBox.isVisible = true;
                            this.typeWriter(adminmessage, script[script_index], 1);
                        }, 2000);
                    }
                    else if (script_index == 128) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.scene.beginAnimation(block, 120, 0, false, undefined, () => {
                                block.material!.alpha = 1
                                setTimeout(() => {
                                    speaker_index++;
                                    s = speakers[speaker_index];
                                    title.color = speakerStatus[s];
                                    title.text = s;
                                    dialogBox.isVisible = true;
                                    this.typeWriter(message, script[script_index], 0);
                                }, 2000)
                            });
                        }, 500);
                    }


                    else {
                        if (script_index == 7) {
                            this.lyrina.playAnimation(106, 106, false, 100);
                        }
                        if (script_index == 12) {
                            this.lyrina.playAnimation(107, 107, false, 100);
                        }
                        if (script_index == 22) {
                            this.lyrina.playAnimation(106, 106, false, 100);
                        }
                        if (script_index == 27) {
                            this.mitsuki.playAnimation(66, 66, false, 400);
                        }
                        if (script_index == 33) {
                            this.flusselle.playAnimation(72, 79, true, 100);
                        }
                        if (script_index == 34) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 8, 87, false, 100, () => { this.flusselle.playAnimation(80, 87, true, 100) });
                        }
                        if (script_index == 35) {
                            this.flusselle.invertU = false;
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 24, 63, false, 100, () => { this.flusselle.playAnimation(56, 63, true, 100) });
                        }
                        if (script_index == 36) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 24, 87, false, 100, () => { this.flusselle.playAnimation(80, 87, true, 100) });
                        }
                        if (script_index == 38) {
                            this.lyrina.playAnimation(72, 79, true, 100);
                        }
                        if (script_index == 39) {
                            this.flusselle.playAnimation(80, 87, true, 100);
                        }
                        if (script_index == 40) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 16, 71, false, 100, () => { this.flusselle.playAnimation(64, 71, true, 100) });
                        }
                        if (script_index == 41) {
                            this.mitsuki.playAnimation(68, 68, false, 400);
                        }
                        if (script_index == 44) {
                            this.flusselle.playAnimation(118, 119, true, 150);
                        }
                        if (script_index == 45) {
                            this.flusselle.playAnimation(120, 121, true, 150);
                        }
                        if (script_index == 48) {
                            this.mitsuki.playAnimation(69, 69, false, 400);
                        }
                        if (script_index == 49) {
                            this.mitsuki.playAnimation(70, 70, false, 400);
                        }
                        if (script_index == 57) {
                            this.flusselle.invertU = true;
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 24, 63, false, 100, () => { this.flusselle.playAnimation(56, 63, true, 100) });
                        }
                        if (script_index == 59) {
                            this.flusselle.playAnimation(116, 117, true, 150);
                        }
                        if (script_index == 61) {
                            this.flusselle.playAnimation(120, 121, true, 150);
                        }
                        if (script_index == 64) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 24, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                        }
                        if (script_index == 67) {
                            this.flusselle.playAnimation(123, 123, false, 100);
                        }
                        if (script_index == 69) {
                            this.flusselle.playAnimation(102, 102, false, 100);
                        }
                        if (script_index == 76) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 24, 79, false, 100, () => { this.lyrina.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 82) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 24, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                        }
                        if (script_index == 98) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 24, 79, false, 100, () => { this.lyrina.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 99) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 24, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                        }
                        if (script_index == 100) {
                            this.lyrina.invertU = true;
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 96, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 103) {
                            message.fontSize = 27;
                        }
                        if (script_index == 106) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 64, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 115) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 96, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                        }
                        if (script_index == 121) {                            
                            this.lyrina.invertU = false;
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 24, 79, false, 100, () => { this.lyrina.playAnimation(72, 79, true, 100) });
                        }


                        if (script[script_index].startsWith("!")) {
                            dialogBox.isVisible = false;
                            narator.isVisible = true;
                            adminBox.isVisible = false;
                            this.naratorWriter(narator, script[script_index], 1, na_message);
                        }
                        if (script[script_index].startsWith("#")) {
                            dialogBox.isVisible = false;
                            narator.isVisible = false;
                            adminBox.isVisible = true;
                            speaker_index++;
                            s = speakers[speaker_index];
                            ex_message.play();
                            admintitle.color = speakerStatus[s];
                            admintitle.text = s;
                            this.typeWriter(adminmessage, script[script_index], 1);
                        }
                        else {
                            speaker_index++;
                            s = speakers[speaker_index];
                            if (s != "S1-F3") se_message.play();
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            narator.isVisible = false;
                            adminBox.isVisible = false;
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

    isshaking = false;

    async shaking(char: number, from: number, speed: number) {
        if (this.isshaking) {
            if (char == 1) {
                if (from == 0) {
                    this.mitsuki.position._x += 0.005;
                    setTimeout(() => { this.shaking(char, 1, speed) }, speed);
                }
                else {
                    this.mitsuki.position._x -= 0.005;
                    setTimeout(() => { this.shaking(char, 0, speed) }, speed);
                }
            }
            else {
                if (from == 0) {
                    this.flusselle.position._x += 0.005;
                    setTimeout(() => { this.shaking(char, 1, speed) }, speed);
                }
                else {
                    this.flusselle.position._x -= 0.005;
                    setTimeout(() => { this.shaking(char, 0, speed) }, speed);
                }
            }
        }
    }

    nextScene() {
        const next = new CH3_CU_OW_3(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        this.scene = next.scene;
    }
}