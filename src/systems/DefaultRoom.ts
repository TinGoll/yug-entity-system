import { PropertyValue } from "..";
import { Engine } from "../Engine";
import Entity from "../Entity";
import Room from "./Room";

import { Subscriber } from "./Subscriber";

export default class DefaultRoom extends Room<string, Subscriber<string, {}>> {
    subscribe(subscriber: Subscriber<string, any>, ...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    unsubscribe(subscriber: Subscriber<string, any>): this {
        throw new Error("Method not implemented.");
    }
    recalculation(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    applyChanges(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    addEntityByKey(key: string, addedKey: string, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
    addPropertyToKey(key: string, propertyKeys: string[], ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
    deleteEntityByKey(keys: string[], ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
    editEntityToKey(key: string, propertyKey: string, value: PropertyValue, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
    build(...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
    notifyRooms(...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
    sendNotificationToSubscribers(...args: any[]): void {
        throw new Error("Method not implemented.");
    }
    sendToOneSubscriber(subscriber: Subscriber<string, any>, ...args: any[]): void {
        throw new Error("Method not implemented.");
    }
    errorLoger(...args: any[]) {
        throw new Error("Method not implemented.");
    }
    constructor(key: string, engine: Engine, entity?: Entity) {
        super(key, engine, entity);
    }
   
}

