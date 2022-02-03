import Entity from "../Models/entities/Entity";
import EntityBody from "../Models/entities/EntityBody";
import EntityHeader from "../Models/entities/EntityHeader";
import { ApiComponent, Components, EntityComponents, EntityOptions } from "../types/entity-types";

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
  /** Создает пустую номенклатуру */
  public nomenclatureCreator() {
    if (!this._creator) this._creator = new NomenclatureCreator();
    return this._creator
  }

  /*** ----------------------------------- */
 /** * Создание нового заказа. */
  newOrder(type: StageType = StageType.STANDART): Order {
    const order = new Order(type);
    this._order = order;
    return order;
  }
  get order (): Order |null {return this._order || null;}
  public onChange(listener: any) {}

  /** Дезинтегрирует объект Engine */
  destroy() {
    this._order = undefined;
    Engine.instance = undefined;
  }

  

  /** Статические методы */
  /** Конвертирует объект компонентов в массив */
  public static componentConverterObjectToArray(components: Components): ApiComponent[] {
    try {
      return Object.entries(components).reduce((accumulator: ApiComponent[], value): ApiComponent[] => {
        const { componentDescription, ...otherProperties } = value[1];
        const componentProperties: ApiComponent[] = Object.entries(otherProperties).map(prob => {
          const component: ApiComponent = {
            componentName: value[0],
            componentDescription: componentDescription,
            propertyName: prob[0],
            ...prob[1] as any,
          }
          return component
        });
        accumulator.push(...componentProperties)
        return accumulator;
      }, [] as ApiComponent[])
    } catch (e) {
      throw e
    }
  }
  /** Конвертирует массив комопнентов в объект. */
  public static componentConverterArrayToObject(components: ApiComponent[]): Components {
    try {
      return Object.fromEntries(Object.entries(
        Engine.groupBy<ApiComponent>(components, (it) => {
          return it.componentName; // Выбираем поле, по которому производим групировку
        })
      ).map(componentEntry => {
        return [componentEntry[0],
        Object.fromEntries([
          ['componentDescription', componentEntry[1][0]?.componentDescription,],
          ...componentEntry[1].map(componentEntry => {
            return [componentEntry.propertyName, Engine.componentDestructuring(componentEntry)]
          })
        ])
        ]
      })
      )
    } catch (e) {
      throw e;
    }
  }

  public static generateKey (): string {return uuid();}
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
            const comp = component as any
            const donorComp = donorComponent as any ;
            comp[key] = donorComp[key];
          }
        }
      }
    }
    //console.timeEnd('FirstWay');
    return recipient = {...options};
  }

  /***----------------------------------------------------------------------------------- */
  /***----------------------------------------------------------------------------------- */
  /** служебная функция для групировки комопнентов по определенному полю. */
  private static groupBy<T>(array: T[], predicate: (compEntry: T) => string) {
    return array.reduce((acc, value, index, arr) => {
      (acc[predicate(value)] ||= []).push(value);
      return acc;
    }, {} as { [key: string]: T[] }
    );
  }
  /** Деструкруризация компонента на свойства */
  private static componentDestructuring(component: ApiComponent) {
    const { propertyDescription, propertyValue, propertyType, propertyFormula, attributes, bindingToList, entityId, id } = component;
    return { id, entityId, propertyDescription, propertyValue, propertyType, propertyFormula, attributes, bindingToList }
  }
  /***----------------------------------------------------------------------------------- */
}

export default Engine;

