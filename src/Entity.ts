import { ApiComponent, EntityIndicators, EntityShell, PropertyAttribute, PropertyType, PropertyValue } from "./@engine-types";
import { Engine } from "./Engine";

export default class Entity {
    private _shell: EntityShell;
    private _engine: Engine;

    constructor(shell: EntityShell, engine: Engine) {
        this._shell = shell;
        this._engine = engine;
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
        const candidate = await this._engine.findOne(key);
        if (!candidate) return null;
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
        if (this._shell.options?.indicators.is_changeable || this._shell.options?.indicators.is_changeable_component) {
            tempArr.push(this);
        }
        const entityShells = await this.engine.find(this.key, "all offspring");
        for (const iterator of entityShells) {
            if (iterator.options?.indicators.is_changeable || iterator.options?.indicators.is_changeable_component) {
                tempArr.push(this.engine.creator.shellToEntity(iterator));
            }
        }
        return tempArr;
    }
    /**
     * Сброс отметок об изменении
     */
    unmarkСhanges (): void {
        const { is_changeable, is_changeable_component, ...indicators } = this.shell.options.indicators;
        this.shell.options.indicators = { ...indicators };
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
        })
        const children = await this.getChildren();
        for (const iterator of children) {
            const cmps = await iterator.recalculation();
            tempArr.push(...cmps);
        }
        return tempArr;
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
        if (!cmp) throw new Error(`getValueToKey: <${this.name} (${this.category})> Свойство ключу <${key}> не найдено.`);
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
            const isReadonly = this.existAttribute(cmp.componentName, cmp.propertyName, "readonly");
            const previusValue: PropertyValue = cmp.propertyValue;
            const type = cmp.propertyType;
            let tempValue: PropertyValue;
            if (isReadonly && manualChange) throw new Error("Изменение свойства запрещено, так как установлен 'readonly' атрибут.");
            switch (type) {
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
                    tempValue = String(value);
            }

            if (tempValue !== previusValue) {
                // this.options.isChange = true;
                // cmp.isChange = true;
                // cmp.changedByUser = prod;
                // this.historyRepository
                //     .push(`изменение свойства "${cmp.propertyDescription}": ${previusValue} => ${tempValue}`,
                //         { entityKey: this.key, componentKey: cmp.key }, "high");
                // cmp.propertyValue = tempValue;
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
            const previusValue = cmp.propertyValue;
            const formula = cmp.propertyFormula;
            let value: PropertyValue | null = null;
            if (formula && formula != '') {
                // const result = <PropertyValue | null>(formulaExecutor.bind(this)(cmp, formula, "execution", (err) => {
                //     this.historyRepository.push(`<${this.name}> Ошибка вычисления формулы, свойство ${cmp.propertyDescription}, комопнента ${cmp.componentDescription}: ${err.message}`,
                //         { entityKey: this.key, componentKey: cmp.key }, "error")
                // }));
                // value = this.get_value(type, result === null ? previusValue : result)
               
                // this.setPropertyValueToKey(cmp.key, value, false)
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
            const findAtt = attribute?.replace(/\s+/g, '').replace(/\;/g, "");
            const cmp = (this._shell?.options?.components || [])
                .find(c => c.componentName === componentName && c.propertyName === propertyName);
            if (!cmp) return false;
            const attributeArr = (cmp.attributes?.replace(/\s+/g, "").split(";")) || [];
            return !!(attributeArr.find(a => a.toUpperCase() === findAtt.toUpperCase()));
        } catch (e) {
            throw e;
        }
    }

    // Гетеры

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