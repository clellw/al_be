import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3} from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'

export class SceneCB {
    
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

        scene.createDefaultCameraOrLight(true, false,true);

        const hemilight = new HemisphericLight(
            "hemilight", 
            new Vector3(0,1,0), 
            this.scene
        );

        hemilight.intensity = 0.;
        

        const sphere = MeshBuilder.CreateSphere('sphere', {diameter:3, segments:5}, this.scene);

        sphere.material = new StandardMaterial('material');
        sphere.material.wireframe = true;

        this.CreateMainCharacter(scene);

        this.CreateEnvironment(scene);
        this.CreateDialog(scene);

        return scene;
    }

    async CreateMainCharacter(scene:Scene): Promise<void> {

        const LManager = new SpriteManager(
            'LManager',
            './sprites/spritesheet_L.png',
            1,
            336,
            scene
        );

        const lyrina = new Sprite('lyrina', LManager)

        lyrina.size = 0.4;

        lyrina.playAnimation(0, 7, true, 100);
        
        const keyStatus = {
            f: false,
            b: false,
        };

        scene.actionManager = new ActionManager(scene);

        scene.actionManager.registerAction(new ExecuteCodeAction
            (ActionManager.OnKeyDownTrigger, 
                (event) => {
                    let key = event.sourceEvent.key;
                    if(key !== "Shift") {
                        key = key.toLowerCase();
                    }
                    if(key in keyStatus) {
                        keyStatus[key as keyof typeof keyStatus] = true;
                    }
                }
            )
        );

        scene.actionManager.registerAction(new ExecuteCodeAction
            (ActionManager.OnKeyUpTrigger,
                (event) =>{
                    let key = event.sourceEvent.key;
                    if(key !== "Shift") {
                        key = key.toLowerCase();
                    }
                    if(key in keyStatus) {
                        keyStatus[key as keyof typeof keyStatus] = false;
                    }
                }
            )
        )

        let moving = false;
        let newAnim = true;

        scene.onBeforeRenderObservable.add(() => {
            if(keyStatus.f || keyStatus.b) {
                moving = true;
                if(newAnim) {
                    lyrina.playAnimation(9, 13, true, 120);
                    newAnim = false
                }
                if(keyStatus.b && !keyStatus.f) {
                    lyrina.invertU = true;
                }
                else if(keyStatus.f) {
                    lyrina.invertU = false;
                }
            }
            else if(moving) {
                lyrina.playAnimation(0,7,true,100);
                moving = false;
                newAnim = true;
            }
            
        });
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
        for (let i = 0; i < 10; i++) {
            const tile = new Sprite("tile" + i, spriteManager);
            tile.position.x = -9 * 0.147 / 2 + i * 0.147; // space tiles apart
            tile.size = 0.15;
            tile.position.y = -0.18;
            tile.position.z = 0.1;
            tile.cellIndex = 0; // choose tile from sprite sheet
        }

        const skybox = Mesh.CreateBox("BackgroundSkybox", 500, scene, undefined, Mesh.BACKSIDE);
    
        // Create and tweak the background material.
        const backgroundManager = new SpriteManager(
            "tilesManager",
            "./sprites/place_holder_b.jpg",
            100,           
            {width:961, height:501}, 
            scene
        );
        const background = new Sprite("background", backgroundManager);
        background.position.z = 2;
        background.position.y = 1;
        background.width = 6;
        background.height = 2.9;
    }

    async CreateDialog(scene:Scene): Promise<void> {
        const font = new FontFace('MyCustomFont', 'url(./font/ARCADECLASSIC.TTF)');
        font.load();
        font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            console.log('Font loaded and ready to use in Babylon.js');
        });
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        /*const dialogBox = new GUI.Rectangle();
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
        message.text = "Is it hard to  communicate  with  this? seems  like  it is  for  now. I could  stubornly figure out how to  write  every  dialog. seems  like  a  chore  though.";
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

        const block = MeshBuilder.CreateBox("block", {width:1, height:0.5, depth:0.1});
        block.position = new Vector3(0,0,-0.5);
        const mat = new StandardMaterial("m");
        mat.alpha = 0.2;
        mat.diffuseColor = new Color3(0,0,0);
        block.material = mat;

        const yesButton = GUI.Button.CreateImageButton("next", "","./sprites/dialogButton.png");
        yesButton.width = "160px";
        yesButton.height = "40px";
        yesButton.thickness = 0;
        yesButton.color = "white";
        yesButton.paddingRight = "20px";
        yesButton.onPointerUpObservable.add(() => {
            console.log("User clicked Next");
            //dialogBox.isVisible = false; // Hide dialog
            message.text = "I hope it works without any issue. could be annoying very fast if it didn't.";
            mat.alpha = 0.5;
        });
        buttonPanel.addControl(yesButton);*/
        
        const healthbar = new GUI.Image("healthbar", "./sprites/healthbar_l.png");

        healthbar.paddingLeft = "4%";
        healthbar.paddingTop = "5%";
        healthbar.height = "25%";
        healthbar.width = "30%";
        healthbar.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        healthbar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(healthbar);

        const health_g = new GUI.Image("healthbar", "./sprites/health_g.png");
        health_g.paddingLeft = "14.35%";
        health_g.paddingTop = "20.4%";
        health_g.height = "18.9%";
        health_g.width = "28.2%";
        health_g.sourceLeft = 0; //crop image ; 440 crops all the healthbar
        health_g.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        health_g.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(health_g);
        let part = 2;

        let health = 440;

        scene.actionManager.registerAction(new ExecuteCodeAction
            (ActionManager.OnKeyDownTrigger, 
                (event) => {
                    let key = event.sourceEvent.key;
                    if(key !== "Shift") {
                        key = key.toLowerCase();
                    }
                    if(key == "r") {
                        health -= 20;
                        if(part == 2 && health <= 220) {
                            health_g.source = "./sprites/health_o.png";
                            part = 1;
                        }
                        
                        if(part ==1 && health <= 80) {
                            health_g.source = "./sprites/health_r.png";
                            part = 0;
                        }
                    }
                }
            )
        );
        scene.onBeforeRenderObservable.add(() => {
            health_g.sourceLeft = 440 - health;
        })
    }
}