import Engine from "../engine/Engine";
import { EntityOptions } from "../types/entity-types";
import { DefaultSample, samples } from "../utils/default-sample";
import { EntityType, Unit } from "../utils/entity-units";

import { EntityProduct } from "./entities/EntityProduct";

interface NomenclatureCreatorOptions {
    sample?: DefaultSample;
    prototype?: EntityProduct;
    unit?: Unit;
}

export default class NomenclatureCreator {
    private _key?: string;
    private _nomenclature?: EntityProduct;
    private _nomenclatureList: EntityProduct[] = [];
    private _defaultName: string = 'Новая номенклатура';
    constructor() {}
    public newNomenclature(name: string, opt?: NomenclatureCreatorOptions): EntityProduct {

        const entity = <EntityProduct> Engine.create(this.createEmpty(name));
        const entityOptions = entity.getOptions();

        if (opt?.prototype) {
            const sampleState = opt?.prototype.build();
            sampleState.options.key = entityOptions.key;
            sampleState.options.parentKey = undefined;
            sampleState.options.entity.name = name;
            entity.setState(sampleState);
        } else if (opt?.sample) {
            entity.setState(samples.get(opt.sample));
        }
        if (opt?.unit) entity.setUnit(opt.unit)
        this._nomenclature = entity;
        return entity;
    }

    public nomenclatureNames (): string[] {
        return this._nomenclatureList.map(n => n.getName()||'Нет имени')
    }

    public get nomenclature () : EntityProduct | null {
        return this._nomenclature||null;
    }

    private createEmpty(name: string): EntityOptions {
        return {
            entity: {
                name: name,
                typeId: EntityType.ENTITY_PRODUCT
            },
            components: {},
        }
    }
}