import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, CreateAudioEngineAsync, CreateSoundAsync, StaticSound, Animation} from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'

export class CH1_CU_UN_1 { 
    
    scene: Scene;
    engine: Engine;

    lyrina: Sprite;
    flusselle: Sprite;

    constructor(private canvas:HTMLCanvasElement){
        this.engine = new Engine(this.canvas, true);

        this.scene = this.CreateScene();
        //Inspector.show(this.scene, {})
        this.engine.runRenderLoop(()=>{
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
        
        LManager.texture=new Texture(
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
        
        FManager.texture=new Texture(
            "./sprites/cutscenes/fl-c.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        this.flusselle = new Sprite('flusselle', FManager)

        
        this.lyrina.size = 0.45;
        this.lyrina.position = new Vector3(0.1,0,0)
        this.lyrina.playAnimation(0, 7, true, 100);

        
        this.flusselle.size = 0.45;
        this.flusselle.position = new Vector3(-0.3,0,0)
        this.flusselle.playAnimation(88, 89, true, 150);
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);
        
        //const sideCamera = new FreeCamera("SideCamera", new Vector3(0, 0.05, 1.2), scene);

        const hemilight = new HemisphericLight(
            "hemilight", 
            new Vector3(0,1,0), 
            this.scene
        );

        hemilight.intensity = 1.;

        //this.CreateEnnemy(scene);
        this.CreateEnvironment(scene);
        this.CreateDialog();


        return scene;
    }



    async CreateEnvironment(scene:Scene): Promise<void> {
        
        const houseManager = new SpriteManager(
            'houseManager',
            './sprites/cutscenes/house.png',
            1,
            244,
            this.scene
        );
        
        houseManager.texture=new Texture(
            "./sprites/cutscenes/house.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        const house = new Sprite('house', houseManager)
        house.position = new Vector3(0.8,0.24,0)
        house.size = 0.9

        const mailboxManager = new SpriteManager(
            'mailboxManager',
            './sprites/cutscenes/house.png',
            1,
            54,
            this.scene
        );
        
        mailboxManager.texture=new Texture(
            "./sprites/cutscenes/mailbox.png",
            this.scene,
            false, // no mipmaps
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        const mailbox = new Sprite('mailbox', mailboxManager)
        mailbox.position = new Vector3(-0.4,-0.025,0)
        mailbox.size = 0.2

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
            tile3.position.y = -0.465;
            tile3.position.z = -0.01;
            tile3.cellIndex = 0; // choose tile from sprite sheet
        }

        const skybox = Mesh.CreateBox("BackgroundSkybox", 500, scene, undefined, Mesh.BACKSIDE);
    
        const backgroundManager = new SpriteManager(
            "tilesManager",
            "./sprites/background_house.jpg",
            100,           
            {width:1800, height:1200}, 
            scene
        );
        const background = new Sprite("background", backgroundManager);

        background.position.z = -1;
        background.position.y = 0.5;
        background.width = 6;
        background.height = 2.9;
    }

    canSkip = false;

    async CreateDialog(): Promise<void> {

        const sideCamera = new FreeCamera("SideCamera", new Vector3(0, 0.6, 1.2), this.scene);
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
        
        const speakerStatus: { [key: string]: string } = { "lyrina": "brown", "flusselle": "rgb(0, 157, 255)", "???": "rgb(0, 157, 255)" };
        
        script.push("!This world is a simulation we created to develop Artificial Intelligences.")
        script.push("!I dive into it every day to follow their development.")
        script.push("!Here, I'm called...")
        script.push("lyrina!  wake  up!  it's  time  already!")
        script.push("ah,  finally!  I  thought  you'd  never  wake  up  today.");
        script.push("Sorry.  guess  I  shouldn't  read  too  late  at  night.");
        script.push("Like  it's  the  first  time  that  happens.  You  never  learn,  do  you?")
        script.push("!This is Flusselle, or rather, this is what she believes she's called.")
        script.push("!Her real version name is S1-F3. She's an AI we are developping to have feelings.")
        script.push("do  we  have  any  new  mission  for  the  day?")
        script.push("yes.  a   mission  to retrieve  an  orb  from  the  hands  of  a  mischievous  individual.")
        script.push("...")
        script.push("what?  that's  it?")
        script.push("Hum...  I'm  afraid  so.")
        script.push("(this  has  to   be  the  worst  one  yet.)")
        script.push("!This simulation is her reality.")
        script.push("!In her programming, we instructed her with the knowledge she needs.")
        script.push("!We are members of a guild accomplishing missions and errands for the crown.")
        script.push("!The missions we are assigned to are made up by Raphaël, A.K.A. the worst storyteller alive.")
        script.push("Come  on!  Psyche  up  a  little!  It  will  not  be  that  boring.")
        script.push("I  wish  I  were  as  optimistic  as  you.")
        script.push("Let's  not  waste  anymore  time.  Here  we  go!")
        script.push("/")

        let script_index = 0;
        let speaker_index = 0;

        let s = "flusselle";
        title.text = s;
        title.color = speakerStatus[s];


        speakers.push("???")
        speakers.push("???")
        speakers.push("???")
        speakers.push("lyrina")
        speakers.push("???")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("flusselle")
        speakers.push("lyrina")
        speakers.push("flusselle")

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
        const block = MeshBuilder.CreateBox("block", {width:3, height:50, depth:0.1});
        block.position = new Vector3(0,0.6,0.15);
        const mat = new StandardMaterial("m");
        mat.alpha = 1.;
        mat.diffuseColor = new Color3(0,0,0);
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
            "./sounds/music/The Way Home.mp3"
        );
        music.volume = 0.3
        music.loop = true;

        this.naratorWriter(narator, script[0], 1, na_message);

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
            { frame: 0, value: new Vector3(0, 0.6, 1.2) }, // Start position
            //{ frame: 60, value: new Vector3(10, 5, 0) }, // Mid position
            { frame: 120, value: new Vector3(0, 0.05, 1.2) } // End position
        ];

        camanim.setKeys(camkeys);

        // Attach animation to camera
        sideCamera.animations.push(camanim);


        const yesButton = GUI.Button.CreateImageButton("next", "","./sprites/dialogButton.png");
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
            (ActionManager.OnKeyDownTrigger,(event)=>{
                let key = event.sourceEvent.key;
                if(key !== "Shift"){
                    key = key.toLowerCase();
                }
                if(key in keyStatus){
                    keyStatus[key as keyof typeof keyStatus] = true;
                }
            })
        );
        this.scene.actionManager.registerAction(new ExecuteCodeAction
            (ActionManager.OnKeyUpTrigger,(event)=>{
                let key = event.sourceEvent.key;
                if(key !== "Shift"){
                    key = key.toLowerCase();
                }
                if(key in keyStatus){
                    keyStatus[key as keyof typeof keyStatus] = false;
                }
            })
        );

        this.scene.onBeforeRenderObservable.add(() => {
            if(keyStatus["e"]) {
                console.log("User pressed e");
                if(this.canSkip) {
                this.canSkip = false;
                script_index++;
                message.text = "";
                narator.text = "";


                if(script[script_index].startsWith("/")) {
                    dialogBox.isVisible = false;
                    this.scene.beginAnimation(block, 120, 0, false, undefined, () => {block.material!.alpha=1});
                    this.fadeVolumeOut(music);
                }


                else if(script_index == 4) {
                    narator.color = "black";
                    dialogBox.isVisible = false;
                    setTimeout(() => {
                        this.scene.beginAnimation(block, 0, 120, false, undefined, () => {
                            music.play();
                            this.scene.beginAnimation(sideCamera, 0, 120, false, undefined, () => {
                                setTimeout(() => {
                                    setTimeout(() => {
                                        su_message.play();
                                        this.flusselle.playAnimation(90, 91, true, 150) 
                                        setTimeout(() => {
                                            this.flusselle.invertU = true;
                                            this.flusselle.playAnimation(8, 15, true, 100) 
                                            se_message.play();
                                            speaker_index++;
                                            s = speakers[speaker_index];
                                            title.color = speakerStatus[s];
                                            title.text = s;
                                            dialogBox.isVisible = true;
                                            narator.isVisible = false;
                                            this.typeWriter(message, script[script_index], 0);
                                        }, 1000)  
                                    }, 1000)
                                }, 500)
                            });
                        });
                    }, 1000);
                }

                else {
                    if(script_index == 5) {
                        this.lyrina.playAnimation(this.lyrina.cellIndex+8, 15, false, 100, () => {this.lyrina.playAnimation(8, 15, true, 100)});
                    }
                    if(script_index == 6) {
                        this.flusselle.playAnimation(this.flusselle.cellIndex+8, 23, false, 100, () => {this.flusselle.playAnimation(16, 23, true, 100)});
                    }
                    if(script_index == 10) {
                        this.flusselle.playAnimation(88, 89, true, 150);
                    }
                    if(script_index == 11) {
                        this.flusselle.playAnimation(94, 95, true, 150);
                        this.lyrina.playAnimation(this.lyrina.cellIndex-8, 7, false, 100, () => {this.lyrina.playAnimation(0, 7, true, 100)});
                    }
                    if(script_index == 12) {
                        this.lyrina.playAnimation(this.lyrina.cellIndex+48, 55, false, 100, () => {this.lyrina.playAnimation(48, 55, true, 100)});
                    }
                    if(script_index == 13) {
                        this.flusselle.playAnimation(98, 99, true, 150); 
                    }
                    if(script_index == 14) {
                        this.lyrina.playAnimation(this.lyrina.cellIndex+8, 63, false, 100, () => {this.lyrina.playAnimation(56, 63, true, 100)});
                    }
                    if(script_index == 19) {
                        this.flusselle.playAnimation(24, 31, true, 100);
                    }
                    if(script_index == 20) {
                        this.lyrina.playAnimation(this.lyrina.cellIndex-32, 31, false, 100, () => {this.lyrina.playAnimation(24, 31, true, 100)});
                    }
                    if(script_index == 21) {
                        //this.flusselle.playAnimation(this.flusselle.cellIndex+8, 31, false, 100, () => {this.flusselle.playAnimation(24, 31, true, 100)});
                        this.flusselle.playAnimation(100, 101, true, 150);
                    }

                    if(script[script_index].startsWith("!")) {
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

    async typeWriter(message:GUI.TextBlock, script:string, line_index:number):Promise<void> {
        if (line_index <= script.length) {
            message.text += script.charAt(line_index);
            setTimeout(() => {this.typeWriter(message, script, ++line_index)}, 20);
        }
        else {
            setTimeout(() => { this.canSkip = true; }, 100)
        }
    }


    async naratorWriter(narator:GUI.TextBlock, script:string, index:number, na:StaticSound):Promise<void> {
        if (index <= script.length) {
            narator.text += script.charAt(index);
            na.play();
            setTimeout(() => {this.naratorWriter(narator, script, ++index, na)}, 30);
        }
        else {
            setTimeout(() => { this.canSkip = true; }, 100)
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
