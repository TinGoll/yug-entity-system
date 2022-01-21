import Entity from "../Models/entities/Entity";
import EntityBody from "../Models/entities/EntityBody";
import EntityHeader from "../Models/entities/EntityHeader";
import EntityUncertain from "../Models/entities/EntityUncertain";
import { Component, EntityComponents, EntityOptions } from "../types/entity-types";

import uuid from 'uuid-random';
import { getProperty } from "../utils/object-utils";

class Engine {
  private static instance: Engine;
  constructor() {
    if (Engine.instance) {
      return Engine.instance;
    }
    Engine.instance = this;
  }
  /** Дезинтегрирует объект Engine */
  destroy() {}

  /** Описывать здесь все расширяемые классы */
  public static create(options: EntityOptions): Entity {
    /** Присваиваем уникальный ключь созданному обекту */
    if (!options.key) options.key = uuid();
    switch (options?.entity?.typeId) {
      case 1:
        return new EntityHeader(options);
      case 2:
        return new EntityBody(options);
      default:
        return new EntityUncertain(options);
    }
  }
  /** Метод слияния параметров одного объекта с другим */
  public static integration(recipient: EntityOptions, donor: EntityOptions): EntityOptions {
    console.time('FirstWay');
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
    console.timeEnd('FirstWay');
    return recipient = {...options};
  }
}

export default Engine;