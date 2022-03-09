import { ApiComponent, ApiEntity, ApiOptionsComponent, ApiOptionsEntity } from "../types/entity-types";
import EventEmitter from "events"
import { EngineObjectType, ISerializable } from "../types/engine-interfaces";
import Creator from "../Models/Creator";


export class Engine {
    private static eventEmitter: EventEmitter = new EventEmitter();
    private static instance?: Engine;

    private static apiEntityList = new Map<string, ApiEntity>();
    private static apiComponents: ApiComponent[] = [];

    private _creator?: Creator;

    constructor () {
        if (Engine.instance) { return Engine.instance; }
        Engine.instance = this;
    }

    creator(): Creator {
        if (this._creator) return this._creator;
        this._creator = new Creator();
        return this._creator;
    }

    /**
     * Загружает в память движка, обновляет данные или добавляет новые.
     * @param apiObjects ApiComponent[] | ApiEntity[] массив объекта движка.
     */
    public static loadObjects(apiObjects: ApiComponent[] | ApiEntity[]) {
        try {
            if (apiObjects.length && (<ApiEntity>apiObjects[0]).name ) {
                Engine.setApiEntities(<ApiEntity[]>apiObjects);
            } else if (apiObjects.length && (<ApiComponent>apiObjects[0]).componentName){
                Engine.setApiComponent(<ApiComponent[]>apiObjects);
            }
        } catch (e) {
            console.log(e);
            // Сделать выброс ошибки
        }
    }

    /**
     * Создает и регистрирует новый объект движка.
     * @param type Тип создаваемого объекта: "entity" или "component"
     * @param options набор опций для создания объекта
     */
    public static createObject<T extends ApiComponent | ApiEntity = ApiComponent>(type: 'component', options: ApiOptionsComponent): ApiComponent;
    public static createObject<T extends ApiComponent | ApiEntity = ApiEntity>(type: 'entity', options: ApiOptionsEntity): ApiEntity;
    public static createObject<T extends ApiComponent | ApiEntity>(type: EngineObjectType, options: ApiOptionsComponent | ApiOptionsEntity): T {
       try {
            switch (type) {
                case 'entity':
                    const apiEntity: ApiOptionsEntity = {
                        ...<ApiOptionsEntity>options
                    }
                    const serializedEntity = Engine.registration<T>(<ISerializable>apiEntity);
                    return serializedEntity;
                case 'component':
                    const component: ApiOptionsComponent = {
                        ...<ApiOptionsComponent>options
                    }
                    return Engine.registration<T>(<ISerializable> component);
                default:
                    throw new Error(`${type} - Неизвестный тип объекта`);
            }
       } catch (e) {
           throw e;
       }
    }

    public static saveComponentAsTemplate () {
        try {
            
        } catch (e) {
            console.log(e);
            // Выбросить ошибку
        }
    }

    public static getApiComponents (): ApiComponent[] {
        return Engine.apiComponents || [];
    }

    public static getApiEntities (): ApiEntity[] {
        const arr: ApiEntity[] = [...Engine.apiEntityList.values()];
        return arr;
    }

    /** Сборка определенной сущности и ее дочерних элементов. */
    public static getBuildData(key: string): ApiEntity [] {
        const apiEntities: ApiEntity[] = [];
        const entity = Engine.getApiEntityToKey(key);
        if (entity) apiEntities.push({...entity});
        const children = Engine.getChildrenApiEntityToKey(key);
        for (const child of children) {
            apiEntities.push(...Engine.getBuildData(child.key!))
        }
        return apiEntities;
    }

    /**
     * Статический метод, получение сущности по уникальному ключу.
     * @param key  уникальный ключ сущности
     * @returns ApiEntity - объект описывающий сущность
     */
    public static getApiEntityToKey(key: string): ApiEntity | undefined {
        if (!Engine.has(key)) return;
        return Engine.apiEntityList.get(key);
    }

    public static setApiComponent (comps: ApiComponent[]) {
        try {
            for (const component of comps) {
                const index = Engine.apiComponents.findIndex(c => c.componentName === component.componentName && c.propertyName === component.propertyName);
                if (index > -1) {
                    const candidate = Engine.apiComponents[index];
                    Engine.apiComponents[index] = { ...component, key: candidate.key };
                } else {
                    Engine.apiComponents.push({ ...component });
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    /** Метод для изменения состояния сущности. */
    public static setApiEntities(states: ApiEntity[]): void {
        try {
            for (const state of states) {
                if (Engine.has(state.key!)) {
                    const apiEntity = Engine.get(state.key!)!;
                    const components: ApiComponent[] = [];
                    for (const component of state.components || []) {
                        components.push({ ...component, entityId: apiEntity.id, entityKey: apiEntity.key })
                    }
                    apiEntity.category = state.category;
                    apiEntity.components = [...components];
                    apiEntity.dateCreation = state.dateCreation;
                    apiEntity.dateUpdate = state.dateUpdate;
                    apiEntity.id = state.id;
                    apiEntity.name = state.name;
                    apiEntity.note = state.note;
                    apiEntity.parentId = state.parentId;
                    apiEntity.parentKey = state.parentKey;
                    apiEntity.sampleId = state.sampleId;
                    apiEntity.typeId = state.typeId;  
                } else {
                    state.components?.forEach(c => {
                        c.entityId = state.id;
                        c.entityKey = state.key;
                        return;
                    });
                    this.set({...state});
                }
            }
        } catch (e) {
            // Событие ошибки.
        }   
    }
    /**
     * Получить все дочерние определения сущности по ключу родителя.
     * @param key уникальный ключ
     * @returns ApiEntity 
     */
    public static getChildrenApiEntityToKey(key: string): ApiEntity[] {
        const apiEntities: ApiEntity[] = [];
        for (const apiEntity of Engine.apiEntityList) {
            if (apiEntity[0] === key) apiEntities.push(apiEntity[1]);
        }
        return apiEntities;
    }

    /**
     * Проверка существования объекта определения сущности, по уникальному ключу.
     * @param key уникальный ключ.
     * @returns true/false.
     */
    public static has(key: string): boolean {
        return !!Engine.apiEntityList.get(key);
    }
    /**
     * Получение объекта определения сущности по ключу.
     * @param key уникальный ключ.
     * @returns ApiEntity|undefined
     */
    public static get(key: string): ApiEntity|undefined {
        if(!this.has(key)) return;
        return Engine.apiEntityList.get(key);
    }
    /**
     * Добавление объекта определения сущности в коллекцию.
     * @param state 
     * @returns 
     */
    public static set(state: ApiEntity) {
        Engine.apiEntityList.set(state.key!, state);
    }
    /**
     * Удаление сущностей и компонентов из хранилища движка.
     */
    public static clear () {
        Engine.clearComponent();
        Engine.clearEntity();
    }
    /**
     * Удаление сущностей из хранилища движка.
     */
    public static clearEntity () {
        Engine.apiEntityList.clear();
    }
    /**
     *  Удаление компонентов из хранилища движка.
     */
    public static clearComponent() {
        Engine.apiComponents = [];
    }
   
    public static on(event: string, listener: (...params: any[]) => void): void {
        try {Engine.eventEmitter.on(event, listener);} catch (e) {
            const error = e as Error;
            console.log('Ошибка при прослушивании события, обратитесь к уважаемому разработчику', error.message);
        }
    }

    public static emit(event: string, ...params: any[]) {
        try {Engine.eventEmitter.emit(event, ...params);} catch (e) {
            const error = e as Error;
            console.log('Ошибка при создании события, обратитесь к уважаемому разработчику', error.message);
        }
    }
    /** Генератор ключей, для объектов */
    public static keyGenerator (): string {
        return Date.now().toString(16);
    }
    /** Регистрация (сериализация) всех объектов движка. Объекту присваивается уникальный ключь. В качстве дженерика, используется интерфейс сущности или компонента. */
    public static registration <T extends ApiComponent | ApiEntity> (object: ISerializable): T {
        if (!object.key) object.key = Engine.keyGenerator();
        return <T> object
    }

    

}