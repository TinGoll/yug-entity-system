import Engine from "./Engine";
import { ApiComponent, ISerializable } from "./types/engine-types";

export default class Component {
    private componentName: string;
    private componentDescription: string
    private components: ApiComponent []
    constructor({ componentName, componentDescription }: Partial<ApiComponent>, components: ApiComponent[] = []) {
        this.componentName = componentName!;
        this.componentDescription = componentDescription!;
        this.components = components;
    }

    setComponentName (value: string): Component {
        this.componentName = value;
        return this;
    }
    setComponentDescription(value: string): Component {
        this.componentDescription = value;
        return this;
    }

    getComponentName (): string {
        return this.componentName;
    }
    getComponentDescription() {
        return this.componentDescription;
    }



    addProperty(component: Partial<ApiComponent>): Component {
        try {
            Engine.registration(<ISerializable>component);
            const { propertyName, propertyType, propertyDescription = 'Описание свойства', 
                propertyValue = 0, attributes, bindingToList, propertyFormula, key, isChange = false } = component;
            if (!propertyName) throw new Error("Название свойства не может быть пустым.")
            const index = this.components.findIndex(c => 
                c.componentName === this.componentName && c.propertyName === propertyName);
            if (index >= 0) {
                const cmp =  this.components[index];
                this.components[index] = {
                    ...cmp, propertyName, propertyType, propertyDescription,
                    propertyValue, attributes, bindingToList, propertyFormula, key: key!, isChange
                }
            }else {
                this.components.push({
                    componentName: this.componentName,
                    componentDescription: this.componentDescription,
                    propertyName, propertyType, propertyDescription,
                    propertyValue, attributes, bindingToList, propertyFormula,
                    key: key!, isChange
                })
            }
            return this;
        } catch (e) {
            console.log(e);
            return this;
        }
    }

    build (): ApiComponent[] {
        const component: ApiComponent[] = this.components
            .filter(c => c.componentName === this.componentName)
            .map(c => {
                return {...c,  }
            })
        return component;
    }

    clone (): ApiComponent[] {
        const cloneComponent: ApiComponent[] = this.components
            .filter(c => c.componentName === this.componentName)
            .map(c => {
                return {
                    ...c, key: Engine.keyGenerator('cmp:'),
                    entityKey: undefined,
                    entityId: 0
                }
            })
        return cloneComponent;
    }
}