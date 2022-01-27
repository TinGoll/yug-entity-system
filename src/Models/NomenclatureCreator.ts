import Engine from "../engine/Engine";
import { EntityOptions, NomenclatureCreatorOptions } from "../types/entity-types";
import { DefaultSample, samples } from "../utils/default-sample";
import { EntityType, Unit } from "../utils/entity-units";

import { EntityProduct } from "./entities/EntityProduct";



export default class NomenclatureCreator {
    private _key?: string;
    private _nomenclature?: EntityProduct;
    private _nomenclatureList: EntityProduct[] = [];
    constructor() {}
    public newNomenclature(name: string, opt?: NomenclatureCreatorOptions): EntityProduct {

        const entity = <EntityProduct> Engine.create(this.createEmpty(name));
        const entityOptions = entity.getOptions();

        if (opt?.prototype) {
            const sampleState = opt?.prototype.build();
            sampleState.options.key = entityOptions.key;
            sampleState.options.parentKey = undefined;
            entity.setState(sampleState).setName(name);
        } else if (opt?.sample) {
            entity.setState(samples.get(opt.sample)).setName(name);
        }
        if (opt?.unit) entity.setUnit(opt.unit)
        this._nomenclature = entity;
        return entity;
    }

    public save(): EntityProduct | null {
        if (!this._nomenclature) return null;
        this._nomenclatureList.push(this._nomenclature)
        return this._nomenclature;
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