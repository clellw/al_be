import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction} from "@babylonjs/core"

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
}