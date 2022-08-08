import Engine from "..";
import { EntitySysyem } from "./EntitySysyem";

export class GeometrySystem extends EntitySysyem {
  constructor(...args: any[]) {
    super(...args);
  }

  public addedToEngine(engine: Engine): void {}
  public removedFromEngine(engine: Engine): void {}
  public async update(deltaTime: number): Promise<void> {}
  public checkProcessing(): boolean {
    return true;
  }
  public setProcessing(isProcessing: boolean): void {
    this.isProcessing = isProcessing;
  }
  public async processing(next: () => void): Promise<void> {

    const shels = await this.room.getEntityShells();
    const filtredShells = shels.filter((sh) => sh.options.category === "fasade");
    this.entities = this.engine.creator.convertShellEntitiesToEntities(...filtredShells);

    for (const entity of this.entities) {
        const height = await entity.getValue("geometry", "height");
        const width = await entity.getValue("geometry", "width");
        const amount = await entity.getValue("geometry", "amount");
        const square = await entity.getValue("geometry", "square");
        console.log(
          "Сущность: ",
          `${height} x ${width} x ${amount} = ${square}`
        );
    }

    next();
  }
}
