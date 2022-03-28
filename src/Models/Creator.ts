import { Engine } from "../engine/Engine";
import { EngineObjectType } from "../types/engine-interfaces";
import { ApiComponent, ApiEntity, ApiEntityOptions, ApiOptionsComponent, ApiOptionsEntity, Components } from "../types/entity-types";
import { Component } from "./components/Component";
import { Entity } from "./entities/Entity";

export default class Creator {
   
    constructor() {}

    /** ************************************************************************************************************************************************ */

    createEmpty(type: 'component'): ApiComponent[];
    createEmpty(type: 'entity'): ApiEntity[];
    createEmpty(type: 'entity' | 'component'): ApiComponent[] | ApiEntity [] {
        if (type === 'component') {
            return [
                <ApiComponent>{ 
                    id: 0,
                    key: '',
                    entityId: 0,
                    entityKey: '',
                    componentName: '',
                    componentDescription: '',
                    propertyName: '',
                    propertyDescription: '',
                    propertyValue: '',
                    propertyFormula: '',
                    propertyType: 'string',
                    attributes: '',
                    bindingToList: false,
                }
            ]
        }
        return [
            <ApiEntity> {
                id: 0,
                category: '',
                parentId: 0,
                sampleId: 0,
                name: '',
                note: '',
                key: '',
                parentKey: '',
                components:[],
                сhildEntities:[]
            }
        ]
    }


    /**
     * Загрузка, фиксация и возврат массива instance сущности или компонента.
     * @param apiObjects api дата.
     * @returns  Entity[] или Component[]
     */
    loadAndReturning<T extends Entity | Component = Entity>(apiObjects: ApiComponent[] | ApiEntity[]): T[] {
        try {
            Engine.loadObjects(apiObjects);
            /** Возвращаем массив объектов класса Entity */
            if (apiObjects && (<ApiEntity> apiObjects[0]).name) {
                const apiEnts = <ApiEntity[]>apiObjects;
                const apiFathers = apiEnts.filter(e => !e.parentKey);
                return <T[]> apiFathers.map(e => new Entity(e.key));
            }
            /** Возвращаем массив объектов класса Component */
            if (apiObjects && (<ApiComponent>apiObjects[0]).propertyName) {
                const comps = (<ApiComponent[]>apiObjects);
                const compNames = [...new Set(comps.map(c => c.componentName))];
                const components = compNames.map(cmpName => {
                    const opt = comps.find(c => c.componentName === cmpName);
                    return new Component(opt!, comps);
                })
                return <T[]> components;
            }

            return [];
        } catch (e) {
            // Сделать вывод ошибки.
            console.log(e);   
            return [];
        }
    }
    
    /**
     * Загрузка объеетов в движок
     * @param apiObjects 
     * @returns 
     */
    loadObjects(apiObjects: ApiComponent[] | ApiEntity[]): Creator {
        Engine.loadObjects(apiObjects);
        return this;
    }

    /** ************************************************************************************************************************************************ */

    create(type: 'entity', name: string, options?: Omit<ApiOptionsEntity, 'name'>): Entity;
    create(type: 'component', name: string, options?: Omit<Partial<ApiOptionsComponent>, 'componentName'>): Component;
    create(type: EngineObjectType, name: string, options?: ApiOptionsEntity | Omit<Partial<ApiOptionsComponent>, 'componentName'>): Entity | Component {
        switch (type) {
            case 'entity':
                const entityOpt: ApiOptionsEntity = { 
                    ...<ApiOptionsEntity>options,
                    name: name
                };
                const apiEntity = Engine.createObject('entity', entityOpt);
                Engine.setApiEntities([apiEntity]);
                return new Entity(apiEntity.key);
            case 'component':
                const componentOpt: ApiOptionsComponent = {
                    ...<ApiOptionsComponent>options,
                    componentName: name
                }
                const apiComponent = Engine.createObject('component', componentOpt);
                Engine.setApiComponent([apiComponent]);
                return new Component(componentOpt, Engine.getApiComponents());
        }
    }

    getSamples(type: 'entity'): Entity[];
    getSamples(type: 'component'): Component[];
    getSamples(type: EngineObjectType): Entity[] | Component[] {
        if (type === 'entity') {
            return Engine.getApiEntities().filter(e => !!e.sampleId).map(e => new Entity(e.key))
        }
        return Engine.getApiComponents().map((c, index, arr) => new Component(c, arr));
    }

    loadTemplateComponents(components: ApiComponent[]): Creator {return this.loadObjects(components);}
    
    /** Получить комопненты */
    getComponents (): ApiComponent[] {return Engine.getApiComponents();}

    /** Конвертирует массив комопнентов в объект. */
    public componentConverterArrayToObject(components: ApiComponent[]): Components {
        try {
            return Object.fromEntries(Object.entries(
                this.groupBy<ApiComponent>(components, (it) => {
                    return it.componentName; // Выбираем поле, по которому производим групировку
                })
            ).map(componentEntry => {
                return [componentEntry[0],
                Object.fromEntries([
                    ['componentDescription', componentEntry[1][0]?.componentDescription,],
                    ...componentEntry[1].map(componentEntry => {
                        return [componentEntry.propertyName, this.componentDestructuring(componentEntry)]
                    })
                ])
                ]
            })
            )
        } catch (e) {
            const error = e as Error;
            return {}
        }
    }

    /** служебная функция для групировки комопнентов по определенному полю. */
    private groupBy<T>(array: T[], predicate: (compEntry: T) => string) {
        return array.reduce((acc, value, index, arr) => {
                (acc[predicate(value)] ||= []).push(value);
                return acc;
            }, {} as { [key: string]: T[] }
        );
    }

    /** Деструкруризация компонента на свойства */
    private componentDestructuring(component: ApiComponent) {
        const { propertyDescription, propertyValue, propertyType, propertyFormula, attributes, bindingToList, entityId, id, key } = component;
        return { id, entityId, propertyDescription, propertyValue, propertyType, propertyFormula, attributes, bindingToList, key}
    }


  
}