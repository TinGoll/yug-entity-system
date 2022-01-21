import Entity from "../Models/entities/Entity";
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