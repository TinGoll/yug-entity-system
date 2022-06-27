import { ApiComponent, ApiEntity, EntityIndicators, EntityShell, PropertyAttribute, PropertyType, PropertyValue } from "./@engine-types";
import Component from "./Component";
import { Engine } from "./Engine";
import { formulaExecutor } from "./FormulaExecutor";

export default class Entity {
    private _shell: EntityShell;
    private _engine: Engine;

    constructor(shell: EntityShell, engine: Engine) {
        this._shell = shell;
        this._engine = engine;
    }

    /**
     * Получение интерактивного компонента.
     * @param componentName 
     * @returns 
     */
    getComponent (componentName: string): Component | null {
        const componentsApi = this.getComponents().filter(cmp => cmp.componentName === componentName);
        if (!componentsApi.length) return null;
        return new Component(componentsApi[0], this.engine, ...componentsApi);
    }
    /**
     * Установить новые свойства компонента.
     * Новый компонент, полностью заменит все свойства этого компонента, и удалит те, которых нет в новом.
     * @param components Объекты класса компонента
     */
    setComponent(...components: Component[]): this {
        for (const component of components) {
            const componentName = component.prevName;
            this._shell.options.components =  [...this._shell.options.components.filter(c => c.componentName !== componentName), ...[...component]] 
        }
        this.setChangeable(false, true)
        return this;
    }


    /**
     * Добавление компонента в сущность.
     * @param apiComponents 
     * @returns 
     */
    addApiComponents(...apiComponents: ApiComponent[]): this {
        const cmps = this.engine.cloneApiComponent(apiComponents);
        this.shell.options.components = [
            ...this.engine.creator.concatenateApiComponents(...this.shell.options.components, ...cmps)
        ]
        return this;
    }
    /**
     * Установить новый набор компонентов.
     * @param apiComponents 
     * @returns 
     */
    setApiComponents(...apiComponents: ApiComponent[]): this {
        for (const cmp of apiComponents) {
            const index = this._shell.options.components.findIndex(c => c.componentName === cmp.componentName && c.propertyName === cmp.propertyName);
            if (index > -1) {
                const { id, key, entityKey, sampleKey, ...other } = cmp;
                this._shell.options.components = [...this._shell.options.components, { ...this._shell.options.components[index], ...other }]
            }else{
                cmp.entityKey = this.key;
                this._shell.options.components.push(cmp);
            }
        }
        return this;
    }

    /**
     * Получение данных для редактора формул
     */
    getPreparationData(componentKey: string) {
        const cmp = this.getComponents().find(c => c.key === componentKey);
        if (!cmp) return;
        return formulaExecutor.bind(this)(cmp, '', 'preparation');
    }
    /**
     * Присвоение новой формулы
     * @param componentKey ключ компонента
     * @param formula текст формулы или null
     * @returns this
     */
    setForlmula(componentKey: string, formula: string | null): this {
        try {
            const cmp = this.getComponents().find(c => c.key === componentKey);
            if (!cmp) throw new Error("Компонента с таким ключем не существует.");
            if (!formula) {
                cmp.propertyFormula = undefined;
            }else{
                cmp.propertyFormula = formula;
            }
            cmp.indicators = { ...cmp.indicators, is_changeable: true}
            this.setChangeable(false, true);
            return this;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Присвоить атрибуты
     * @param componentKey 
     * @param attribute 
     * @returns 
     */
    setAttribute(componentKey: string, attribute: string | null) {
        try {
            const cmp = this.getComponents().find(c => c.key === componentKey);
            if (!cmp) throw new Error("Компонента с таким ключем не существует.");
            if (!attribute) {
                cmp.attributes = undefined;
            } else {
                cmp.attributes = attribute;
            }
            cmp.indicators = { ...cmp.indicators, is_changeable: true }
            this.setChangeable(false, true);
            return this;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Присвоить метку об изменении.
     * @param entity измененеи сущности.
     * @param component изменение компонента сущности.
     */
    setChangeable (entity: boolean, component?: boolean) {
        const indicators: EntityIndicators = {}
        if (entity) {
            indicators.is_changeable = true;
        }
        if (component) {
            indicators.is_changeable_component = true;
        }
        this._shell.options.indicators = { ...this._shell.options.indicators, ...indicators }
    }

    async build (): Promise<ApiEntity[]> {
        const shells = await this.engine.find(this.key, "children and me");
        return shells.map(shell => ({...shell.options, components: [
            ...(shell.options.components.map(cmp => ({...cmp})))
        ]}))
    }

    async fullBuild(): Promise<ApiEntity[]> {
        const shells = await this.engine.find(this.key, "all offspring");
        //shells.push(this.shell) добавляется в режиме "all offspring"
        return shells.map(shell => ({
            ...shell.options, components: [
                ...(shell.options.components.map(cmp => ({ ...cmp })))
            ]
        }))
    }

    // ДОБАВЛЕНИЕ / УДАЛЕНИЕ СУЩНОСТЕЙ

    /**
     * Удаление вложенной сущности по ключу. 
     * @param key ключ удаляемой сущности
     * @returns [deletedKeys, dependencyKeys] кортеж из массива удаленных ссущностей, в данном слчае с одним ключом и массивом ключей зависимостей.
     */
    async deleteEntityToKey(key: string): Promise<[string[], string[]]> {
        if (this.key === key) return [[], []];
        return this.exist(key).then(result => { 
            if (result) return this._engine.deleteEntityShell([key]);
            else return [[], []]; 
        })
    }
    /**
     * Добавление дочерней сущности в текущую, по ключу сущности донора.
     * Будет создана новая сущность, в качестве дочерней текущей сущности.
     * @param key ключ добавляемой сущности.
     * @returns доабавленная Entity (новый объект).
     */
    async addChildToKey (key: string): Promise<Entity | null> {
        const newChildShell = await this._engine.cloneEntityShell(key, this.key);
        if (!newChildShell) return null;
        return this._engine.creator.shellToEntity(newChildShell);
    }

    // СУЩНОСТИ ЗАВИСИМОСТИ

    /**
     * Сущестует ли сущность в потомках данной.
     * @param key ключу искомой сущности
     * @returns boolean;
     */
    async exist(key: string): Promise<boolean> {
        if (this.key === key) return true;
        const shells = await this._engine.find(this.key, "all offspring");
        let result: boolean = false;
        for (const iterator of shells) {
            if (iterator.options.key === key) {
                result = true;
                break;
            }
        }
        return result;
    }
    /**
     * Существует ли свойство компонента.
     * @param componentName Название компонента
     * @param propertyName название свойства
     * @returns boolean;
     */
    existComponent(componentName: string, propertyName: string): boolean {
        return Boolean(this._shell.options.components
            .find(c => c.componentName === componentName && c.propertyName === propertyName))
    }


    /**
     * Массив дочерних сущностей
     * @returns Promise<Entity[]> 
     */
    async getChildren (): Promise<Entity[]> {
        const shells = await this.engine.find(this.key, "only children");
        return this.engine.creator.convertShellEntitiesToEntities(...shells);
    }

    /**
     * Получить сущность по ключу. (в том числе и текущую)
     * @param key ключ искомой сущности
     * @returns Promise<Entity | null>
     */
    async getEntityToKey(key: string): Promise<Entity | null> {
        if (key === this.key) return this;
        const shells = await this._engine.find(key, "all offspring");
        const shell = shells.find(sh => sh.options.key === key);
        if (!shell) return null;
        return this._engine.creator.shellToEntity(shell); 
    }

    // ПОЛУЧЕНИЕ И УСТАНОВКА СВОЙСТВ

    /**
     * Получить измененные сущности.
     * Будут добавлены сущности, а которых были изменены компоненты.
     */
    async getChangedEntities(): Promise<Entity[]> {
        const tempArr: Entity[] = [];
        // if (this._shell.options?.indicators.is_changeable || this._shell.options?.indicators.is_changeable_component) {
        //     tempArr.push(this); Присутствет в режиме "all offspring"
        // }
        const entityShells = await this.engine.find(this.key, "all offspring");
        for (const iterator of entityShells) {
            if (iterator.options?.indicators.is_changeable || iterator.options?.indicators.is_changeable_component) {
                tempArr.push(this.engine.creator.shellToEntity(iterator));
            }
        }
        return tempArr;
    }

    getNotRecordedComponents (): ApiComponent[] {
        return this._shell.options.components.filter(cmp => cmp.indicators.is_unwritten_in_storage);
    }

    getNotUpdatedComponents(): ApiComponent[] {
        return this._shell.options.components.filter(cmp => cmp.indicators.is_changeable)
    }

    getNotNotificated(): ApiComponent[]  {
        return this._shell.options.components.filter(cmp => cmp.indicators.is_not_sent_notification)
    }

    /**
     * Сброс отметок об изменении
     */
    unmarkСhanges (): void {
        // const { is_changeable, is_changeable_component, ...indicators } = this.shell.options.indicators;
        // this.shell.options.indicators = { ...indicators }; Присутствет в режиме "all offspring"

        this.engine.find(this.key, "all offspring").then(shells => {
            for (const iterator of shells) {
                const { is_changeable, is_changeable_component, ...indic } = iterator.options.indicators;
                iterator.options.indicators = { ...indic };
            }
        })
    }



    /**
     * Пересчет формул, и получение всех измененных свойств.
     */
    async recalculation(): Promise<ApiComponent[]> {
        const tempArr: ApiComponent[] = [];
        this._shell.options.components.forEach(async (component) => {
            if (component.propertyFormula) {
                const val = await this.get_property_value(component);
                if (component.indicators.is_changeable) tempArr.push(component);
            }
        });
        const children = await this.getChildren();
        for (const iterator of children) {
            const cmps = await iterator.recalculation();
            tempArr.push(...cmps);
        }
        return tempArr;
    }

    /**
     * Отправка изменений в хранилище.
     */
    writeChanges () {
        this.getChangedEntities()
            .then(entities => this._engine.updateEntityShell(entities.map(e => e.shell)));
    }


    /**
     * Получить значение компонента сущности.
     * @deprecated Устаревший метод, используйте getValue();
     * @param componentName Имя компонента
     * @param propertyName Имя свойства
     * @returns значение PropertyValue
     */
    async getPropertyValue(componentName: string, propertyName: string): Promise<PropertyValue | null > {
        return this.getValue(componentName, propertyName);
    }

    /**
     * Получить значение компонента сущности. (Если у компонента есть формула, она будет просчитана)
     * @param componentName Имя компонента
     * @param propertyName Имя свойства
     * @returns значение PropertyValue
     */
    async getValue(componentName: string, propertyName: string): Promise<PropertyValue | null> {
        try {
            const cmp = this._shell.options.components?.find(c =>
                c.componentName === componentName && c.propertyName === propertyName
            );
            if (!cmp) throw new Error(`getValue: <${this.name} (${this.category})> Свойство ${<string>propertyName} компонента ${componentName} не найдено.`);
            return this.get_property_value(cmp);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Получить значение компонента сущности. (Если у компонента есть формула, она будет просчитана)
     * @param key Ключ компонента
     * @returns значение PropertyValue
    */
    async getValueToKey(key: string): Promise<PropertyValue | null> {
        try {
            const cmp = this._shell.options.components?.find(c => c.key === key);
            if (!cmp) throw new Error(`getValueToKey: <${this.name} (${this.category})> Свойство ключу <${key}> не найдено.`);
            return this.get_property_value(cmp);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Присвоить значение по имени комопнента и имени свойства.
     * @param key Ключ компонента 
     * @param value значение PropertyValue 
     * @returns this 
     */
    setValueToKey(key: string, value: PropertyValue, manualChange: boolean = true): this {
        const cmp = this._shell.options.components?.find(c => c.key === key);
        if (!cmp) throw new Error(`getValueToKey: <${this.name} (${this.category})> Свойство по ключу <${key}> не найдено.`);
        return this.set_property(cmp, value, manualChange)
    }

    /**
     * Присвоить значение по имени комопнента и имени свойства.
     * @param componentName Имя компонента 
     * @param propertyName Имя свойства 
     * @param value значение PropertyValue 
     * @returns this 
     */
    setValue(componentName: string, propertyName: string, value: PropertyValue, manualChange: boolean = true): this {
        const cmp = this._shell.options.components?.find(c =>
            c.componentName === componentName && c.propertyName === propertyName
        );
        if (!cmp) throw new Error(`setValue: <${this.name} (${this.category})> Свойство  <${propertyName}> комопнента <${componentName}> не найдено.`);
        return this.set_property(cmp, value, manualChange);
    }

    /**
     * Приватный метод, для изменения свойств сущности. 
     * @param cmp Свойство
     * @param value Новое значение
     * @param manualChange Mode , в случае false, будут игнорироватся атрибуты
     * @returns this;
     */
    private set_property(cmp: ApiComponent, value: PropertyValue, manualChange: boolean = true): this {
        try {
            if (!cmp) throw new Error("Некорректный объект компонента.");
            const isReadonly = this.attribute_exists(cmp, "readonly");
            const previusValue: PropertyValue = cmp.propertyValue;
            const type = cmp.propertyType;
            let tempValue: PropertyValue;
            if (isReadonly && manualChange) throw new Error("Изменение свойства запрещено, так как установлен 'readonly' атрибут.");
            switch (type) {
                case 'string': tempValue = String(value);
                    break;
                case 'boolean': tempValue = Boolean(value);
                    break;
                case 'number': tempValue = Number(value);
                    break;
                case 'date': tempValue = new Date(<string>value);
                    break;
                default: tempValue = String(value);
            }

            if (tempValue !== previusValue) {
                // Устанавливаем индикаторы, о изменении компонента. 
                cmp.indicators = { ...cmp.indicators, is_changeable: true };
                // Устанавливам индикатор, о изменении компонента в родительской сущности
                this._shell.options.indicators = { ...this._shell.options.indicators, is_changeable_component: true };

                // Сохраняем предыдущее значение
                cmp.previousValue = String(previusValue);
                
                // присваимваем новое значение
                cmp.propertyValue = String(tempValue);

                // Записать в историю.
                // TODO
    
                // Отправка на сохранение данных в хранилище.
                // ******************************************************
                // Делегируем задачу по обновлению, на вызывающую сторону, 
                // Для того, что бы обновлять данные массивом, после пересчета формул.
                // ******************************************************
            }
            return this;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Возврат значения компонента с вычислением формулы и конвертацией значения согласно типа.
     * @param cmp компонент.
     * @returns значение компонента.
     */
    private async get_property_value(cmp: ApiComponent): Promise<PropertyValue | null> {
        try {
            if (!cmp) throw new Error("Некорректное свойство компонента.")
            const type: PropertyType = cmp.propertyType || 'string';
            const previusValue = this.convert_value_by_type(type, cmp.propertyValue);
            const formula = cmp.propertyFormula;
            let value: PropertyValue | null = null;
            if (formula && formula != '') {
                const formulaResult = <PropertyValue | null>(await formulaExecutor.call(this, cmp, formula, "execution"));
                value = formulaResult === null? null : this.convert_value_by_type(type, formulaResult) ;
                if (value! == previusValue) {
                    this.set_property(cmp, value, false);
                    cmp.indicators = {...cmp.indicators, is_changeable: true};
                    this._shell.options.indicators = { ...this._shell.options.indicators, is_changeable_component: true}
                }
                
            } else {
                value = this.convert_value_by_type(type, previusValue);
            }
            return value;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Приватный метод, конвертирование значения, согласно указанного типа.
     * @param type Тип свойства компонента
     * @param value Конвертируемое значение.
     * @returns Результат конвертирования.
     */
    private convert_value_by_type(type: PropertyType, value: PropertyValue) {
        switch (type) {
            case 'string': return String(value); // Преобразование в строку
            case 'boolean': return Boolean(value); // Преобразование в boolean
            case 'number': return Number(value); // Преобразование в число
            case 'date': return new Date(<string>value); // Преобразование в дату
            default: return value; // возврат значения в том же виде.
        }
    }

    /**
     * Существует ли атрибут
     * @param componentName Название компонента
     * @param propertyName Название свойства
     * @param attribute Искомый атрибут
     * @returns boolean
     */
    existAttribute(componentName: string, propertyName: string, attribute: PropertyAttribute): boolean {
        try {
            if (!componentName || !propertyName || !attribute) return false;
            const cmp = (this._shell?.options?.components || [])
                .find(c => c.componentName === componentName && c.propertyName === propertyName);
            if (!cmp) return false;
            return this.attribute_exists(cmp, attribute);
        } catch (e) {
            throw e;
        }
    }
    /**
     * Приватный, технический метод, поиска атрибута
     * @param cmp ApiComponent
     * @param attribute PropertyAttribute
     * @returns boolean
     */
    private attribute_exists(cmp: ApiComponent, attribute: PropertyAttribute): boolean {
        try {
            const findAtt = attribute?.replace(/\s+/g, '').replace(/\;/g, "");
            const attributeArr = (cmp.attributes?.replace(/\s+/g, "").split(";")) || [];
            return !!(attributeArr.find(a => a.toUpperCase() === findAtt.toUpperCase()));
        } catch (e) {
            console.log('attribute_exists', (e as Error).message);
            return false;
        }
    } 

    // Гетеры

    /**
     * Получение родительской сущности
     * @returns Promise<Entity | null>
     */
    async getParent (): Promise<Entity | null> {
        // Получаем оболочку родительской сущности.
        const shell = await this.engine.findParent(this._shell.options.key);
        if (!shell) return null;
        return this._engine.creator.shellToEntity(shell);
    }
    get parent():Promise<Entity | null > {
        return this.getParent()
    }

    /**
     * Получение главной сущности.
     * @returns Promise<Entity | null> 
     */
    async getOverEntity (): Promise<Entity | null> {
        const shell = await this._engine.findAncestor(this._shell.options.key)
        if (!shell) return null;
        return this._engine.creator.shellToEntity(shell);
    }
    /**
     * Получение "братских" сущностей.
     * @returns Promise<Entity[]>
     */
    async getBrothers (): Promise<Entity[]>{
        return (await this.getParent())?.getChildren() || [];
    }
    /**
     * Получение всех зависимых сущностей, для текущей сущности.
     * начиная от высшей, до всех дочерних в том числе и сама сущность
     * @returns 
     */
    async getDynasty (): Promise<Entity[]> {
        const dynasy = await this.engine.findDynasty(this._shell.options.key);
        return dynasy.map(sh => this.engine.creator.shellToEntity(sh));
    }

    /** Получить список компонентов сущности */
    getId(): number {return this._shell.options.id || 0}
    getComponents (): ApiComponent[] {return this._shell.options.components || []}
    /** Список (объект) индикаторов сущности */
    getIndicators (): EntityIndicators {return this._shell.options.indicators}
    /** Индекс сущности */
    getIndex(): number {return this._shell.options.index || 0;}
    /** Ключ сущности */
    getKey (): string {return this._shell.options.key || "";}
    /** Родительский ключ сущности */
    getParentKey(): string | null {return this._shell.options.parentKey || null;}
    /** Ключ шаблона сущности */
    getSampleKey (): string | null {return this._shell.options.sampleKey || null;}
    /** Описание сущности */
    getNote (): string {return this._shell.options.note || ""}
    /** Тип сущности */
    getType (): string {return this._shell.options.type || ""}
    /** Сатегория сущности */
    getCategory(): string {return this._shell.options.category || ""}
    /** Имя сущности */
    getName(): string {return this._shell.options.name}
    /** Получить объект движка */
    getEngine(): Engine {return this._engine;}
    /** Получить объект оболочки */
    getShell (): EntityShell {return this._shell;}
    get id (): number {return this.getId()}
    /** Имя сущности */
    get name(): string {return this.getName();}
    /** Получить объект движка */
    get engine (): Engine {return this.getEngine();}
    /** Получить объект оболочки */
    get shell (): EntityShell {return this.getShell();}
    /** Описание сущности */
    get note(): string {return this.getNote();}
    /** Тип сущности */
    get type(): string {return this.getType();}
    /** Сатегория сущности */
    get category(): string {return this.getCategory();}
    /** Индекс сущности */
    get index (): number {return this.getIndex();}
    /** Ключ сущности */
    get key (): string {return this.getKey();}
    /** Родительский ключ сущности */
    get parentKey (): string | null {return this.getParentKey();}
    /** Ключ шаблона сущности */
    get sampleKey (): string | null {return this.getSampleKey();}
    /** Получить список компонентов сущности */
    get components(): ApiComponent[] { return this.getComponents();}
    /** Список (объект) индикаторов сущности */
    get indicators(): EntityIndicators { return this.getIndicators(); }
}