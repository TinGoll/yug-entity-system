import Component from "./Component";
import Engine from "./Engine";
import { formulaExecutor3 } from "./FormulaExecutor3";
import { ApiComponent, ApiEntity, PropertyAttribute, PropertyTypes, PropertyValue } from "./types/engine-types";

export default class Entity {
    private options: ApiEntity;
    private engine: Engine;

    constructor(options: ApiEntity, engine: Engine) {
        this.engine = engine;
        this.options =  options;
    }

    /**
     * Усыновление сущности.
     */
    adoptEntity(entity: Entity): Entity {
        try {
            return entity.setParentKey(this.options.key).setParentId(this.options.id||0);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Переопределение свойств компонентов.
     */
    overridingProperties (entity: Entity): Entity {
        try {
            const dynasty = entity.getDynasty();
            for (const ent of dynasty) {
                for (const cmp of ent.getApiComponents()) {
                    const candidat = (this.options.components||[])
                        .find(c => c.componentName === cmp.componentName && c.propertyName === cmp.propertyName);
                    if (candidat) {
                        cmp.propertyValue = candidat.propertyValue;
                    }
                }
            }
            return entity;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Получение контекстных данных по ключу.
     * @param key Ключ
     */
    getKtx<T extends object = object>(key: string): T | null {
        try {
            return this.engine.getKtx<T>(`${this.options.key}_${key}`);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Присвоение контекстных данных по ключу.
     * @param key ключ
     * @param data данные
     * @returns 
     */
    setKtx<T extends object = object>(key: string, data: T) {
        try {
            this.engine.setKtx(`${this.options.key}_${key}`, data);
            return this;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Просчет необходимых для вывода данных, вывод данных 
     * по фильтру, аттрибутов компонента.
     * Выводится родительская сущность и дочерние.
     */
    getBuildProductionData({ attributes }: { attributes?: PropertyAttribute[], } = {}): ApiEntity[] {
        try {
            const tempArr: ApiEntity[] = [];
            this.recalculationFormulas();
            const cmps = this.getApiComponents({ attributes }).map(c => ({...c}));
            const entityApi: ApiEntity = { ...this.options, components: cmps };
            tempArr.push(entityApi);

            for (const cld of this.getChildren()) {
                const cldCmps = cld.getApiComponents({ attributes }).map(c => ({ ...c }));
                const cldOpt: ApiEntity = { ...cld.getOptions(), components: cldCmps };
                if (cldCmps.length) tempArr.push(cldOpt);
            }
            return tempArr;
        } catch (e) {
            throw e;
        }
    }

    /**
     * @param componentName Название компонента
     * @param propertyName Название свойства
     * @param attribute Искомые атрибуты, массив
     * @returns boolean
     */
    existAttribute(componentName: string, propertyName: string, attribute: PropertyAttribute ): boolean {
        try {
            if (!componentName || !propertyName || !attribute) return false;
            const findAtt = attribute?.replace(/\s+/g, '').replace(/\;/g, "");
            const cmp = (this.options.components || [])
                .find(c => c.componentName === componentName && c.propertyName === propertyName);
            if (!cmp) return false;
            const attributeArr = (cmp.attributes?.replace(/\s+/g, "").split(";")) || [];
            return !!(attributeArr.find(a => a.toUpperCase() === findAtt.toUpperCase()));
        } catch (e) {
            throw e;
        }
    }

    /**
     * Пересчет формул.
     */
    recalculationFormulas (): Entity {
        try {
            const comps = this.getApiComponents();
            for (const cmp of comps) {
                if (cmp.propertyFormula) {
                    this.getPropertyValue<PropertyValue, string>(cmp.componentName, cmp.propertyName)
                }
            }
            for (const cld of this.getChildren()) {
                cld.recalculationFormulas();
            }
            return this;
        } catch (e) {
            throw e;
        }
    }


    /**
     * Получени измененных сущностей, включая дочерние.
     * @returns Массив Сущностей (Entity[])
     */
    getChangedEntities(): Entity[] {
        try {
            const tempEntity: Entity [] = [];
            if (this.options.isChange) tempEntity.push(this);
            for (const cld of this.getChildren()) {
                tempEntity.push(...cld.getChangedEntities())
            }
            return tempEntity;
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    deleteComponentPropertyToKey (propertyKey: string) {
        try {
            this.options.components = this.options.components?.filter(c => c.key !== propertyKey);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Получение всех измененных компонентов, 
     * включая компоненты дочерних сущностей.
     * @returns массив ApiComponets
     */
    getChangedComponents(): ApiComponent[] {
        try {
            const apiComponents: ApiComponent[] = [];
            const entities = this.getChangedEntities();
            for (const ent of entities) {
                for (const cmp of ent.getApiComponents()) {
                    if (cmp.isChange) apiComponents.push(cmp);
                }
            }
            return apiComponents;
        } catch (e) {
            console.log(e);
            return []
        }
    }
    
    /**
     * Сброс отметки об изменении.
     * @returns this
     */
    resetСheckСhanges (): Entity {
        try {
            this.options.isChange = false;
            for (const cmp of this.getApiComponents()) {
                cmp.isChange = false;
            }
            for (const cld of this.getChildren()) {
                cld.resetСheckСhanges();
            }
            return this;
        } catch (e) {
            console.log( e);
            return this;
        }
    }

    /**
     * Получение значения компонента, если присутствует формула, производится вычисление.
     * @param componentName 
     * @param propertyName 
     * @returns 
     */
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
            const result = <U>(formulaExecutor3.bind(this)(cmp, formula, "execution"));
            const newData = this.get_value<U>(cmp.propertyType!, result);
            // Отслеживание изменений
            if (cmp.propertyValue !== newData) {
                this.options.isChange = true;
                cmp.isChange = true;
            }
            cmp.propertyValue = newData;
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
                // Отслеживание изменений.
                if (this.options.components![index].propertyValue !== tempValue) {
                    this.options.components![index].isChange = true;
                    this.options.isChange = true;
                }
                this.options.components![index].propertyValue = tempValue;
            }
        } catch (e) {
            console.log('Error setPropertyValue', e);
            throw e;
        }
        return this;
    }

    /**
     * Установка новой формулы.
     * @param componentName Название компонента
     * @param propertyName Название свойства
     * @param formula Формула
     * @returns Entity
     */
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
            if (cmp.propertyFormula !== String(formula)) {
                cmp.isChange = true;
                this.options.isChange = true;
            }
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
        return formulaExecutor3.bind(this)({ key: componentKey }, '', 'preparation');
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

    /**
     * Получить дочернюю сущность по ключу.
     * @param key 
     */
    getChildrenToKey (key: string): Entity | null {
        try {
            return this.getChildren().find(e => e.key === key) || null;
        } catch (e) {
            throw e;
        }
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

    /**
     * Пересчет формул, согласно списку указанном в определении.
     */
    definition () {

    }

    cloneAndRetutning(): Entity {
        return new Entity(this.engine.cloneEntity(this.options.key, this.options.parentKey)!, this.engine);
    }

    produce(): ApiEntity[] {
        return [];
    }

    /**
     * Переопределение свойств сщности и ее дочерних чущностей.
     * Переопределение будет только в том случае, если такое свойство существует.
     * @param entity Переопределыемая сущность
     * @returns Переопределенная сущность.
     */
    propertyPredefinition(entity: Entity): Entity {
        const cmps = this.options.components || [];
        const entities = entity.getDynasty();

        entity.setParentKey(this.options.key); // Присвоение родительского ключа
        entity.setParentId(this.getId()); // Присовение родительского ID

        for (const ent of entities) {
            for (const cmp of ent.getApiComponents()) {
                const index = cmps.findIndex(c => c.componentName === cmp.componentName 
                    && c.propertyName === cmp.propertyName);
                if (index > -1) {
                    cmp.propertyValue = cmps[index].propertyValue;
                }
            }
        }
        return entity;
    }

    produceAndRetutning(): Entity {
        return this.cloneAndRetutning().setSampleId(this.options.id||0);
    }
    /**
     * Получение вложенной сущности по name и note.
     * @returns Entity или null
     */
    getHeirByName({ name, note }: { name: string; note?: string; }): Entity | null {
        try {
            const apiData = this.build();
            const api = apiData.find(e => {
                if (!note || note === '') {
                    return e.name?.toUpperCase() === name;
                }
                return e.name?.toUpperCase() === name.toUpperCase()
                    && e.note?.toUpperCase() === note?.toUpperCase();
            });
            if (!api) return null;
            return this.engine.creator().getEntityToKey(api.key) ||  null;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Добавление дочерней сущности. Принцип основан на копировании передаваемой сущности.
     * Так же новые сущности добавляються в хранилище движка.
     * @param children Либо объект класса Entity либо api данные.
     * @returns This
     */
    addChild(children: ApiEntity[] | Entity): Entity {
        try {
            let candidateChildren: ApiEntity[] = []
            let tempChildren: ApiEntity[] = [];
            let i = 0;
            let buildData = this.build();
            if (children instanceof Entity) tempChildren = children.build();
            else tempChildren = children;
            for (const cld of tempChildren) {
                if (this.getHeirByName({ name: cld.name || '', note: cld.note })) {
                    if (this.key !== cld.key) {
                        cld.note = Engine.getUniqueNote(cld.name || '', cld.note || '', buildData, i++);
                    }
                }
            }
            candidateChildren.push(...<ApiEntity[]>tempChildren);
            this.engine.cloneApiEntityBuildData(candidateChildren, this.options.key);
            return this;
        } catch (e) {
            throw e;
        }
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
        this.options.isChange = true;
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
            return new Component({ 
                componentName: name, 
                componentDescription: cmps[0].componentDescription||'Описание компонента' },
                cmps
            );
        })
    }

    getDynasty (): Entity [] {
        return this.engine.creator().getDynasty(this.options.key);
    }
    /*
    getChildrens(): Entity[] {
        const chlds = this.engine.getСhildren(this.options.key);
        return chlds.map(e => new Entity(e, this.engine));
    }
    */

    getSampleId (): number {
        return this.options.sampleId||0;
    }

    /** Seters */

    setName(value: string): Entity {
        this.options.name = value;
        this.options.isChange = true;
        return this;
    }
    setNote(value: string ): Entity {
        this.options.note = value;
        this.options.isChange = true;
       return this; 
    }

    setCategory(value: string): Entity {
        this.options.category = value;
        this.options.isChange = true;
        return this;
    }

    setParentKey(value: string): Entity {
        this.options.parentKey = value;
        return this;
    }

    setParentId(value: number): Entity {
        this.options.parentId = value;
        return this;
    }

    setSampleId(value: number): Entity {
        this.options.sampleId = value;
        return this;
    }

    getApiComponents({ attributes }: { attributes?: PropertyAttribute[], } = {}): ApiComponent[] {
        try {
            if (attributes && attributes?.length) {
                return (this.options.components || []).filter(c => {
                    let check: boolean = false;
                    const cmpAtt = (c.attributes || "").split(";");
                    for (const att of attributes) {
                        if (cmpAtt.find(ct => ct === att)) {
                            check = true;
                            break;
                        }
                    }
                    return check;
                });
            }
            return this.options.components||[];
        } catch (e) {
            return [];
        }
    }

    /************************************************************************************ */
    /** GETERS */
    /** Получение Id */
    get id(): number {
        return this.getId()
    }

    /** Название сущности. */
    get name(): string {
        return this.getName();
    }
    get note(): string {
        return this.getNote();
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