import { EntityProduct } from "../Models/entities/EntityProduct";
import { DefaultSample } from "../utils/default-sample";
import { EntityType } from "../utils/entity-units";


export interface CreateOptions extends Omit<Partial<EntityOptions>, 'key' | 'parentKey' | 'components' > {
  components?: ApiComponent[]
}

export interface EntityOptions {
  signature: ApiEntity;
  components: ApiComponent[]
  key?: string;
  parentKey?: string;
}

export type Components<T extends any | EntityComponentDescription = string, J extends 'AnyComponent' | DefaultComponents = 'AnyComponent'> = {
  [key in J extends 'AnyComponent' ? string : J ]: EntityComponent<T>
};
export type EntityComponent<T extends any = string> = {
  [key in T extends string ? string : keyof T]: T extends EntityComponentDescription ? string : EntityComponentProperty;
};
export interface EntityComponentDescription {
  componentDescription: string;
}

export type PropertyValue = string | number | Date;

export interface EntityComponentProperty {
  propertyDescription: string;
  propertyValue: PropertyValue;
  propertyType: 'number' | 'string' | 'date'
  propertyFormula: string;
  attributes: string;
  bindingToList: boolean;
}

/**------------------------------Api Types-------------------------------------------------- */
/** Api объект определения сущности. */
export interface EntityOptionsApi extends EntityOptions {
  сhildEntities: EntityOptionsApi[];
}

/** Модель сущность */
export interface ApiEntity {
  id?: number;
  typeId?: EntityType;
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
  propertyValue: string | number | Date;
  propertyFormula?: string;
  propertyType?: 'string' | 'number' | 'date';
  attributes?: string;
  bindingToList?: boolean;
}

/**----------------------------------------------------------------------------------------- */

export type PropertyAttributes = 'readonly' | 'required';

export interface NomenclatureCreatorOptions {
  sample?: DefaultSample;
  prototype?: EntityProduct;
  unit?: Unit;
}

export interface EntityState {
  options: EntityOptions;
  elements: EntityState[];
}


/**----------------------------------------------------------------------------------------- */
/** Тут определить компоненты, для которых нужен автокомплит и стандартизация */
export interface GeometryComponent { geometry: Omit<APIGeometryComponent, 'id'> }
export interface FinishingComponent { geometry: Omit<APIPriceComponent, "id"> }
export interface PriceComponent { geometry: Omit<APIPriceComponent, "id"> }

//export interface GeometryComponent extends Omit<APIGeometryComponent, 'id'>{}
//export interface FinishingComponent extends Omit<APIFinishingComponent, "id"> {}
//export interface PriceComponent extends Omit<APIPriceComponent, "id"> {}

export type DefaultComponents = 'geometry' | 'finishing' | 'price' | 'entityId';
export type ComponentKeys = keyof GeometryComponent | keyof FinishingComponent | keyof PriceComponent;
export type Unit = 'шт.' | 'м. кв.' | 'м. куб.' | 'п/м';

export interface ValidateObject {
  isValid: boolean;
  errors: string[];
}

/** Модель Компонент отделка */
export interface APIFinishingComponent {
  id?: number;
  colorId?: number;
  patinaId?: number;
  varnishId?: number;
}
/** Модель компонент геометрия */
export interface APIGeometryComponent{
  id?: number;
  height?: number;
  width?: number;
  depth?: number;
  amount?: number;
  square?: number;
  cubature?: number;
  linearMeter?: number;
}

/** Модель компонент цена */
export interface APIPriceComponent {
  id?: number;
  price?: number;
}

/** тестовый тип */
export type A = {
  [key: string]: any;
  param1: string;
  param2: string;
}
/** ---------- */



