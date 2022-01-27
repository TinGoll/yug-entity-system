import { EntityState } from "../types/entity-types";
import { EntityType } from "./entity-units";
const map = new Map<DefaultSample, EntityState>();
export type DefaultSample = 'Фасад' | 'Карниз'

export const emptyState: EntityState = {
    options: {
        entity: {
            name: 'Новая номенклатура'
        },
        components: {
            finishingComponent: {

            },
            geometryComponent: {

            },
            priceComponent: {

            }
        }
    },
    elements: []
}

map.set(
    'Фасад',
    {
        options: {
            entity: {
                name: 'Фасад',
                typeId: EntityType.ENTITY_PRODUCT,
            },
            components: {
                geometryComponent: {
                    height: 0,
                    width: 0,
                    depth: 21,
                    amount: 0,
                },
                priceComponent: {
                    price: 0
                },
                finishingComponent: {
                    colorId: 0,
                    patinaId: 0,
                    varnishId: 0
                }
            }
        },
        elements: [
            {
                options: {
                    entity: {
                        name: 'Филёнка',
                        typeId: EntityType.ENTITY_PRODUCT,
                    },
                    components: {
                        finishingComponent: {
                            colorId: 0,
                            patinaId: 0,
                            varnishId: 0
                        },
                        geometryComponent: {

                        },
                        priceComponent: {
                            price: 0
                        }
                    }
                },
                elements: [
                    {
                        options: {
                            entity: {
                                name: 'Рубашка',
                                typeId: EntityType.ENTITY_PRODUCT,
                            },
                            components: {
                                finishingComponent: {

                                }
                            }
                        },
                        elements: []
                    }
                ]
            }
        ]
    }
)

map.set(
    'Карниз',
    {
        options: {
            entity: {
                name: 'Карниз',
                typeId: EntityType.ENTITY_PRODUCT,
            },
            components: {
                finishingComponent: {
                    colorId: 0,
                    patinaId: 0,
                    varnishId: 0
                },
                geometryComponent: {
                    height: 0,
                    amount: 0
                },
                priceComponent: {
                    price: 0
                }
            },
        },
        elements: []
    }
)

export const samples = {
    get (sample: DefaultSample): EntityState {
        if (!map.has(sample)) return emptyState;
        return map.get(sample)!;
    }
}

