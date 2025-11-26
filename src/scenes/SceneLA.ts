import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder,ActionManager, ExecuteCodeAction} from "@babylonjs/core"

export class SceneLA {
    
    scene: Scene;
    engine: Engine;

    constructor(private canvas:HTMLCanvasElement){
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.engine.runRenderLoop(()=>{
            this.scene.render();
        })
    }


    CreateScene():Scene {
        const scene = new Scene(this.engine);
        const camera = new FreeCamera("camera", new Vector3(0,1,-5), this.scene);
        camera.attachControl();

        const hemilight = new HemisphericLight(
            "hemilight", 
            new Vector3(0,1,0), 
            this.scene
        );

        hemilight.intensity = 0.5;

        const ground = MeshBuilder.CreateGround(
            "ground", 
            {width:10, height:10}, 
            this.scene
        );

        this.CreateMovment(scene);

        return scene;
    }

    CreateMovment(scene: Scene): void {
        const ball = MeshBuilder.CreateSphere("ball", {diameter:1}, this.scene);

        ball.position = new Vector3(0,1,0);

        const keyStatus = {q:false,s:false};

        scene.actionManager = new ActionManager(scene);

        scene.actionManager.registerAction(new ExecuteCodeAction
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
        scene.actionManager.registerAction(new ExecuteCodeAction
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

        let moving=false;
        const speed=0.1;
        let acceleration=0;
        scene.onBeforeRenderObservable.add(()=>{
            if(keyStatus.q||keyStatus.s){
                moving=true;
                if(keyStatus.q && !keyStatus.s){
                    ball.position.x += acceleration;
                    if(acceleration>-speed){
                        acceleration-=0.004;
                    }
                }
                else if(keyStatus.s ){
                    ball.position.x += acceleration;
                    if(acceleration<speed){
                        acceleration+=0.004;
                    }
                }
            }
            else{
                if(acceleration>0){
                    acceleration-=0.002;
                    ball.position.x += acceleration;
                }
                else if(acceleration<0){
                    acceleration+=0.002;
                    ball.position.x += acceleration;
                }
                else if(Math.abs(acceleration)<0.002){
                    acceleration=0;
                }
                if(moving){
                    moving=false;
                }
            }
        });
    }
}