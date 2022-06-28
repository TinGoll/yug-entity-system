import { Engine } from "../Engine";
import Entity from "../Entity";
import Room from "./Room";
import { Subscriber } from "./Subscriber";

export default class DefaultRoom extends Room<string, Subscriber<string, {}>> {
    build(): Promise<any[]> {
        throw new Error("Method not implemented.");
    }
    constructor(key: string, engine: Engine, entity?: Entity) {
        super(key, engine, entity);
    }
    subscribe(subscriber: Subscriber<string, any>, ...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    unsubscribe(subscriber: Subscriber<string, any>): this {
        throw new Error("Method not implemented.");
    }
    notifyAllRooms(action: string, entityKey: string, ...args: any[]): void {
        throw new Error("Method not implemented.");
    }
    sendNotificationToSubscribers(action: string, ...args: any[]): void {
        throw new Error("Method not implemented.");
    }
    async update(dt: number): Promise<void> {

    }

    sendToOneSubscriber(action: string, subscriber: Subscriber<string, any>, ...args: any[]): void {
        throw new Error("Method not implemented.");
    }

    destroy(): void {

    }
}

