import Entity from "../Models/entities/Entity";
import EntityBody from "../Models/entities/EntityBody";
import EntityHeader from "../Models/entities/EntityHeader";
import { Component, EntityComponents, EntityOptions } from "../types/entity-types";

import uuid from 'uuid-random';
import { getProperty } from "../utils/object-utils";
import { EntityType } from "../utils/entity-units";
import Order from "../Models/Order";
import { EntityProduct } from "../Models/entities/EntityProduct";
import { StageType } from "../utils/order-utils";
import NomenclatureCreator from "../Models/NomenclatureCreator";


class Engine {
  private static instance?: Engine;
  private static entities: Map<string, EntityOptions> = new Map <string, EntityOptions>()
  private _order?: Order;
  private _creator?: NomenclatureCreator;

  constructor() {
    if (Engine.instance) {return Engine.instance;}
    Engine.instance = this;
  }

  /*** ----------------------------------- */

  public nomenclatureCreator() {
    if (!this._creator) this._creator = new NomenclatureCreator();
    return this._creator
  }

  /*** ----------------------------------- */

 /** * Создание нового заказа. */
  newOrder(type: StageType = StageType.STANDART): Order {
    Engine.clear();
    const order = new Order(type);
    this._order = order;
    return order;
  }

  get order (): Order |null {return this._order || null;}

  public onChange(listener: any) {

  }

  /** Дезинтегрирует объект Engine */
  destroy() {
    this._order = undefined;
    Engine.clear();
    Engine.instance = undefined;
  }

  public static getEntity(key: string): Entity | null {
    if (!this.entities.has(key)) return null;
    const options = this.entities.get(key)!;
    return Engine.create(options);
  }

  public static clear () {
    Engine.entities.clear();
  }
  public static removeEntity(key: string) {

  }  
  public static generateKey (): string {
    return uuid();
  }
  public static entityRegistration (options: EntityOptions): EntityOptions {
    if (options.key && Engine.entities.has(options.key)) return options;
    options.key = this.generateKey();
    Engine.entities.set(options.key, options);
    return options;
  }
  /** Описывать здесь все расширяемые классы */
  public static create(options: EntityOptions): Entity {
    /** Присваиваем уникальный ключь созданному обекту */
    this.entityRegistration(options);
    switch (options?.entity?.typeId) {
      case EntityType.ENTITY_HEADER:
        return new EntityHeader(options);
      case EntityType.ENTITY_BODY:
        return new EntityBody(options);
      case EntityType.ENTITY_PRODUCT:
        return new EntityProduct(options);
      default:
        return new EntityProduct(options);
    }
  }
  /** Метод слияния параметров одного объекта с другим */
  public static integration(recipient: EntityOptions, donor: EntityOptions): EntityOptions {
    //console.time('FirstWay');
    const options = { ...recipient };
    for (const componentKey in options.components) {
      if (Object.prototype.hasOwnProperty.call(options.components, componentKey) && donor.components?.hasOwnProperty(componentKey)) {
        const component = getProperty<EntityComponents, keyof EntityComponents>(options.components, componentKey as keyof EntityComponents);
        const donorComponent = getProperty<EntityComponents, keyof EntityComponents>(donor.components, componentKey as keyof EntityComponents); 
        for (const key in component) {
          if (Object.prototype.hasOwnProperty.call(component, key) && Object.prototype.hasOwnProperty.call(donorComponent, key)) {
            const comp = component as Component
            const donorComp = donorComponent as Component;
            comp[key] = donorComp[key];
          }
        }
      }
    }
    //console.timeEnd('FirstWay');
    return recipient = {...options};
  }
}

export default Engine;