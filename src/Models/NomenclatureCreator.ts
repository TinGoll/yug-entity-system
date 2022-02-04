import Engine from "../engine/Engine";
import { ApiComponent, CreateOptions} from "../types/entity-types";
import Component from "./components/Component";

import { EntityProduct } from "./entities/EntityProduct";

export default class NomenclatureCreator {
    private _key?: string;
    private _nomenclature?: EntityProduct;
    private _currentComponent?: Component;
    private _nomenclatureList: EntityProduct[] = [];
    constructor() {}

    /** Сщздание номенклатуры или копонента */
    create(type: 'nomenclature', options: CreateOptions): EntityProduct;
    create(type: 'component', name: string): Component;
    create(type: string, opt: CreateOptions | string): EntityProduct | Component | null{
        switch (type) {
            case 'nomenclature':
                this._nomenclature = Engine.create(opt as CreateOptions);
                return this._nomenclature;
            case 'component':
                this._currentComponent = new Component(opt as string);
                return this._currentComponent
            default:
                Engine.emit('error', { message: 'Неверный тип обекста, введи "nomenclature" для создания Номенклатуры или "component" для создания компонента.'})
                return null
        }
    }

    get currentComponent(): Component | null {
        return this._currentComponent || null;
    }

    saveComponent (): NomenclatureCreator {
        if (!this._currentComponent) {
            Engine.emit('error', { message: 'Текущий компонент не создан или не выбран.' });
            return this;
        }
        this._currentComponent.SaveAsTemplate();
        return this;
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
}