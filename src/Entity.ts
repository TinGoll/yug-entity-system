import Component from "./Component";
import Engine from "./Engine";
import { formulaExecutor } from "./FormulaExecutor";
import { ApiComponent, ApiEntity } from "./types/engine-types";

export default class Entity {
    private options: ApiEntity;
    private engine: Engine;
    constructor(options: ApiEntity, engine: Engine) {
        this.engine = engine;
        this.options =  options;
    }

    /**
     * Получение данных для редактора формул
     */
    getPreparationData () {
        if (!this.options.id) return;
        return formulaExecutor.bind(this)('', null, 'preparation');
    }

    /**
     * Получение родительской сущности.
     * @returns Entity
     */
    getParent(): Entity | undefined {
        const parentKey = this.options.parentKey;
        if (!parentKey) return;
        return this.engine.creator().getEntityToKey(parentKey);
    }
    /**
     * Получаем наивысшую сущность, в независимости с какого уровня вложенности будет запрос
     * будет получена самая верхная сущность.
     * @returns Entity;
     */
    getGrandFather () {
        return this.get_grand_father(this.getParent());
    }
    /**
     * Получаем все дочерние сущности.
     * @returns Entity[]
     */
    getChildren(): Entity[] {
        return this.engine.creator().getEntityChildren(this.options.key);
    }

    getOptions () : ApiEntity {
        return {...this.options};
    }

    getEngine(): Engine {
        return this.engine;
    }

    build (): ApiEntity[] {
        return this.engine.getBuildData(this.options.key);
    }

    assemble () : ApiEntity {
        return this.engine.assembleObject(this.options.key)!;
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


    addChild (children: ApiEntity[] | Entity): Entity {
        let candidateChildren: ApiEntity[] = []
        if (children instanceof Entity ) {
            candidateChildren.push(children.getOptions())
        }
        if (children && (<ApiEntity[]>children).length && (<ApiEntity[]>children)[0].name) {
            candidateChildren.push(...(<ApiEntity[]>children||[]).filter((e, i, arr) => {
                if (!e.parentKey) return true;
                const index = arr.findIndex(f => f.key === e.parentKey);
                return index === -1;
            }))
        }

        this.engine.loadEntities(candidateChildren);
        for (const candidate of candidateChildren) {
            const chld = this.engine.cloneEntity(candidate.key, this.options.key);
        }
        return this;
    }

    addComponent (component: ApiComponent[] | Component): Entity {

        let addedComponents: ApiComponent[] = [];

        if (component instanceof Component) addedComponents =  component.build();

        if (component && (<ApiComponent[]>component)[0]?.propertyName) addedComponents = (<ApiComponent[]>component);

        const cmps = this.engine.cloneComponents(addedComponents, this.options.key)

        if (!this.options.components) this.options.components = [];

        for (const cmp of cmps) {
            const index = this.options.components?.findIndex(c =>
                 c.componentName === cmp.componentName && c.propertyName === cmp.propertyName);
            if (index >= 0 ) {
                const currentCmp = this.options.components[index];
                this.options.components[index] = { 
                    ...currentCmp, 
                    componentDescription: cmp.componentDescription,
                    propertyDescription: cmp.propertyDescription,
                    propertyType: cmp.propertyType,
                    propertyFormula: cmp.propertyFormula,
                    propertyValue: cmp.propertyValue
                };
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
        const componentNames = [...new Set((this.options.components||[]).map(c => c.componentName))];
        return (componentNames||[]).map(name => {
            const cmps = (this.options.components || []).filter(c => c.componentName === name);
            return new Component({ componentName: name, componentDescription: cmps[0].componentDescription||'Описание компонента' },
                cmps);
        })
    }

    getChildrens(): Entity[] {
        const chlds = this.engine.getСhildren(this.options.key);
        return chlds.map(e => new Entity(e, this.engine));
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

    getApiComponents (): ApiComponent[] {
        return this.options.components||[];
    }

    /************************************************************************************ */
    /** GETERS */

    /** Название сущности. */
    get name(): string {
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

    /** Приватные методы */
    private get_grand_father(father: Entity | undefined): Entity | undefined {
        if (!father) return;
        return this.get_grand_father(father.getParent()) || father;
    }
}