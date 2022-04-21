
export type PropertyValue = string | number | Date | boolean;
export type PropertyTypes = 'number' | 'string' | 'date' | 'boolean';
export type EngineObjectType = 'entity' | 'component';


/** Модель сущность */
export interface ApiEntity extends ISerializable {
    id?: number;
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
    children?: ApiEntity[];
    isChange?: boolean;
    sortIndex?: number;
}
/** Модель компонента */
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
    isChange?: boolean;
    sortIndex?: number;
}

export interface ISerializable {
    key: string;
}