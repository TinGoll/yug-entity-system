import { Engine } from "../Engine";
import Entity from "../Entity";
import Room from "./Room";
import { Subscriber } from "./Subscriber";

export default class DefaultRoom extends Room<string, Subscriber<string, {}>> {
    notifyAllRooms(entityKey: string, action: string, ...args: any[]): void {
        throw new Error("Method not implemented.");
    }
    sendNotificationToSubscribers(action: string, ...args: any[]): void {
        throw new Error("Method not implemented.");
    }
    
    subscribe(subscriber: Subscriber, ...args: any[]): this {
        throw new Error("Метод подписки для комнаты по умолчанию не задан.");
    }

    unsubscribe(subscriber: Subscriber): this {
        throw new Error("Метод отписки для комнаты по умолчанию не задан.");
    }
    
    constructor(key: string, engine: Engine, entity?: Entity) {
        super(key, engine, entity);
    }
   
    async update(dt: number): Promise<void> {

    }

    destroy(): void {

    }
}

