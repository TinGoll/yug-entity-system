import { EntityProduct } from "../Models/entities/EntityProduct";
import { EntityType } from "../utils/entity-units";

/****************************************************************** */
export interface IGetable {
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
export interface ApiEntity {
  id?: number;
  typeId?: EntityType;
  category?: string;
  parentId?: number;
  sampleId?: number;
  name?: string;
  note?: string;
  dateCreation?: Date;
  dateUpdate?: Date;
}
export interface ApiComponent {
  id?: number;
  entityId?: number;
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
export interface CreatorOptions {
  prototype?: EntityProduct;
  unit?: Unit;
}
export interface EntityState {
  options: EntityOptions;
  elements: EntityState[];
}
/**----------------------------------------------------------------------------------------- */
export type Unit = 'шт.' | 'м. кв.' | 'м. куб.' | 'п/м';