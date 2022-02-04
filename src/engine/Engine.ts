import Entity from "../Models/entities/Entity";
import EntityBody from "../Models/entities/EntityBody";
import EntityHeader from "../Models/entities/EntityHeader";
import { ApiComponent, Components, CreateOptions, EntityOptions, IEventable } from "../types/entity-types";

import uuid from 'uuid-random';
import EventEmitter from "events"
import { EntityType } from "../utils/entity-units";
import Order from "../Models/Order";
import { EntityProduct } from "../Models/entities/EntityProduct";
import { StageType } from "../utils/order-utils";
import NomenclatureCreator from "../Models/NomenclatureCreator";
import Component from "../Models/components/Component";


class Engine implements IEventable {
  private static instance?: Engine;
  private static eventEmitter: EventEmitter = new EventEmitter();

  private static entities: Map<string, EntityOptions> = new Map <string, EntityOptions>();
  private static componentTemplates: ApiComponent[] = [];

  private _order?: Order;
  private _creator?: NomenclatureCreator;

  constructor(mode: 'CLIENT' | 'SERVER' = 'CLIENT') {

    if (Engine.instance) {return Engine.instance;}
    Engine.instance = this;
  }

  on(event: any, listener: any): this {
    throw new Error("Method not implemented.");
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
  /** Добавляем новый шаблон компонентов. */
  public static addTemplateComponent(component: ApiComponent[]): Components {
    this.componentTemplates = Engine.componentConverterObjectToArray({
      ...Engine.componentConverterArrayToObject(this.componentTemplates),
      ...Engine.componentConverterArrayToObject(component)
    });
    return Engine.componentConverterArrayToObject(component)
  }
  /** Возвращает шаблоны компонентов. */
  public static getTemplateComponents (): Components {
    return Engine.componentConverterArrayToObject(this.componentTemplates);
  }

  /** Получаем сущьность по ключу. */
  public static getEntityOptionsToKey(key: string): EntityOptions | null {
    if (!Engine.entities.has(key)) return null;
    return Engine.entities.get(key) || null;
  }

  /** Получаем все дочерние сущьности. */
  public static getChildrenOptionsToParentKey(key: string): EntityOptions[] {
    return [...Engine.entities].map(e => e[1]).filter(e => e.parentKey == key);
  }

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
  public static create(options: CreateOptions): Entity {
    /** Присваиваем уникальный ключь созданному обекту */
    if (!options.components) options.components = [];
    const opt = options as EntityOptions;
    this.entityRegistration(opt);
    switch (options?.signature?.typeId) {
      case EntityType.ENTITY_HEADER:
        return new EntityHeader(opt);
      case EntityType.ENTITY_BODY:
        return new EntityBody(opt);
      case EntityType.ENTITY_PRODUCT:
        return new EntityProduct(opt);
      default:
        return new EntityProduct(opt);
    }
  }
  /** Метод слияния параметров одного объекта с другим */
  public static integration(recipient: EntityOptions, donor: EntityOptions): EntityOptions {
    //console.time('FirstWay');

    const recipientComponents =  [ ...recipient.components ] ;
    const donorComponents =  [ ...donor.components ];

    for (const component of recipientComponents) {
      // Если свойство у принимающего обекта не задано, пропускаем
      if (typeof component.propertyValue === "undefined" || component.propertyValue == '') continue;
      const donorComponent = donorComponents.find(
          c => c.componentName === component.componentName 
              && c.propertyName === component.propertyName
          && (typeof c.propertyValue !== "undefined" && c.propertyValue != ''));
      if (donorComponent) component.propertyValue = donorComponent.propertyValue;
    }
    recipient.components = [...recipientComponents];
    return recipient;
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

