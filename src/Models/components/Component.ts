import { validate } from "uuid";
import Engine from "../../engine/Engine";
import { ApiComponent, Components, EntityComponent, EntityComponentDescription, EntityComponentProperty, GeometryComponent, PropertyAttributes, PropertyTypes, PropertyValue } from "../../types/entity-types";

interface ComponentProbs extends Partial<EntityComponentProperty> {
    propertyName: string;
    propertyType: PropertyTypes
}

interface EntityComponentPropertyInteractive {
    component: ApiComponent;
    get propertyDescription(): string;
    get propertyValue(): PropertyValue;
    get propertyType(): PropertyTypes
    get propertyFormula(): string;
    get attributes(): string;
    get bindingToList(): boolean;

    set propertyDescription(value: string);
    set propertyValue(value: PropertyValue);
    set propertyType(value: PropertyTypes);
    set propertyFormula(value: string);
    set attributes(value: string);
    set bindingToList(value: boolean);

    addAttributes(att: PropertyAttributes): EntityComponentPropertyInteractive;
    removeAttributes(att: PropertyAttributes): EntityComponentPropertyInteractive;
}

export default class Component {
    private DEFAULT_COMPONENT_NAME = 'Описание копонента на русском'
    private componentFields: ApiComponent[] = []
    private componentName: string;
    private componentDescription: string = this.DEFAULT_COMPONENT_NAME;
    constructor(name: string = 'Новый компонент') {
        this.componentName = name;
    }

    /** Название компонента на английском */
    public getComponentName (): string {
        return this.componentName;
    }

    public build(): ApiComponent[] {
        return [...this.componentFields]
    }

    public setComponent (componentApi: ApiComponent[]): Component {
        const componentName = componentApi[0].componentName;
        const componentDescription = componentApi[0].componentDescription;
        this.componentName = componentName;
        this.componentDescription = componentDescription;
        this.componentFields = [...componentApi]
        return this;
    }

    /** Сохраняем новый компонент в шаблоны */
    public SaveAsTemplate (): Components | null{
        if (!this.validate()) return null;
        return Engine.addTemplateComponent([...this.componentFields]);
    }
    /** Получить имя компонента на английском */
    public setComponentName (value: string): Component {
        this.componentName = value;
        this.componentFields.forEach(c => c.componentName = this.componentName);
        this.componentFields = [...this.componentFields]
        return this;
    }
    /** Получить описание компонента на русском */
    public setComponentDescription(value: string): Component {
        this.componentDescription = value;
        this.componentFields.forEach(c => c.componentDescription = this.componentDescription);
        this.componentFields = [...this.componentFields]
        return this;
    }
    /**
     * Создать новое свойство в компоненте
     * @param probs Набор необходимых параметров для создания свойства компонента
     * @returns Интерактивный обект, позволяющий редактировать свойство не прибегая к мутации
     */
    public crateProperty(probs: ComponentProbs): EntityComponentPropertyInteractive {
        const defaultValue: string = probs.propertyType === 'number' ? '0' : '';
        const component: Required<ApiComponent> = {
            id: 0,
            entityId: 0,
            componentName: this.componentName,
            componentDescription: this.componentDescription,
            propertyName: probs.propertyName,
            propertyDescription: probs.propertyDescription || 'Описание свойства',
            propertyValue: probs.propertyValue || defaultValue,
            propertyFormula: probs.propertyFormula || '',
            propertyType: probs.propertyType,
            attributes: probs.attributes || '',
            bindingToList: probs.bindingToList || false
        }

        this.addProperty(component);

        return this.getInteractivProperty(component);
    }

    private addProperty(componentProperty: ApiComponent) {
        const existingEntryIndex = this.componentFields.findIndex(p => p.propertyName === componentProperty.propertyName);
        if (existingEntryIndex > -1) {
            this.componentFields[existingEntryIndex] = { ...componentProperty};
        } else {
            this.componentFields.push(componentProperty);
        }
        this.componentFields = [...this.componentFields];
    }

    /** Список созданных свойств в комоненте */
    public propertyNames (): string [] {
        return this.componentFields.map(c => c.propertyName);
    }
    /** Колличество свойство в компоненте */
    public propertyCount (): number {
        return this.componentFields.length;
    }
    /** Получаем интерактивный объект для редактирования, по имени свойства */
    public getPropertyToName(nameProperty: string): EntityComponentPropertyInteractive | null {
        const component = this.componentFields.find(c => c.propertyName === nameProperty);
        if (!component) return null;
        return this.getInteractivProperty(component);
    }

    private getInteractivProperty(component: ApiComponent): EntityComponentPropertyInteractive {
        const interactive: EntityComponentPropertyInteractive = {
            component: component,
            get propertyDescription() { return this.component.propertyDescription; },
            get propertyValue() { return this.component.propertyValue!; },
            get propertyType() { return this.component.propertyType!; },
            get propertyFormula() { return this.component.propertyFormula!; },
            get attributes() { return this.component.attributes!; },
            get bindingToList() { return this.component.bindingToList!; },

            set propertyDescription(value: string) { this.component.propertyDescription = value; },
            set propertyValue(value: PropertyValue) { this.component.propertyValue = value; },
            set propertyType(value: PropertyTypes) { this.component.propertyType = value; },
            set propertyFormula(value: string) { this.component.propertyFormula = value; },
            set attributes(value: string) { this.component.attributes = value; },
            set bindingToList(value: boolean) { this.component.bindingToList = value; },

            addAttributes: function (att: PropertyAttributes): EntityComponentPropertyInteractive {
                const attStr = this.attributes + att + ';'
                const setAtt = new Set(attStr.replace(/\s+/g, '').split(';'))
                this.attributes = [...setAtt].join(';')
                return this;
            },

            removeAttributes: function (att: PropertyAttributes): EntityComponentPropertyInteractive {
                const strAtt = this.attributes || '';
                const arrAtt = [...new Set(strAtt.replace(/\s+/g, '').split(';'))]
                this.attributes = arrAtt.filter(a => a !== att).join(';');
                return this;
            }
        }

        return interactive;
    }

    get (): EntityComponent {
        const components =  Engine.componentConverterArrayToObject(this.componentFields);
        return (components)[this.componentName]
    }

    /** Проверка компонента */
    private validate(): boolean {
        const errors: string [] = [];
        const component = Engine.componentConverterArrayToObject(this.componentFields)
        if (<any>component.componentDescription == this.DEFAULT_COMPONENT_NAME) {
            errors.push('Не задано описание / название компонента на русском');
        }
        if (!this.propertyNames().length) {
            errors.push('В компонент не добавлено ни одно свойство.')
        }
        if (errors.length) {
            Engine.emit('on-component-error', {
                component: this,
                componentName: this.componentName,
                err: {
                    message: `Ошибка сохранения копонента "${this.componentName}"`,
                    errors: [...errors]
                }
            })
        }
        return !errors.length;
    }

    public static setComponent(componentApi: ApiComponent[]): Component {
        const componentName = componentApi[0].componentName;
        const componentDescription = componentApi[0].componentDescription;
        const component = new Component(componentName);
        component.componentDescription = componentDescription;
        component.componentFields = [...componentApi]
        return component;
    }
}