import Engine from "../engine/Engine";
import { ApiComponent, ApiEntityOptions, Components, CreateOptions} from "../types/entity-types";
import Component from "./components/Component";

import { EntityProduct } from "./entities/EntityProduct";

export default class NomenclatureCreator {
    private _nomenclature?: EntityProduct;
    private _currentComponent?: Component;
    constructor() {}

    loadTemplateComponents (components: ApiComponent[]): NomenclatureCreator {
        Engine.clearTemplateComponents();
        Engine.addTemplateComponent(components);
        return this;
    }

    eatSavedData (data: ApiComponent[] | ApiEntityOptions) {
        if ((data as ApiEntityOptions ).signature) {

        } else if ( Array.isArray(data)) {

        }
    }

    /** Сщздание номенклатуры или копонента */
    create(type: 'nomenclature', options: CreateOptions): EntityProduct;
    create(type: 'component', name: string): Component;
    create(type: string, opt: CreateOptions | string): EntityProduct | Component | null {
        switch (type) {
            case 'nomenclature':
                this._nomenclature = Engine.create(opt as CreateOptions);
                return this._nomenclature;
            case 'component':
                this._currentComponent = new Component(opt as string);
                return this._currentComponent
            default:
                Engine.emit('error', { message: 'Неверный тип объекта, введи "nomenclature" для создания Номенклатуры или "component" для создания компонента.'})
                return null
        }
    }

    get currentComponent(): Component | null {
        return this._currentComponent || null;
    }

    saveComponent (): NomenclatureCreator {
        try {
             if (!this._currentComponent) {
                 throw new Error('Текущий компонент не создан или не выбран.')
            }
            this._currentComponent.SaveAsTemplate();
            return this;
        } catch (error) {
            const e = error  as Error;
            Engine.emit('error', { message: e.message });
            return this;
        }
       
    }
    selectCurrentComponent(componentName: string): NomenclatureCreator {
        const compApi = Engine.getTemplateComponentsApiToName(componentName);
        if (compApi.length) {
            this._currentComponent = Component.setComponent(compApi);
        }
        return this;
    }

    componentNames(): string[] {
        return Engine.getTemplateComponentNames();
    }

    getInstanceComponentToName(componentName: string): Component {
        const compApi = Engine.getTemplateComponentsApiToName(componentName);
        const component = Component.setComponent(compApi);
        return component;
    }
    /*** Получение шаблонов комопнетов. */
    getTemplateComponents(): Components {
        return Engine.getTemplateComponents();
    }


}