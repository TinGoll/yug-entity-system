import { Engine } from "../../engine/Engine";
import { ISerializable } from "../../types/engine-interfaces";
import { ApiComponent, ApiOptionsComponent, ComponentProbs, EntityComponent, EntitySnapshot, IGetable, PropertyAttributes, PropertyValue } from "../../types/entity-types";

export class Component {
    private apiComponent: ApiComponent[];
    private componentName: string;
    private componentDescription: string;
    constructor(opt: ApiOptionsComponent, apiComponent: ApiComponent[]) {
        this.componentName = opt.componentName;
        this.componentDescription = opt.componentDescription
        this.apiComponent = apiComponent;
    }

    setName (name: string) : Component {
        for (const component of this.apiComponent.filter(c => c.componentName === this.componentName)) {
            component.componentName = name;
        }
        this.componentName = name;
        return this;
    }
    setDescription(description: string): Component {
        for (const component of this.apiComponent.filter(c => c.componentName === this.componentName)) {
            component.componentDescription = description;
        }
        this.componentDescription = description;
        return this;
    }

    getName (): string {
        return this.componentName;
    }

    getDescription (): string {
        return this.componentDescription;
    }

    build (): ApiComponent[] {
        const buildData: ApiComponent[] = [];
        for (const component of this.apiComponent.filter(c => c.componentName === this.componentName)) {
            buildData.push({...component})
        }
        return buildData;
    }
    
    /**
     * Получение значение свойства компонента.
     * @param propertyName Название свойства
     * @returns PropertyValue (string, number, Date, boolean) 
     */
    getProperty<U extends PropertyValue = string, 
                T extends object | string = string
                >(propertyName: T extends string ? string : keyof T[keyof T]): U | null {
        try {
            const prob = this.apiComponent.find(p => p.componentName === this.componentName && p.propertyName === propertyName);
            if (!prob) return null;
            switch (prob.propertyType) {
                case 'number':
                    return <U>Number(prob.propertyValue);
                case 'date':
                    return <U>(new Date(prob.propertyValue as string));
                case 'boolean':
                    return <U>Boolean(prob.propertyValue);
                case 'string':
                    return <U>String(prob.propertyValue);
                default:
                    return <U>String(prob.propertyValue);
            }
        } catch (e) {
            console.log(e); // сделать событие на ошибку.
            return null;
        }
    }
    /**
     * Присвоение значения свойству компонента.
     * @param propertyName Название свойства.
     * @param value PropertyValue (string, number, Date, boolean). 
     * @returns Component.
     */
    setProperty<U extends PropertyValue = string, T extends object | string = string>
                (propertyName: T extends string ? string : keyof T[keyof T], value: U): Component {
        try {
            const prob = this.apiComponent.find(p => p.componentName === this.componentName && p.propertyName === propertyName);
            if (!prob) throw new Error('Свойство не найдено.');
            const attributes = <PropertyAttributes[]> (prob.attributes?.split(';') || []);
            if (attributes.includes('readonly')) 
                throw new Error('Попытка присвоить значение свойству которое помечено как "Только для чтения".');
            if (prob.propertyType == 'date' && !(value instanceof Date))
                throw new Error('Попытка присвоить значение, которое не является датой.');
            if (prob.propertyType == 'number' && isNaN((value as number)))
                throw new Error('Попытка присвоить значение, которое не является числом.');
            prob.propertyValue = value;
        } catch (e) {
            console.log(e); // сделать событие на ошибку
        }   
        return this;
    }

    addProperty(componentProbs: ComponentProbs): Component {
        const template = this.apiComponent.find(c => c.componentName === this.componentName);
        const candidate = this.apiComponent.find(c => c.componentName === this.componentName && c.propertyName === componentProbs.propertyName);

        if (candidate) {
            candidate.propertyDescription = componentProbs.propertyDescription || '';
            candidate.propertyValue = componentProbs.propertyValue || '';
            candidate.propertyFormula = componentProbs.propertyFormula;
            candidate.propertyType = componentProbs.propertyType;
            candidate.attributes = componentProbs.attributes;
            candidate.bindingToList = componentProbs.bindingToList;
        }else {
            const component: Omit<Partial<ApiComponent>, 'id' | 'entityId' | 'entityKey'> = {
                componentName: this.componentName,
                componentDescription: this.componentDescription || 'Описание компонента',
                ...componentProbs
            }
            Engine.registration(<ISerializable>component)
            this.apiComponent.push(<ApiComponent> component);
        }
        return this;
    }

    get name (): string {
        return this.getName();
    }
    get description(): string {
        return this.getDescription();
    }

}
