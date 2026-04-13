import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, CreateAudioEngineAsync, CreateSoundAsync} from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'

export class SceneCB2 { 
    
    scene: Scene;
    engine: Engine;

    constructor(private canvas:HTMLCanvasElement){
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        //Inspector.show(this.scene, {})
        this.engine.runRenderLoop(()=>{
            this.scene.render();
        })
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);
        
        const sideCamera = new FreeCamera("SideCamera", new Vector3(0, 0.05, 1.2), scene);
        // Make camera look toward -Z (scene) so it doesn't look into empty space
        sideCamera.setTarget(new Vector3(sideCamera.position.x, sideCamera.position.y, 0));

        const hemilight = new HemisphericLight(
            "hemilight", 
            new Vector3(0,1,0), 
            this.scene
        );

        hemilight.intensity = 1.;

        this.CreateCharacters(scene);
        //this.CreateEnnemy(scene);
        this.CreateEnvironment(scene);
        this.CreateDialog();


        return scene;
    }

    
    async CreateCharacters(scene:Scene): Promise<void> {

        //importing the sprites for the character
        const LManager = new SpriteManager(
            'LManager',
            './sprites/spritesheet_lyrina.png',
            1,
            336,
            scene
        );
        const lyrina = new Sprite('lyrina', LManager)
        lyrina.size = 0.4;
        lyrina.position = new Vector3(0,0,0)
        lyrina.playAnimation(0, 7, true, 100);
    }


    async CreateEnvironment(scene:Scene): Promise<void> {
        const spriteManager = new SpriteManager(
            "tilesManager",
            "./sprites/grass_m.png",
            100,           // max number of sprites
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
        }

        const skybox = Mesh.CreateBox("BackgroundSkybox", 500, scene, undefined, Mesh.BACKSIDE);
    
        const backgroundManager = new SpriteManager(
            "tilesManager",
            "./sprites/place_holder_b.jpg",
            100,           
            {width:961, height:501}, 
            scene
        );
        const background = new Sprite("background", backgroundManager);

        background.position.z = -1;
        background.position.y = 1;
        background.width = 6;
        background.height = 2.9;
    }

    canSkip = false;

    async CreateDialog(): Promise<void> {
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
        advancedTexture.addControl(dialogBox);

        const panel = new GUI.StackPanel();
        dialogBox.addControl(panel);

        const title = new GUI.TextBlock();
        title.text = "lyrina";
        title.paddingLeft = "20px";
        title.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        title.height = "40px";
        title.color = "gray";
        title.fontSize = 24;
        panel.addControl(title);

        // Message
        const message = new GUI.TextBlock();
        const script: string[] = [];
        const speakers = [];
        
        script.push("Is it hard to  communicate  with  this? seems  like  it is  for  now. I could  stubornly figure out how to  write  every  dialog. seems  like  a  chore  though.");
        script.push("I hope it works without any issue. could be annoying very fast if it didn't.");

        let script_index = 0;

        speakers.push("lyrina")
        this.typeWriter(message, script[0], 0)
        message.fontSize = 27;
        message.height = "70px";
        message.color = "white";
        message.textWrapping = true;
        panel.addControl(message);

        const buttonPanel = new GUI.StackPanel();
        buttonPanel.isVertical = false;
        buttonPanel.height = "50px";
        buttonPanel.width = "50px";
        buttonPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.addControl(buttonPanel);

        // block for the shading of the camera
        const block = MeshBuilder.CreateBox("block", {width:1, height:0.5, depth:0.1});
        block.position = new Vector3(0,0,0.15);
        const mat = new StandardMaterial("m");
        mat.alpha = 0.;
        mat.diffuseColor = new Color3(0,0,0);
        block.material = mat;

        const audioEngine = await CreateAudioEngineAsync();

        const se_message = await CreateSoundAsync("se_message",
            "./sounds/SEQ_SE_MESSAGE.wav"
        );

        // Wait until audio engine is ready to play sounds.
        await audioEngine.unlockAsync();

        const yesButton = GUI.Button.CreateImageButton("next", "","./sprites/dialogButton.png");
        yesButton.width = "160px";
        yesButton.height = "40px";
        yesButton.thickness = 0;
        yesButton.color = "white";
        yesButton.paddingRight = "20px";
        yesButton.onPointerUpObservable.add(() => {
            console.log("User clicked Next");
            if(this.canSkip) {
                this.canSkip = false;
                se_message.play();
                //dialogBox.isVisible = false; // Hide dialog
                script_index++;
                message.text = "";
                this.typeWriter(message, script[script_index], 0);
            }
        });
        buttonPanel.addControl(yesButton);
    }

    async typeWriter(message:GUI.TextBlock, script:string, line_index:number):Promise<void> {
        if (line_index < script.length) {
            message.text += script.charAt(line_index);
            setTimeout(() => {this.typeWriter(message, script, ++line_index)}, 20);
        }
        else {
            this.canSkip = true;
        }
    }
}
