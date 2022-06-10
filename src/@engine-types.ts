export type PropertyValue = string | number | Date | boolean;
export type PropertyType = 'number' | 'string' | 'date' | 'boolean';
export type EngineObjectType = 'entity' | 'component';
export type PropertyAttribute = 'required' | 'readonly' | 'show';


/** Общие, вспомогательные индикаторы для объектов, данные хранятся только в течении выполнения процедуры. */
export interface ObjectIndicators {
    is_changeable ?: boolean;
    is_save_in_storage?: boolean;
    is_unwritten_in_storage ?: boolean;
    is_removable ?: boolean;
    is_failed_update?: boolean;
    // is_need_an_update?: boolean;
}
/** Вспомогательные индикаторы для сущности, данные хранятся только в течении выполнения процедуры. */
export interface EntityIndicators extends ObjectIndicators {
    is_changeable_component?: boolean;
}
/** Вспомогательные индикаторы для компонента, данные хранятся только в течении выполнения процедуры. */
export interface ComponentIndicators extends ObjectIndicators {}

export interface ISerializable {
    key: string;
}

/** Модель сущность */
export interface ApiEntity extends ISerializable {
    id: number;
    key: string;
    name: string;
    index: number;
    components: ApiComponent[];
    indicators: EntityIndicators;
    note?: string;
    type?: string;
    category?: string;
    parentKey?: string;
    sampleKey?: string;
}

/** Модель компонента */
export interface ApiComponent extends ISerializable {
    id: number;
    key: string;
    index: number;
    sampleKey?: string;
    entityKey?: string;
    componentName: string;
    componentDescription: string;
    propertyName: string;
    propertyDescription: string;
    propertyValue: PropertyValue;
    previousValue?: PropertyValue;
    propertyType: PropertyType;
    propertyFormula?: string;
    attributes?: string;
    bindingToList?: boolean;
    indicators: ComponentIndicators;
}

export interface EntityDto extends Omit<Partial<ApiEntity>, "id" | "key" | "index" | "indicators"> {
    name: string;
}

export interface ComponentDto extends Omit<Partial<ApiComponent>, "id" | "key" | "index" | "indicators"> {
    componentName: string,
}
export interface PropertyDto extends Omit<Partial<ApiComponent>, "id" | "key" | "index" | "indicators" | "componentName" | "componentDescription"> {
    propertyName: string;
    propertyType: PropertyType;
}


export interface EntityShell {
    options: ApiEntity;
}

export interface ComponentShell {
    options: ApiComponent;
}

export interface ISerializableShell {
    options: ISerializable;
}

/****************************************************** */
export type EngineAction = typeof actions[number]
/****************************************************** */
/** Массив методов. */
const actions = ['delete-entity-shell', 'create-entity-shell', 'update-entity-shell'] as const
/****************************************************** */