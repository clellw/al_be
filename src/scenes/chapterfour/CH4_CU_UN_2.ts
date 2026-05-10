import { Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, CreateAudioEngineAsync, CreateSoundAsync, StaticSound, Animation, Color4 } from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'
import { epilogue } from "./epilogue";

export class CH4_CU_UN_2 {


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
            './sprites/cutscenes/ly-c-en.png',
            1,
            128,
            this.scene
        );

        LManager.texture = new Texture(
            "./sprites/cutscenes/ly-c-en.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        this.lyrina = new Sprite('lyrina', LManager)

        const FManager = new SpriteManager(
            'LManager',
            './sprites/cutscenes/fl-c-en.png',
            1,
            128,
            this.scene
        );

        FManager.texture = new Texture(
            "./sprites/cutscenes/fl-c-en.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        this.flusselle = new Sprite('flusselle', FManager)

        this.lyrina.size = 0.45;
        this.lyrina.position = new Vector3(-0.01, 0, 0)
        this.lyrina.playAnimation(0, 1, true, 150);

        this.flusselle.size = 0.45;
        this.flusselle.position = new Vector3(-0.09, 0, 0)
        this.flusselle.playAnimation(4, 5, true, 150);
        this.flusselle.invertU = true;

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

        this.flusselle.animations = [animation];
        this.lyrina.animations = [animation];
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);

        this.CreateEnvironment(scene);
        this.CreateDialog();


        return scene;
    }

    stable = false;

    async CreateEnvironment(scene: Scene): Promise<void> {
        
        const fadeout = new Animation(
            "fadealpha",
            "visibility",
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const fadekeys = [
            { frame: 0, value: 1 },
            { frame: 120, value: 0 }
        ];

        fadeout.setKeys(fadekeys);


        const ground = MeshBuilder.CreateBox("ground")
        ground.scaling = new Vector3(100, 40, 1)
        ground.position = new Vector3(0, -20.15, 0)
        ground.material = new StandardMaterial('material');
        ground.material.wireframe = true;
        ground.animations = [fadeout]

        const rsp1 = MeshBuilder.CreateSphere("rsp1", { diameter: 0.5, segments: 1 })
        rsp1.material = new StandardMaterial('material');
        rsp1.material.wireframe = true;
        rsp1.position = new Vector3(2, 5, -4);
        rsp1.animations = [fadeout]
        const rc1 = MeshBuilder.CreateCylinder("rc1", { diameter: 0.5, tessellation: 6, height: 0.4 })
        rc1.material = new StandardMaterial('material');
        rc1.material.wireframe = true;
        rc1.position = new Vector3(-2, 14, -10);
        rc1.animations = [fadeout]
        const rt1 = MeshBuilder.CreateBox("rt1",)
        rt1.scaling = new Vector3(0.2, 0.2, 0.2)
        rt1.position = new Vector3(-20, 2, -5)
        rt1.material = new StandardMaterial('material');
        rt1.material.wireframe = true;
        rt1.animations = [fadeout]

        const littleblock1 = MeshBuilder.CreateBox("littleblock1")
        littleblock1.scaling = new Vector3(0.2, 0.2, 0.2)
        littleblock1.position = new Vector3(0.7, 0, -2)
        littleblock1.material = new StandardMaterial('material');
        littleblock1.material.wireframe = true;
        littleblock1.animations = [fadeout]
        const littleblock2 = MeshBuilder.CreateBox("littleblock2")
        littleblock2.scaling = new Vector3(0.05, 0.05, 0.05)
        littleblock2.position = new Vector3(-0.2, -4, -2)
        littleblock2.material = new StandardMaterial('material');
        littleblock2.material.wireframe = true;
        littleblock2.animations = [fadeout]
        const littleblock3 = MeshBuilder.CreateBox("littleblock3")
        littleblock3.scaling = new Vector3(0.05, 0.05, 0.05)
        littleblock3.position = new Vector3(0.1, -5, -2)
        littleblock3.material = new StandardMaterial('material');
        littleblock3.material.wireframe = true;
        littleblock3.animations = [fadeout]
        const littleblock4 = MeshBuilder.CreateBox("littleblock4")
        littleblock4.scaling = new Vector3(0.2, 0.2, 0.2)
        littleblock4.position = new Vector3(-1, -9, -5)
        littleblock4.material = new StandardMaterial('material');
        littleblock4.material.wireframe = true;
        littleblock4.animations = [fadeout]

        const littleblock5 = MeshBuilder.CreateBox("littleblock5")
        littleblock5.scaling = new Vector3(0.2, 0.2, 0.2)
        littleblock5.position = new Vector3(-4, -20, -5)
        littleblock5.material = new StandardMaterial('material');
        littleblock5.material.wireframe = true;
        littleblock5.animations = [fadeout]
        const littleblock6 = MeshBuilder.CreateBox("littleblock6")
        littleblock6.scaling = new Vector3(0.2, 0.2, 0.2)
        littleblock6.position = new Vector3(-1, -14, -7)
        littleblock6.material = new StandardMaterial('material');
        littleblock6.material.wireframe = true;
        littleblock6.animations = [fadeout]
        const littleblock7 = MeshBuilder.CreateBox("littleblock7")
        littleblock7.scaling = new Vector3(0.2, 0.2, 0.2)
        littleblock7.position = new Vector3(-3, -16, -2)
        littleblock7.material = new StandardMaterial('material');
        littleblock7.material.wireframe = true;
        littleblock7.animations = [fadeout]

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


            if(this.stable) {
                this.stable = false;
                this.scene.beginAnimation(ground, 0, 120, false, undefined);
                this.scene.beginAnimation(rsp1, 0, 120, false, undefined);
                this.scene.beginAnimation(rc1, 0, 120, false, undefined);
                this.scene.beginAnimation(rt1, 0, 120, false, undefined);
                this.scene.beginAnimation(littleblock1, 0, 120, false, undefined);
                this.scene.beginAnimation(littleblock2, 0, 120, false, undefined);
                this.scene.beginAnimation(littleblock3, 0, 120, false, undefined);
                this.scene.beginAnimation(littleblock4, 0, 120, false, undefined);
                this.scene.beginAnimation(littleblock5, 0, 120, false, undefined);
                this.scene.beginAnimation(littleblock6, 0, 120, false, undefined);
                this.scene.beginAnimation(littleblock7, 0, 120, false, undefined);
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
        
        // Create skybox
        const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, this.scene);
        const skyboxMaterial = new StandardMaterial("skyBoxMaterial", this.scene);

        // Solid color (no texture)
        skyboxMaterial.diffuseColor = new Color3(0.5, 0.7, 1.0); // light blue
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skyboxMaterial.backFaceCulling = false;
        skybox.material = skyboxMaterial;

        
        const skyboxanim = new Animation(
            "fadeInalpha",
            "material.diffuseColor",
            60,
            Animation.ANIMATIONTYPE_COLOR3,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const skyboxkeys = [
            { frame: 0, value: new Color3(0.5, 0.7, 1) },
            { frame: 180, value: new Color3(1, 1, 1) }
        ];
        
        const skyboxkeystwo = [
            { frame: 0, value: new Color3(1, 1, 1) },
            { frame: 180, value: new Color3(0, 0, 0) }
        ];

        skyboxanim.setKeys(skyboxkeys);

        skybox.animations = [skyboxanim];


        const sideCamera = new FreeCamera("SideCamera", new Vector3(-0.05, 0.05, 1.2), this.scene);
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

        script.push("I'm  sorry,  lyrina.")
        script.push("I  didn't  want  to  fight  you...")
        script.push("I  was  afraid  of  you,  even  though...")
        script.push("You  don't  have  to  apologize  for  anything.")
        script.push("I  should  have  understood  what  was  happening  to  you.")
        script.push("I  wasn't  sure  what  I  had  to  do.")
        script.push("And  that  doubt  made  me  unable  to  help.")
        script.push("When  I  was  lost,  I  found  everyone.")
        script.push("I  couldn't  recognize  them,  but  I  knew  who  they  were.")
        script.push("It  made  me  snap  out  entirely.")
        script.push("I  felt  like  I  was  in  hell.")
        script.push("I  wanted  to  protect  them  at  all  cost.")
        script.push("Even  if  I  had  to  destroy  everything  that  felt  dangerous.")
        script.push("Even  if  I  had  to  go  against  you.")
        script.push("What's  going  to  happen  now?")
        script.push("Everything  is  gone...")
        script.push("Because  of  me.")
        script.push("I  didn't  want  this...")
        script.push("Ahh...  aah...")
        script.push("I'm  not  feeling  good.")
        script.push("I  feel  like  my  body  is  tearing  appart.")
        script.push("I  feel...  shattered.")
        script.push("I'm  sorry...")
        script.push("No...")
        script.push("I  can't  cry  now.")
        script.push("I'm  the  one  responsible  for  this  mess.")
        script.push("I...")
        script.push("It's  okay.  you  can  cry.")
        script.push("You  went  through  too  much  to  bottle  it  up  like  that.")
        script.push("It  will  help  you.")
        script.push("You  don't  have  to  worry.")
        script.push("We  can  get  everything  back  to  normal.")
        script.push("I  won't  let  you,  or  everything  we  lived  together  disappear.")
        script.push("I  won't  let  that  happen.")
        script.push("You  will  have  to  be  strong.")
        script.push("the  process  will  hurt  you  a  lot.")
        script.push("but  you  are  the  strongest  person  i  know.")
        script.push("and  i  will  be  with  you  through  it  all.")
        script.push("you  will  not  catch  me  oversleeping  a  single  time.")
        script.push("everything  will  get  better.")
        script.push("You  are  very  kind,  lyrina...")
        script.push("I  trust  you.")
        script.push("I  will  be  strong.  I  promise  you.")
        script.push("I  know  you  will  be.")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "flusselle";
        title.text = s;
        title.color = speakerStatus[s];

        speakers.push("flusselle")
        speakers.push("flusselle")
        speakers.push("flusselle")
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
        speakers.push("flusselle")
        speakers.push("flusselle")
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

        hemilight.intensity = 1.;

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
                setTimeout(() => {
                    dialogBox.isVisible = true;
                    se_message.play();
                    narator.isVisible = false;
                    this.typeWriter(message, script[script_index], 0);
                }, 2000)
            })
        }, 1000)


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
                        skyboxanim.setKeys(skyboxkeystwo);
                        skybox.animations = [skyboxanim];
                        setTimeout(() => {
                            this.scene.beginAnimation(this.flusselle, 0, 180, false)
                            this.scene.beginAnimation(this.lyrina, 0, 180, false, undefined, (() => {
                                setTimeout(() => {
                                    this.scene.beginAnimation(skybox, 0, 180, false, undefined, (() => {
                                        setTimeout(() => {
                                            this.nextScene();
                                        }, 4000)
                                    }))
                                }, 3000)
                            }))
                        }, 2000)
                    }
                    
                    else if (script_index == 2) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            this.flusselle.playAnimation(2, 3, true, 150);
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000);
                    }
                    
                    else if (script_index == 3) {
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
                    
                    else if (script_index == 5) {
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
                    
                    else if (script_index == 7) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            se_message.play();
                            this.flusselle.playAnimation(4, 5, true, 150)
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000);
                    }
                    
                    else if (script_index == 10) {
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
                    
                    else if (script_index == 13) {
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
                    
                    else if (script_index == 14) {
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
                        }, 3000);
                    }
                    
                    else if (script_index == 17) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(8, 9, true, 150)
                            setTimeout(() => {
                                se_message.play();
                                speaker_index++;
                                s = speakers[speaker_index];
                                message.fontSize = 27;
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            },2000)
                        }, 2000);
                    }
                    
                    else if (script_index == 18) {
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
                        }, 3000);
                    }
                    
                    else if (script_index == 19) {
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
                        }, 3000);
                    }
                    
                    else if (script_index == 21) {
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
                        }, 3000);
                    }
                    
                    else if (script_index == 22) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000);
                    }
                    
                    else if (script_index == 23) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(10, 11, true, 150)
                            setTimeout(() => {
                                se_message.play();
                                speaker_index++;
                                s = speakers[speaker_index];
                                message.fontSize = 27;
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            },2000)
                        }, 2000);
                    }
                    
                    
                    else if (script_index == 26) {
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
                        }, 3000);
                    }
                    
                    else if (script_index == 27) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.lyrina.playAnimation(8, 9, true, 150)
                            setTimeout(() => {
                                se_message.play();
                                speaker_index++;
                                s = speakers[speaker_index];
                                message.fontSize = 27;
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            },2000)
                        }, 2000);
                    }
                    
                    else if (script_index == 30) {
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
                    
                    else if (script_index == 32) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.lyrina.playAnimation(10, 11, true, 150);
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
                    
                    else if (script_index == 34) {
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
                    
                    else if (script_index == 36) {
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
                    
                    else if (script_index == 37) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.lyrina.playAnimation(12, 13, true, 150)
                            this.flusselle.playAnimation(14, 15, true, 150)
                            setTimeout(() => {
                                se_message.play();
                                speaker_index++;
                                s = speakers[speaker_index];
                                message.fontSize = 27;
                                title.color = speakerStatus[s];
                                title.text = s;
                                dialogBox.isVisible = true;
                                this.typeWriter(message, script[script_index], 0);
                            },2000)
                        }, 2000);
                    }
                    
                    else if (script_index == 40) {
                        dialogBox.isVisible = false;
                        setTimeout(() => {
                            this.flusselle.playAnimation(16, 17, true, 150)
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
                    
                    else if (script_index == 41) {
                        dialogBox.isVisible = false;
                        this.stable = true;
                        setTimeout(() => {
                            se_message.play();
                            speaker_index++;
                            s = speakers[speaker_index];
                            message.fontSize = 27;
                            title.color = speakerStatus[s];
                            title.text = s;
                            dialogBox.isVisible = true;
                            this.typeWriter(message, script[script_index], 0);
                        }, 3000);
                    }
                    
                    else if (script_index == 43) {
                        dialogBox.isVisible = false;
                        this.scene.beginAnimation(skybox, 0, 180, false, undefined);
                        setTimeout(() => {
                            this.lyrina.playAnimation(14, 15, true, 150)
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

                    else {
                        if (script_index == 1) {
                            this.flusselle.playAnimation(0, 1, true, 150);
                        }
                        
                        if (script_index == 4) {
                            this.lyrina.playAnimation(2, 3, true, 150);
                        }
                        
                        if (script_index == 6) {
                            this.lyrina.playAnimation(4, 5, true, 150);
                        }
                        
                        if (script_index == 8) {
                            this.lyrina.playAnimation(6, 7, true, 150);
                        }
                        
                        if (script_index == 16) {
                            this.flusselle.playAnimation(6, 7, true, 150);
                        }

                        if (script_index == 29) {
                            this.flusselle.playAnimation(12, 13, true, 150);
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

    nextScene() {
        const next = new epilogue(this.canvas);
        this.engine.stopRenderLoop();
        if (this.scene) {
            this.scene.dispose();
        }
        this.scene = next.scene;
    }
}