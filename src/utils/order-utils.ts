
import { OrderOptions } from "../types/order-types";
import { EntityType } from "./entity-units";

export enum StageType {
    STANDART = 'standart'
}

export const getOrderOptions = (type: StageType): OrderOptions => {
    switch (type) {
        case StageType.STANDART:
            return standartOptions;
        default:
            return standartOptions;
    }
}

/** Стандартные предустановки */
const standartOptions: OrderOptions = {
    headerOptions: {
        entity: {
            name: 'Заказ Фасады',
            note: '',
            typeId: EntityType.ENTITY_HEADER
        }
    },
    bodyOptions: {
        entity: {
            name: 'Список элементов заказа',
            typeId: EntityType.ENTITY_BODY
        }
    },
    prototypes: []
}