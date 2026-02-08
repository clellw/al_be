import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, FollowCamera, ActionManager, ExecuteCodeAction, StandardMaterial, Mesh} from "@babylonjs/core"

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

        const hemilight = new HemisphericLight(
            "hemilight", 
            new Vector3(0,1,0), 
            this.scene
        );

        hemilight.intensity = 1.0;

        const sphere = MeshBuilder.CreateSphere('sphere', {diameter:10, segments:5}, this.scene);

        sphere.material = new StandardMaterial('material');
        sphere.material.wireframe = true;

        this.CreateCharacter(scene);

        return scene;
    }

    isCollidingWithBlock (spriteAnchor: Mesh, block: Mesh): boolean{
        const spriteMin = new Vector3(
            spriteAnchor.position.x - spriteAnchor.scaling.x * spriteAnchor.getBoundingInfo().boundingBox.extendSize.x,
            spriteAnchor.position.y - spriteAnchor.scaling.y * spriteAnchor.getBoundingInfo().boundingBox.extendSize.y,
            0
        );
        const spriteMax = new Vector3(
            spriteAnchor.position.x + spriteAnchor.scaling.x * spriteAnchor.getBoundingInfo().boundingBox.extendSize.x,
            spriteAnchor.position.y + spriteAnchor.scaling.y * spriteAnchor.getBoundingInfo().boundingBox.extendSize.y,
            0
        );

        const blockMin = new Vector3(
            block.position.x - block.scaling.x * block.getBoundingInfo().boundingBox.extendSize.x,
            block.position.y - block.scaling.y * block.getBoundingInfo().boundingBox.extendSize.y,
            0
        );
        const blockMax = new Vector3(
            block.position.x + block.scaling.x * block.getBoundingInfo().boundingBox.extendSize.x,
            block.position.y + block.scaling.y * block.getBoundingInfo().boundingBox.extendSize.y,
            0
        );

        return spriteMin.x <= blockMax.x && spriteMax.x >= blockMin.x &&
                spriteMin.y <= blockMax.y && spriteMax.y >= blockMin.y;
    }

    async CreateCharacter(scene:Scene): Promise<void> {

        const ground = MeshBuilder.CreateBox('block', {width: 10, height: 0.1, depth: 0.5}, this.scene);
        ground.position = new Vector3(0,-0.18,0);

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
        const spriteAnchor = MeshBuilder.CreateBox("anchor", {width: lyrina.width/4, height: lyrina.height/1.71, depth:0.1}, scene);
        spriteAnchor.material = new StandardMaterial('invisibleMat', scene);
        spriteAnchor.material.wireframe = true;
        spriteAnchor.isVisible = true;
        spriteAnchor.position = lyrina.position.clone();
        spriteAnchor.position.y -= 0.009;
        followCamera.lockedTarget = spriteAnchor;
        scene.activeCamera = followCamera;
        let spriteAnchorpotentiel = spriteAnchor.clone("spriteAnchorpotentiel");
        spriteAnchorpotentiel.isVisible = false;
        let groundcheat = ground.clone("groundcheat");
        groundcheat.isVisible = false;
        while(!this.isCollidingWithBlock(spriteAnchor, ground)){
            lyrina.position.y -= 0.01;
            spriteAnchor.position.y -= 0.01;
        }
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
            if(!this.isCollidingWithBlock(spriteAnchor, ground)){
                lyrina.position.y -= 0.001;
            }
            if(keyStatus.q||keyStatus.s){
                if(newAnim) {
                    lyrina.playAnimation(9, 13, true, 120);
                    newAnim = false
                }
                if(keyStatus.s && !keyStatus.q){
                    lyrina.invertU = false;
                    spriteAnchorpotentiel = spriteAnchor.clone("spriteAnchorpotentiel");
                    spriteAnchorpotentiel.isVisible = false;
                    spriteAnchorpotentiel.position.x += acceleration;
                    groundcheat = ground.clone("groundcheat");
                    groundcheat.isVisible = false;
                    groundcheat.position.y -= 0.01;
                    if(!this.isCollidingWithBlock(spriteAnchorpotentiel, groundcheat)){
                        lyrina.position.x += acceleration;
                        if(acceleration>-speed){
                            acceleration-=0.004;
                        }
                    }
                    else{
                        acceleration=0;
                    }
                }
                else if(keyStatus.q ){
                    lyrina.invertU = true;
                    spriteAnchorpotentiel = spriteAnchor.clone("spriteAnchorpotentiel");
                    spriteAnchorpotentiel.isVisible = false;
                    spriteAnchorpotentiel.position.x += acceleration;
                    groundcheat = ground.clone("groundcheat");
                    groundcheat.isVisible = false;
                    groundcheat.position.y -= 0.01;
                    if(!this.isCollidingWithBlock(spriteAnchorpotentiel, groundcheat)){
                        lyrina.position.x += acceleration;
                        if(acceleration<speed){
                            acceleration+=0.004;
                        }
                    }
                    else{
                        acceleration=0;
                    }
                }
            }
            else{
                if(Math.abs(acceleration)<0.006){
                    acceleration=0;
                }
                else if(acceleration>0){
                    acceleration-=0.008;
                    spriteAnchorpotentiel = spriteAnchor.clone("spriteAnchorpotentiel");
                    spriteAnchorpotentiel.isVisible = false;
                    spriteAnchorpotentiel.position.x += acceleration;
                    groundcheat = ground.clone("groundcheat");
                    groundcheat.isVisible = false;
                    groundcheat.position.y -= 0.01;
                    if(!this.isCollidingWithBlock(spriteAnchorpotentiel, groundcheat)){
                        lyrina.position.x += acceleration;
                    }
                }
                else if(acceleration<0){
                    acceleration+=0.008;
                    spriteAnchorpotentiel = spriteAnchor.clone("spriteAnchorpotentiel");
                    spriteAnchorpotentiel.isVisible = false;
                    spriteAnchorpotentiel.position.x += acceleration;
                    groundcheat = ground.clone("groundcheat");
                    groundcheat.isVisible = false;
                    groundcheat.position.y -= 0.01;
                    if(!this.isCollidingWithBlock(spriteAnchorpotentiel, groundcheat)){
                        lyrina.position.x += acceleration;
                    }
                }
                if(acceleration==0){
                    if(!newAnim)lyrina.playAnimation(0,7,true,100);
                    newAnim = true;
                }
            }
            //update the position of the anchor
            spriteAnchor.position.copyFrom(lyrina.position);
            spriteAnchor.position.y -= 0.009;
            console.log(acceleration);
        });
    }
}