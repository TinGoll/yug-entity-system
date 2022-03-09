import { EntityType } from "../utils/entity-units";
import { ISerializable } from "./engine-interfaces";

/****************************************************************** */

export interface ApiOptionsEntity extends Omit<ApiEntity, 'key'> {
  key?: string;
}

export interface ApiOptionsComponent extends Omit<ApiComponent, 'key'> {
  key?: string;
}

export interface IGetable {
  /** Превращение объекта движка в статический образ, для отображения */
  get(): EntityComponent | EntitySnapshot
}
export interface CreateOptions extends Omit<Partial<EntityOptions>, 'key' | 'parentKey' | 'components' > {
  components?: ApiComponent[]
}
export interface EntitySnapshot extends Omit<EntityOptions, 'components'> {
  components: Components
}

/****************************************************************** */
export interface EntityOptions {
  signature: ApiEntity;
  components: ApiComponent[]
  key?: string;
  parentKey?: string;
}

/****************************************************************** */
export type Components<T extends any = string> = {
  [key in T extends string ? string : keyof T]: EntityComponent<T>;
};
export type EntityComponent<T extends any = string> = {
  [key in T extends string ? string : keyof T[keyof T]]: EntityComponentProperty
};
export interface EntityComponentDescription {
  componentDescription: string;
};
export interface ComponentProbs extends Partial<EntityComponentProperty> {
  propertyName: string;
  propertyType: PropertyTypes
}
export interface EntityComponentProperty {
  propertyDescription: string;
  propertyValue: PropertyValue;
  propertyType: PropertyTypes
  propertyFormula: string;
  attributes: string;
  bindingToList: boolean;
};
export type PropertyValue = string | number | Date | boolean;
export type PropertyTypes = 'number' | 'string' | 'date' | 'boolean';
/*************************************************************************************************************************************************** */
/**------------------------------Api Types-------------------------------------------------- */
/** Api объект определения сущности. */
export interface ApiEntityOptions extends EntityOptions {
  сhildEntities: ApiEntityOptions[];
}
/** Модель сущность */
export interface ApiEntity extends ISerializable {
  id?: number;
  typeId?: EntityType;
  category?: string;
  parentId?: number;
  sampleId?: number;
  name?: string;
  note?: string;
  dateCreation?: Date;
  dateUpdate?: Date;
  key: string;
  parentKey?: string;
  components?: ApiComponent[];
}
export interface ApiComponent extends ISerializable {
  id?: number;
  key: string;
  entityId?: number;
  entityKey?: string;
  componentName: string;
  componentDescription: string;
  propertyName: string;
  propertyDescription: string;
  propertyValue: PropertyValue;
  propertyFormula?: string;
  propertyType?: PropertyTypes;
  attributes?: string;
  bindingToList?: boolean;
}
export declare interface EventCallback {
  (...params: any[]): void;
}
export interface IEventable {
  on(event: string | symbol, listener: EventCallback): void;
}
/**----------------------------------------------------------------------------------------- */
export type PropertyAttributes = 'readonly' | 'required';

/**----------------------------------------------------------------------------------------- */
export type Unit = 'шт.' | 'м. кв.' | 'м. куб.' | 'п/м';