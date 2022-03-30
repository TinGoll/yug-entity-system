import Component from "./Component";
import Engine from "./Engine";
import { ApiComponent, ApiEntity } from "./types/engine-types";

export default class Entity {
    private options: ApiEntity;
    private engine: Engine;
    constructor(options: ApiEntity, engine: Engine) {
        this.engine = engine;
        this.options =  options;
    }

    getEngine(): Engine {
        return this.engine;
    }

    build (): ApiEntity[] {
        return this.engine.getBuildData(this.options.key);
    }

    clone (): ApiEntity {
        return this.engine.cloneEntity(this.options.key, this.options.parentKey)!
    }

    produce (): ApiEntity [] {
        return [];
    }

    cloneAndRetutning (): Entity {
        return new Entity(this.engine.cloneEntity(this.options.key, this.options.parentKey)!, this.engine);
    }

    produceAndRetutning(): Entity {
        throw new Error('Не реализовано')

    }

    addChild (children: ApiEntity[]): Entity {
        const candidateChildren =  this.engine.loadEntities(children);
        for (const candidate of candidateChildren) {
            const chld = this.engine.cloneEntity(candidate.key, this.options.key);
        }
        return this;
    }

    addComponent (component: ApiComponent[]): Entity {
        const cmps = this.engine.cloneComponents(component, this.options.key)
        if (!this.options.components) this.options.components = [];
        for (const cmp of cmps) {
            const index = this.options.components?.findIndex(c =>
                 c.componentName === cmp.componentName && c.propertyName === cmp.propertyName);
            if (index >= 0 ) {
                this.options.components[index] = { ...cmp };
            }else {
                this.options.components.push({...cmp})
            } 
        }
        return this;
    }

    /** Geters */

    getId (): number {
        return this.options.id||0;
    }

    getName (): string {
        return this.options.name||''
    }
    getNote (): string {
        return this.options.note||'';
    }

    getCategory(): string {
        return this.options.category||''
    }

    getDateCreation(): Date | undefined {
        return this.options.dateCreation;
    }

    getDateUpdate(): Date | undefined {
        return this.options.dateUpdate;
    }

    getKey(): string {
        return this.options.key;
    }

    getParentKey(): string | undefined {
        return this.options.parentKey;
    }

    getParenttId (): number {
        return this.options.parentId||0;
    }

    getComponents (): Component[] {
        throw new Error("Не реализовано")
    }

    getChildrens(): Entity[] {
        throw new Error("Не реализовано")
    }

    getSampleId (): number {
        return this.options.sampleId||0;
    }

    /** Seters */

    setName(value: string): Entity {
        this.options.name = value;
        return this;
    }
    setNote(value: string ): Entity {
        this.options.note = value;
       return this; 
    }

    setCategory(value: string): Entity {
        this.options.category = value;
        return this;
    }


    setParentKey(value: string): Entity {
        this.options.parentKey = value;
        return this;
    }

    setParenttId(value: number): Entity {
        this.options.parentId = value;
        return this;
    }

    setSampleId(value: number): Entity {
        this.options.sampleId = value;
        return this;
    }
}