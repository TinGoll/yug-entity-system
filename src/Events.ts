import { EventEmitter } from "events";
import { ApiEntity, EngineObjectType, ApiComponent } from "./@engine-types";
import { Engine } from "./Engine";
import MultipleEmitter from "./other/MultipleEmitter";
import SingleEmitter from "./other/SingleEmitter";

const engineEvensArray = [
    "Engine: create",
    "Engine: destroy",
] as const;
export type EngineEvent = typeof engineEvensArray[number]

export type LoadMethod = "Find One" | "Find All";
type EventListener = (...args: any[]) => Promise<any>;

export default class Events extends EventEmitter {
    private singleEmitter: SingleEmitter = new SingleEmitter();
    private multipleEmitter: MultipleEmitter = new MultipleEmitter();
    private _engine: Engine;

    constructor(engine: Engine) {
        super();
        this._engine = engine;
    }

    /** Получить объект движка */
    getEngine() {
        return this._engine;
    }
    /** Получить объект движка */
    get engine () {
        return this.getEngine();
    }

    // Оригинальные события.

    /**
     * Подписка на событие
     * @param eventName имя события
     * @param listener функция callback
     * @returns this
     */
    subscribe(eventName: string, listener: (...args: any[]) => void): this {
        this.on(eventName, listener);
        return this;
    }

    /**
     * Инициировать событие.
     * @param eventName имя события
     * @param args аргументы
     * @returns boolean
     */
    pushEvent(eventName: string, ...args: any[]): boolean {
        return this.emit(eventName, ...args);
    }


    // События, связанные с созданием, обновлением, удалением или загрузкой объектов движка.

    onLoad(type: 'entity', method: 'Find One', listener: (key: string) => Promise<ApiEntity[]>): this;
    onLoad(type: 'entity', method: 'Find All',
        listener: (params: { where?: { id?: Array<number>, keys?: Array<string>, categories?: Array<string>, }, sample?: boolean }) => Promise<ApiEntity[]>): this;
    onLoad(type: EngineObjectType, method: LoadMethod, listener: EventListener): this {
        const eventName = `load-object-${type}-${method}`;
        this.singleEmitter.on(eventName, listener);
        return this;
    }

    /**
     * Событие создание новой сущности
     * @param type entity
     * @param listener Функция, принимающая в качестве аргумента массив сущностей. Обязана вернуть массив сущностей в ответ
     * @returns this
    */
    onCreatedObjects(type: 'entity', listener: (objects: ApiEntity[]) => Promise<ApiEntity[]>): this;
    /**
     * Событие создания нового компонента.
     * @param type component
     * @param listener Функция, принимающая в качестве аргумента массив компонентов. Обязана вернуть массив компонентов в ответ
     * @returns this
    */
    onCreatedObjects(type: 'component', listener: (objects: ApiComponent[]) => Promise<ApiComponent[]>): this;
    onCreatedObjects(type: EngineObjectType, listener: EventListener): this {
        const eventName = `created-object-${type}`;
        this.singleEmitter.on(eventName, listener);
        return this;
    }

    onUpdatableObjects(type: 'entity', listener: (objects: ApiEntity[]) => Promise<ApiEntity[]>): this;
    onUpdatableObjects(type: 'component', listener: (objects: ApiComponent[]) => Promise<ApiComponent[]>): this;
    onUpdatableObjects(type: EngineObjectType, listener: EventListener): this {
        const eventName = `updatable-object-${type}`;
        this.singleEmitter.on(eventName, listener);
        return this;
    }
    onDeletedObjects(type: 'entity', listener: (keys: string[]) => Promise<string[]>): this;
    onDeletedObjects(type: 'component', listener: (keys: string[]) => Promise<string[]>): this;
    onDeletedObjects(type: EngineObjectType, listener: EventListener): this {
        const eventName = `deleted-object-${type}`;
        this.singleEmitter.on(eventName, listener);
        return this;
    }

    // *******************************************************************************
    // Эмиттеры - инициализаторы, которые нужно вызывать, для получения или модификации объектов.
    // *******************************************************************************

    loadEmit(type: 'entity', method: 'Find One', key: string): Promise<ApiEntity[]>
    loadEmit(type: 'entity', method: 'Find All',
        params: { where?: { id?: Array<number>, keys?: Array<string>, categories?: Array<string>, }, sample?: boolean }): Promise<ApiEntity[]>
    loadEmit(type: EngineObjectType, method: LoadMethod, ...args: any[]): Promise<any> {
        console.log('loadEmit', type, method);
        
        const eventName = `load-object-${type}-${method}`;
        return this.singleEmitter.emit(eventName, ...args);
    }

    createdEmit(type: 'entity', objects: ApiEntity[]): Promise<ApiEntity[]>;
    createdEmit(type: 'component', objects: ApiComponent[]): Promise<ApiComponent[]>;
    createdEmit(type: EngineObjectType, ...args: any[]): Promise<any> {
        const eventName = `created-object-${type}`;
        return this.singleEmitter.emit(eventName, ...args);
    }

    updatedEmit(type: 'entity', objects: ApiEntity[]): Promise<ApiEntity[]>;
    updatedEmit(type: 'component', objects: ApiComponent[]): Promise<ApiComponent[]>;
    updatedEmit(type: EngineObjectType, ...args: any[]): Promise<any> {
        const eventName = `updatable-object-${type}`;
        return this.singleEmitter.emit(eventName, ...args);
    }

    deletedEmit(type: 'entity', keys: string[]): Promise<string[]>;
    deletedEmit(type: 'component', keys: string[]): Promise<string[]>;
    deletedEmit(type: EngineObjectType, ...args: any[]): Promise<any> {
        const eventName = `deleted-object-${type}`;
        return this.singleEmitter.emit(eventName, ...args);
    }
}