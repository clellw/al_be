import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture} from "@babylonjs/core"

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
}