import Entity from "../Models/entities/Entity";
import EntityBody from "../Models/entities/EntityBody";
import EntityHeader from "../Models/entities/EntityHeader";
import EntityUncertain from "../Models/entities/EntityUncertain";
import { Component, EntityComponents, EntityOptions } from "../types/entity-types";

import uuid from 'uuid-random';
import { getProperty } from "../utils/object-utils";
import { EntityFasade } from "../Models/product/EntityFasade";
import { EntityPanel } from "../Models/product/EntityPanel";
import { EntityShield } from "../Models/product/EntityShield";
import { EntityType } from "../utils/entity-units";
import Order from "../Models/Order";

class Engine {
  private static instance?: Engine;
  private _order?: Order;

  constructor() {
    if (Engine.instance) {return Engine.instance;}
    Engine.instance = this;
  }
 

  newOrder(): Order {
    const order = new Order();
    this._order = order;
    return order;
  }

  get order (): Order |null {
    return this._order || null;
  }

  /** Дезинтегрирует объект Engine */
  destroy() {
    this._order = undefined;
    Engine.instance = undefined;
  }
  /** Описывать здесь все расширяемые классы */
  public static create(options: EntityOptions): Entity {
    /** Присваиваем уникальный ключь созданному обекту */
    if (!options.key) options.key = uuid();
    switch (options?.entity?.typeId) {
      case EntityType.ENTITY_HEADER:
        return new EntityHeader(options);
      case EntityType.ENTITY_BODY:
        return new EntityBody(options);
      case EntityType.ENTITY_FASADE:
        return new EntityFasade(options);
      case EntityType.ENTITY_PANEL:
        return new EntityPanel(options);
      case EntityType.ENTITY_SHIELD:
        return new EntityShield(options);
      default:
        return new EntityUncertain(options);
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