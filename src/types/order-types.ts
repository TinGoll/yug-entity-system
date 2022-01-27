import Entity from "../Models/entities/Entity";
import { EntityOptions } from "./entity-types";
/** Элемент массива заказа, состоящий из шапки и тела */
export interface OrderListElement {
    header: Entity;
    body: Entity;
}

export interface OrderOptions {
    id?: number;
    clientId?: number;
    userId?: number;
    note?: string;
}

export interface OrderOptions {
    headerOptions: EntityOptions;
    bodyOptions: EntityOptions;
    prototypes: EntityOptions[];
}