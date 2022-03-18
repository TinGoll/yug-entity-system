import { Engine } from "../../engine/Engine";
import { EngineObject } from "../../types/engine-interfaces";
import { ApiComponent, ApiEntity, EntityComponent, EntitySnapshot, IGetable, PropertyValue } from "../../types/entity-types";
import { Component } from "../components/Component";


export class Entity implements EngineObject<ApiEntity>, IGetable {
    private _key: string;
    constructor(key: string) {
        this._key = key;
    }
    get(): EntityComponent<string> | EntitySnapshot {
        throw new Error("Method not implemented.");
    }

    /** * Собирает сущность для отправки серверу/клиенту.*/
    build(): ApiEntity[] {
        return Engine.getBuildData(this._key);
    }

    /**
     * Добавление комопнента в сущность. 
     * @param apiComponent Массив ApiComponent
     * @returns this
     */
    addComponent(apiComponent: ApiComponent[]): Entity {
        try {
            const apiEntity = Engine.get(this._key);
            if (!apiEntity) throw new Error("Сущность с таким ключем не обнаружена.");
            const apiComponents = apiEntity.components || [];

            for (const comp of apiComponent) {
                const index = apiComponents.findIndex(c => c.componentName === comp.componentName && c.propertyName === comp.propertyName);
                if (index >= 0){
                    apiComponents[index] = { ...comp, id: apiComponents[index].id, entityId: apiEntity.id, entityKey: apiEntity.key }
                }else{
                    apiComponents.push({ ...comp, entityId: apiEntity.id, entityKey: apiEntity.key });
                }
            }
            apiEntity.components = [...apiComponents]
            return this;
        } catch (e) {
            console.log(e);
            // выкинуть ошибку
            return this;
        }
    }
    
    /** Получение всех комопнентов сущности */
    getComponents (): ApiComponent[] {
        try {
            const apiEntity = Engine.get(this._key);
            return apiEntity?.components || [];
        } catch (e) {
            return []
        }
    }

    /**
     * Переопределяет данный объект.
     * @param state  Набор данных, определяющий сущность.
     * @returns  instance Сущности.
     */
    setState(state: ApiEntity): Entity {
        this._key = state.key!;
        Engine.setApiEntities([state]);
        return this;
    }
    /**
     * Возвращает наименование сущности.
     * @returns строка, имя сущности.
     */
    getName(): string {
        return Engine.getApiEntityToKey(this._key)?.name || ''
    }
    /**
     * Возвращает уникальный ключ сущности.
     * @returns строка
     */
    getKey(): string {
        return this._key;
    }
    /** Родительская сущность или  undefined*/
    getParent(): Entity | undefined {
        const parentKey = Engine.get(this._key)?.parentKey;
        if (!parentKey) return;
        return new Entity(parentKey);
    }
    /**
     * Получение всех дочерних сущностей.
     * @returns массив дочерних сущностей instance класса Entity
     */
    getChildren(): Entity[] {
        const children = Engine.getChildrenApiEntityToKey(this._key).map(e => new Entity(e.key!));
        return children;
    }
    /**
     * Добавление дочеренй сущности, путем передачи строкового ключа или ApiEntity.
     * @param child Ключ дочерней сущности или сама сущность.
     * @returns Entity
     */
    addChild(child: string): Entity;
    addChild(child: ApiEntity): Entity;
    addChild(child: string | ApiEntity): Entity {
        try {
            if (typeof child === "string" || child instanceof String) {
                if (Engine.has(<string>child)) {
                    Engine.get(<string>child)!.parentKey = this._key;
                }
            }else{
                const apiEntity = child as ApiEntity;
                if (Engine.has(apiEntity.key)) {
                    Engine.get(apiEntity.key)!.parentKey = this._key;
                }
            }
            return this;
        } catch (e) {
            console.log(e);
            return this;
        }
    }
    /**
     * Способ получения значения свойства компонента.
     * @param componentName название компонента на английском
     * @param propertyName название свойства на английском.
     * @returns PropertyValue (string, number, Date, boolean)
     */
    getPropertyValue<U extends PropertyValue = string, T extends object | string = string>(
        componentName: T extends string ? string: keyof T, 
        propertyName: T extends string ? string : keyof T[keyof T]
    ): U | null {
        const apiComponent = Engine.get(this._key)?.components || [];
        const firstOpt = apiComponent.find(c => c.componentName === componentName);
        if (!firstOpt) return null;
        const component = new Component(firstOpt, apiComponent);
        return component.getProperty<U, T>(propertyName);
    }

    /**
     * Способ присвоения значения определенному свойству компонента.
     * @param componentName название компонента на английском.
     * @param propertyName название свойства на английском.
     * @param value PropertyValue (string, number, Date, boolean).
     * @returns Entity.
     */
    setPropertyValue<U extends PropertyValue = PropertyValue, T extends object | string = string>(
        componentName: T extends string ? string : keyof T,
        propertyName: T extends string ? string : keyof T[keyof T],
        value: U
    ): Entity {
        const apiComponent = Engine.get(this._key)?.components || [];
        const firstOpt = apiComponent.find(c => c.componentName === componentName);
        if (firstOpt) {
            const component = new Component(firstOpt, apiComponent);
            component.setProperty(propertyName, value);
        }
        return this;
    }

    /** Пересчет всех компонентов */
    calculate() {

    }

    /************************************************************************************ */
    /** GETERS */

    /** Название сущности. */
    get name (): string {
        return this.getName();
    }
    /** Уникальный ключ сущности. */
    get key(): string {
        return this.getKey();
    }
    /** Родительская сущность или  undefined*/
    get parent(): Entity | undefined {
        return this.getParent();
    }
    /** Массив дочерних сущностей */
    get children(): Entity[] {
        return this.getChildren();
    }
}

/*
interface Geometry {geometry: GeometryProb}
interface GeometryProb extends EntityComponentDescription {
    height: EntityComponentProperty;
    width: EntityComponentProperty;
    depth: EntityComponentProperty;
}
*/