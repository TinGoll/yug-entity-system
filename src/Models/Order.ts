
import Engine from "../engine/Engine";
import { OrderOptions } from "../types/order-types";
import { EntityErrors, getError } from "../utils/api-error";
import { getOrderOptions, StageType } from "../utils/order-utils";
import Entity from "./entities/Entity";
import EntityBody from "./entities/EntityBody";
import EntityHeader from "./entities/EntityHeader";

interface Bundle {
  header: Entity;
  body: Entity;
  key: string;
  index: number;
}

class Order {
  private bundles: Bundle[] = [] 
  private _key?: string;
  private _index: number = 0;
  
  constructor(type: StageType = StageType.STANDART) {
    this.newStage(type);    
  }

  /** Для смены текущего этапа, необходимо передать ключь нужного бандла. */
  public setFocus(key: string): Order {
    const bundle = this.bundles.find(b => b.key === key);
    if (!bundle) throw getError(EntityErrors.WRONG_KEY);
    this._key = key;
    return this;
  }
  
  /** Создаем новый этап */
  public newStage(type: StageType = StageType.STANDART): Bundle {
    const { headerOptions, bodyOptions, prototypes } = getOrderOptions(type);
    return this.addBundle({ headerOptions, bodyOptions, prototypes})
  }
 /** Получам доступ к текущему этапу. Смена текущего этапа происходит путем передачи методу setFocus() ключа нужного этапа. */
  public getCurrentStage() {
    const bundle = this.bundles.find(b => b.key === this.key);
    if (!bundle) return null;
    const entityHeader = <EntityHeader>bundle.header;
    const EntityBody = <EntityBody>bundle.body;
  
    return {
      header: {

      }
    }
  }

  public get key () : string|null {return this._key||null}
  public get keys (): string[] {return this.bundles.map(b => b.key);}

  /**  ------------------Приватные методы------------------------------ */

  private addBundle({ headerOptions, bodyOptions, prototypes }: OrderOptions): Bundle {
    const header = Engine.create(headerOptions).setChildrenToOptions(prototypes);
    const body = Engine.create(bodyOptions);
    const key = this.setCurrentKey(Engine.generateKey()).key!;
    const index = this.nextIndex();
    this.bundles.push({header, body, key, index})
    return {header, body, key, index};
  }
  private nextIndex (): number {return ++ this._index;}
  private setCurrentKey(key: string): Order {this._key = key; return this;}

}

export default Order;