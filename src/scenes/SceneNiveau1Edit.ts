import {Scene, Engine, Camera, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SpriteManager, Sprite, StandardMaterial, ActionManager, ExecuteCodeAction, Mesh, BackgroundMaterial, Texture, CubeTexture, Color3, PointerEventTypes, KeyboardEventTypes, Matrix} from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'
import { Slime } from "./Slime";
import { Platforme } from "./Platforme";
import { Ground } from "./Ground";
import { Obstacles } from "./Obstacles";
import { Obstaclesflying } from "./Obstaclesflying";
import { Obstaclesinvisibles } from "./Obstaclesinvisibles";
import { Slimerouge } from "./Slimerouge";
import { Guepe } from "./Guepe";
import { Frog } from "./Frog";
import { Nuage } from "./Nuage";
import { Frogpurple } from "./Frogpurple";
import {Guepepurple} from "./Guepepurple";

type LevelObjectType = "ground" | "obstacle" | "obstacleFlying" | "obstacleInvisible" | "platform";
type EnemyObjectType = "slime" | "slimerouge" | "guepe" | "guepepurple" | "frog" | "frogpurple";
type EditorSpawnType = LevelObjectType | EnemyObjectType;

type EnemyEntity = Slime | Slimerouge | Guepe | Guepepurple | Frog | Frogpurple;
type GroundEnemyEntity = Slime | Slimerouge | Frog | Frogpurple;
type AirEnemyEntity = Guepe | Guepepurple;

type LevelObjectRecord = {
    id: string;
    type: LevelObjectType;
    name: string;
    position: Vector3;
    mesh: Mesh;
    tiles: Sprite[];
    ownerSprite?: Sprite;
    sizeintitles?: number;
    widthincubes?: number;
    heightincubes?: number;
};

type EnemyRecord = {
    id: string;
    type: EnemyObjectType;
    name: string;
    position: Vector3;
    enemy: EnemyEntity;
    slimeCollider: Mesh;
    attackCollider: Mesh;
    sprite: Sprite;
    axe?: number;
    distance?: number;
    debut?: boolean;
};

export class SceneNiveau1Edit {
    
    scene: Scene;
    engine: Engine;
    devpoweractive: boolean;
    private levelObjects: LevelObjectRecord[] = [];
    private levelObjectCounter = 1;
    private enemyObjects: EnemyRecord[] = [];
    private enemyObjectCounter = 1;
    private selectedLevelObjectId: string | null = null;
    private selectedEnemyObjectId: string | null = null;
    private levelEditorEnabled = true;
    private enemiesPaused = false;
    private levelEditorSpawnType: EditorSpawnType = "obstacle";
    private levelEditorHUD: GUI.TextBlock | null = null;
    private runtimeSlimes: GroundEnemyEntity[] = [];
    private runtimeGuepes: AirEnemyEntity[] = [];
    private runtimeFrogs: Frog[] = [];
    private runtimeFrogsPurple: Frogpurple[] = [];

    private formatLevelNumber(value: number): string {
        return Number(value.toFixed(3)).toString();
    }

    private updateLevelEditorHUD(): void {
        if (!this.levelEditorHUD) {
            return;
        }

        const selectedLevel = this.levelObjects.find((obj) => obj.id === this.selectedLevelObjectId) ?? null;
        const selectedEnemy = this.enemyObjects.find((obj) => obj.id === this.selectedEnemyObjectId) ?? null;

        const selectedLabel = selectedLevel
            ? `${selectedLevel.name} (${selectedLevel.type})`
            : selectedEnemy
            ? `${selectedEnemy.name} (${selectedEnemy.type})`
            : "aucun";

        const enemyHint = selectedEnemy && selectedEnemy.type === "guepepurple"
            ? `\nGP: dist=${this.formatLevelNumber(selectedEnemy.distance ?? 0.17)} | axe=${selectedEnemy.axe ?? 0} | debut=${selectedEnemy.debut ? "true" : "false"}`
            : "";

        this.levelEditorHUD.text =
            `EDITOR ${this.levelEditorEnabled ? "ON" : "OFF"}\n` +
            `Ennemis: ${this.enemiesPaused ? "PAUSE" : "RUN"}\n` +
            `Type spawn: ${this.levelEditorSpawnType}\n` +
            `Selection: ${selectedLabel}${enemyHint}\n` +
            `F1 on/off | F2 type | F3 ajoute | Tab suivant\n` +
            `PageUp/PageDown largeur (GP: distance) | Home/F7 hauteur (GP: axe)\n` +
            `F4 (GP): toggle debut\n` +
            `Delete supprime | F6 export jeu | F9 export edit | F8 pause ennemis`;
    }

    private toggleEnemiesPause(): void {
        this.enemiesPaused = !this.enemiesPaused;
        this.updateLevelEditorHUD();
        console.log(`Mode pause ennemis: ${this.enemiesPaused ? "ON" : "OFF"}`);
    }

    private setSelectedLevelObject(id: string | null): void {
        this.selectedLevelObjectId = id;
        if (id !== null) {
            this.selectedEnemyObjectId = null;
        }
    }

    private setSelectedEnemyObject(id: string | null): void {
        this.selectedEnemyObjectId = id;
        if (id !== null) {
            this.selectedLevelObjectId = null;
        }
    }

    private nextLevelObjectName(type: LevelObjectType): string {
        const prefixes: Record<LevelObjectType, string> = {
            ground: "block_edit",
            obstacle: "obstacle_edit",
            obstacleFlying: "obstaclevolant_edit",
            obstacleInvisible: "obstacleinvisible_edit",
            platform: "platform_edit"
        };

        const base = prefixes[type];
        let idx = this.levelObjectCounter;
        while (this.levelObjects.some((obj) => obj.name === `${base}${idx}`)) {
            idx++;
        }
        this.levelObjectCounter = idx + 1;
        return `${base}${idx}`;
    }

    private nextEnemyObjectName(type: EnemyObjectType): string {
        const prefixes: Record<EnemyObjectType, string> = {
            slime: "slime_edit",
            slimerouge: "slimerouge_edit",
            guepe: "guepe_edit",
            guepepurple: "guepepurple_edit",
            frog: "frog_edit",
            frogpurple: "frogpurple_edit"
        };

        const base = prefixes[type];
        let idx = this.enemyObjectCounter;
        while (this.enemyObjects.some((obj) => obj.name === `${base}${idx}`)) {
            idx++;
        }
        this.enemyObjectCounter = idx + 1;
        return `${base}${idx}`;
    }

    private attachLevelObjectMetadata(obj: LevelObjectRecord): void {
        const prevMeta: any = obj.mesh.metadata ?? {};
        obj.mesh.metadata = {
            ...prevMeta,
            editorId: obj.id,
            editorType: obj.type,
            ownerSprite: obj.ownerSprite ?? prevMeta.ownerSprite,
            tiles: obj.tiles.length > 0 ? obj.tiles : prevMeta.tiles
        };
    }

    private attachEnemyObjectMetadata(obj: EnemyRecord): void {
        const attach = (mesh: Mesh, part: "slimeCollider" | "attackCollider") => {
            const prevMeta: any = mesh.metadata ?? {};
            mesh.metadata = {
                ...prevMeta,
                enemyEditorId: obj.id,
                enemyEditorType: obj.type,
                enemyPart: part,
                ownerSprite: obj.sprite,
                ownerCollider: obj.slimeCollider
            };
        };

        attach(obj.slimeCollider, "slimeCollider");
        attach(obj.attackCollider, "attackCollider");
    }

    private addEnemyToRuntimeLists(enemy: EnemyEntity): void {
        if (enemy instanceof Slime || enemy instanceof Slimerouge || enemy instanceof Frog || enemy instanceof Frogpurple) {
            this.runtimeSlimes.push(enemy);
        }

        if (enemy instanceof Guepe || enemy instanceof Guepepurple) {
            this.runtimeGuepes.push(enemy);
        }

        if (enemy instanceof Frog) {
            this.runtimeFrogs.push(enemy);
        }

        if (enemy instanceof Frogpurple) {
            this.runtimeFrogsPurple.push(enemy);
        }
    }

    private removeEnemyFromRuntimeLists(enemy: EnemyEntity): void {
        const removeOne = <T>(arr: T[], value: T) => {
            const index = arr.indexOf(value);
            if (index >= 0) {
                arr.splice(index, 1);
            }
        };

        removeOne(this.runtimeSlimes, enemy as GroundEnemyEntity);
        removeOne(this.runtimeGuepes, enemy as AirEnemyEntity);
        removeOne(this.runtimeFrogs, enemy as Frog);
        removeOne(this.runtimeFrogsPurple, enemy as Frogpurple);
    }

    private spawnEnemyObject(
        scene: Scene,
        type: EnemyObjectType,
        name: string,
        position: Vector3,
        options?: {
            axe?: number;
            distance?: number;
            debut?: boolean;
            id?: string;
            addToList?: boolean;
            addToRuntime?: boolean;
        }
    ): EnemyRecord {
        let enemy: EnemyEntity;
        const axe = options?.axe ?? 0;
        const distance = options?.distance ?? 0.17;
        const debut = options?.debut ?? true;

        if (type === "slime") {
            enemy = new Slime(name, scene, position.clone(), this.devpoweractive);
        } else if (type === "slimerouge") {
            enemy = new Slimerouge(name, scene, position.clone(), this.devpoweractive);
        } else if (type === "guepe") {
            enemy = new Guepe(name, scene, position.clone(), this.devpoweractive);
        } else if (type === "guepepurple") {
            enemy = new Guepepurple(name, scene, position.clone(), this.devpoweractive, axe, distance, debut);
        } else if (type === "frog") {
            enemy = new Frog(name, scene, position.clone(), this.devpoweractive);
        } else {
            enemy = new Frogpurple(name, scene, position.clone(), this.devpoweractive);
        }

        const record: EnemyRecord = {
            id: options?.id ?? `enemyObj${this.enemyObjectCounter++}`,
            type,
            name,
            position: position.clone(),
            enemy,
            slimeCollider: enemy.slimeCollider,
            attackCollider: enemy.attackCollider,
            sprite: enemy.sprite,
            axe: type === "guepepurple" ? axe : undefined,
            distance: type === "guepepurple" ? distance : undefined,
            debut: type === "guepepurple" ? debut : undefined
        };

        this.attachEnemyObjectMetadata(record);

        if (options?.addToRuntime !== false) {
            this.addEnemyToRuntimeLists(enemy);
        }

        if (options?.addToList !== false) {
            this.enemyObjects.push(record);
        }

        return record;
    }

    private setEnemyObjectPosition(record: EnemyRecord, x: number, y: number): void {
        const z = record.position.z;
        record.position = new Vector3(x, y, z);

        if (record.type === "guepe") {
            const guepe = record.enemy as Guepe;
            guepe.sprite.position.x = x;
            guepe.sprite.position.y = y;
            guepe.slimeCollider.position.x = x;
            guepe.slimeCollider.position.y = y - 0.02;
            guepe.attackCollider.position.x = x;
            guepe.attackCollider.position.y = y - 0.02;
        } else if (record.type === "guepepurple") {
            const guepePurple = record.enemy as Guepepurple;
            guepePurple.slimeCollider.position.x = x;
            guepePurple.slimeCollider.position.y = y;
            guepePurple.sprite.position.copyFrom(guepePurple.slimeCollider.position);
            guepePurple.sprite.position.y += 0.02;
            guepePurple.attackCollider.position.copyFrom(guepePurple.sprite.position);
            guepePurple.initialPositionx = x;
            guepePurple.initialPositiony = y;
        } else {
            record.enemy.slimeCollider.position.x = x;
            record.enemy.slimeCollider.position.y = y;
            record.enemy.sprite.position.copyFrom(record.enemy.slimeCollider.position);
            record.enemy.attackCollider.position.copyFrom(record.enemy.sprite.position);
        }

        record.enemy.slimeCollider.computeWorldMatrix(true);
        record.enemy.attackCollider.computeWorldMatrix(true);
    }

    private destroyEnemyObject(record: EnemyRecord): void {
        this.removeEnemyFromRuntimeLists(record.enemy);
        record.enemy.attackCollider.checkCollisions = false;
        record.enemy.sprite.dispose();
        record.enemy.slimeCollider.dispose();
        record.enemy.attackCollider.dispose();
        record.enemy.spriteManager.dispose();
    }

    private rebuildEnemyObject(scene: Scene, record: EnemyRecord): EnemyRecord {
        const index = this.enemyObjects.findIndex((obj) => obj.id === record.id);
        if (index === -1) {
            return record;
        }

        const snapshot = {
            id: record.id,
            type: record.type,
            name: record.name,
            position: record.position.clone(),
            axe: record.axe,
            distance: record.distance,
            debut: record.debut
        };

        this.destroyEnemyObject(record);

        const rebuilt = this.spawnEnemyObject(scene, snapshot.type, snapshot.name, snapshot.position, {
            id: snapshot.id,
            addToList: false,
            axe: snapshot.axe,
            distance: snapshot.distance,
            debut: snapshot.debut
        });

        this.enemyObjects[index] = rebuilt;
        if (this.selectedEnemyObjectId === record.id) {
            this.selectedEnemyObjectId = rebuilt.id;
        }

        return rebuilt;
    }

    private getSelectedEnemyObject(): EnemyRecord | null {
        return this.enemyObjects.find((obj) => obj.id === this.selectedEnemyObjectId) ?? null;
    }

    private spawnLevelObject(
        scene: Scene,
        type: LevelObjectType,
        name: string,
        position: Vector3,
        options?: {
            sizeintitles?: number;
            widthincubes?: number;
            heightincubes?: number;
            id?: string;
            addToList?: boolean;
        }
    ): LevelObjectRecord {
        let mesh: Mesh;
        let tiles: Sprite[] = [];
        let ownerSprite: Sprite | undefined;

        let sizeintitles = options?.sizeintitles;
        let widthincubes = options?.widthincubes;
        let heightincubes = options?.heightincubes;

        if (type === "ground") {
            sizeintitles = Math.max(1, Math.round(sizeintitles ?? 40));
            const ground = new Ground(name, scene, position.clone(), sizeintitles, this.devpoweractive);
            mesh = ground.lemesh;
            tiles = ground.tiles ?? [];
        } else if (type === "obstacle") {
            widthincubes = Math.max(1, Math.round(widthincubes ?? 6));
            heightincubes = Math.max(1, Math.round(heightincubes ?? 2));
            const obstacle = new Obstacles(name, scene, position.clone(), widthincubes, heightincubes, this.devpoweractive);
            mesh = obstacle.lemesh;
            tiles = obstacle.tiles ?? [];
        } else if (type === "obstacleFlying") {
            widthincubes = Math.max(1, Math.round(widthincubes ?? 8));
            heightincubes = Math.max(1, Math.round(heightincubes ?? 1));
            const obstacleFlying = new Obstaclesflying(name, scene, position.clone(), widthincubes, heightincubes, this.devpoweractive);
            mesh = obstacleFlying.lemesh;
            tiles = obstacleFlying.tiles ?? [];
        } else if (type === "obstacleInvisible") {
            widthincubes = Math.max(1, Math.round(widthincubes ?? 3));
            heightincubes = Math.max(1, Math.round(heightincubes ?? 3));
            const obstacleInvisible = new Obstaclesinvisibles(name, scene, position.clone(), widthincubes, heightincubes, this.devpoweractive);
            mesh = obstacleInvisible.lemesh;
        } else {
            const platform = new Platforme(name, scene, position.clone(), this.devpoweractive);
            mesh = platform.lemesh;
            ownerSprite = platform.sprite;
        }

        const meshMeta: any = mesh.metadata ?? {};
        if (tiles.length === 0 && Array.isArray(meshMeta.tiles)) {
            tiles = meshMeta.tiles as Sprite[];
        }
        if (!ownerSprite && meshMeta.ownerSprite) {
            ownerSprite = meshMeta.ownerSprite as Sprite;
        }

        const record: LevelObjectRecord = {
            id: options?.id ?? `levelObj${this.levelObjectCounter++}`,
            type,
            name,
            position: mesh.position.clone(),
            mesh,
            tiles,
            ownerSprite,
            sizeintitles,
            widthincubes,
            heightincubes
        };

        this.attachLevelObjectMetadata(record);

        if (options?.addToList !== false) {
            this.levelObjects.push(record);
        }

        return record;
    }

    private destroyLevelObject(record: LevelObjectRecord): void {
        const disposedSprites = new Set<Sprite>();
        if (record.ownerSprite) {
            record.ownerSprite.dispose();
            disposedSprites.add(record.ownerSprite);
        }
        for (const tile of record.tiles) {
            if (!disposedSprites.has(tile)) {
                tile.dispose();
            }
        }
        record.mesh.dispose();
    }

    private rebuildLevelObject(scene: Scene, record: LevelObjectRecord): LevelObjectRecord {
        const index = this.levelObjects.findIndex((obj) => obj.id === record.id);
        if (index === -1) {
            return record;
        }

        const snapshot = {
            id: record.id,
            type: record.type,
            name: record.name,
            position: record.position.clone(),
            sizeintitles: record.sizeintitles,
            widthincubes: record.widthincubes,
            heightincubes: record.heightincubes
        };

        this.destroyLevelObject(record);

        const rebuilt = this.spawnLevelObject(scene, snapshot.type, snapshot.name, snapshot.position, {
            id: snapshot.id,
            addToList: false,
            sizeintitles: snapshot.sizeintitles,
            widthincubes: snapshot.widthincubes,
            heightincubes: snapshot.heightincubes
        });

        this.levelObjects[index] = rebuilt;
        if (this.selectedLevelObjectId === record.id) {
            this.selectedLevelObjectId = rebuilt.id;
        }

        return rebuilt;
    }

    private getSelectedLevelObject(): LevelObjectRecord | null {
        return this.levelObjects.find((obj) => obj.id === this.selectedLevelObjectId) ?? null;
    }

    private selectNextEditableObject(): LevelObjectRecord | EnemyRecord | null {
        const merged = [
            ...this.levelObjects.map((obj) => ({ kind: "level" as const, id: obj.id })),
            ...this.enemyObjects.map((obj) => ({ kind: "enemy" as const, id: obj.id }))
        ];

        if (merged.length === 0) {
            this.selectedLevelObjectId = null;
            this.selectedEnemyObjectId = null;
            this.updateLevelEditorHUD();
            return null;
        }

        const currentKind = this.selectedEnemyObjectId ? "enemy" : this.selectedLevelObjectId ? "level" : null;
        const currentId = this.selectedEnemyObjectId ?? this.selectedLevelObjectId;

        if (!currentKind || !currentId) {
            const first = merged[0];
            if (first.kind === "level") {
                this.setSelectedLevelObject(first.id);
                this.updateLevelEditorHUD();
                return this.levelObjects.find((obj) => obj.id === first.id) ?? null;
            }
            this.setSelectedEnemyObject(first.id);
            this.updateLevelEditorHUD();
            return this.enemyObjects.find((obj) => obj.id === first.id) ?? null;
        }

        const currentIndex = merged.findIndex((entry) => entry.kind === currentKind && entry.id === currentId);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % merged.length : 0;
        const next = merged[nextIndex];

        if (next.kind === "level") {
            this.setSelectedLevelObject(next.id);
            this.updateLevelEditorHUD();
            return this.levelObjects.find((obj) => obj.id === next.id) ?? null;
        }

        this.setSelectedEnemyObject(next.id);
        this.updateLevelEditorHUD();
        return this.enemyObjects.find((obj) => obj.id === next.id) ?? null;
    }

    private resizeSelectedObject(scene: Scene, axis: "width" | "height", delta: number): void {
        const selectedLevel = this.getSelectedLevelObject();
        if (selectedLevel) {
            if (selectedLevel.type === "platform") {
                console.log("Plateforme: taille fixe (pas de width/height en constructeur).");
                return;
            }

            if (selectedLevel.type === "ground") {
                if (axis === "height") {
                    console.log("Ground: seule la largeur (sizeintitles) est modifiable.");
                    return;
                }
                selectedLevel.sizeintitles = Math.max(1, Math.round((selectedLevel.sizeintitles ?? 1) + delta));
                this.rebuildLevelObject(scene, selectedLevel);
                this.updateLevelEditorHUD();
                return;
            }

            if (axis === "width") {
                selectedLevel.widthincubes = Math.max(1, Math.round((selectedLevel.widthincubes ?? 1) + delta));
            } else {
                selectedLevel.heightincubes = Math.max(1, Math.round((selectedLevel.heightincubes ?? 1) + delta));
            }

            this.rebuildLevelObject(scene, selectedLevel);
            this.updateLevelEditorHUD();
            return;
        }

        const selectedEnemy = this.getSelectedEnemyObject();
        if (!selectedEnemy) {
            return;
        }

        if (selectedEnemy.type !== "guepepurple") {
            console.log("Cet ennemi n'a pas de paramètre largeur/hauteur éditable.");
            return;
        }

        if (axis === "width") {
            const nextDistance = (selectedEnemy.distance ?? 0.17) + delta * 0.01;
            selectedEnemy.distance = Math.max(0.01, Number(nextDistance.toFixed(3)));
        } else {
            selectedEnemy.axe = selectedEnemy.axe === 0 ? 1 : 0;
        }

        this.rebuildEnemyObject(scene, selectedEnemy);
        this.updateLevelEditorHUD();
    }

    private toggleSelectedEnemyStartDirection(scene: Scene): void {
        const selectedEnemy = this.getSelectedEnemyObject();
        if (!selectedEnemy || selectedEnemy.type !== "guepepurple") {
            console.log("Sélectionne une guepepurple pour modifier 'debut'.");
            return;
        }

        selectedEnemy.debut = !(selectedEnemy.debut ?? true);
        this.rebuildEnemyObject(scene, selectedEnemy);
        this.updateLevelEditorHUD();
    }

    private addNewObjectFromCamera(scene: Scene): void {
        const camera = scene.activeCamera;
        const baseX = camera ? camera.position.x : 0;
        const baseY = camera ? camera.position.y : 0;
        const isLevelSpawn =
            this.levelEditorSpawnType === "ground" ||
            this.levelEditorSpawnType === "obstacle" ||
            this.levelEditorSpawnType === "obstacleFlying" ||
            this.levelEditorSpawnType === "obstacleInvisible" ||
            this.levelEditorSpawnType === "platform";

        if (isLevelSpawn) {
            const levelType = this.levelEditorSpawnType as LevelObjectType;
            const spawnName = this.nextLevelObjectName(levelType);
            let spawnPos = new Vector3(baseX, baseY, -0.0101);
            let options: { sizeintitles?: number; widthincubes?: number; heightincubes?: number } = {};

            switch (levelType) {
                case "ground":
                    spawnPos = new Vector3(baseX, -0.28, 0);
                    options = { sizeintitles: 30 };
                    break;
                case "obstacle":
                    options = { widthincubes: 6, heightincubes: 2 };
                    break;
                case "obstacleFlying":
                    options = { widthincubes: 8, heightincubes: 1 };
                    break;
                case "obstacleInvisible":
                    spawnPos = new Vector3(baseX, baseY, 0);
                    options = { widthincubes: 3, heightincubes: 3 };
                    break;
                case "platform":
                    spawnPos = new Vector3(baseX, baseY, 0);
                    break;
            }

            const created = this.spawnLevelObject(scene, levelType, spawnName, spawnPos, options);
            this.setSelectedLevelObject(created.id);
            this.updateLevelEditorHUD();
            console.log(`Ajouté: ${created.name} (${created.type})`);
            return;
        }

        const enemyType = this.levelEditorSpawnType as EnemyObjectType;
        const spawnName = this.nextEnemyObjectName(enemyType);
        let spawnPos = new Vector3(baseX, baseY, -0.0099);
        let enemyOptions: { axe?: number; distance?: number; debut?: boolean } = {};

        if (enemyType === "guepe" || enemyType === "guepepurple") {
            spawnPos = new Vector3(baseX, baseY + 0.5, -0.0099);
        }

        if (enemyType === "guepepurple") {
            enemyOptions = { axe: 0, distance: 0.17, debut: true };
        }

        const createdEnemy = this.spawnEnemyObject(scene, enemyType, spawnName, spawnPos, enemyOptions);
        this.setSelectedEnemyObject(createdEnemy.id);
        this.updateLevelEditorHUD();
        console.log(`Ajouté: ${createdEnemy.name} (${createdEnemy.type})`);
    }

    private deleteSelectedObject(): void {
        const selectedLevel = this.getSelectedLevelObject();
        if (selectedLevel) {
            const index = this.levelObjects.findIndex((obj) => obj.id === selectedLevel.id);
            if (index >= 0) {
                this.destroyLevelObject(selectedLevel);
                this.levelObjects.splice(index, 1);
                if (this.levelObjects.length > 0) {
                    const nextIndex = Math.min(index, this.levelObjects.length - 1);
                    this.setSelectedLevelObject(this.levelObjects[nextIndex].id);
                } else {
                    this.setSelectedLevelObject(null);
                }
                this.updateLevelEditorHUD();
            }
            return;
        }

        const selectedEnemy = this.getSelectedEnemyObject();
        if (!selectedEnemy) {
            return;
        }

        const enemyIndex = this.enemyObjects.findIndex((obj) => obj.id === selectedEnemy.id);
        if (enemyIndex === -1) {
            return;
        }

        this.destroyEnemyObject(selectedEnemy);
        this.enemyObjects.splice(enemyIndex, 1);
        if (this.enemyObjects.length > 0) {
            const nextIndex = Math.min(enemyIndex, this.enemyObjects.length - 1);
            this.setSelectedEnemyObject(this.enemyObjects[nextIndex].id);
        } else {
            this.setSelectedEnemyObject(null);
        }
        this.updateLevelEditorHUD();
    }

    private buildCreateLine(record: LevelObjectRecord): string {
        const x = this.formatLevelNumber(record.position.x);
        const y = this.formatLevelNumber(record.position.y);
        const z = this.formatLevelNumber(record.position.z);

        if (record.type === "ground") {
            return `const ${record.name} = new Ground("${record.name}", this.scene, new Vector3(${x}, ${y}, ${z}), ${record.sizeintitles ?? 1},this.devpoweractive);`;
        }
        if (record.type === "obstacle") {
            return `const ${record.name} = new Obstacles("${record.name}", this.scene, new Vector3(${x}, ${y}, ${z}), ${record.widthincubes ?? 1}, ${record.heightincubes ?? 1},this.devpoweractive);`;
        }
        if (record.type === "obstacleFlying") {
            return `const ${record.name} = new Obstaclesflying("${record.name}", this.scene, new Vector3(${x}, ${y}, ${z}), ${record.widthincubes ?? 1}, ${record.heightincubes ?? 1},this.devpoweractive);`;
        }
        if (record.type === "obstacleInvisible") {
            return `const ${record.name} = new Obstaclesinvisibles("${record.name}", this.scene, new Vector3(${x}, ${y}, ${z}), ${record.widthincubes ?? 1}, ${record.heightincubes ?? 1},this.devpoweractive);`;
        }
        return `const ${record.name} = new Platforme("${record.name}", this.scene, new Vector3(${x}, ${y}, ${z}),this.devpoweractive);`;
    }

    private buildEnemyCreateLine(record: EnemyRecord): string {
        const x = this.formatLevelNumber(record.position.x);
        const y = this.formatLevelNumber(record.position.y);
        const z = this.formatLevelNumber(record.position.z);

        if (record.type === "slime") {
            return `const ${record.name} = new Slime('${record.name}', scene, new Vector3(${x}, ${y}, ${z}),this.devpoweractive);`;
        }
        if (record.type === "slimerouge") {
            return `const ${record.name} = new Slimerouge('${record.name}', scene, new Vector3(${x}, ${y}, ${z}),this.devpoweractive);`;
        }
        if (record.type === "guepe") {
            return `const ${record.name} = new Guepe('${record.name}', scene, new Vector3(${x}, ${y}, ${z}),this.devpoweractive);`;
        }
        if (record.type === "guepepurple") {
            return `const ${record.name} = new Guepepurple('${record.name}', scene, new Vector3(${x}, ${y}, ${z}),this.devpoweractive,${record.axe ?? 0},${this.formatLevelNumber(record.distance ?? 0.17)},${record.debut ? "true" : "false"});`;
        }
        if (record.type === "frog") {
            return `const ${record.name} = new Frog('${record.name}', scene, new Vector3(${x}, ${y}, ${z}),this.devpoweractive);`;
        }
        return `const ${record.name} = new Frogpurple('${record.name}', scene, new Vector3(${x}, ${y}, ${z}),this.devpoweractive);`;
    }

    private buildLevelEditSpawnLine(record: LevelObjectRecord): string {
        const x = this.formatLevelNumber(record.position.x);
        const y = this.formatLevelNumber(record.position.y);
        const z = this.formatLevelNumber(record.position.z);

        if (record.type === "ground") {
            return `this.spawnLevelObject(scene, "ground", "${record.name}", new Vector3(${x}, ${y}, ${z}), { sizeintitles: ${record.sizeintitles ?? 1} });`;
        }
        if (record.type === "obstacle") {
            return `this.spawnLevelObject(scene, "obstacle", "${record.name}", new Vector3(${x}, ${y}, ${z}), { widthincubes: ${record.widthincubes ?? 1}, heightincubes: ${record.heightincubes ?? 1} });`;
        }
        if (record.type === "obstacleFlying") {
            return `this.spawnLevelObject(scene, "obstacleFlying", "${record.name}", new Vector3(${x}, ${y}, ${z}), { widthincubes: ${record.widthincubes ?? 1}, heightincubes: ${record.heightincubes ?? 1} });`;
        }
        if (record.type === "obstacleInvisible") {
            return `this.spawnLevelObject(scene, "obstacleInvisible", "${record.name}", new Vector3(${x}, ${y}, ${z}), { widthincubes: ${record.widthincubes ?? 1}, heightincubes: ${record.heightincubes ?? 1} });`;
        }
        return `this.spawnLevelObject(scene, "platform", "${record.name}", new Vector3(${x}, ${y}, ${z}));`;
    }

    private buildEnemyEditSpawnLine(record: EnemyRecord): string {
        const x = this.formatLevelNumber(record.position.x);
        const y = this.formatLevelNumber(record.position.y);
        const z = this.formatLevelNumber(record.position.z);

        if (record.type === "guepepurple") {
            return `this.spawnEnemyObject(scene, "guepepurple", "${record.name}", new Vector3(${x}, ${y}, ${z}), { axe: ${record.axe ?? 0}, distance: ${this.formatLevelNumber(record.distance ?? 0.17)}, debut: ${record.debut ? "true" : "false"} });`;
        }
        return `this.spawnEnemyObject(scene, "${record.type}", "${record.name}", new Vector3(${x}, ${y}, ${z}));`;
    }

    private copyExportToClipboard(code: string, label: string): void {
        console.log(`===== ${label} =====`);
        console.log(code);

        if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                console.log(`${label} copié dans le presse-papiers.`);
            }).catch(() => {
                console.log(`Impossible de copier automatiquement ${label}, mais le code est affiché dans la console.`);
            });
        }
    }

    private exportLevelCode(): void {
        const lines: string[] = [];
        lines.push("async CreateEnvironment(scene:Scene): Promise<void> {");
        lines.push("");

        for (const record of this.levelObjects) {
            lines.push(`    ${this.buildCreateLine(record)}`);
        }

        lines.push("");
        lines.push("    const skybox = Mesh.CreateBox(\"BackgroundSkybox\", 500, scene, undefined, Mesh.BACKSIDE);");
        lines.push("}");

        lines.push("");
        lines.push("// ===== ENNEMIS (CreateMainCharacter) =====");
        for (const record of this.enemyObjects) {
            lines.push(this.buildEnemyCreateLine(record));
        }

        const slimesList = this.enemyObjects
            .filter((record) => record.type === "slime" || record.type === "slimerouge" || record.type === "frog" || record.type === "frogpurple")
            .map((record) => record.name)
            .join(", ");

        const guepesList = this.enemyObjects
            .filter((record) => record.type === "guepe" || record.type === "guepepurple")
            .map((record) => record.name)
            .join(", ");

        const frogsList = this.enemyObjects
            .filter((record) => record.type === "frog")
            .map((record) => record.name)
            .join(", ");

        const frogsPurpleList = this.enemyObjects
            .filter((record) => record.type === "frogpurple")
            .map((record) => record.name)
            .join(", ");

        lines.push("");
        lines.push(`const slimes = [${slimesList}];`);
        lines.push(`const guepes = [${guepesList}];`);
        lines.push(`const frogs = [${frogsList}];`);
        lines.push(`const frogspurple = [${frogsPurpleList}];`);

        const code = lines.join("\n");
        this.copyExportToClipboard(code, "CODE NIVEAU (format jeu)");
    }

    private exportLevelCodeSceneNiveau1Edit(): void {
        const lines: string[] = [];
        lines.push("// ===== FORMAT SCENENIVEAU1EDIT =====");
        lines.push("// À coller dans CreateEnvironment(scene)");
        for (const record of this.levelObjects) {
            lines.push(this.buildLevelEditSpawnLine(record));
        }

        lines.push("");
        lines.push("// À coller dans CreateMainCharacter(scene)");
        for (const record of this.enemyObjects) {
            lines.push(this.buildEnemyEditSpawnLine(record));
        }

        lines.push("");
        lines.push("const slimes = this.runtimeSlimes;");
        lines.push("const guepes = this.runtimeGuepes;");
        lines.push("const frogs = this.runtimeFrogs;");
        lines.push("const frogspurple = this.runtimeFrogsPurple;");

        const code = lines.join("\n");
        this.copyExportToClipboard(code, "CODE NIVEAU (format SceneNiveau1Edit)");
    }

    private findLevelObjectFromMesh(mesh: Mesh): LevelObjectRecord | null {
        const meta: any = mesh.metadata ?? {};
        if (meta.editorId) {
            return this.levelObjects.find((obj) => obj.id === meta.editorId) ?? null;
        }
        return this.levelObjects.find((obj) => obj.mesh === mesh || obj.name === mesh.name) ?? null;
    }

    private findEnemyObjectFromMesh(mesh: Mesh): EnemyRecord | null {
        const meta: any = mesh.metadata ?? {};
        if (meta.enemyEditorId) {
            return this.enemyObjects.find((obj) => obj.id === meta.enemyEditorId) ?? null;
        }

        return this.enemyObjects.find((obj) => obj.slimeCollider === mesh || obj.attackCollider === mesh) ?? null;
    }

    constructor(private canvas:HTMLCanvasElement){
        this.devpoweractive = true;
        this.engine = new Engine(this.canvas, false);
        this.scene = this.CreateScene();
        //Inspector.show(this.scene, {})
        this.engine.runRenderLoop(()=>{
            this.scene.render();
        })
    }

    public health = 440;

    CreateScene(): Scene {
        const scene = new Scene(this.engine);

        scene.createDefaultCameraOrLight(true, false,true);

        const hemilight = new HemisphericLight(
            "hemilight", 
            new Vector3(0,1,0), 
            this.scene
        );

        hemilight.intensity = 0.;
        

        //const sphere = MeshBuilder.CreateSphere('sphere', {diameter:3, segments:5}, this.scene);

        //sphere.material = new StandardMaterial('material');
        //sphere.material.wireframe = true;

        this.CreateMainCharacter(scene);
        //this.CreateEnnemy(scene);
        this.CreateEnvironment(scene);
        this.CreateDialog(scene);

        // --- ÉDITEUR DE NIVEAU COMPLET ---
        // Déplacement souris: objets de niveau + guêpes simples.
        // Raccourcis clavier: F1/F2/F3/Tab/Delete/PageUp/PageDown/Home/F7/F6/F8/F9.
        let draggedMesh: Mesh | null = null;

        scene.onPointerObservable.add((pointerInfo) => {
            if (!this.devpoweractive || !this.levelEditorEnabled) {
                return;
            }

            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN: {
                    const pick = pointerInfo.pickInfo;
                    if (!pick || !pick.hit || !pick.pickedMesh) {
                        break;
                    }

                    const mesh = pick.pickedMesh as Mesh;
                    const object = this.findLevelObjectFromMesh(mesh);

                    if (object) {
                        this.setSelectedLevelObject(object.id);
                        this.updateLevelEditorHUD();
                        draggedMesh = object.mesh;
                        break;
                    }

                    const enemyObject = this.findEnemyObjectFromMesh(mesh);
                    if (enemyObject) {
                        this.setSelectedEnemyObject(enemyObject.id);
                        this.updateLevelEditorHUD();
                        draggedMesh = mesh;
                    }
                    break;
                }
                case PointerEventTypes.POINTERMOVE: {
                    if (!draggedMesh || !scene.activeCamera) {
                        break;
                    }

                    const ray = scene.createPickingRay(
                        scene.pointerX,
                        scene.pointerY,
                        Matrix.Identity(),
                        scene.activeCamera as Camera
                    );

                    const dirZ = ray.direction.z;
                    if (Math.abs(dirZ) <= 1e-6) {
                        break;
                    }

                    const t = (draggedMesh.position.z - ray.origin.z) / dirZ;
                    if (t <= 0) {
                        break;
                    }

                    const hit = ray.origin.add(ray.direction.scale(t));

                    const enemyObject = this.findEnemyObjectFromMesh(draggedMesh);
                    if (enemyObject) {
                        this.setEnemyObjectPosition(enemyObject, hit.x, hit.y);
                        break;
                    }

                    const oldPos = draggedMesh.position.clone();
                    draggedMesh.position.x = hit.x;
                    draggedMesh.position.y = hit.y;

                    const dx = draggedMesh.position.x - oldPos.x;
                    const dy = draggedMesh.position.y - oldPos.y;

                    const meta: any = draggedMesh.metadata;
                    const ownerSprite = meta?.ownerSprite as Sprite | undefined;
                    const ownerCollider = meta?.ownerCollider as Mesh | undefined;
                    const tiles = Array.isArray(meta?.tiles) ? (meta.tiles as Sprite[]) : [];

                    if (ownerSprite) {
                        ownerSprite.position.x += dx;
                        ownerSprite.position.y += dy;
                    }

                    if (ownerCollider) {
                        ownerCollider.position.x += dx;
                        ownerCollider.position.y += dy;
                    }

                    for (const tile of tiles) {
                        tile.position.x += dx;
                        tile.position.y += dy;
                    }

                    const object = this.findLevelObjectFromMesh(draggedMesh);
                    if (object) {
                        object.position.copyFrom(draggedMesh.position);
                    }
                    break;
                }
                case PointerEventTypes.POINTERUP: {
                    if (draggedMesh) {
                        const levelObject = this.findLevelObjectFromMesh(draggedMesh);
                        const enemyObject = this.findEnemyObjectFromMesh(draggedMesh);
                        const p = levelObject ? levelObject.position : enemyObject ? enemyObject.position : draggedMesh.position;
                        console.log(
                            `Position ${draggedMesh.name}: new Vector3(${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`
                        );
                    }
                    draggedMesh = null;
                    break;
                }
            }
        });

        const spawnTypes: EditorSpawnType[] = ["ground", "obstacle", "obstacleFlying", "obstacleInvisible", "platform", "slime", "slimerouge", "guepe", "guepepurple", "frog", "frogpurple"];
        let spawnTypeIndex = spawnTypes.indexOf(this.levelEditorSpawnType);
        if (spawnTypeIndex < 0) {
            spawnTypeIndex = 0;
            this.levelEditorSpawnType = spawnTypes[0];
        }

        scene.onKeyboardObservable.add((keyboardInfo) => {
            if (!this.devpoweractive || keyboardInfo.type !== KeyboardEventTypes.KEYDOWN) {
                return;
            }

            const key = keyboardInfo.event.key.toLowerCase();

            if (key === "f1") {
                this.levelEditorEnabled = !this.levelEditorEnabled;
                this.updateLevelEditorHUD();
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "f8") {
                this.toggleEnemiesPause();
                keyboardInfo.event.preventDefault();
                return;
            }

            if (!this.levelEditorEnabled) {
                return;
            }

            if (key === "f2") {
                spawnTypeIndex = (spawnTypeIndex + 1) % spawnTypes.length;
                this.levelEditorSpawnType = spawnTypes[spawnTypeIndex];
                this.updateLevelEditorHUD();
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "f3") {
                this.addNewObjectFromCamera(scene);
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "tab") {
                this.selectNextEditableObject();
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "delete") {
                this.deleteSelectedObject();
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "pageup") {
                this.resizeSelectedObject(scene, "width", 1);
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "pagedown") {
                this.resizeSelectedObject(scene, "width", -1);
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "home") {
                this.resizeSelectedObject(scene, "height", 1);
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "f7") {
                this.resizeSelectedObject(scene, "height", -1);
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "f4") {
                this.toggleSelectedEnemyStartDirection(scene);
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "f6") {
                this.exportLevelCode();
                keyboardInfo.event.preventDefault();
                return;
            }

            if (key === "f9") {
                this.exportLevelCodeSceneNiveau1Edit();
                keyboardInfo.event.preventDefault();
            }
        });

        this.updateLevelEditorHUD();

        return scene;
    }

    async CreateMainCharacter(scene:Scene): Promise<void> {
        //importing the sprites for the character
        const LManager = new SpriteManager(
            'LManager',
            './sprites/spritesheet_lyrina.png',
            1,
            336,
            scene
        );
        const lyrina = new Sprite('lyrina', LManager)
        lyrina.position = new Vector3(-35.18, 0, 0);//debut(7, 0.2, 0)  part 1(-2.48, 0.47, 0) PART 2 (-12.11, 0.4, 0) part3 (-20.923, 0.495, 0) part 4 (-35.18, 0, 0)
        lyrina.size = 0.4;
        lyrina.playAnimation(0, 7, true, 100);
        
        //creating the movements of the player and the camera
        const keyStatus: { [key: string]: boolean } = { q: false, s: false, ' ': false, z: false };
        
        scene.actionManager = new ActionManager(scene);

        const sideCamera = new FreeCamera("SideCamera", new Vector3(0, 0.3, 2.2), scene);//z1.9
        // Make camera look toward -Z (scene) so it doesn't look into empty space
        sideCamera.setTarget(new Vector3(sideCamera.position.x, sideCamera.position.y, 0));

        // Player collider sized in world units based on sprite size (not texture pixels)
        const colliderWidth = lyrina.size * 0.25;   // narrower than sprite width
        const colliderHeight = lyrina.size /1.71;   // close to sprite height
        const colliderDepth = 0.1;                  // thin depth for 2D side view
        const playerCollider = MeshBuilder.CreateBox("playerCollider", {width: colliderWidth, height: colliderHeight, depth: colliderDepth}, scene);
        playerCollider.isVisible = this.devpoweractive;
        playerCollider.material = new StandardMaterial('playerMaterial', scene);
        playerCollider.material.wireframe = true;
        // No engine collisions: we resolve collisions manually with AABB
        playerCollider.position = lyrina.position.clone();

        const fixedCameraY = sideCamera.position.y;
        scene.activeCamera = sideCamera;
        const attackCollider =  MeshBuilder.CreateBox("attackCollider", {width: colliderHeight-0.03, height: colliderWidth+0.04, depth: colliderDepth}, scene);
        attackCollider.isVisible = false;
        attackCollider.material = new StandardMaterial('playerMaterial', scene);
        attackCollider.checkCollisions = false;
        
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

        // Create and tweak the background material.
        const backgroundManager = new SpriteManager(
            "tilesManager",
            "./sprites/place_holder_bnew.png",
            100,           
            {width:961, height:550}, 
            scene
        );
        const background = new Sprite("background", backgroundManager);
        background.position.z = -1;
        background.position.y = 1;//1.1
        background.width = 6;
        background.height = 3;

        let newAnim = true;
        const speed=0.03;
        let acceleration=0;
        const gravity = 0.0019999999;
        const jumpStrength = 0.05;
        let verticalVelocity = 0;
        let isGrounded = false;
        let isLanded = false;
        let falling=false;
        let isAttacking = false;
        let isKnockback = false;
        let knockbackVelocityX = 0;
        let invincibilityFrames = 0;
        const collidables: Mesh[] = [];

        this.enemyObjects = [];
        this.enemyObjectCounter = 1;
        this.selectedEnemyObjectId = null;
        this.runtimeSlimes = [];
        this.runtimeGuepes = [];
        this.runtimeFrogs = [];
        this.runtimeFrogsPurple = [];

        const slime1 = this.spawnEnemyObject(scene, "slime", "slime1", new Vector3(6, 0, -0.0099)).enemy as Slime;
        const slime2 = this.spawnEnemyObject(scene, "slime", "slime2", new Vector3(3.8, 1, -0.0099)).enemy as Slime;
        const slime3 = this.spawnEnemyObject(scene, "slime", "slime3", new Vector3(2.48, 1, -0.0099)).enemy as Slime;
        const slime4 = this.spawnEnemyObject(scene, "slime", "slime4", new Vector3(-1.4, -0.1, -0.0099)).enemy as Slime;
        const slime5 = this.spawnEnemyObject(scene, "slime", "slime5", new Vector3(-1.6, -0.1, -0.0099)).enemy as Slime;
        const slimerouge1 = this.spawnEnemyObject(scene, "slimerouge", "slimerouge1", new Vector3(-6.69, 0.23, -0.0099)).enemy as Slimerouge;
        const slimerouge2 = this.spawnEnemyObject(scene, "slimerouge", "slimerouge2", new Vector3(-7.89, 0.5, -0.0099)).enemy as Slimerouge;
        const slimerouge3 = this.spawnEnemyObject(scene, "slimerouge", "slimerouge3", new Vector3(-9.39, 0.19, -0.0099)).enemy as Slimerouge;
        const slimerouge4 = this.spawnEnemyObject(scene, "slimerouge", "slimerouge4", new Vector3(-12.35, -0.06, -0.0099)).enemy as Slimerouge;
        const slimerouge5 = this.spawnEnemyObject(scene, "slimerouge", "slimerouge5", new Vector3(-13.95, -0.06, -0.0099)).enemy as Slimerouge;
        const guepe1 = this.spawnEnemyObject(scene, "guepe", "guepe1", new Vector3(-4.06, 0.99, -0.0099)).enemy as Guepe;
        const guepe2 = this.spawnEnemyObject(scene, "guepe", "guepe2", new Vector3(-5.3, 1.88, -0.0099)).enemy as Guepe;
        const guepe3 = this.spawnEnemyObject(scene, "guepe", "guepe3", new Vector3(-5.3, 1.51, -0.0099)).enemy as Guepe;
        const guepe4 = this.spawnEnemyObject(scene, "guepe", "guepe4", new Vector3(-5.3, 1.15, -0.0099)).enemy as Guepe;
        const guepe5 = this.spawnEnemyObject(scene, "guepe", "guepe5", new Vector3(-13.5, 1, -0.0099)).enemy as Guepe;
        const guepepurple1 = this.spawnEnemyObject(scene, "guepepurple", "guepepurple1", new Vector3(-0.88, 0.98, -0.0099), { axe: 0, distance: 0.17, debut: true }).enemy as Guepepurple;
        const guepepurple2 = this.spawnEnemyObject(scene, "guepepurple", "guepepurple2", new Vector3(-0.45, 1.15, -0.0099), { axe: 1, distance: 0.17, debut: false }).enemy as Guepepurple;
        const guepepurple3 = this.spawnEnemyObject(scene, "guepepurple", "guepepurple3", new Vector3(-1.15, 0.98, -0.0099), { axe: 0, distance: 0.17, debut: true }).enemy as Guepepurple;
        const guepepurple4 = this.spawnEnemyObject(scene, "guepepurple", "guepepurple4", new Vector3(-1.6, 1.15, -0.0099), { axe: 1, distance: 0.17, debut: true }).enemy as Guepepurple;
        const frog1 = this.spawnEnemyObject(scene, "frog", "frog1", new Vector3(-3.52, -0.11, -0.0099)).enemy as Frog;
        const frog2 = this.spawnEnemyObject(scene, "frog", "frog2", new Vector3(-4.52, -0.11, -0.0099)).enemy as Frog;
        const frogpurple1 = this.spawnEnemyObject(scene, "frogpurple", "frogpurple1", new Vector3(-3.52, -50, -0.0099)).enemy as Frogpurple;
        this.spawnEnemyObject(scene, "slimerouge", "slimerouge_23", new Vector3(-16.089, 0.3, -0.0099));
        this.spawnEnemyObject(scene, "slimerouge", "slimerouge_25", new Vector3(-16.889, 0.3, -0.0099));
        this.spawnEnemyObject(scene, "slimerouge", "slimerouge_27", new Vector3(-17.677, 0.3, -0.0099));
        this.spawnEnemyObject(scene, "slime", "slime_29", new Vector3(-18.1, 0.3, -0.0099));
        this.spawnEnemyObject(scene, "slime", "slime_31", new Vector3(-18.276, 0.3, -0.0099));
        this.spawnEnemyObject(scene, "slime", "slime_33", new Vector3(-18.42, 0.3, -0.0099));
        this.spawnEnemyObject(scene, "slime", "slime_35", new Vector3(-18.56, 0.3, -0.0099));
        this.spawnEnemyObject(scene, "slime", "slime_37", new Vector3(-18.704, 0.3, -0.0099));
        this.spawnEnemyObject(scene, "guepe", "guepe_39", new Vector3(-19.113, 0.818, -0.0099));
        this.spawnEnemyObject(scene, "guepe", "guepe_41", new Vector3(-19.413, 0.816, -0.0099));
        this.spawnEnemyObject(scene, "slimerouge", "slimerouge_45", new Vector3(-19.984, 0.3, -0.0099));
        this.spawnEnemyObject(scene, "slimerouge", "slimerouge_34", new Vector3(-18.688, 1.005, -0.0099));
        this.spawnEnemyObject(scene, "slime", "slime_38", new Vector3(-20.174, 1.541, -0.0099));
        this.spawnEnemyObject(scene, "guepe", "guepe_40", new Vector3(-21.393, 1.255, -0.0099));
        this.spawnEnemyObject(scene, "guepe", "guepe_42", new Vector3(-21.389, 0.683, -0.0099));
        this.spawnEnemyObject(scene, "guepe", "guepe_44", new Vector3(-21.391, 0.961, -0.0099));
        this.spawnEnemyObject(scene, "guepe", "guepe_edit41", new Vector3(-22.231, 0.408, -0.01));
        this.spawnEnemyObject(scene, "guepe", "guepe_edit43", new Vector3(-23.03, 0.672, -0.01));
        this.spawnEnemyObject(scene, "guepe", "guepe_edit45", new Vector3(-23.815, 0.947, -0.01));
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit51", new Vector3(-24.67, 0.919, -0.01), { axe: 0, distance: 0.17, debut: true });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit53", new Vector3(-25.489, 1.782, -0.01), { axe: 1, distance: 0.4, debut: true });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit57", new Vector3(-26.71, 1.572, -0.01), { axe: 0, distance: 0.17, debut: true });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit61", new Vector3(-26.708, 1.352, -0.01), { axe: 0, distance: 0.17, debut: true });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit63", new Vector3(-26.71, 1.786, -0.01), { axe: 0, distance: 0.17, debut: true });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit49", new Vector3(-28.153, 2.39, -0.01), { axe: 0, distance: 0.17, debut: true });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit54", new Vector3(-28.153, 1.797, -0.01), { axe: 0, distance: 0.17, debut: false });
        this.spawnEnemyObject(scene, "guepe", "guepe_edit49", new Vector3(-28.827, 1.922, -0.01));
        this.spawnEnemyObject(scene, "guepe", "guepe_edit51", new Vector3(-29.572, 2.131, -0.01));
        //this.spawnEnemyObject(scene, "guepe", "guepe_edit53", new Vector3(-33.254, 0.614, -0.01));
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit52", new Vector3(-30.322, 2.133, -0.01), { axe: 0, distance: 0.17, debut: true });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit55", new Vector3(-30.75, 2.135, -0.01), { axe: 0, distance: 0.17, debut: true });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit58", new Vector3(-31.164, 2.129, -0.01), { axe: 0, distance: 0.17, debut: true });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit56", new Vector3(-31.837, 2.033, -0.01), { axe: 0, distance: 0.17, debut: true });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit62", new Vector3(-32.716, 1.159, -0.01), { axe: 0, distance: 0.17, debut: false });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit64", new Vector3(-32.915, 1.159, -0.01), { axe: 0, distance: 0.17, debut: false });
        this.spawnEnemyObject(scene, "guepepurple", "guepepurple_edit66", new Vector3(-32.514, 1.165, -0.01), { axe: 0, distance: 0.17, debut: false });
        this.spawnEnemyObject(scene, "frog", "frog_edit58", new Vector3(-35.650, 0.1, -0.0099));
        this.spawnEnemyObject(scene, "frog", "frog_edit60", new Vector3(-36.065, 0.197, -0.0099));
        this.spawnEnemyObject(scene, "frogpurple", "frogpurple_edit62", new Vector3(-36.971, -0.106, -0.0099));
        this.spawnEnemyObject(scene, "frogpurple", "frogpurple_edit64", new Vector3(-37.164, -0.1, -0.0099));
        this.spawnEnemyObject(scene, "frog", "frog_edit62", new Vector3(-38.054, 0.184, -0.0099));
        this.spawnEnemyObject(scene, "frog", "frog_edit64", new Vector3(-39.543, 0.182, -0.0099));
        this.spawnEnemyObject(scene, "frog", "frog_edit65", new Vector3(-40.913, 0.143, -0.0099));
        this.spawnEnemyObject(scene, "frogpurple", "frogpurple_edit67", new Vector3(-41.83, 0.604, -0.0099));
        this.spawnEnemyObject(scene, "frogpurple", "frogpurple_edit69", new Vector3(-42.537, 0.849, -0.0099));
        const slimes = this.runtimeSlimes;
        const guepes = this.runtimeGuepes;

        let lastHitSlime: Slime | Slimerouge | Guepe | Guepepurple | Frog | Frogpurple | null = null;
        
        // Compteur global pour déclencher le saut des frogs
        // après un saut du joueur.
        const frogs = this.runtimeFrogs;
        const frogspurple = this.runtimeFrogsPurple;

        // Détecte s'il y a du sol "devant" un collider de slime, dans une direction donnée
        const hasGroundAhead = (slimeCollider: Mesh, dir: number): boolean => {
            const sBB = slimeCollider.getBoundingInfo().boundingBox;
            const xFront = dir > 0 ? sBB.maximumWorld.x + 0.01 : sBB.minimumWorld.x - 0.01;
            const yProbe = sBB.minimumWorld.y - 0.05;

            for (const obstacle of collidables) {
                const oBB = obstacle.getBoundingInfo().boundingBox;
                const obstacleTop = oBB.maximumWorld.y;

                const withinX = xFront >= oBB.minimumWorld.x && xFront <= oBB.maximumWorld.x;
                const closeY = Math.abs(obstacleTop - yProbe) < 0.08;
                if (withinX && closeY) {
                    return true;
                }
            }
            return false;
        };

        function frogpurpleboucle(frog: Frogpurple): void {
            // Si le frog est déjà mort, on ne fait plus rien
            if (frog.isDead) {
                return;
            }

            // Dégâts reçus depuis l'attaque du joueur
            if (frog.attackCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                frog.slimeHealth -= 2;
                frog.isSuffering = true;
                // on (ré)initialise un petit timer de souffrance
                frog.waittime = 20;
                // pas de frame spéciale de "hit" : on garde l'animation idle (0..5)
                frog.sprite.playAnimation(0, 3, true, 100);
                frog.actionTime = 0;
                frog.isAttacking = false;
            }

            // mort du guepe
            if (frog.slimeHealth <= 0 && !frog.isDead) {
                frog.isDead = true;
                frog.attackCollider.checkCollisions = false;
                frog.sprite.dispose();
                frog.slimeCollider.dispose();
                frog.attackCollider.dispose();
                slimes.splice(slimes.indexOf(frog), 1);
                return;
            }

            if (frog.isSuffering) {
                const prevX = frog.slimeCollider.position.x;
                if(frog.sprite.position.x < lyrina.position.x) {
                    frog.slimeCollider.position.x -= 0.01;
                    
                }
                else {
                    frog.slimeCollider.position.x += 0.01;
                    frog.sprite.invertU = true;
                }
                frog.slimeCollider.computeWorldMatrix(true);
                // faire clignoter la guepe comme le joueur pendant quelques frames
                if (frog.waittime > 0) {
                    frog.waittime--;
                    // clignotement simple: visible 3 frames sur 6
                    frog.sprite.isVisible = (frog.waittime % 6) >= 3;
                } else {
                    frog.isSuffering = false;
                    frog.sprite.isVisible = true;
                }
                frog.slimeCollider.computeWorldMatrix(true);
                // empêcher un slime touché de traverser les autres slimes
                for (const other of slimes) {
                    if (other === frog) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        frog.slimeCollider.position.x = prevX;
                        frog.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
                for (const obstacle of collidables) {
                    const oBB = obstacle.getBoundingInfo().boundingBox;
                    const sBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        frog.slimeCollider.position.x = prevX;
                        frog.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
            } else {
                // faire en sorte de sauter 20 frames apres que le joueur est sauté n'importe où dans la scene,
                // pour donner l'impression que les frogs réagissent au saut du joueur.

                // 1) Gestion du délai avant le saut
                if (frog.jumpDelay > 0) {
                    frog.jumpDelay--;
                    // Quand le délai arrive à 0, on applique une impulsion vers le haut
                    if (frog.jumpDelay === 0 && frog.IsGrounded) {
                        frog.verticalVelocity = 0.06; // force du saut
                        frog.IsGrounded = false;
                    }
                }

                // 2) Animation : frame 4 pendant le saut, 0..3 au sol
                if (!frog.IsGrounded || Math.abs(frog.verticalVelocity) > 0.0001) {
                    // en l'air : pose de saut (frame 4)
                    frog.sprite.playAnimation(4, 4, true, 100);
                } else if(frog.sprite.cellIndex==4){
                    // au sol : idle 0..3
                    frog.sprite.playAnimation(0, 3, true, 160);
                }
            }

            // === PHYSIQUE VERTICALE de la frog (même logique que le joueur/slimes) ===
            frog.verticalVelocity -= gravity;
            const fdy = frog.verticalVelocity;
            const prevY = frog.slimeCollider.position.y;
            frog.slimeCollider.position.y += fdy;
            frog.slimeCollider.computeWorldMatrix(true);

            let frogHitObstacle = false;
            for (const obstacle of collidables) {
                const oBB = obstacle.getBoundingInfo().boundingBox;
                const fBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                const obstacleTop = oBB.maximumWorld.y;
                const obstacleBottom = oBB.minimumWorld.y;
                const obstacleLeft = oBB.minimumWorld.x;
                const obstacleRight = oBB.maximumWorld.x;
                const frogHalfY = fBB.extendSizeWorld.y;
                const overlapsX = fBB.maximumWorld.x >= obstacleLeft && fBB.minimumWorld.x <= obstacleRight;

                // Atterrissage sur le haut d'un obstacle
                if (fdy <= 0 && overlapsX && fBB.minimumWorld.y <= obstacleTop && fBB.maximumWorld.y >= obstacleTop) {
                    frog.slimeCollider.position.y = obstacleTop + frogHalfY;
                    frog.slimeCollider.computeWorldMatrix(true);
                    frog.verticalVelocity = 0;
                    frog.IsGrounded = true;
                    frogHitObstacle = true;
                    break;
                }
                // Collision par le dessous (tête de la frog sous une plateforme)
                else if (fdy > 0 && overlapsX && fBB.maximumWorld.y >= obstacleBottom && fBB.minimumWorld.y <= obstacleBottom) {
                    frog.slimeCollider.position.y = obstacleBottom - frogHalfY;
                    frog.slimeCollider.computeWorldMatrix(true);
                    frog.verticalVelocity = 0;
                    frog.IsGrounded = false;
                    frogHitObstacle = true;
                    break;
                }
            }

            if (!frogHitObstacle) {
                frog.IsGrounded = false;
            }
            // empêche un slime qui tombe de traverser un autre slime (collision verticale)
            if (fdy <= 0) {
                for (const other of slimes) {
                    if (other === frog) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        // replace le slime à son ancienne hauteur et annule la chute
                        frog.slimeCollider.position.y = prevY;
                        frog.slimeCollider.computeWorldMatrix(true);
                        frog.verticalVelocity = 0;
                        frog.IsGrounded = true;
                        break;
                    }
                }

            }
            // garder les sprites alignés avec le collider
            frog.sprite.position.copyFrom(frog.slimeCollider.position);
            frog.attackCollider.position.copyFrom(frog.sprite.position);
            frog.attackCollider.checkCollisions = true;
        }

        function frogboucle(frog: Frog): void {
            // Si le frog est déjà mort, on ne fait plus rien
            if (frog.isDead) {
                return;
            }

            // Dégâts reçus depuis l'attaque du joueur
            if (frog.attackCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                frog.slimeHealth -= 2;
                frog.isSuffering = true;
                // on (ré)initialise un petit timer de souffrance
                frog.waittime = 20;
                // pas de frame spéciale de "hit" : on garde l'animation idle (0..5)
                frog.sprite.playAnimation(0, 3, true, 100);
                frog.actionTime = 0;
                frog.isAttacking = false;
            }

            // mort du guepe
            if (frog.slimeHealth <= 0 && !frog.isDead) {
                frog.isDead = true;
                frog.attackCollider.checkCollisions = false;
                frog.sprite.dispose();
                frog.slimeCollider.dispose();
                frog.attackCollider.dispose();
                slimes.splice(slimes.indexOf(frog), 1);
                return;
            }

            if (frog.isSuffering) {
                const prevX = frog.slimeCollider.position.x;
                if(frog.sprite.position.x < lyrina.position.x) {
                    frog.slimeCollider.position.x -= 0.01;
                    
                }
                else {
                    frog.slimeCollider.position.x += 0.01;
                    frog.sprite.invertU = true;
                }
                frog.slimeCollider.computeWorldMatrix(true);
                // faire clignoter la guepe comme le joueur pendant quelques frames
                if (frog.waittime > 0) {
                    frog.waittime--;
                    // clignotement simple: visible 3 frames sur 6
                    frog.sprite.isVisible = (frog.waittime % 6) >= 3;
                } else {
                    frog.isSuffering = false;
                    frog.sprite.isVisible = true;
                }
                frog.slimeCollider.computeWorldMatrix(true);
                // empêcher un slime touché de traverser les autres slimes
                for (const other of slimes) {
                    if (other === frog) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        frog.slimeCollider.position.x = prevX;
                        frog.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
                for (const obstacle of collidables) {
                    const oBB = obstacle.getBoundingInfo().boundingBox;
                    const sBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        frog.slimeCollider.position.x = prevX;
                        frog.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
            } else {
                // faire en sorte de sauter 20 frames apres que le joueur est sauté n'importe où dans la scene,
                // pour donner l'impression que les frogs réagissent au saut du joueur.

                // 1) Gestion du délai avant le saut
                if (frog.jumpDelay > 0) {
                    frog.jumpDelay--;
                    // Quand le délai arrive à 0, on applique une impulsion vers le haut
                    if (frog.jumpDelay === 0 && frog.IsGrounded) {
                        frog.verticalVelocity = 0.05; // force du saut
                        frog.IsGrounded = false;
                    }
                }

                // 2) Animation : frame 4 pendant le saut, 0..3 au sol
                if (!frog.IsGrounded || Math.abs(frog.verticalVelocity) > 0.0001) {
                    // en l'air : pose de saut (frame 4)
                    frog.sprite.playAnimation(4, 4, true, 100);
                } else if(frog.sprite.cellIndex==4){
                    // au sol : idle 0..3
                    frog.sprite.playAnimation(0, 3, true, 160);
                }
            }

            // === PHYSIQUE VERTICALE de la frog (même logique que le joueur/slimes) ===
            frog.verticalVelocity -= gravity;
            const fdy = frog.verticalVelocity;
            const prevY = frog.slimeCollider.position.y;
            frog.slimeCollider.position.y += fdy;
            frog.slimeCollider.computeWorldMatrix(true);

            let frogHitObstacle = false;
            for (const obstacle of collidables) {
                const oBB = obstacle.getBoundingInfo().boundingBox;
                const fBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                const obstacleTop = oBB.maximumWorld.y;
                const obstacleBottom = oBB.minimumWorld.y;
                const obstacleLeft = oBB.minimumWorld.x;
                const obstacleRight = oBB.maximumWorld.x;
                const frogHalfY = fBB.extendSizeWorld.y;
                const overlapsX = fBB.maximumWorld.x >= obstacleLeft && fBB.minimumWorld.x <= obstacleRight;

                // Atterrissage sur le haut d'un obstacle
                if (fdy <= 0 && overlapsX && fBB.minimumWorld.y <= obstacleTop && fBB.maximumWorld.y >= obstacleTop) {
                    frog.slimeCollider.position.y = obstacleTop + frogHalfY;
                    frog.slimeCollider.computeWorldMatrix(true);
                    frog.verticalVelocity = 0;
                    frog.IsGrounded = true;
                    frogHitObstacle = true;
                    break;
                }
                // Collision par le dessous (tête de la frog sous une plateforme)
                else if (fdy > 0 && overlapsX && fBB.maximumWorld.y >= obstacleBottom && fBB.minimumWorld.y <= obstacleBottom) {
                    frog.slimeCollider.position.y = obstacleBottom - frogHalfY;
                    frog.slimeCollider.computeWorldMatrix(true);
                    frog.verticalVelocity = 0;
                    frog.IsGrounded = false;
                    frogHitObstacle = true;
                    break;
                }
            }

            if (!frogHitObstacle) {
                frog.IsGrounded = false;
            }
            // empêche un slime qui tombe de traverser un autre slime (collision verticale)
            if (fdy <= 0) {
                for (const other of slimes) {
                    if (other === frog) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = frog.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        // replace le slime à son ancienne hauteur et annule la chute
                        frog.slimeCollider.position.y = prevY;
                        frog.slimeCollider.computeWorldMatrix(true);
                        frog.verticalVelocity = 0;
                        frog.IsGrounded = true;
                        break;
                    }
                }

            }
            // garder les sprites alignés avec le collider
            frog.sprite.position.copyFrom(frog.slimeCollider.position);
            frog.attackCollider.position.copyFrom(frog.sprite.position);
            frog.attackCollider.checkCollisions = true;
        }

        function guepeboucle(guepe: Guepe): void {
            // Si le guepe est déjà mort, on ne fait plus rien
            if (guepe.isDead) {
                return;
            }

            // Dégâts reçus depuis l'attaque du joueur
            if (guepe.attackCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                guepe.guepeHealth -= 2;
                guepe.isSuffering = true;
                // on (ré)initialise un petit timer de souffrance
                guepe.waittime = 20;
                // pas de frame spéciale de "hit" : on garde l'animation idle (0..5)
                guepe.sprite.playAnimation(0, 5, true, 100);
                guepe.actionTime = 0;
                guepe.isAttacking = false;
            }

            // mort du guepe
            if (guepe.guepeHealth <= 0 && !guepe.isDead) {
                guepe.isDead = true;
                guepe.attackCollider.checkCollisions = false;
                guepe.sprite.dispose();
                guepe.slimeCollider.dispose();
                guepe.attackCollider.dispose();
                guepes.splice(guepes.indexOf(guepe), 1);
                return;
            }

            if (guepe.isSuffering) {
                // faire clignoter la guepe comme le joueur pendant quelques frames
                if (guepe.waittime > 0) {
                    guepe.waittime--;
                    // clignotement simple: visible 3 frames sur 6
                    guepe.sprite.isVisible = (guepe.waittime % 6) >= 3;
                } else {
                    guepe.isSuffering = false;
                    guepe.sprite.isVisible = true;
                }
                const prevX = guepe.slimeCollider.position.x;
                guepe.slimeCollider.computeWorldMatrix(true);
            } else {
                // juste animer la guepe sans déplacement pour l'instant
                if( !guepe.isAttacking && invincibilityFrames <= 0) {
                    guepe.sprite.playAnimation(0, 5, false, 50, () => {  
                        guepe.sprite.playAnimation(0, 5, true, 100);
                    });
                    guepe.waittime = 20;
                    guepe.actionTime = 0;
                    guepe.isAttacking = true;
                }
                if(guepe.isAttacking) {
                    const prevX = guepe.slimeCollider.position.x;
                    guepe.slimeCollider.computeWorldMatrix(true);
                    if (invincibilityFrames > 0) {
                        const sBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                        const pBB = playerCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            guepe.slimeCollider.position.x = prevX;
                            guepe.slimeCollider.computeWorldMatrix(true);
                        }
                    }
                }
                else{
                    guepe.sprite.playAnimation(0, 5, true, 100);
                }
            }

            // garder les colliders alignés avec le sprite
            guepe.slimeCollider.position.copyFrom(guepe.sprite.position);
            guepe.slimeCollider.position.y-=0.02;
            guepe.attackCollider.position.copyFrom(guepe.sprite.position);
            guepe.attackCollider.position.y-=0.02;
            guepe.attackCollider.checkCollisions = true;
        }

        function guepepurpleboucle(guepe: Guepepurple): void {
            // Si le guepe est déjà mort, on ne fait plus rien
            if (guepe.isDead) {
                return;
            }

            // Dégâts reçus depuis l'attaque du joueur
            if (guepe.attackCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                guepe.guepeHealth -= 2;
                guepe.isSuffering = true;
                // on (ré)initialise un petit timer de souffrance
                guepe.waittime = 20;
                // pas de frame spéciale de "hit" : on garde l'animation idle (0..5)
                guepe.sprite.playAnimation(0, 5, true, 100);
                guepe.actionTime = 0;
                guepe.isAttacking = false;
            }

            // mort du guepe
            if (guepe.guepeHealth <= 0 && !guepe.isDead) {
                guepe.isDead = true;
                guepe.attackCollider.checkCollisions = false;
                guepe.sprite.dispose();
                guepe.slimeCollider.dispose();
                guepe.attackCollider.dispose();
                guepes.splice(guepes.indexOf(guepe), 1);
                return;
            }

            if (guepe.isSuffering) {
                // faire clignoter la guepe comme le joueur pendant quelques frames
                if (guepe.waittime > 0) {
                    guepe.waittime--;
                    // clignotement simple: visible 3 frames sur 6
                    guepe.sprite.isVisible = (guepe.waittime % 6) >= 3;
                } else {
                    guepe.isSuffering = false;
                    guepe.sprite.isVisible = true;
                }
                const prevX = guepe.slimeCollider.position.x;
                const prevY = guepe.slimeCollider.position.y;
                guepe.slimeCollider.computeWorldMatrix(true);
            } else {
                // juste animer la guepe sans déplacement pour l'instant
                if( !guepe.isAttacking && invincibilityFrames <= 0) {
                    guepe.sprite.playAnimation(0, 5, false, 50, () => {  
                        guepe.sprite.playAnimation(0, 5, true, 100);
                        guepe.isAttacking = false;
                    });
                    guepe.waittime = 20;
                    guepe.actionTime = 0;
                    guepe.isAttacking = true;
                }
                if(guepe.isAttacking) {
                    if(guepe.axe==0){
                        const prevY = guepe.slimeCollider.position.y;
                        const prevX = guepe.slimeCollider.position.x;
                        if(guepe.slimeCollider.position.y >= guepe.initialPositiony + guepe.distance){
                            guepe.isgoinigup=false;
                        }
                        else if(guepe.slimeCollider.position.y <= guepe.initialPositiony - guepe.distance){
                            guepe.isgoinigup=true;
                        }
                        if((guepe.slimeCollider.position.y < guepe.initialPositiony + guepe.distance) && guepe.isgoinigup) {
                            guepe.slimeCollider.position.y += 0.003;
                        }
                        else if(guepe.slimeCollider.position.y > guepe.initialPositiony - guepe.distance && !guepe.isgoinigup){
                            guepe.slimeCollider.position.y -= 0.003;
                        }
                        guepe.slimeCollider.computeWorldMatrix(true);
                        if (invincibilityFrames > 0) {
                            const sBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                            const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                            if (overlapX && overlapY) {
                                guepe.slimeCollider.position.x = prevX;
                                guepe.slimeCollider.position.y = prevY;
                                guepe.slimeCollider.computeWorldMatrix(true);
                            }
                        }
                    }
                    else if(guepe.axe==1){
                        const prevY = guepe.slimeCollider.position.y;
                        const prevX = guepe.slimeCollider.position.x;
                        if(guepe.slimeCollider.position.x >= guepe.initialPositionx + guepe.distance){
                            guepe.isgoinigup=false;
                        }
                        else if(guepe.slimeCollider.position.x <= guepe.initialPositionx - guepe.distance){
                            guepe.isgoinigup=true;
                        }
                        if((guepe.slimeCollider.position.x < guepe.initialPositionx + guepe.distance) && guepe.isgoinigup) {
                            guepe.slimeCollider.position.x += 0.003;
                        }
                        else if(guepe.slimeCollider.position.x > guepe.initialPositionx - guepe.distance && !guepe.isgoinigup){
                            guepe.slimeCollider.position.x -= 0.003;
                        }
                        guepe.slimeCollider.computeWorldMatrix(true);
                        if (invincibilityFrames > 0) {
                            const sBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                            const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                            if (overlapX && overlapY) {
                                guepe.slimeCollider.position.x = prevX;
                                guepe.slimeCollider.position.y = prevY;
                                guepe.slimeCollider.computeWorldMatrix(true);
                            }
                        }
                    }
                }
                else{
                    guepe.sprite.playAnimation(0, 5, true, 100);
                }
            }

            // garder les colliders alignés avec le sprite
            guepe.sprite.position.copyFrom(guepe.slimeCollider.position);
            guepe.attackCollider.position.copyFrom(guepe.sprite.position);
            guepe.sprite.position.y+=0.02;
            guepe.attackCollider.checkCollisions = true;
        }

        function slimeboucle(slime: Slime): void {
            // Si le slime est déjà mort, on ne fait plus rien
            if (slime.isDead) {
                return;
            }
            if(slime.slimeCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                slime.slimeHealth -= 2;
                // frame 39 = dernière case de la spritesheet rouge (4 colonnes x 10 lignes)
                slime.sprite.playAnimation(39, 39, false, 500, () => {  
                    slime.sprite.playAnimation(0, 5, true, 100);
                    slime.waittime = 20;
                    slime.actionTime = 0;
                    slime.isAttacking = false;
                })
            }
            // mort du slime vert
            if (slime.slimeHealth <= 0 && !slime.isDead) {
                slime.isDead = true;
                slime.attackCollider.checkCollisions = false;
                slime.sprite.dispose();
                slime.slimeCollider.dispose();
                slime.attackCollider.dispose();
                slimes.splice(slimes.indexOf(slime), 1);
                return;
            }
            if(slime.sprite.cellIndex == 39) {
                const prevX = slime.slimeCollider.position.x;
                if(slime.sprite.position.x < lyrina.position.x) {
                    slime.slimeCollider.position.x -= 0.005;
                    slime.sprite.invertU = true;
                }
                else {
                    slime.slimeCollider.position.x += 0.005;
                }
                slime.slimeCollider.computeWorldMatrix(true);

                // empêcher un slime touché de traverser les autres slimes
                for (const other of slimes) {
                    if (other === slime) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        slime.slimeCollider.position.x = prevX;
                        slime.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
                for (const obs of collidables) {
                    const oBB = obs.getBoundingInfo().boundingBox;
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        slime.slimeCollider.position.x = prevX;
                        slime.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
            }

            // === VERTICAL PHYSICS du slime (même logique que le joueur) ===
            slime.verticalVelocity -= gravity;
            const sdy1 = slime.verticalVelocity;
            const prevY = slime.slimeCollider.position.y;
            slime.slimeCollider.position.y += sdy1;
            slime.slimeCollider.computeWorldMatrix(true);

            let slime1HitObstacle = false;
            for (const obstacle of collidables) {
                const oBB = obstacle.getBoundingInfo().boundingBox;
                const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                const obstacleTop = oBB.maximumWorld.y;
                const obstacleBottom = oBB.minimumWorld.y;
                const obstacleLeft = oBB.minimumWorld.x;
                const obstacleRight = oBB.maximumWorld.x;
                const slimeHalfY = sBB.extendSizeWorld.y;
                const overlapsX = sBB.maximumWorld.x >= obstacleLeft && sBB.minimumWorld.x <= obstacleRight;

                // Atterrissage sur le haut d'un obstacle
                if (sdy1 <= 0 && overlapsX && sBB.minimumWorld.y <= obstacleTop && sBB.maximumWorld.y >= obstacleTop) {
                    slime.slimeCollider.position.y = obstacleTop + slimeHalfY;
                    slime.slimeCollider.computeWorldMatrix(true);
                    slime.verticalVelocity = 0;
                    slime.IsGrounded = true;
                    slime1HitObstacle = true;
                    break;
                }
                // Collision par le dessous (tête du slime sous une plateforme)
                else if (sdy1 > 0 && overlapsX && sBB.maximumWorld.y >= obstacleBottom && sBB.minimumWorld.y <= obstacleBottom) {
                    slime.slimeCollider.position.y = obstacleBottom - slimeHalfY;
                    slime.slimeCollider.computeWorldMatrix(true);
                    slime.verticalVelocity = 0;
                    slime.IsGrounded = false;
                    slime1HitObstacle = true;
                    break;
                }
            }
            if (!slime1HitObstacle) {
                slime.IsGrounded = false;
            }

            // empêche un slime qui tombe de traverser un autre slime (collision verticale)
            if (sdy1 <= 0) {
                for (const other of slimes) {
                    if (other === slime) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        // replace le slime à son ancienne hauteur et annule la chute
                        slime.slimeCollider.position.y = prevY;
                        slime.slimeCollider.computeWorldMatrix(true);
                        slime.verticalVelocity = 0;
                        slime.IsGrounded = true;
                        break;
                    }
                }

            }
            //detectiondistance
            if(slime.sprite.cellIndex != 39) {
                // Ne déclenche pas une nouvelle attaque si le joueur est en invincibilité
                // et seulement si le joueur est proche en X **et** en Y.
                const dxGreen = Math.abs(playerCollider.position.x - slime.slimeCollider.position.x);
                const dyGreen = Math.abs(playerCollider.position.y - slime.slimeCollider.position.y);
                // Portée horizontale ~0.5, portée verticale plus courte (~0.25)
                if(dxGreen < 0.8 && dyGreen < 0.3 && !slime.isAttacking && slime.pastFirstCycle && invincibilityFrames <= 0) {
                    slime.sprite.playAnimation(16, 38, false, 50, () => {  
                        slime.sprite.playAnimation(0, 5, true, 100);
                        slime.isAttacking = false;
                    });
                    slime.waittime = 10;
                    slime.actionTime = 0;
                    slime.isAttacking = true;
                }
                if(slime.isAttacking) {
                    const prevX = slime.slimeCollider.position.x;
                    if(slime.sprite.position.x < lyrina.position.x) {
                        slime.slimeCollider.position.x += slime.speed;
                        slime.sprite.invertU = true;
                    }
                    else {
                        slime.slimeCollider.position.x -= slime.speed;
                        slime.sprite.invertU = false;
                    }
                    slime.slimeCollider.computeWorldMatrix(true);

                    // collision entre slimes pendant l'attaque
                    for (const other of slimes) {
                        if (other === slime) continue;
                        const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                            break;
                        }
                    }
                    // collision slime ↔ joueur pendant l'attaque
                    // Pendant les invincibility frames du joueur, le slime ne
                    // doit pas le traverser : on le bloque comme un mur.
                    const testing=1;
                    if (testing==1) {
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const pBB = playerCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                        }
                    }
                    for (const obs of collidables) {
                        const oBB = obs.getBoundingInfo().boundingBox;
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                            break;
                        }
                    }
                }
                else {
                    if(slime.waittime > 0) {
                        slime.waittime--;
                    }
                    else {
                        if(slime.actionTime == 0) {
                            slime.actionTime = Math.floor(Math.random() * (180 - 60 + 1)) + 60;
                            slime.sprite.playAnimation(6,15, true, 100);
                            slime.dir = Math.random();
                            slime.speed =  Math.random() * (0.002 - 0.003) + 0.003;
                            //console.log(slime.dir < 0.5);
                        }
                        // tentative de déplacement horizontal
                        const prevX = slime.slimeCollider.position.x;
                        if(slime.dir < 0.5) {
                            slime.slimeCollider.position.x += slime.speed;
                            slime.sprite.invertU = true;
                        }
                        else {
                            slime.slimeCollider.position.x -= slime.speed;
                            slime.sprite.invertU = false;
                        }
                        slime.slimeCollider.computeWorldMatrix(true);

                        // empêche les slimes de se traverser entre eux (collision AABB)
                        for (const other of slimes) {
                            if (other === slime) continue;
                            const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                            const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                            const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                            if (overlapX && overlapY) {
                                slime.slimeCollider.position.x = prevX;
                                slime.slimeCollider.computeWorldMatrix(true);
                                break;
                            }
                        }
                        for (const obs of collidables) {
                            const oBB = obs.getBoundingInfo().boundingBox;
                            const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                            const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                            if (overlapX && overlapY) {
                                slime.slimeCollider.position.x = prevX;
                                slime.slimeCollider.computeWorldMatrix(true);
                                break;
                            }
                        }
                        // empêche les slimes de traverser le joueur (collision AABB)
                        {
                            const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.005;
                            const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                            const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                            if (overlapX && overlapY) {
                                slime.slimeCollider.position.x = prevX;
                                slime.slimeCollider.computeWorldMatrix(true);
                            }
                        }
                        const groundAhead = hasGroundAhead(slime.slimeCollider,slime.dir < 0.5 ? 1 : -1);
                        if (!groundAhead) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                        }

                        slime.actionTime--;
                        if(slime.actionTime == 0) {
                            slime.waittime = Math.floor(Math.random() * (15 - 8 + 1)) + 8;
                            slime.sprite.playAnimation(0, 5, true, 100);
                            slime.pastFirstCycle = true;
                        }
                    }
                }
            }
            slime.sprite.position.copyFrom(slime.slimeCollider.position);
            slime.attackCollider.position.copyFrom(slime.sprite.position);
            slime.sprite.position.y += 0.019;
            if(slime.sprite.cellIndex >= 16 && slime.sprite.cellIndex <= 37) {
                slime.attackCollider.checkCollisions = true;
            }
            else {
                slime.attackCollider.checkCollisions = false;
            }
        }
        //BOUCLE SLIME ROUGE
        function slimerougeboucle(slime: Slimerouge): void {
            // Si le slime rouge est déjà mort, on ne fait plus rien
            if (slime.isDead) {
                
                return;
            }
            if(slime.slimeCollider.intersectsMesh(attackCollider, false) && attackCollider.checkCollisions) {
                slime.slimeHealth -= 2;
                slime.sprite.playAnimation(39, 39, false, 500, () => {  
                    slime.sprite.playAnimation(0, 5, true, 100);
                    slime.waittime = 20;
                    slime.actionTime = 0;
                    slime.isAttacking = false;
                })
            }
            // mort du slime rouge
            if (slime.slimeHealth <= 0 && !slime.isDead) {
                slime.isDead = true;
                slime.attackCollider.checkCollisions = false;
                slime.sprite.dispose();
                slime.slimeCollider.dispose();
                slime.attackCollider.dispose();
                slimes.splice(slimes.indexOf(slime), 1);
                return;
            }
            if(slime.sprite.cellIndex == 39) {
                const prevX = slime.slimeCollider.position.x;
                if(slime.sprite.position.x < lyrina.position.x) {
                    slime.slimeCollider.position.x -= 0.005;
                    slime.sprite.invertU = true;
                }
                else {
                    slime.slimeCollider.position.x += 0.005;
                }
                slime.slimeCollider.computeWorldMatrix(true);

                // empêcher un slime touché de traverser les autres slimes
                for (const other of slimes) {
                    if (other === slime) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        slime.slimeCollider.position.x = prevX;
                        slime.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
                for (const obstacle of collidables) {
                    const oBB = obstacle.getBoundingInfo().boundingBox;
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        slime.slimeCollider.position.x = prevX;
                        slime.slimeCollider.computeWorldMatrix(true);
                        break;
                    }
                }
            }

            // === VERTICAL PHYSICS du slime (même logique que le joueur) ===
            slime.verticalVelocity -= gravity;
            const sdy1 = slime.verticalVelocity;
            const prevY = slime.slimeCollider.position.y;
            slime.slimeCollider.position.y += sdy1;
            slime.slimeCollider.computeWorldMatrix(true);

            let slime1HitObstacle = false;
            for (const obstacle of collidables) {
                const oBB = obstacle.getBoundingInfo().boundingBox;
                const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                const obstacleTop = oBB.maximumWorld.y;
                const obstacleBottom = oBB.minimumWorld.y;
                const obstacleLeft = oBB.minimumWorld.x;
                const obstacleRight = oBB.maximumWorld.x;
                const slimeHalfY = sBB.extendSizeWorld.y;
                const overlapsX = sBB.maximumWorld.x >= obstacleLeft && sBB.minimumWorld.x <= obstacleRight;

                // Atterrissage sur le haut d'un obstacle
                if (sdy1 <= 0 && overlapsX && sBB.minimumWorld.y <= obstacleTop && sBB.maximumWorld.y >= obstacleTop) {
                    slime.slimeCollider.position.y = obstacleTop + slimeHalfY;
                    slime.slimeCollider.computeWorldMatrix(true);
                    slime.verticalVelocity = 0;
                    slime.IsGrounded = true;
                    slime1HitObstacle = true;
                    break;
                }
                // Collision par le dessous (tête du slime sous une plateforme)
                else if (sdy1 > 0 && overlapsX && sBB.maximumWorld.y >= obstacleBottom && sBB.minimumWorld.y <= obstacleBottom) {
                    slime.slimeCollider.position.y = obstacleBottom - slimeHalfY;
                    slime.slimeCollider.computeWorldMatrix(true);
                    slime.verticalVelocity = 0;
                    slime.IsGrounded = false;
                    slime1HitObstacle = true;
                    break;
                }
            }
            if (!slime1HitObstacle) {
                slime.IsGrounded = false;
            }

            // empêche un slime qui tombe de traverser un autre slime (collision verticale)
            if (sdy1 <= 0) {
                for (const other of slimes) {
                    if (other === slime) continue;
                    const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                    const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                    if (overlapX && overlapY) {
                        // replace le slime à son ancienne hauteur et annule la chute
                        slime.slimeCollider.position.y = prevY;
                        slime.slimeCollider.computeWorldMatrix(true);
                        slime.verticalVelocity = 0;
                        slime.IsGrounded = true;
                        break;
                    }
                }

            }
            //iiiiiiiiIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
            //detectiondistance
            
            if(slime.sprite.cellIndex != 39) {
                // Ne déclenche pas une nouvelle attaque si le joueur est en invincibilité
                // Utilise maintenant la vraie distance horizontale entre le joueur et le slime rouge
                const dxRed = Math.abs(playerCollider.position.x - slime.slimeCollider.position.x);
                const dyRed = Math.abs(playerCollider.position.y - slime.slimeCollider.position.y);
                if(dxRed < 0.4 && dyRed < 0.3 && !slime.isAttacking && invincibilityFrames <= 0) {
                    // la spritesheet a 40 frames (0..39). On utilise 16..38 pour l'attaque.
                    slime.sprite.playAnimation(16, 38, false, 50, () => {  
                        slime.sprite.playAnimation(0, 5, true, 100);
                        slime.isAttacking = false;
                    });
                    slime.waittime = 10;
                    slime.actionTime = 0;
                    slime.isAttacking = true;
                }
                if(slime.isAttacking) {
                    const prevX = slime.slimeCollider.position.x;
                    if(slime.sprite.position.x < lyrina.position.x) {
                        slime.slimeCollider.position.x += slime.speed;
                        slime.sprite.invertU = true;
                    }
                    else {
                        slime.slimeCollider.position.x -= slime.speed;
                        slime.sprite.invertU = false;
                    }
                    slime.slimeCollider.computeWorldMatrix(true);

                    // collision entre slimes pendant l'attaque
                    for (const other of slimes) {
                        if (other === slime) continue;
                        const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                            break;
                        }
                    }
                    for (const obstacle of collidables) {
                        const oBB = obstacle.getBoundingInfo().boundingBox;
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                            break;
                        }
                    }
                    // collision slime ↔ joueur pendant l'attaque
                    // Pendant les invincibility frames du joueur, le slime ne
                    // doit pas le traverser : on le bloque comme un mur.
                    if (invincibilityFrames > 0) {
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const pBB = playerCollider.getBoundingInfo().boundingBox;
                        const eps = 0.005;
                        const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                        }
                    }
                    
                    const groundAhead = hasGroundAhead(slime.slimeCollider, slime.sprite.position.x < lyrina.position.x ? 1 : -1);
                    if (!groundAhead) {
                        slime.slimeCollider.position.x = prevX;
                        slime.slimeCollider.computeWorldMatrix(true);
                    }
                }
                else {
                    // Déplacement continu sans hasard : la direction ne change
                    // que si le slime est bloqué ou s'il arrive au bord du vide.
                    // On lance l'animation de marche (6..15) si on n'est pas déjà dessus.
                    if (slime.sprite.cellIndex < 6 || slime.sprite.cellIndex > 15) {
                        slime.sprite.playAnimation(6, 15, true, 100);
                    }

                    // initialisation direction si nécessaire
                    if (slime.dir === 0) {
                        slime.dir = 1;
                    }

                    const prevX = slime.slimeCollider.position.x;
                    slime.slimeCollider.position.x += (slime.dir > 0 ? 1 : -1) * slime.speed;
                    slime.sprite.invertU = slime.dir > 0;
                    slime.slimeCollider.computeWorldMatrix(true);

                    let blocked = false;

                    // empêche les slimes de se traverser entre eux (collision AABB)
                    for (const other of slimes) {
                        if (other === slime) continue;
                        const oBB = other.slimeCollider.getBoundingInfo().boundingBox;
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            blocked = true;
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                            break;
                        }
                    }

                    // empêche les slimes de traverser le joueur (collision AABB)
                    {
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const pBB = playerCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > pBB.minimumWorld.x + eps && sBB.minimumWorld.x < pBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > pBB.minimumWorld.y + eps && sBB.minimumWorld.y < pBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            blocked = true;
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                        }
                    }

                    // collision avec le décor (obstacles/plateformes) pendant le déplacement
                    for (const obstacle of collidables) {
                        const oBB = obstacle.getBoundingInfo().boundingBox;
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const eps = 0.0005;
                        const overlapX = sBB.maximumWorld.x > oBB.minimumWorld.x + eps && sBB.minimumWorld.x < oBB.maximumWorld.x - eps;
                        const overlapY = sBB.maximumWorld.y > oBB.minimumWorld.y + eps && sBB.minimumWorld.y < oBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            blocked = true;
                            slime.slimeCollider.position.x = prevX;
                            slime.slimeCollider.computeWorldMatrix(true);
                            break;
                        }
                    }

                    const groundAhead = hasGroundAhead(slime.slimeCollider, slime.dir > 0 ? 1 : -1);

                    // changement de direction seulement si bloqué ou bord du vide
                    if (blocked || !groundAhead) {
                        slime.dir *= -1;
                    }
                }
            }
            slime.sprite.position.copyFrom(slime.slimeCollider.position);
            slime.attackCollider.position.copyFrom(slime.sprite.position);
            slime.sprite.position.y += 0.019;
            if(slime.sprite.cellIndex >= 16 && slime.sprite.cellIndex <= 38) {
                slime.attackCollider.checkCollisions = true;
            }
            else {
                slime.attackCollider.checkCollisions = false;
            }
        }
        //BOUCLE PRINCIPALE JOUEUR
        scene.onBeforeRenderObservable.add(()=>{
            // décrémente l'invincibilité si active et fait clignoter le joueur
            if (invincibilityFrames > 0) {
                invincibilityFrames--;
                // clignotement simple: visible 3 frames sur 6
                lyrina.isVisible = (invincibilityFrames % 6) >= 3;
            } else {
                // hors invincibilité: toujours visible
                lyrina.isVisible = true;
            }

            if (!this.enemiesPaused) {
                for (const slime of slimes) {
                    if((invincibilityFrames <= 0 && playerCollider.intersectsMesh(slime.attackCollider, false) && slime.attackCollider.checkCollisions)||(invincibilityFrames <= 0 && playerCollider.intersectsMesh(slime.attackCollider, false) && !slime.IsGrounded)) {
                        lyrina.playAnimation(24, 24, false, 500, () => {  
                            lyrina.playAnimation(0, 5, true, 100);
                            isAttacking = false;
                            isKnockback = false;
                            knockbackVelocityX = 0;
                        })
                        this.health -= slime.degat;
                        {
                            const dx = playerCollider.position.x - slime.slimeCollider.position.x;
                            // lance un knockback continu plutôt qu'un téléport
                            isKnockback = true;
                            knockbackVelocityX = (dx >= 0) ? 0.04 : -0.04;
                            // 120 frames d'invincibilité après avoir été touché
                            invincibilityFrames = 120;
                            lastHitSlime = slime;
                        }
                    }
                }
                for (const guepe of guepes) {
                    if(invincibilityFrames <= 0 && playerCollider.intersectsMesh(guepe.attackCollider, false) && guepe.attackCollider.checkCollisions) {
                        lyrina.playAnimation(24, 24, false, 500, () => {  
                            lyrina.playAnimation(0, 5, true, 100);
                            isAttacking = false;
                            isKnockback = false;
                            knockbackVelocityX = 0;
                        })
                        this.health -= guepe.degat;
                        {
                            const dx = playerCollider.position.x - guepe.slimeCollider.position.x;
                            // lance un knockback continu plutôt qu'un téléport
                            isKnockback = true;
                            knockbackVelocityX = (dx >= 0) ? 0.04 : -0.04;
                            // 120 frames d'invincibilité après avoir été touché
                            invincibilityFrames = 120;
                            lastHitSlime = guepe;
                        }
                    }
                }
            }
            //ACTIVATION DES COLLISION ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ
            // Rebuild collidables pour inclure immédiatement les ajouts/suppressions de l'éditeur.
            collidables.length = 0;
            for (const m of scene.meshes) {
                if (!(m instanceof Mesh)) {
                    continue;
                }

                const isLevelCollider =
                    m.name.startsWith('block') ||
                    m.name.startsWith('platform') ||
                    m.name.startsWith('obstacle');

                if (isLevelCollider) {
                    collidables.push(m);
                }
            }

            // Knockback animé du joueur (comme les slimes)
            if (isKnockback) {
                const prevX = playerCollider.position.x;
                playerCollider.position.x += knockbackVelocityX;
                playerCollider.computeWorldMatrix(true);

                // collision avec le décor pendant le knockback
                for (const obs of collidables) {
                    const oBB = obs.getBoundingInfo().boundingBox;
                    const pBB = playerCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    if (pBB.maximumWorld.x > oBB.minimumWorld.x + eps && pBB.minimumWorld.x < oBB.maximumWorld.x - eps &&
                        pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                        playerCollider.position.x = prevX;
                        playerCollider.computeWorldMatrix(true);
                        knockbackVelocityX = 0;
                        break;
                    }
                }
                
                const groundAhead = hasGroundAhead(playerCollider, knockbackVelocityX > 0 ? 1 : -1);
                if (!groundAhead && isGrounded) {
                    playerCollider.position.x = prevX;
                    playerCollider.computeWorldMatrix(true);
                    knockbackVelocityX = 0;
                }

                // collision avec les slimes pendant le knockback
                if (knockbackVelocityX !== 0 && isGrounded) {
                    const pBB = playerCollider.getBoundingInfo().boundingBox;
                    const eps = 0.0005;
                    const overlappingSlimes: Slime[] = [];
                    for (const slime of slimes) {
                        // ici ignorer le slime qui a provoqué la collision
                        if (slime === lastHitSlime) {
                            continue;
                        }
                        const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                        const overlapX = pBB.maximumWorld.x > sBB.minimumWorld.x + eps && pBB.minimumWorld.x < sBB.maximumWorld.x - eps;
                        const overlapY = pBB.maximumWorld.y > sBB.minimumWorld.y + eps && pBB.minimumWorld.y < sBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            overlappingSlimes.push(slime);
                        }
                    }

                    for (const guepe of guepes) {
                        // ici ignorer le guepe qui a provoqué la collision
                        if (guepe === lastHitSlime) {
                            continue;
                        }
                        const sBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                        const overlapX = pBB.maximumWorld.x > sBB.minimumWorld.x + eps && pBB.minimumWorld.x < sBB.maximumWorld.x - eps;
                        const overlapY = pBB.maximumWorld.y > sBB.minimumWorld.y + eps && pBB.minimumWorld.y < sBB.maximumWorld.y - eps;
                        if (overlapX && overlapY) {
                            overlappingSlimes.push(guepe);
                        }
                    }

                    if (invincibilityFrames > 0) {
                        // Pendant l'invincibilité : si on touche au moins un slime,
                        // on s'arrête net contre lui (on annule le knockback).
                        if (overlappingSlimes.length > 0) {
                            playerCollider.position.x = prevX;
                            playerCollider.computeWorldMatrix(true);
                            knockbackVelocityX = 0;
                            isKnockback = false;
                        }
                    } else {
                        // Hors invincibilité : comportement spécial du knockback
                        // quand on percute exactement un seul slime.
                        if (overlappingSlimes.length === 1) {
                            const onlySlime = overlappingSlimes[0];
                            const dxHit = playerCollider.position.x - onlySlime.slimeCollider.position.x;
                            const dir = dxHit >= 0 ? 1 : -1;
                            // force un knockback "plein pot" dans la bonne direction
                            knockbackVelocityX = dir * 0.06;
                        }
                    }
                }

                // amortit progressivement la vitesse de knockback
                knockbackVelocityX *= 0.9;
                if (Math.abs(knockbackVelocityX) < 0.005) {
                    knockbackVelocityX = 0;
                    isKnockback = false;
                    lastHitSlime = null;
                }
            }

            if(lyrina.cellIndex != 24) {
                if (keyStatus.z && !isAttacking) {
                    attackCollider.checkCollisions = true;
                    if(isGrounded)
                        lyrina.playAnimation(18,20,false,100,() => {
                            isAttacking = false;
                            newAnim = true;
                        });
                    else
                        lyrina.playAnimation(21,23,false,100,() => {
                            isAttacking = false;
                            newAnim = true;
                        });
                    isAttacking = true;
                }

                // Jump input: start jump only if grounded (pas de nouveau saut pendant une attaque)
                if (!isAttacking && keyStatus[' '] && isGrounded) {
                    verticalVelocity = jumpStrength;
                    isGrounded = false;
                    lyrina.playAnimation(14,15,true,120);
                    newAnim = true;

                    // Déclenche un saut "de réaction" des frogs
                    // 20 frames après le saut du joueur.
                    for (const frog of frogs) {
                        frog.jumpDelay = 20;      // délai en frames
                        frog.jumpTime = 0;        // on réinitialise le saut
                        frog.baseY = frog.sprite.position.y; // hauteur de base
                    }
                    // Déclenche un saut "de réaction" des frogs
                    // 20 frames après le saut du joueur.
                    for (const frog of frogspurple) {
                        frog.jumpDelay = 1;      // délai en frames
                        frog.jumpTime = 0;        // on réinitialise le saut
                        frog.baseY = frog.sprite.position.y; // hauteur de base
                    }
                }

                // Animation de chute uniquement si on n'est pas en train d'attaquer
                if (!isAttacking && !isGrounded && verticalVelocity < 0 && !falling){
                    lyrina.playAnimation(16,17,true,120);
                    falling = true;
                    newAnim = true;
                }

                // === HORIZONTAL MOVEMENT first (prevents corner-sliding) ===
                // Pendant une attaque (isAttacking == true), on ignore q et s
                // mais on laisse la décélération/friction agir dans le else.
                if(!isAttacking && !isKnockback && (keyStatus.q||keyStatus.s)){
                    if(!isAttacking && newAnim && isGrounded) {
                        lyrina.playAnimation(9, 13, true, 120);
                        newAnim = false
                    }
                    if(keyStatus.s && !keyStatus.q){
                        lyrina.invertU = false;
                        const prevX = playerCollider.position.x;
                        playerCollider.position.x += acceleration;
                        playerCollider.computeWorldMatrix(true);
                        for (const obs of collidables) {
                            const oBB = obs.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            if (pBB.maximumWorld.x > oBB.minimumWorld.x && pBB.minimumWorld.x < oBB.maximumWorld.x &&
                                pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                                playerCollider.position.x = prevX;
                                playerCollider.computeWorldMatrix(true);
                                acceleration = 0;
                                break;
                            }
                        }
                        {
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            for (const slime of slimes) {
                                const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                                const overlapX = pBB.maximumWorld.x > sBB.minimumWorld.x + eps && pBB.minimumWorld.x < sBB.maximumWorld.x - eps;
                                const overlapY = pBB.maximumWorld.y > sBB.minimumWorld.y + eps && pBB.minimumWorld.y < sBB.maximumWorld.y - eps;
                                if (overlapX && overlapY) {
                                    playerCollider.position.x = prevX;
                                    playerCollider.computeWorldMatrix(true);
                                    acceleration = 0;
                                    break;
                                }
                            }
                        }
                        if(invincibilityFrames>0){
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            for (const guepe of guepes) {
                                const gBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                                const overlapX = pBB.maximumWorld.x > gBB.minimumWorld.x + eps && pBB.minimumWorld.x < gBB.maximumWorld.x - eps;
                                const overlapY = pBB.maximumWorld.y > gBB.minimumWorld.y + eps && pBB.minimumWorld.y < gBB.maximumWorld.y - eps;
                                if (overlapX && overlapY) {
                                    playerCollider.position.x = prevX;
                                    playerCollider.computeWorldMatrix(true);
                                    acceleration = 0;
                                    break;
                                }
                            }
                        }
                        if(acceleration>-speed){
                            acceleration-=0.004;
                        }
                    }
                    else if(keyStatus.q ){
                        lyrina.invertU = true;
                        const prevX = playerCollider.position.x;
                        playerCollider.position.x += acceleration;
                        playerCollider.computeWorldMatrix(true);
                        for (const obs of collidables) {
                            const oBB = obs.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            if (pBB.maximumWorld.x > oBB.minimumWorld.x && pBB.minimumWorld.x < oBB.maximumWorld.x &&
                                pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                                playerCollider.position.x = prevX;
                                playerCollider.computeWorldMatrix(true);
                                acceleration = 0;
                                break;
                            }
                        }
                        {
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.0005;
                            for (const slime of slimes) {
                                const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                                const overlapX = pBB.maximumWorld.x > sBB.minimumWorld.x + eps && pBB.minimumWorld.x < sBB.maximumWorld.x - eps;
                                const overlapY = pBB.maximumWorld.y > sBB.minimumWorld.y + eps && pBB.minimumWorld.y < sBB.maximumWorld.y - eps;
                                if (overlapX && overlapY) {
                                    playerCollider.position.x = prevX;
                                    playerCollider.computeWorldMatrix(true);
                                    acceleration = 0;
                                    break;
                                }
                            }
                        }
                        if(invincibilityFrames>0){
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            for (const guepe of guepes) {
                                const gBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                                const overlapX = pBB.maximumWorld.x > gBB.minimumWorld.x + eps && pBB.minimumWorld.x < gBB.maximumWorld.x - eps;
                                const overlapY = pBB.maximumWorld.y > gBB.minimumWorld.y + eps && pBB.minimumWorld.y < gBB.maximumWorld.y - eps;
                                if (overlapX && overlapY) {
                                    playerCollider.position.x = prevX;
                                    playerCollider.computeWorldMatrix(true);
                                    acceleration = 0;
                                    break;
                                }
                            }
                        }
                        if(acceleration<speed){
                            acceleration+=0.004;
                        }
                    }
                }
                else{
                    if(Math.abs(acceleration)<0.006){
                        acceleration=0;
                    }
                    else if(acceleration>0 && !isKnockback){
                        acceleration-=0.008;
                        const prevX = playerCollider.position.x;
                        playerCollider.position.x += acceleration;
                        playerCollider.computeWorldMatrix(true);
                        for (const obs of collidables) {
                            const oBB = obs.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            if (pBB.maximumWorld.x > oBB.minimumWorld.x && pBB.minimumWorld.x < oBB.maximumWorld.x &&
                                pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                                playerCollider.position.x = prevX;
                                playerCollider.computeWorldMatrix(true);
                                acceleration = 0;
                                break;
                            }
                        }
                    }
                    else if(acceleration<0 && !isKnockback){
                        acceleration+=0.008;
                        const prevX = playerCollider.position.x;
                        playerCollider.position.x += acceleration;
                        playerCollider.computeWorldMatrix(true);
                        for (const obs of collidables) {
                            const oBB = obs.getBoundingInfo().boundingBox;
                            const pBB = playerCollider.getBoundingInfo().boundingBox;
                            const eps = 0.001;
                            if (pBB.maximumWorld.x > oBB.minimumWorld.x && pBB.minimumWorld.x < oBB.maximumWorld.x &&
                                pBB.minimumWorld.y < oBB.maximumWorld.y - eps && pBB.maximumWorld.y > oBB.minimumWorld.y + eps) {
                                playerCollider.position.x = prevX;
                                playerCollider.computeWorldMatrix(true);
                                acceleration = 0;
                                break;
                            }
                        }
                    }
                    if(!isAttacking && acceleration==0 && isGrounded){
                        if(!newAnim)lyrina.playAnimation(0,7,true,100);
                        newAnim = true;
                    }
                    if(!isAttacking && verticalVelocity==0 && isLanded){
                        lyrina.playAnimation(0,7,true,100);
                        newAnim = true;
                        isLanded = false;
                    }
                }
            }

            // === VERTICAL PHYSICS after horizontal (prevents corner-sliding) ===
            // S'applique même pendant l'animation de hit (cellIndex 24)
            verticalVelocity -= gravity;
            const dy = verticalVelocity;
            playerCollider.position.y += dy;
            playerCollider.computeWorldMatrix(true);

            let hitObstacle = false;
            for (const obstacle of collidables) {
                const oBB = obstacle.getBoundingInfo().boundingBox;
                const pBB = playerCollider.getBoundingInfo().boundingBox;
                const obstacleTop = oBB.maximumWorld.y;
                const obstacleBottom = oBB.minimumWorld.y;
                const obstacleLeft = oBB.minimumWorld.x;
                const obstacleRight = oBB.maximumWorld.x;
                const playerHalfY = pBB.extendSizeWorld.y;
                const overlapsX = pBB.maximumWorld.x >= obstacleLeft && pBB.minimumWorld.x <= obstacleRight;

                if (dy <= 0 && overlapsX && pBB.minimumWorld.y <= obstacleTop && pBB.maximumWorld.y >= obstacleTop) {
                    playerCollider.position.y = obstacleTop + playerHalfY;
                    playerCollider.computeWorldMatrix(true);
                    if (verticalVelocity < -0.005) isLanded = true;
                    verticalVelocity = 0;
                    isGrounded = true;
                    falling = false;
                    hitObstacle = true;
                    break;
                } else if (dy > 0 && overlapsX && pBB.maximumWorld.y >= obstacleBottom && pBB.minimumWorld.y <= obstacleBottom) {
                    playerCollider.position.y = obstacleBottom - playerHalfY;
                    playerCollider.computeWorldMatrix(true);
                    verticalVelocity = 0;
                    isGrounded = false;
                    hitObstacle = true;
                    break;
                }
            }

            // Empêche le joueur de traverser les slimes en tombant dessus
            // (collision verticale joueur -> slimes quand il arrive par le haut)
            let hitSlimeFromTop = false;
            if (!hitObstacle && dy <= 0) {
                const pBB = playerCollider.getBoundingInfo().boundingBox;
                const playerHalfY = pBB.extendSizeWorld.y;

                for (const slime of slimes) {
                    const sBB = slime.slimeCollider.getBoundingInfo().boundingBox;
                    const slimeTop = sBB.maximumWorld.y;
                    const slimeLeft = sBB.minimumWorld.x;
                    const slimeRight = sBB.maximumWorld.x;
                    const overlapsX = pBB.maximumWorld.x >= slimeLeft && pBB.minimumWorld.x <= slimeRight;

                    if ((overlapsX && pBB.minimumWorld.y <= slimeTop && pBB.maximumWorld.y >= slimeTop && !slime.isAttacking)) {
                        playerCollider.position.y = slimeTop + playerHalfY;
                        playerCollider.computeWorldMatrix(true);
                        if (verticalVelocity < -0.005) isLanded = true;
                        verticalVelocity = 0;
                        //isGrounded = true;
                        falling = false;
                        hitSlimeFromTop = true;
                        break;
                    }
                }
            }
            if (invincibilityFrames > 0 && !hitObstacle) {
                const pBB = playerCollider.getBoundingInfo().boundingBox;
                const playerHalfY = pBB.extendSizeWorld.y;
                for (const guepe of guepes) {
                    const gBB = guepe.slimeCollider.getBoundingInfo().boundingBox;
                    const guepeTop = gBB.maximumWorld.y;
                    const guepeLeft = gBB.minimumWorld.x;
                    const guepeRight = gBB.maximumWorld.x;
                    const guepeBottom = gBB.minimumWorld.y;
                    const overlapsX = pBB.maximumWorld.x >= guepeLeft && pBB.minimumWorld.x <= guepeRight;
                    if ((dy<=0 && overlapsX && pBB.minimumWorld.y <= guepeTop && pBB.maximumWorld.y >= guepeTop)) {
                        playerCollider.position.y = guepeTop + playerHalfY;
                        playerCollider.computeWorldMatrix(true);
                        if (verticalVelocity < -0.005) isLanded = true;
                        verticalVelocity = 0;
                        //isGrounded = true;
                        falling = false;
                        hitSlimeFromTop = true;
                        break;
                    }
                    else if (dy>0 && overlapsX && pBB.maximumWorld.y >= guepeBottom && pBB.minimumWorld.y <= guepeBottom) {
                        playerCollider.position.y = guepeBottom - playerHalfY;
                        playerCollider.computeWorldMatrix(true);
                        verticalVelocity = 0;
                        isGrounded = false;
                        hitSlimeFromTop = true;
                        break;
                    }
                }
            }

            if (!hitObstacle && !hitSlimeFromTop) {
                isGrounded = false;
            }
            lyrina.position.copyFrom(playerCollider.position);
            sideCamera.position.x = playerCollider.position.x;
            // Quand le joueur dépasse y = 1.2, la caméra monte de 1 en hauteur
            if (playerCollider.position.y > 1.3) {
                sideCamera.position.y = fixedCameraY + 1.4;
            } else {
                sideCamera.position.y = fixedCameraY;
            }
            attackCollider.position.copyFrom(lyrina.position);
            if(lyrina.invertU)
                attackCollider.position._x +=0.107;
            else
                attackCollider.position._x -=0.107;
            attackCollider.position._y -=0.01;

            if(lyrina.cellIndex == 19 || lyrina.cellIndex == 22) {
                attackCollider.checkCollisions = true;
            }
            else {
                attackCollider.checkCollisions = false;
            }
            background.position.x = lyrina.position._x;
            //console.log(acceleration);
        });
        //GESTION MONSTRES
        scene.onBeforeRenderObservable.add(() => {
            if (this.enemiesPaused) {
                return;
            }

            for (const slime of slimes) {
                if (slime instanceof Slime) {
                    slimeboucle(slime);
                } else if (slime instanceof Slimerouge) {
                    slimerougeboucle(slime);
                } else if (slime instanceof Frog) {
                    frogboucle(slime);
                } else if (slime instanceof Frogpurple) {
                    frogpurpleboucle(slime);
                }
            }

            for (const guepe of guepes) {
                if (guepe instanceof Guepe) {
                    guepeboucle(guepe);
                } else if (guepe instanceof Guepepurple) {
                    guepepurpleboucle(guepe);
                }
            }
        })
    }

    async CreateEnvironment(scene:Scene): Promise<void> {
        this.levelObjects = [];
        this.levelObjectCounter = 1;
        this.setSelectedLevelObject(null);
        this.selectedEnemyObjectId = null;

        this.spawnLevelObject(scene, "obstacleInvisible", "obstacleinvisible", new Vector3(7.75, 0.51, 0), {
            widthincubes: 3,
            heightincubes: 10
        });

        this.spawnLevelObject(scene, "ground", "block1", new Vector3(3, -0.28, 0), {
            sizeintitles: 120
        });
        this.spawnLevelObject(scene, "ground", "block2", new Vector3(-16.2, -0.28, 0), {
            sizeintitles: 68
        });

        this.spawnLevelObject(scene, "obstacle", "obstacle2", new Vector3(4, -0.1, -0.0101), {
            widthincubes: 7,
            heightincubes: 2
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle3", new Vector3(3.242, 0.05, -0.0101), {
            widthincubes: 6,
            heightincubes: 4
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle4", new Vector3(2.48, -0.1, -0.0101), {
            widthincubes: 7,
            heightincubes: 2
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle5", new Vector3(-0.13, -0.16, -0.0101), {
            widthincubes: 3,
            heightincubes: 1
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle6", new Vector3(-1.91, -0.16, -0.0101), {
            widthincubes: 3,
            heightincubes: 1
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle7", new Vector3(-12.1, -0.1, -0.0101), {
            widthincubes: 4,
            heightincubes: 3
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle8", new Vector3(-14.2, -0.1, -0.0101), {
            widthincubes: 4,
            heightincubes: 3
        });

        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant1", new Vector3(-1.02, 0.46, -0.0101), {
            widthincubes: 15,
            heightincubes: 3
        });
        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant2", new Vector3(-50, 0.37, -0.0101), {
            widthincubes: 15,
            heightincubes: 3
        });
        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant4", new Vector3(-4.06, 0.74, -0.0101), {
            widthincubes: 10,
            heightincubes: 1
        });
        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant5", new Vector3(-6.58, 0.05, -0.0101), {
            widthincubes: 7,
            heightincubes: 1
        });
        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant6", new Vector3(-8, 0.35, -0.0101), {
            widthincubes: 7,
            heightincubes: 1
        });
        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant7", new Vector3(-9.5, 0, -0.0101), {
            widthincubes: 7,
            heightincubes: 1
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit24", new Vector3(-17.702, -0.034, -0.0101), {
            widthincubes: 6,
            heightincubes: 4
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit26", new Vector3(-18.46, -0.11, -0.0101), {
            widthincubes: 7,
            heightincubes: 3
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit28", new Vector3(-17.088, -0.112, -0.0101), {
            widthincubes: 5,
            heightincubes: 3
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit30", new Vector3(-16.258, -0.188, -0.0101), {
            widthincubes: 9,
            heightincubes: 2
        });
        
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit22", new Vector3(-19.293, -0.037, -0.0101), {
            widthincubes: 7,
            heightincubes: 4
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit29",  new Vector3(-20.051, -0.186, -0.0101), {
            widthincubes: 6,
            heightincubes: 2
        });
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit34",  new Vector3(-18.63, 0.822, -0.0101), {
            widthincubes: 5,
            heightincubes: 1
        });
        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant_edit33", new Vector3(-19.965, 1.124, -0.0101), {
            widthincubes: 6,
            heightincubes: 2
        });
        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant_edit39",  new Vector3(-18.555, 0.676, -0.0101), {
            widthincubes: 6,
            heightincubes: 1
        });
        this.spawnLevelObject(scene, "platform", "platform1", new Vector3(0.76, 0.39, 0));
        this.spawnLevelObject(scene, "platform", "platform2", new Vector3(-2.5, 0.3, 0));
        this.spawnLevelObject(scene, "platform", "platform3", new Vector3(-4.6, 1.3, 0));
        this.spawnLevelObject(scene, "platform", "platform4", new Vector3(-10.5, 0.5, 0));
        this.spawnLevelObject(scene, "platform", "platform5", new Vector3(-10.5, -0.18, 0));
        this.spawnLevelObject(scene, "platform", "platform6", new Vector3(-12.85, 0.33, 0));
        this.spawnLevelObject(scene, "platform", "platform7", new Vector3(-13.45, 0.33, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit30", new Vector3(-20.984, 0.65, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit32", new Vector3(-20.825, 1, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit34", new Vector3(-20.825, 0.3, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit36", new Vector3(-21.848, 0.068, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit38", new Vector3(-22.696, 0.362, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit40", new Vector3(-23.488, 0.665, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit42", new Vector3(-24.21, 0.936, 0));
        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant_edit44", new Vector3(-25.479, 1.141, -0.0101), { widthincubes: 8, heightincubes: 1 });
        this.spawnLevelObject(scene, "platform", "platform_edit46", new Vector3(-26.296, 1.648, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit48", new Vector3(-27.071, 1.185, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit50", new Vector3(-27.548, 1.493, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit52", new Vector3(-28.548, 1.514, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit54", new Vector3(-29.177, 1.885, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit56", new Vector3(-30.003, 2.177, 0));
        this.spawnLevelObject(scene, "ground", "block_edit58", new Vector3(-22.813, -0.28, 0), { sizeintitles: 9 });
        this.spawnLevelObject(scene, "ground", "block_edit60", new Vector3(-24.597, -0.28, 0), { sizeintitles: 9 });
        this.spawnLevelObject(scene, "ground", "block_edit62", new Vector3(-26.442, -0.28, 0), { sizeintitles: 9 });
        this.spawnLevelObject(scene, "ground", "block_edit50", new Vector3(-28.222, -0.28, 0), { sizeintitles: 9 });
        this.spawnLevelObject(scene, "ground", "block_edit52", new Vector3(-29.944, -0.28, 0), { sizeintitles: 9 });
        this.spawnLevelObject(scene, "ground", "block_edit54", new Vector3(-32.122, -0.28, 0), { sizeintitles: 12 });
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit57", new Vector3(-22.459, -0.122, -0.0101), { widthincubes: 4, heightincubes: 2 });
        this.spawnLevelObject(scene, "platform", "platform_edit61", new Vector3(-31.478, 2.173, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit63", new Vector3(-30.59, 1.708, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit65", new Vector3(-30.923, 1.708, 0));
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit69", new Vector3(-32.487, 0.114, -0.0101), { widthincubes: 7, heightincubes: 5 });
        this.spawnLevelObject(scene, "platform", "platform_edit58", new Vector3(-32.185, 2.173, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit62", new Vector3(-33.118, 0.37, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit64", new Vector3(-33.48, 0.258, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit66", new Vector3(-33.839, 0.132, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit68", new Vector3(-34.175, -0.012, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit70", new Vector3(-34.512, -0.137, 0));
        this.spawnLevelObject(scene, "ground", "block_edit72", new Vector3(-36.861, -0.28, 0), { sizeintitles: 32 });
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit65", new Vector3(-36.074, -0.085, -0.0101), { widthincubes: 6, heightincubes: 2 });
        this.spawnLevelObject(scene, "platform", "platform_edit67", new Vector3(-36.695, 0.343, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit69", new Vector3(-37.439, 0.337, 0));
        this.spawnLevelObject(scene, "obstacle", "obstacle_edit71", new Vector3(-38.048, -0.085, -0.0101), { widthincubes: 6, heightincubes: 2 });
        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant_edit73", new Vector3(-39.92, -0.08, -0.0101), { widthincubes: 7, heightincubes: 1 });
        this.spawnLevelObject(scene, "obstacleFlying", "obstaclevolant_edit70", new Vector3(-41.238, -0.073, -0.0101), { widthincubes: 7, heightincubes: 1 });
        this.spawnLevelObject(scene, "platform", "platform_edit72", new Vector3(-41.828, 0.428, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit74", new Vector3(-42.176, 0.225, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit76", new Vector3(-42.54, 0.653, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit78", new Vector3(-42.914, 0.434, 0));
        this.spawnLevelObject(scene, "platform", "platform_edit80", new Vector3(-43.385, 0.219, 0));
        this.spawnLevelObject(scene, "ground", "block_edit82", new Vector3(-45.203, -0.28, 0), { sizeintitles: 28 });


const slimes = this.runtimeSlimes;
const guepes = this.runtimeGuepes;
const frogs = this.runtimeFrogs;
const frogspurple = this.runtimeFrogsPurple;
        if (this.levelObjects.length > 0) {
            this.setSelectedLevelObject(this.levelObjects[0].id);
        }
        this.updateLevelEditorHUD();

        const skybox = Mesh.CreateBox("BackgroundSkybox", 500, scene, undefined, Mesh.BACKSIDE);
    
        
    }

    /*async CreateEnnemy(scene:Scene): Promise<void> {
        
    }*/

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

        scene.onBeforeRenderObservable.add(() => {
            health_g.sourceLeft = 440 - this.health;
            if(part == 2 && this.health <= 220) {
                health_g.source = "./sprites/health_o.png";
                part = 1;
            }
                        
            if(part == 1 && this.health <= 80) {
                health_g.source = "./sprites/health_r.png";
                part = 0;
            }
        })

        const editorHUD = new GUI.TextBlock("levelEditorHUD");
        editorHUD.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        editorHUD.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        editorHUD.paddingTop = "2%";
        editorHUD.paddingRight = "2%";
        editorHUD.width = "46%";
        editorHUD.height = "32%";
        editorHUD.color = "#e8f6ff";
        editorHUD.fontFamily = "monospace";
        editorHUD.fontSize = 18;
        editorHUD.textWrapping = true;
        editorHUD.outlineColor = "black";
        editorHUD.outlineWidth = 2;
        advancedTexture.addControl(editorHUD);
        this.levelEditorHUD = editorHUD;
        this.updateLevelEditorHUD();
    }
}