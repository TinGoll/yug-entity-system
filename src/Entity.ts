import Component from "./Component";
import Engine from "./Engine";
import { formulaExecutor } from "./FormulaExecutor";
import { ApiComponent, ApiEntity, PropertyTypes, PropertyValue } from "./types/engine-types";

export default class Entity {
    private options: ApiEntity;
    private engine: Engine;
    constructor(options: ApiEntity, engine: Engine) {
        this.engine = engine;
        this.options =  options;
    }

    getPropertyValue<U extends PropertyValue = string, T extends object | string = string>(
        componentName: T extends string ? string : keyof T,
        propertyName: T extends string ? string : keyof T[keyof T]
    ): U | null {
        const cmp = this.options.components?.find(c => 
            c.componentName === componentName &&
            c.propertyName === propertyName
        )
        if (!cmp) return null;
        const formula = cmp.propertyFormula;
        if (!formula) return this.get_value<U>(cmp.propertyType!, cmp.propertyValue);
        return <U>(formulaExecutor.bind(this)(formula, cmp.propertyValue, 'execution'));
    }

    /**
     * Задает свойство копонента
     * @param componentName Название копопнента
     * @param propertyName Название свойства
     * @param value значение, согласно типа свойства
     * @returns Entity
     */
    setPropertyValue<U extends PropertyValue = PropertyValue, T extends object | string = string>(
        componentName: T extends string ? string : keyof T,
        propertyName: T extends string ? string : keyof T[keyof T],
        value: U
    ): Entity {
        try {
            const index = (this.options.components || []).findIndex(c => 
                c.componentName === componentName &&
                c.propertyName === propertyName
            );
            if (index >= 0) {
                const propertyType = this.options.components![index].propertyType;
                let tempValue: PropertyValue;
                switch (propertyType) {
                    case 'string':
                        tempValue = String(value);
                        break;
                    case 'boolean':
                        tempValue = Boolean(value);
                        break;
                    case 'number':
                        tempValue = Number(value);
                        break;
                    case 'date':
                        tempValue = new Date(<string>value);
                        break;
                    default:
                        throw new Error("Неизвестный тип копонента")
                }
                this.options.components![index].propertyValue = tempValue;
            }
        } catch (e) {
            console.log(e);
        }
        return this;
    }

    setPropertyFormula<T extends object | string = string>(
        componentName: T extends string ? string : keyof T,
        propertyName: T extends string ? string : keyof T[keyof T],
        formula: string | null
        ): Entity {
        try {
            const cmp = this.options.components?.find(c =>
                c.componentName === componentName &&
                c.propertyName === propertyName
            )
            if (!cmp) throw new Error("Свойство компонента не найдено");
            if (!formula) cmp.propertyFormula = undefined;
            cmp.propertyFormula = String(formula);
        } catch (e) {
            console.log(e);
        }
        return this;
    }

    getPropertyFormula<T extends object | string = string>(
        componentName: T extends string ? string : keyof T,
        propertyName: T extends string ? string : keyof T[keyof T]
    ): string | null {
        const cmp = this.options.components?.find(c =>
            c.componentName === componentName &&
            c.propertyName === propertyName
        );
        if (!cmp) return null;
        return cmp.propertyFormula||null;
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
            candidateChildren.push(...children.build())
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
    private get_value<U extends PropertyValue = string>(type: PropertyTypes, value: PropertyValue): U {
        switch (type) {
            case 'string':
                return <U>String(value);
            case 'boolean':
                return <U>Boolean(value);
            case 'number':
                return <U>Number(value);
            case 'date':
                return <U>new Date(<string>value);
            default:
                return <U>value;
        }
    }
}