
import { OrderOptions } from "../types/order-types";
import { defaultEntities } from "./default-entities";
import { EntityType } from "./entity-units";

export enum OrderType {
    STANDART = 'standart'
}

export const getOrderOptions = (type: OrderType): OrderOptions => {
    switch (type) {
        case OrderType.STANDART:
            return standartOptions;
        default:
            return standartOptions;
    }
}

/** Стандартные предустановки */
const standartOptions: OrderOptions = {
    header: {
        entity: {
            name: 'Заказ Фасады',
            note: '',
            typeId: EntityType.ENTITY_HEADER
        }
    },
    body: {
        entity: {
            name: 'Список элементов заказа',
            typeId: EntityType.ENTITY_BODY
        }
    },
    prototypes: [defaultEntities.defaultFasade, defaultEntities.defaultPanel]
}