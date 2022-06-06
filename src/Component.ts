import { ApiComponent, ComponentDto, PropertyAttribute, PropertyDto, PropertyType, PropertyValue } from "./@engine-types";
import { Engine } from "./Engine";
import AttributeCreator from "./other/AttributeCreator";


export default class Component {
    properties: ApiComponent[];
    private componentName: string;
    private componentDescription?: string;
    private entityKey?: string;
    private engine: Engine;
    private defaultValues: Array<{type: PropertyType, value: PropertyValue}> = [
        { type: "string", value: "" },
        { type: "number", value: 0},
        { type: "boolean", value: false},
        { type: "date", value: new Date()},

    ]
    constructor({ componentName, componentDescription, entityKey }: ComponentDto, engine: Engine, ...properties: ApiComponent []) {
        this.properties = [];
        this.componentName = componentName;
        this.componentDescription = componentDescription;
        this.engine = engine;
        this.entityKey = entityKey;
        this.concatenate(...properties);
    }
    
    /**
     * Метод создает объект класса AttributeCreator, для формирования атрибутов.
     * @returns AttributeCreator;
     */
    createAttributes(...attributes: PropertyAttribute[]): AttributeCreator {
        return new AttributeCreator(...attributes);
    }

    concatenate(...properties: ApiComponent[]) {
        for (const cmp of properties
            .filter(c => c.componentName === this.componentName)) {
            this.add(cmp);
        }
        return this;
    }

    /**
     * Добавление нового свойства для текущего компонента
     * @param dto  PropertyDto
     * @returns this
     */
    add (dto: PropertyDto): this {
        const { propertyName, propertyDescription = "", propertyType, 
            propertyValue, propertyFormula, attributes, bindingToList } = dto;
        const componentDescription = this.componentDescription || ""  
        const candidateIndex = this.properties.findIndex(p => p.propertyName === propertyName);
        const defaultValue = this.get_dafault_value(propertyType, propertyValue);
        if (candidateIndex > -1) {
            this.properties[candidateIndex] = {
                ...this.properties[candidateIndex],
                propertyType, 
                propertyValue: defaultValue, propertyFormula,
                attributes, bindingToList,
                indicators: {
                    ...this.properties[candidateIndex].indicators,
                    is_changeable: true
                }
            }
            //console.log(`Свойство ${propertyName} компонента ${this.componentName}, было перезаписано новыми данными.`);
            return this;
        }
        const cmp: ApiComponent = {
            id: 0,
            key: this.engine.keyGenerator("cmp:"),
            index: this.nextIndex(),
            componentName: this.componentName,
            componentDescription,
            propertyName,
            propertyDescription,
            propertyValue: defaultValue,
            propertyType,
            indicators: { is_unwritten_in_storage: true, },
            bindingToList,
            attributes,
            propertyFormula,
            entityKey: this.entityKey
        }
        this.properties.push(cmp)
        return this
    }
    /**
     * Количество свойств в компоненте
     * @returns number
     */
    count () {
        return [...this].length
    }
    /**
     * Максимальный index свойства
     * @returns number
     */
    maxIndex (): number {
        const tempIndexes = [...this].map(c => c.index);
        if (!tempIndexes.length) return 0;
        return Math.max(...[...this].map(c => c.index))
    }
    /**
     * Следующий индекс свойства.
     * @returns number
     */
    nextIndex () {
        return this.maxIndex() + 1
    }

    /**
     * Получение компонентов, которые были изменены.
     * @returns ApiComponent[]
     */
    changedComponents (): ApiComponent[] {
        return [...this].filter(c => c.indicators?.is_changeable)
    }
    notRecordedDatabase (): ApiComponent [] {
        return [...this].filter(c => c.indicators.is_unwritten_in_storage)
    }
    /**
     * Удаление отметки об изменении.
     * @returns this;
     */
    removeChangeMarks (): this {
        for (const iterator of this) {
            const { is_changeable, ...indicators } = iterator.indicators;
            iterator.indicators = {
                ...indicators
            }
        }
        return this;
    }
    /**
     * Удаление отметки о записи в базу данных.
     * @returns this;
     */
    removeRecordedMarks(): this {
        for (const iterator of this) {
            const { is_unwritten_in_storage, ...indicators } = iterator.indicators;
            iterator.indicators = {
                ...indicators
            }
        }
        return this;
    }
    /**
     * Установка нового описания для компонента.
     * @param description описание на русском
     * @returns this;
     */
    setDescription(description: string): this {
        for (const iterator of this) {            
            iterator.componentDescription = description;
            iterator.indicators = { ...iterator.indicators, is_changeable: true }
        }
        this.componentDescription = description;
        return this
    }
    /**
     * Установка нового имени (на английском) для компонента.
     * @param name новое имя компонента.
     * @returns this
     */
    rename (name: string): this {
        for (const iterator of this) {
            iterator.componentName = name;
            iterator.indicators = { ...iterator.indicators, is_changeable: true}
        }
        this.componentName = name;
        return this
    }
    private get_dafault_value(type: PropertyType, value?: PropertyValue): PropertyValue {
        if (value) return value;
        const dVal = this.defaultValues.find(d => d.type === type);
        return dVal ? dVal.value : ""
    }
    /** Получение имени компонента */
    get name (): string {return this.componentName}
    /** Получение описания компонента на руссом */
    get description (): string {return this.componentDescription || ""}
    /** Установка описания на русском языке */
    set description(description: string) { this.setDescription(description)}
    /** Установка нового имени компонента */
    set name (name: string) { this.rename(name)}
    /** Итератор класса */
    [Symbol.iterator] () {
        function* sequence(properties: ApiComponent[]) {
            for (const iterator of properties) {
                yield iterator;
            }
        }
        return sequence(this.properties
            .filter(c=>c.componentName === this.componentName));
    } 
}

