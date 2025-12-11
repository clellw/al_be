import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, FollowCamera, ActionManager, ExecuteCodeAction, StandardMaterial} from "@babylonjs/core"

export class FirstScene {
    
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

        const hemilight = new HemisphericLight(
            "hemilight", 
            new Vector3(0,1,0), 
            this.scene
        );

        hemilight.intensity = 0.;

        const sphere = MeshBuilder.CreateSphere('sphere', {diameter:10, segments:5}, this.scene);

        sphere.material = new StandardMaterial('material');
        sphere.material.wireframe = true;

        this.CreateCharacter(scene);

        return scene;
    }

    async CreateCharacter(scene:Scene): Promise<void> {
        //importing the sprites for the character
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

        //creating the movements of the player and the camera
        const keyStatus = {q:false,s:false};
        
        scene.actionManager = new ActionManager(scene);
        
        const followCamera = new FollowCamera("FollowCamera",new Vector3(0, 1.7, 0),scene);
        followCamera.radius = 1.7; // Distance from the target
        followCamera.heightOffset = 0; // Height above the target
        followCamera.rotationOffset = 0; // Angle around the target
        followCamera.cameraAcceleration = 0.9; // How fast to move
        followCamera.maxCameraSpeed = 100000;

        // FollowCamera needs a mesh target, so we create an invisible box to track the sprite
        const spriteAnchor = MeshBuilder.CreateBox("anchor", {size: 0.1}, scene);
        spriteAnchor.isVisible = false;
        spriteAnchor.position = lyrina.position.clone();
        followCamera.lockedTarget = spriteAnchor;
        scene.activeCamera = followCamera;

        
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

        let newAnim = true;
        const speed=0.07;
        let acceleration=0;
        scene.onBeforeRenderObservable.add(()=>{
            if(keyStatus.q||keyStatus.s){
                if(newAnim) {
                    lyrina.playAnimation(9, 13, true, 120);
                    newAnim = false
                }
                if(keyStatus.s && !keyStatus.q){
                    lyrina.invertU = false;
                    lyrina.position.x += acceleration;
                    if(acceleration>-speed){
                        acceleration-=0.004;
                    }
                }
                else if(keyStatus.q ){
                    lyrina.invertU = true;
                    lyrina.position.x += acceleration;
                    if(acceleration<speed){
                        acceleration+=0.004;
                    }
                }
            }
            else{
                if(Math.abs(acceleration)<0.006){
                    acceleration=0;
                }
                else if(acceleration>0){
                    acceleration-=0.008;
                    lyrina.position.x += acceleration;
                }
                else if(acceleration<0){
                    acceleration+=0.008;
                    lyrina.position.x += acceleration;
                }
                if(acceleration==0){
                    if(!newAnim)lyrina.playAnimation(0,7,true,100);
                    newAnim = true;
                }
            }
            //update the position of the anchor
            spriteAnchor.position.copyFrom(lyrina.position);
            console.log(acceleration);
        });
    }
}