import { ApiComponent, ApiEntity, ISerializable } from "./types/engine-types";
import uuid from 'uuid-random'
import Entity from "./Entity";
import Creator from "./Creator";
import EventEmitter from "events"

interface ExtraData {
    isChange: boolean;
    data: object;
}

export default class Engine {
    private static instance?: Engine;
    private entityList: Map<string, ApiEntity> = new Map <string, ApiEntity> ();
    private extraData: Map<string, ExtraData> = new Map<string, ExtraData>();
    private _creator?: Creator;
    private static _mode: "PROD" | "DEV" = "PROD";
    constructor() {
        if (Engine.instance) { return Engine.instance; }
        Engine.instance = this;
    }


    static setMode(mode: "PROD" | "DEV") {
        Engine._mode = mode;
    }

    static getMode(): "PROD" | "DEV" {
        return Engine._mode;
    }

    /**
     * Запись дополнительных данных
     * @param key Ключ данных
     * @param data Данные
     */
    setKtx <T extends object = object> (key: string, data: T) {
        try {
            if (this.extraData.has(key)) {
                this.extraData.get(key)!.data = { ...data };
                this.extraData.get(key)!.isChange = true;
            }else{
                this.extraData.set(key, {data, isChange: true});
            }
            return this;
        } catch (e) {
            throw e;
        }
    }
    /**
     * Получение дополнительных данных по ключу.
     * @param key Ключ данных
     */
    getKtx<T extends object = object>(key: string): T | null {
        try {
            return (<T> this.extraData.get(key)?.data )|| null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Модуль создания объектов.
     * @returns Creator;
     */
    creator (): Creator {
        return this._creator || new Creator(this);
    }

    /** очистка хранилища движка */
    clearEntity () {
        this.entityList.clear();
    }
    /** загрузка в хранилище движка сущностей */
    loadEntities (entities: ApiEntity[]): ApiEntity[] {
        return entities.map(e => this.set(e));
    }
    /** загрузка в хранилище движка сущностей и возврат массива instance Entity */
    loadAndReturning(entities: ApiEntity[]): Entity[] {
        const apiEntities = this.loadEntities(entities);
        const grandParents = apiEntities.filter((oEnt, i, arr) => {
            if (!oEnt.parentKey) return true;
            const index = arr.findIndex(fEnt => fEnt.key === oEnt.parentKey);
            return (index === -1);
        });
        return grandParents.map(e => new Entity(e, this));
    }
    /** Добавление сущности в движок, регистрация */
    set(entity: ApiEntity): ApiEntity { 
       try {
            Engine.registration(entity);
            const key = entity.key;
            // Если такой объект есть в коллекции, заменяем его данные.
            if (this.entityList.has(key)) {
                const candidate = this.entityList.get(key)!
                const components = (candidate?.components|| []).map(c=> {
                    Engine.registration(c);
                    return {...c}
                })
                candidate.components = components;
                candidate.id = entity.id;
                candidate.category = entity.category;
                candidate.parentId = entity.parentId;
                candidate.sampleId = entity.sampleId;
                candidate.name = entity.name;
                candidate.note = entity.note;
                candidate.dateCreation = entity.dateCreation;
                candidate.dateUpdate = entity.dateUpdate;
                candidate.parentKey = entity.parentKey;
            }else {
                this.entityList.set(entity.key, entity);
            }
           return this.entityList.get(key)!;
       } catch (e) {
           throw e;
       }
    }
    /**
     * Получаем сущность из памяти движка по ключу.
     * @param key  ключ сущности.
     * @returns ApiEntity | undefined
     */
    get (key: string): ApiEntity | undefined { 
        if (!this.entityList.has(key)) return;
        return this.entityList.get(key);
    }
    /**
     * Сущетсвует ли требуемая сущность в памяти движка.
     * @param key ключ сущности.
     * @returns boolean
     */
    has(key: string): boolean { 
        return this.entityList.has(key);
    }

    /**
     * Клонирование api данных, полученных в результате метода build()
     * @param apiEntity Результат метода build()
     * @param parentKey Необязательно, ключ родительской сущности.
     */
    cloneApiEntityBuildData (apiEntity: ApiEntity[], parentKey?: string): ApiEntity[] {
        const tempArr: ApiEntity[] = [];
        // Находим верхний уровень сущностей.
        const overEntities = apiEntity.filter((oEnt, idx, arr) => {
            if (!oEnt.parentKey) return true;
            const index = arr.findIndex(fEnt => fEnt.key === oEnt.parentKey);
            return (index === -1);
        });
        for (const ent of overEntities) {
            tempArr.push(...this.сloneByChain(apiEntity, ent.key, parentKey));
        }
        return tempArr;
    }
   
    /**
     * Клонирование сущности.
     * @param key ключ требуемой сущности.
     * @param parentKey родительский ключ Entity, не обязательное.
     * @returns ApiEntity
     */
    cloneEntity (key: string, parentKey?: string): ApiEntity | undefined {
        if (!this.entityList.has(key)) return;
        const candidate = this.entityList.get(key)!;
        const parent = this.entityList.get(parentKey || '');
        const children = this.getСhildren(key);

        const candidateComponens = candidate.components||[];
        const newKey = Engine.keyGenerator('ent:');
        const newParentId = parent?.parentId || 0;

        const cloneComponents = this.cloneComponents(candidateComponens, newKey);
        const clone: ApiEntity = { 
            ...candidate, 
            components: cloneComponents, 
            key: newKey, 
            parentKey,
            id: 0,
            parentId: newParentId
        }
        this.entityList.set(clone.key, clone);
        for (const cld of children) {
            this.cloneEntity(cld.key, clone.key)
        }
        return clone;
    }
    /**
     * Слонирование компонента
     * @param components комопнент ApiComponent[];
     * @param entityKey ключ Entity, не обязательное.
     * @returns ApiComponent[] 
     */
    cloneComponents (components: ApiComponent[], entityKey?: string): ApiComponent[] {
        const cloneComponents = components.map( c => {
            return { ...c, key: Engine.keyGenerator('cmp:'), id: 0, entityId: 0, entityKey: entityKey }
        })
        return cloneComponents;
    }
    /**
     * Данные для сохранения в бд или передачи в память движка.
     * @param key ключ требуемой сущности.
     * @returns ApiEntity[];
     */
    getBuildData(key: string): ApiEntity[] {
        const tempArr: ApiEntity[] = [];
        const apiEntity = this.entityList.get(key);
        if (!apiEntity) return tempArr;
        tempArr.push(apiEntity);
        tempArr.push(...this.getAllDescendants(this.getСhildren(key)));
        return tempArr;
    }

    /**
     * Собираем сущность с вложениями, на выходе получим объект ApiEntity с дочерними сущностями во вложении.
     * @param entityKey - ключ сущности верхнего уровня.
     * @returns 
     */
    assembleObject(entityKey: string): ApiEntity | undefined {
        const candidate = this.entityList.get(entityKey);
        if (!candidate) return;
        const { key, category, children = [], components = [], dateCreation, dateUpdate, id, name,note, parentId, parentKey, sampleId } = candidate;
        const entityComponent: ApiComponent[] = [];
        for (const cmp of components) {
            entityComponent.push({...cmp});
        }
        const apiEntity: ApiEntity = { key, category, children, components: entityComponent, dateCreation, dateUpdate, id, name, note, parentId, parentKey, sampleId };

        const entityChildren = this.getСhildren(entityKey);
        for (const cld of entityChildren) {
            const apiChld = this.assembleObject(cld.key);
            if (apiChld) apiEntity.children!.push({ ...apiChld })
        }
        return apiEntity;
    }

    /**
     * Разбор сущности для сохранения в бд или для передачи в память движка.
     * Сущность может иметь бесконечное множество вложений и будет разобрана на массив сущностей без вложений.
     * @param entity сущность
     * @returns ApiEntity[]
     */
    deassembleObject (entity: ApiEntity): ApiEntity[] {
        const tempArr: ApiEntity[] = [];
        const { id, parentId, key, parentKey, category, dateCreation, dateUpdate, name, note, sampleId, components, children } = entity;
        const deEntity = {
            id, parentId, key, parentKey, category, dateCreation, dateUpdate, name, note, sampleId, components, children: []
        }
        this.set(deEntity)
        tempArr.push(deEntity);
        for (const chld of (children||[])) {
            tempArr.push(...this.deassembleObject(chld));
        }
        return tempArr;
    }

    /**
     * Разбор сущности для передачи в память движка, и возврат instance Entity сущности верхнего уровня.
     * @param entity сущность с вложениями.
     * @returns Entity
     */
    deassembleObjectAndReturning(entity: ApiEntity): Entity {
        this.deassembleObject(entity);
        return new Entity(this.get(entity.key)!, this);
    }
    /**
     * Получение всех потомков. Передавая дочерние сущности, 
     * получаем массив этих сущностей, а так же их дочерние сущности,
     * любого уровня вложенности.
     * @param children массив дочерних сущностей
     * @returns ApiEntity[]
     */
    getAllDescendants (children: ApiEntity[]): ApiEntity[] {
        const tempArr: ApiEntity[] = [];
        tempArr.push(...children);
        for (const chld of children) {
            tempArr.push(...this.getAllDescendants(this.getСhildren(chld.key)));
        }
        return tempArr;
    }

    /**
     * Получение дочерних сущностей ApiEntity, по ключу родительской.
     * @param key Родительский ключ.
     * @returns ApiEntity[];
     */
    getСhildren (key: string): ApiEntity[] {
        const tempArr: ApiEntity[] = [];
        for (const chld of this.entityList.values()) {
            if (chld.parentKey === key) tempArr.push({ ...chld });
        }
        return tempArr;
    }

    /** Уникальльное имя, для названий сущностей */
    public static getUniqueNote (name: string, note: string, apiData: ApiEntity[], startNumber: number = 0): string {
        let maxNumber: number = 0;
        for (const api of apiData) {
            if (api.name?.toUpperCase() === name.toUpperCase()) {
                const numArr = (api.note || '').match(/[0-9]/ig);
                if (numArr) {
                    const tempNum = Number(numArr.join(''));
                    if (tempNum > maxNumber) maxNumber = tempNum;
                }
            }
        }
        return Engine.incrementString(note.replace(/\d/g, '') + ` ${maxNumber}`, startNumber).replace(/\s+/g, ' ').trim();
    }

    /**  */
    public static incrementString(strng: string, startNumber: number = 0): string {
        let numbOfString = strng.match(/[0-9]/ig);
        let number;
        if (numbOfString && numbOfString.length > 0) {
            number = +numbOfString.join('');
            let lastAddValue = startNumber + number + (false ? -1 : 1);
            return strng.replace(/\d/g, '') + Engine.pad(lastAddValue, numbOfString.length);
        }
        return strng + ' ' + Engine.pad(1, 1);
    }

    /**  */
    private static pad(num: number, size: number) {
        let s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    /** Генератор ключей, для объектов */
    public static keyGenerator(pfx?: 'ent:' | 'cmp:'): string {
        //return Date.now().toString(16);
        //return randomUUID();
        if (!pfx) return uuid();
        return pfx + uuid();
    }

    /** Регистрация (сериализация) всех объектов движка. Объекту присваивается уникальный ключь. В качстве дженерика, используется интерфейс сущности или компонента. */
    public static registration<T extends ApiComponent | ApiEntity>(object: ISerializable): T {
        let prefix: 'ent:' | 'cmp:' | undefined = undefined;
        if ((<ApiEntity>object).name) prefix = 'ent:';
        if ((<ApiComponent>object).componentName) prefix = 'cmp:';
        if (!object.key) object.key = Engine.keyGenerator(prefix);
        return <T>object
    }

    /**
     * Уничтожение объекта движка.
     * Так же будут уничтожены все объекты, которые находятся в памяти движка.
     */
    destroy () {
        this.clearEntity();
        this._creator = undefined;
        Engine.instance = undefined;
    }

    /**
    * Клонирование по цепочке
    * @param overKey 
    * @param arr 
    */
    private сloneByChain(arr: ApiEntity[], overKey: string, parentKey?: string): ApiEntity[] {
        const tempArr: ApiEntity[] = [];
        const overEntity = arr.find(e => e.key === overKey);
        if (overEntity) {
            const newKey = Engine.keyGenerator('ent:');
            const componentsOverEntity = overEntity?.components || [];
            const cloneComponents = this.cloneComponents(componentsOverEntity, newKey);
            const cloneEntity = { ...overEntity, key: newKey, parentKey: parentKey, id: 0, parentId: 0, components: cloneComponents }
            this.set(cloneEntity);
            tempArr.push(cloneEntity);
            const childs: ApiEntity[] = arr.filter(e => e.parentKey === overKey);
            for (const child of childs) {
                tempArr.push(...this.сloneByChain(arr, child.key, newKey));
            }
        }
        return tempArr;
    }
}