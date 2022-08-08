import Engine from "..";
import { EntitySysyem } from "./EntitySysyem";

export class FormulaSystem extends EntitySysyem {
  constructor(...args: any[]) {
    super(...args);
  }

  public addedToEngine(engine: Engine): void {
    console.log("addedToEngine");
    
  }
  public removedFromEngine(engine: Engine): void {
    console.log('removedFromEngine');
  }
  public async update(deltaTime: number): Promise<void> {

  }
  public checkProcessing(): boolean {
    return this.isProcessing;
  }
  public setProcessing(isProcessing: boolean): void {
    this.isProcessing = isProcessing;
  }

  public async processing(next: () => void): Promise<void> {
    const shels = await this.room.getEntityShells();
     const filtredShells = shels.filter(
       sh => sh.options.category === "fasade"
     );
    this.entities = this.engine.creator.convertShellEntitiesToEntities(
      ...filtredShells
    );

    console.log("entities count", this.entities.length);
    
    // Просчет формул всех сущностей комнаты.
    for (const entity of this.entities) {
      
      await entity.recalculation();
    }
    next();
  }
}
