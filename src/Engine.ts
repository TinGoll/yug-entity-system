import { ApiComponent, ApiEntity, ISerializable } from "./types/engine-types";
import uuid from 'uuid-random'
import Entity from "./Entity";
import Creator from "./Creator";

export default class Engine {
    private static instance?: Engine;
    private entityList: Map<string, ApiEntity> = new Map <string, ApiEntity> ();
    private _creator?: Creator;
    constructor() {
        if (Engine.instance) { return Engine.instance; }
        Engine.instance = this;
    }

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
        const grandParents = apiEntities.filter((e, i, arr) => {
            if (!e.parentKey) return true;
            const index = arr.findIndex(f => f.key === e.parentKey);
            return index === -1;
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
    get (key: string): ApiEntity | undefined { 
        if (!this.entityList.has(key)) return;
        return this.entityList.get(key);
    }
    has(key: string): boolean { 
        return this.entityList.has(key);
    }

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

    cloneComponents (components: ApiComponent[], entityKey?: string): ApiComponent[] {
        const cloneComponents = components.map( c => {
            return { ...c, id: 0, entityId: 0, entityKey: entityKey }
        })
        return cloneComponents;
    }

    getBuildData(key: string): ApiEntity[] {
        const tempArr: ApiEntity[] = [];
        const apiEntity = this.entityList.get(key);
        if (!apiEntity) return tempArr;
        tempArr.push(apiEntity);
        tempArr.push(...this.getAllDescendants(this.getСhildren(key)));
        return tempArr;
    }  

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

    deassembleObjectAndReturning(entity: ApiEntity): Entity {
        this.deassembleObject(entity);
        return new Entity(this.get(entity.key)!, this);
    }
    
    getAllDescendants (children: ApiEntity[]): ApiEntity[] {
        const tempArr: ApiEntity[] = [];
        tempArr.push(...children);
        for (const chld of children) {
            tempArr.push(...this.getAllDescendants(this.getСhildren(chld.key)));
        }
        return tempArr;
    }

    getСhildren (key: string): ApiEntity[] {
        const tempArr: ApiEntity[] = [];
        for (const chld of this.entityList.values()) {
            if (chld.parentKey === key) tempArr.push({ ...chld });
        }
        return tempArr;
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
}