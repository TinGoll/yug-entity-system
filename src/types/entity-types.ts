import { EntityType } from "../utils/entity-units";

export interface IterableObject {

}

export interface EntityState {
  options: EntityOptions;
  elements: EntityState[];
}

export interface EntityOptions {
  entity: APIEntity;
  key?: string;
  parentKey?: string;
  components?: EntityComponents;
}

export interface EntityComponents {
  geometryComponent?: GeometryComponent;
  finishingComponent?: FinishingComponent;
  priceComponent?: PriceComponent;
}

export interface GeometryComponent extends Omit<APIGeometryComponent, 'id'>{}
export interface FinishingComponent extends Omit<APIFinishingComponent, "id"> {}
export interface PriceComponent extends Omit<APIPriceComponent, "id"> {}

export type ComponentKeys = keyof GeometryComponent | keyof FinishingComponent | keyof PriceComponent;

/** Модель сущность */
export interface APIEntity {
  id?: number;
  typeId?: EntityType;
  parentId?: number;
  sampleId?: number;
  name?: string;
  note?: string;
  dateCreation?: Date;
  dateUpdate?: Date;
}

export interface ValidateObject {
  isValid: boolean;
  errors: string[];
}

export interface Component {
  [key: string]: any
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

/** Модель Связь сущность - отделка */
export interface APIEntityFinishingLink {
  id?: number;
  entityId?: number;
  finishingId?: number;
}
/** Модель Связь сущность - геометрия */
export interface APIEntityGeometryLink {
  id?: number;
  entityId?: number;
  geometryId?: number;
}
/** Модель Связь сущность - цена */
export interface APIEntityPriceLink {
  id?: number;
  entityId?: number;
  priceId?: number;
}
/** Модель Список цветов */
export interface APIColorList {
  id?: number;
  name?: number;
}
/** Модель Список патин */
export interface APIPatinaList {
  id?: number;
  name?: number;
}
/** Модель Список лаков */
export interface APIVarnishList {
  id?: number;
  name?: number;
}

