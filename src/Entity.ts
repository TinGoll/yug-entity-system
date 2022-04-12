import Component from "./Component";
import Engine from "./Engine";
import { formulaExecutor } from "./FormulaExecutor";
import { formulaExecutor2 } from "./FormulaExecutor2";
import { ApiComponent, ApiEntity, PropertyTypes, PropertyValue } from "./types/engine-types";

export default class Entity {
    private options: ApiEntity;
    private engine: Engine;
    constructor(options: ApiEntity, engine: Engine) {
        this.engine = engine;
        this.options =  options;
    }

    testNewFormula<U extends PropertyValue = string, T extends object | string = string>(
        componentName: T extends string ? string : keyof T,
        propertyName: T extends string ? string : keyof T[keyof T]
    ): U | null {
        const cmp = this.options.components?.find(c =>
            c.componentName === componentName &&
            c.propertyName === propertyName
        )
        if (!cmp) return null;
        console.log(JSON.stringify(formulaExecutor2.bind(this)(cmp, '', 'preparation'), null, 2));
        
        return null;
    }


    getPropertyValue<U extends PropertyValue = string, T extends object | string = string>(
        componentName: T extends string ? string : keyof T,
        propertyName: T extends string ? string : keyof T[keyof T]
    ): U | null {
       try {
            const cmp = this.options.components?.find(c => 
                c.componentName === componentName &&
                c.propertyName === propertyName
            )
            if (!cmp) return null;
            const formula = cmp.propertyFormula;
            if (!formula) return this.get_value<U>(cmp.propertyType!, cmp.propertyValue);
           const result = <U>(formulaExecutor2.bind(this)(cmp, formula, "execution"));
           cmp.propertyValue = this.get_value<U>(cmp.propertyType!, result);
           return result;
       } catch (e) {
           console.log(e);
           return null;
       }
    }

    /**
     * Агрегатор, для отсроченного выполнения функции с привязкой контекста. GETTER
     * @param componentName Название копопнента
     * @param propertyName Название свойства
     * @returns функция getter
     */
    getterExecutor (componentName:string, propertyName:string): () => PropertyValue | null {
        const fun = (): PropertyValue | null => this.getPropertyValue.bind(this)<PropertyValue, string>(componentName, propertyName);
        return fun;
    }

    /**
     * Агрегатор, для отсроченного выполнения функции с привязкой контекста. SETTER
     * @param componentName Название копопнента
     * @param propertyName Название свойства
     * @returns функция setter
     */
    setterExecutor(componentName: string, propertyName: string ): (value: PropertyValue) => void {
        const fun = (value: PropertyValue) => this.setPropertyValue.bind(this)<PropertyValue, string>(componentName, propertyName, value);
        return fun.bind(this);
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
            console.log('Error setPropertyValue', e);
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
    getPreparationData(componentKey: string) {
        if (!this.options.id) return;
        return formulaExecutor2.bind(this)({ key: componentKey }, '', 'preparation');
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

    /**
     * Добавление дочерней сущности. Принцип основан на копировании передаваемой сущности.
     * Так же новые сущности добавляються в хранилище движка.
     * @param children Либо объект класса Entity либо api данные.
     * @returns This
     */
    addChild (children: ApiEntity[] | Entity): Entity {
        let candidateChildren: ApiEntity[] = []
        if (children instanceof Entity ) {
            candidateChildren.push(...children.build())
        }
        if (children && (<ApiEntity[]>children).length && (<ApiEntity[]>children)[0].name) {
            candidateChildren.push(...<ApiEntity[]>children);
        }
        this.engine.cloneApiEntityBuildData(candidateChildren, this.options.key);
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

    getDynasty (): Entity [] {
        return this.engine.creator().getDynasty(this.options.key);
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