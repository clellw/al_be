import { Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, CreateAudioEngineAsync, CreateSoundAsync, StaticSound, Animation, Color4 } from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'

export class CH4_CU_UN_1 {


    scene: Scene;
    engine: Engine;

    lyrina: Sprite;
    flusselle: Sprite;

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

        this.lyrina.size = 0.45;
        this.lyrina.position = new Vector3(0, 0, 0)
        this.lyrina.playAnimation(96, 103, true, 100);

        this.flusselle.size = 0.45;
        this.flusselle.position = new Vector3(-1.2, 0, 0)
        this.flusselle.playAnimation(80, 87, true, 100);
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);

        this.CreateEnvironment(scene);
        this.CreateDialog();


        return scene;
    }

    async CreateEnvironment(scene: Scene): Promise<void> {

        const ground = MeshBuilder.CreateBox("ground")
        ground.scaling = new Vector3(100, 40, 1)
        ground.position = new Vector3(0, -20.15, 0)
        ground.material = new StandardMaterial('material');
        ground.material.wireframe = true;

        const rsp1 = MeshBuilder.CreateSphere("rsp1", { diameter: 0.5, segments: 1 })
        rsp1.material = new StandardMaterial('material');
        rsp1.material.wireframe = true;
        rsp1.position = new Vector3(2, 5, -4);
        const rc1 = MeshBuilder.CreateCylinder("rc1", { diameter: 0.5, tessellation: 6, height: 0.4 })
        rc1.material = new StandardMaterial('material');
        rc1.material.wireframe = true;
        rc1.position = new Vector3(-2, 14, -10);
        const rt1 = MeshBuilder.CreateBox("rt1",)
        rt1.scaling = new Vector3(0.2, 0.2, 0.2)
        rt1.position = new Vector3(-20, 2, -5)
        rt1.material = new StandardMaterial('material');
        rt1.material.wireframe = true;

        const littleblock1 = MeshBuilder.CreateBox("littleblock1")
        littleblock1.scaling = new Vector3(0.2, 0.2, 0.2)
        littleblock1.position = new Vector3(0.7, 0, -2)
        littleblock1.material = new StandardMaterial('material');
        littleblock1.material.wireframe = true;
        const littleblock2 = MeshBuilder.CreateBox("littleblock2")
        littleblock2.scaling = new Vector3(0.05, 0.05, 0.05)
        littleblock2.position = new Vector3(-0.2, -4, -2)
        littleblock2.material = new StandardMaterial('material');
        littleblock2.material.wireframe = true;
        const littleblock3 = MeshBuilder.CreateBox("littleblock3")
        littleblock3.scaling = new Vector3(0.05, 0.05, 0.05)
        littleblock3.position = new Vector3(0.1, -5, -2)
        littleblock3.material = new StandardMaterial('material');
        littleblock3.material.wireframe = true;
        const littleblock4 = MeshBuilder.CreateBox("littleblock4")
        littleblock4.scaling = new Vector3(0.2, 0.2, 0.2)
        littleblock4.position = new Vector3(-1, -9, -5)
        littleblock4.material = new StandardMaterial('material');
        littleblock4.material.wireframe = true;

        const littleblock5 = MeshBuilder.CreateBox("littleblock5")
        littleblock5.scaling = new Vector3(0.2, 0.2, 0.2)
        littleblock5.position = new Vector3(-4, -20, -5)
        littleblock5.material = new StandardMaterial('material');
        littleblock5.material.wireframe = true;
        const littleblock6 = MeshBuilder.CreateBox("littleblock6")
        littleblock6.scaling = new Vector3(0.2, 0.2, 0.2)
        littleblock6.position = new Vector3(-1, -14, -7)
        littleblock6.material = new StandardMaterial('material');
        littleblock6.material.wireframe = true;
        const littleblock7 = MeshBuilder.CreateBox("littleblock7")
        littleblock7.scaling = new Vector3(0.2, 0.2, 0.2)
        littleblock7.position = new Vector3(-3, -16, -2)
        littleblock7.material = new StandardMaterial('material');
        littleblock7.material.wireframe = true;

        scene.onBeforeRenderObservable.add(() => {
            rsp1.rotate(Vector3.Up(), 0.05)
            rsp1.rotate(Vector3.Left(), 0.02)
            rsp1.rotate(Vector3.Forward(), 0.01)
            rsp1.moveWithCollisions(new Vector3(-0.004, -0.008, 0))
            rc1.rotate(Vector3.Up(), 0.01)
            rc1.rotate(Vector3.Left(), 0.01)
            rc1.rotate(Vector3.Forward(), 0.04)
            rc1.moveWithCollisions(new Vector3(0.002, -0.013, 0))
            littleblock1.rotate(Vector3.Up(), 0.05)
            littleblock1.rotate(Vector3.Left(), 0.02)
            littleblock1.moveWithCollisions(new Vector3(0, 0.004, 0))
            littleblock4.rotate(Vector3.Right(), 0.05)
            littleblock4.rotate(Vector3.Up(), 0.1)
            littleblock4.moveWithCollisions(new Vector3(0, 0.008, 0))
            littleblock2.rotate(Vector3.Up(), 0.05)
            littleblock2.rotate(Vector3.Forward(), 0.07)
            littleblock2.moveWithCollisions(new Vector3(0, 0.009, 0))
            littleblock3.rotate(Vector3.Forward(), 0.05)
            littleblock3.rotate(Vector3.Left(), 0.1)
            littleblock3.moveWithCollisions(new Vector3(0, 0.007, 0))
            littleblock5.rotate(Vector3.Backward(), 0.02)
            littleblock5.rotate(Vector3.Up(), 0.01)
            littleblock5.moveWithCollisions(new Vector3(0, 0.005, 0))
            littleblock6.rotate(Vector3.Up(), 0.06)
            littleblock6.rotate(Vector3.Right(), 0.03)
            littleblock6.moveWithCollisions(new Vector3(0, 0.002, 0))
            littleblock7.rotate(Vector3.Forward(), 0.01)
            littleblock7.rotate(Vector3.Left(), 0.01)
            littleblock7.moveWithCollisions(new Vector3(0, 0.008, 0))
            rt1.moveWithCollisions(new Vector3(0.01, 0, 0))
            rt1.rotate(Vector3.Forward(), 0.009)

            if (rsp1.position._y <= -8) {
                rsp1.rotate(Vector3.Forward(), 1);
                rsp1.position = new Vector3(2, 5, -4);
            }
            if (rc1.position._y <= -12) {
                rc1.rotate(Vector3.Forward(), 1);
                rc1.position = new Vector3(-2, 7, -10);
            }

            if (littleblock1.position._y >= 4) {
                littleblock1.position._y = -2;
                littleblock1.rotate(Vector3.Forward(), 1);
                littleblock1.position._x = Math.random() * 4 - 2;
                littleblock1.position._z = -Math.random() * 10 - 0.1;
            }

            if (littleblock2.position._y >= 5) {
                littleblock2.position._y = -2;
                littleblock2.rotate(Vector3.Forward(), 1);
                littleblock2.position._x = Math.random() * 4 - 2;
                littleblock2.position._z = -Math.random() * 10 - 0.1;
            }

            if (littleblock3.position._y >= 5) {
                littleblock3.position._y = -2;
                littleblock3.rotate(Vector3.Forward(), 1);
                littleblock3.position._x = Math.random() * 4 - 2;
                littleblock3.position._z = -Math.random() * 10 - 0.1;
            }

            if (littleblock4.position._y >= 7) {
                littleblock4.position._y = -3;
                littleblock4.rotate(Vector3.Forward(), 1);
                littleblock4.position._x = Math.random() * 4 - 2;
                littleblock4.position._z = -Math.random() * 10 - 0.1;
            }

            if (littleblock5.position._y >= 12) {
                littleblock5.position._y = -4;
                littleblock5.rotate(Vector3.Forward(), 1);
                littleblock5.position._x = Math.random() * 8 - 4;
                littleblock5.position._z = -Math.random() * 10 - 3;
            }
            if (littleblock6.position._y >= 12) {
                littleblock6.position._y = -4;
                littleblock6.rotate(Vector3.Forward(), 1);
                littleblock6.position._x = Math.random() * 8 - 4;
                littleblock6.position._z = -Math.random() * 10 - 3;
            }
            if (littleblock7.position._y >= 12) {
                littleblock7.position._y = -4;
                littleblock7.rotate(Vector3.Forward(), 1);
                littleblock7.position._x = Math.random() * 8 - 4;
                littleblock7.position._z = -Math.random() * 10 - 3;
            }

            if (rt1.position._x >= 15) {
                rt1.position._x = -8;
            }
        })
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

        const sideCamera = new FreeCamera("SideCamera", new Vector3(-0.1, 0.05, 1.2), this.scene);
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

        const speakerStatus: { [key: string]: string } = { "lyrina": "brown", "flusselle": "rgb(0, 157, 255)", "S1-F3": "rgb(231, 10, 10)", "Raphaël": "cyan" };

        script.push("wha-?")
        script.push("what  happened  here?")
        script.push("#Helia! Can you hear me?")
        script.push("yes,  but  i  have  no  idea  of  where  i  am.")
        script.push("#it's normal. i cannot locate you either.")
        script.push("so  i  can't  locate  me,  and  you  can't  locate  me.")
        script.push("'normal'  is  not  the  word  i  would  choose  here.")
        script.push("#You are in the simulation, this is the place you dive in every day.")
        script.push("#But all the files have been corrupted by S1-F3 when it got access to the system.")
        script.push("#It is currently reading and rewriting the datas of the environment as we speak.")
        script.push("#It may be trying to recreate everything from scratch based on its memory.")
        script.push("Yeah.  this  is  what  flusselle  would  do.")
        script.push("She  is  not  the  kind  to  give  up  easily,  she  will  try  to  find  a  solution  by  any  means.")
        script.push("#I cannot locate it either, and all the control access commands of its system are not responding.")
        script.push("#So no disbanding mode, no admin mode, no anything.")
        script.push("#We can only count on you to find and appease it.")
        script.push("I  know.  don't  worry.")
        script.push("(I  already  failed  to  help  flusselle  when  she  needed  me.)")
        script.push("(I  will  not  make  the  same...)")
        script.push("...!")
        script.push("(flusselle...)")
        script.push("flusselle!  it's  me,  lyrina!")
        script.push("lyrina...?")
        script.push("So  you  are  here...")
        script.push("You  were  the  only  one  i  couldn't  find.")
        script.push("i  could  find  your  body,  but  you  were  missing.")
        script.push("flusselle,  I  know  everything  is  strange  for  you  right  now.")
        script.push("but  i  am  here,  and  i  will  help  you!")
        script.push("do  you  know  what  is  happening?")
        script.push("i  was  lost  in  a  place  with  no  exit.")
        script.push("i  couldn't  even  hear  my  own  voice.")
        script.push("i  could  sense  other  presences   all  around  me.")
        script.push("i  could  not  see  them,  but...")
        script.push("i  wished  i  didn't  understand  what  they  were.")
        script.push("i  cannot  make  sense  of  anything.")
        script.push("all  i  believe  in  is  wrong  in  the  end.")
        script.push("if  you  understand  any  of  this...")
        script.push("please,  tell  me  i'm  misunderstanding  something...!")
        script.push("...")
        script.push("I  am  very,  deeply  sorry,  flusselle...")
        script.push("But  if  i  were  to  say  what  you  want  to  hear,  it  would  be  a  lie.")
        script.push("And  i  value  you  too  much  to  allow  myself  to...")
        script.push("no.")
        script.push("i  cannot  continue  to  play  pretend  and  face  you  in  the  eyes  anymore.")
        script.push("i  can  guarantee  you  that  every  experience  we  had  was  real,  everything  we  lived  was  not  a  lie.")
        script.push("but  all  that  surrounded  us  was  a  creation  of  which  you  didn't  know  the  true  purpose.")
        script.push("this  is  the  truth.")
        script.push("thank  you.")
        script.push("thank  you  for  being  honest  with  me.")
        script.push("it  means  a  lot  to  me,  lyrina...")
        script.push("so  this  is  really  happening..?")
        script.push("everything  we  saw  was  just  a  facade?")
        script.push("all  we've  been  through...")
        script.push("everyone  we  met...")
        script.push("mitsuki...")
        script.push("...")
        script.push("did  all  of  this  had  no  meaning  from  the  start!?")
        script.push("ah...  aaah...!")
        script.push("I  cannot  stop  it!")
        script.push("this  pain  in  my  chest...  it  hurts!")
        script.push("i  have  no  words  to  describe  what  is  in  my  head!")
        script.push("how..?")
        script.push("that  must  be  it...")
        script.push("i  am  not  human...  i'm  a  monster...")
        script.push("no!  you  are  not!")
        script.push("from  all  the  time  we  spent  together,  i  can  confidently  say  i  am  the  person  who  knows  you  the  best.")
        script.push("flusselle...  you  are  a  wonderful,  kind  and  honest  person.")
        script.push("i  am  very  proud  to  say  i  know  you  like  an  open  book.")
        script.push("and  i  won't  let  myself,  nor  anyone  say  you  are  a  monster.")
        script.push("especially  not  you.")
        script.push("i  could  have  avoided  you  all  this  suffering  if  i  was  as  considerate  as  you  were  with  me.")
        script.push("you  do  not  deserve  what  is  happening  to  you.")
        script.push("but  i  promise  you...  everything  will  get  better.")
        script.push("from  now  on,  i  will  never  leave  your  side  ever  again.")
        script.push("i  will  be  sharing  your  pain  to  ease  its  weight  on  you.")
        script.push("i  will  do  all  i  can  to  get  everyone  back.")
        script.push("flusselle...")
        script.push("i  need  you  to  trust  me  with  this.")
        script.push("i  am  sorry,  lyrina...")
        script.push("i  know  you  are  being  sincere  and  honest,  i  know  i  can  trust  you.")
        script.push("but  this  whole  situation  is  too  convoluted  to  make  sence  of  anything.")
        script.push("and  the  only  thing  that  seems  right  for  me...")
        script.push("is  to  keep  going  forward  without  stopping.")
        script.push("i  understand.  this  is  just  like  the  flusselle  i  know.")
        script.push("then  i  will  have  to  stay  in  your  path  and  prevent  you  from  continuing.")
        script.push("this  is  exactly  what  I  expected  from  you.")
        script.push("then  let's  not  hold  back.")
        script.push("i  will  end  all  of  this,  right  this  instant!")
        script.push("#Helia, this is bad! Let's just say that the stakes are too high right now!")
        script.push("#S1-F3's program found a way to access the network i used for her heavy training.")
        script.push("#With its destructive abilities, this could-.")
        script.push("yeah,  yeah,  i  know.")
        script.push("you  should  start  searching  a  good  restaurant  for  the  three  of  us  when  all  of  this  will  be  over.")
        script.push("Brace  yourself,  lyrina!")
        script.push("here  goes  nothin'!")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "lyrina";
        title.text = s;
        title.color = speakerStatus[s];

        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("Raphaël")
        speakers.push("lyrina")
        speakers.push("Raphaël")
        speakers.push("lyrina")
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
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
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
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("Raphaël")
        speakers.push("lyrina")
        speakers.push("lyrina")
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


        const music = await CreateSoundAsync("music",
            "./sounds/music/Hidden Highland.flac"
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
            { frame: 180, value: 0 }  // End fully transparent
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
            { frame: 0, value: new Vector3(-0.1, 0.05, 1.2) }, // Start position
            //{ frame: 60, value: new Vector3(10, 5, 0) }, // Mid position
            { frame: 180, value: new Vector3(-0.55, 0.05, 1.2) } // End position
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


        const hemilight = new HemisphericLight(
            "hemilight",
            new Vector3(0, 1, 0),
            this.scene
        );

        hemilight.intensity = 0.;

        const lightAnim = new Animation(
            "fadelight",
            "intensity",
            60, // FPS
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )

        const lightkeys = [
            { frame: 0, value: 0 },   // Start fully opaque
            { frame: 180, value: 1 }  // End fully transparent
        ];
        lightAnim.setKeys(lightkeys);
        hemilight.animations.push(lightAnim);


        const chapter = new GUI.TextBlock();
        chapter.fontFamily = "Segoe UI"
        chapter.fontSize = "27px";
        chapter.color = "white";
        chapter.top = "200px";
        chapter.textWrapping = true;
        chapter.text = "Chapter Four";
        chapter.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(chapter);
        chapter.alpha = 0;

        const description = new GUI.TextBlock();
        description.fontFamily = "Segoe UI"
        description.fontSize = "29px";
        description.color = "white";
        description.top = "240px";
        description.textWrapping = true;
        description.text = "Don't be a Stranger when You are Hurt";
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
        paragraph.text = "The new moon feels more melancolic tonight. I wonder if tomorrow can make for a better yesterday.";
        paragraph.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        paragraph.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(paragraph);
        paragraph.alpha = 0;

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
            this.scene.beginAnimation(block, 0, 180, false, undefined, () => {
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
                    }

                    else if (script_index == 1) {
                        dialogBox.isVisible = false;
                        music.play();
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
                                            se_message.play();
                                            this.lyrina.invertU = true;
                                            speaker_index++;
                                            s = speakers[speaker_index];
                                            title.color = speakerStatus[s];
                                            title.text = s;
                                            dialogBox.isVisible = true;
                                            this.typeWriter(message, script[script_index], 0);
                                        }, 1500);
                                    }, 4000)
                                });
                            }, 4000)
                            this.scene.beginAnimation(hemilight, 0, 120, false, undefined)
                        }, 500);
                    }
                    else if (script_index == 20) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.scene.beginAnimation(sideCamera, 0, 180, false, undefined, () => {
                                setTimeout(() => {
                                    se_message.play();
                                    speaker_index++;
                                    s = speakers[speaker_index];
                                    title.color = speakerStatus[s];
                                    title.text = s;
                                    dialogBox.isVisible = true;
                                    this.typeWriter(message, script[script_index], 0);
                                }, 2000)
                            });
                        }, 1000);
                    }

                    else if (script_index == 22) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.invertU = true;
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 88, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 24, 63, false, 100, () => { this.flusselle.playAnimation(56, 63, true, 100) });
                            setTimeout(() => {
                                se_message.play();
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            }, 1000)
                        }, 1000);
                    }

                    else if (script_index == 26) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 96, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }

                    else if (script_index == 29) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 16, 79, false, 100, () => { this.flusselle.playAnimation(72, 79, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 31) {
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

                    else if (script_index == 33) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(116, 117, true, 150);
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 34) {
                        dialogBox.isVisible = false;
                        this.lyrina.playAnimation(this.lyrina.cellIndex - 24, 79, false, 100, () => { this.lyrina.playAnimation(72, 79, true, 100) });
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

                    else if (script_index == 36) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(72, 79, true, 100);
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 38) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 56, 23, false, 100, () => { this.lyrina.playAnimation(16, 23, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000);
                    }

                    else if (script_index == 42) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 16, 23, false, 100, () => { this.lyrina.playAnimation(16, 23, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }


                    else if (script_index == 44) {
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

                    else if (script_index == 47) {
                        dialogBox.isVisible = false;
                        this.flusselle.playAnimation(this.flusselle.cellIndex + 16, 79, false, 100, () => { this.flusselle.playAnimation(72, 79, true, 100) });
                        setTimeout(() => {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 16, 63, false, 100, () => { this.flusselle.playAnimation(56, 63, true, 100) });
                            setTimeout(() => {
                                se_message.play();
                                speaker_index++;
                                s = speakers[speaker_index];
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            })
                        }, 3000);
                    }

                    else if (script_index == 50) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 64, 79, false, 100, () => { this.flusselle.playAnimation(72, 79, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000);
                    }
                    
                    else if (script_index == 53) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(118, 119, true, 150);
                            this.lyrina.playAnimation(this.lyrina.cellIndex +  72, 79, false, 100, () => { this.lyrina.playAnimation(72, 79, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    
                    else if (script_index == 56) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(120, 121, true, 150);
                            message.fontSize = 35;
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 57) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(118, 119, true, 150);
                            message.fontSize = 27;
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
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
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
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }
                    
                    else if (script_index == 61) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(118, 119, true, 150);
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }

                    else if (script_index == 62) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000);
                    }

                    else if (script_index == 64) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            block.material!.alpha = 1;
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 56, 23, false, 100, () => { this.lyrina.playAnimation(16, 23, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 30;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 4000);
                    }
                    else if (script_index == 65) {
                        block.material!.alpha = 0;
                        this.flusselle.playAnimation(56, 63, true, 100);
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 16, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    else if (script_index == 69) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }
                    else if (script_index == 70) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }
                    else if (script_index == 72) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 8, 15, false, 100, () => { this.lyrina.playAnimation(8, 15, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }
                    
                    else if (script_index == 76) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 1000);
                    }
                    
                    else if (script_index == 78) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 4000);
                    }
                    
                    else if (script_index == 82) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 56, 7, false, 100, () => { this.flusselle.playAnimation(0, 7, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else if (script_index == 83) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 16, 31, false, 100, () => { this.lyrina.playAnimation(24, 31, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    else if (script_index == 84) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 24, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    else if (script_index == 85) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 136, 143, false, 100, () => { this.flusselle.playAnimation(136, 143, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    else if (script_index == 86) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 136, 7, false, 100, () => { this.flusselle.playAnimation(0, 7, true, 100) });
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }
                    else if (script_index == 93) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 2000);
                    }

                    else {
                        if (script_index == 3) {
                            this.lyrina.invertU = true;
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 96, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 4) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 48, 55, false, 100, () => { this.lyrina.playAnimation(48, 55, true, 100) });
                        }
                        if (script_index == 5) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 8, 63, false, 100, () => { this.lyrina.playAnimation(56, 63, true, 100) });
                        }
                        if (script_index == 8) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 56, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 16) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 16, 23, false, 100, () => { this.lyrina.playAnimation(16, 23, true, 100) });
                        }
                        if (script_index == 18) {
                            this.lyrina.invertU = false;
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 16, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 19) {
                            music.stop();
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 96, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                        }
                        if (script_index == 21) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 88, 15, false, 100, () => { this.lyrina.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 25) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 16, 79, false, 100, () => { this.flusselle.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 27) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 8, 15, false, 100, () => { this.lyrina.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 28) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 16, 63, false, 100, () => { this.flusselle.playAnimation(56, 63, true, 100) });
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 88, 103, false, 100, () => { this.lyrina.playAnimation(96, 103, true, 100) });
                        }
                        if (script_index == 30) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 8, 87, false, 100, () => { this.flusselle.playAnimation(80, 87, true, 100) });
                        }
                        if (script_index == 35) {
                            this.flusselle.playAnimation(118, 119, true, 150);
                        }
                        if (script_index == 37) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 8, 71, false, 100, () => { this.flusselle.playAnimation(64, 71, true, 100) });
                        }
                        if (script_index == 39) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 56, 79, false, 100, () => { this.lyrina.playAnimation(72, 79, true, 100) });
                        }
                        if (script_index == 41) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 72, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 43) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex - 8, 63, false, 100, () => { this.flusselle.playAnimation(56, 63, true, 100) });
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 16, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 48) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 80, 143, false, 100, () => { this.flusselle.playAnimation(136, 143, true, 100) });
                        }
                        if (script_index == 51) {
                            this.flusselle.playAnimation(116, 117, true, 150);
                        }
                        if (script_index == 59) {
                            this.flusselle.playAnimation(120, 121, true, 150);
                        }
                        if (script_index == 63) {
                            this.flusselle.playAnimation(120, 121, true, 150);
                        }
                        if (script_index == 66) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 8, 15, false, 100, () => { this.lyrina.playAnimation(8, 15, true, 100) });
                        }
                        if (script_index == 68) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex - 8, 7, false, 100, () => { this.lyrina.playAnimation(0, 7, true, 100) });
                        }
                        if (script_index == 87) {
                            this.flusselle.playAnimation(this.flusselle.cellIndex + 104, 111, false, 100, () => { this.flusselle.playAnimation(104, 111, true, 100) });
                        }
                        if (script_index == 92) {
                            this.lyrina.playAnimation(this.lyrina.cellIndex + 80, 87, false, 100, () => { this.lyrina.playAnimation(80, 87, true, 100) });
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