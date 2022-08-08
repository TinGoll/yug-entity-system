import { PropertyValue } from "..";
import { Engine } from "../Engine";
import Entity from "../Entity";
import Room from "./Room";

import { Subscriber } from "./Subscriber";

export default class DefaultRoom extends Room<string, Subscriber<string, {}>> {
  constructor(key: string, engine: Engine, entity?: Entity) {
    super(key, engine, entity);
  }
  subscribe(subscriber: Subscriber<string, any>, ...args: any[]): this {
    return this;
  }
  unsubscribe(subscriber: Subscriber<string, any>): this {
    return this;
  }
  async recalculation(): Promise<any> {
     
  }
  async applyChanges(): Promise<any> {
    
  }
  addEntityByKey(key: string, addedKey: string, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
  addPropertyToKey(
    key: string,
    propertyKeys: string[],
    ...args: any[]
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }
  deleteEntityByKey<D extends unknown = any, K extends unknown = string[]>(
    keys: K,
    ...args: any[]
  ): Promise<D> {
    throw new Error("Method not implemented.");
  }
  editEntityToKey(
    key: string,
    propertyKey: string,
    value: PropertyValue,
    ...args: any[]
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }
  build<D extends unknown = any>(...args: any[]): Promise<D> {
    throw new Error("Method not implemented.");
  }
  notifyRooms(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
  sendNotificationToSubscribers(...args: any[]): void {
    throw new Error("Method not implemented.");
  }
  sendToOneSubscriber(
    subscriber: Subscriber<string, any>,
    ...args: any[]
  ): void {
    throw new Error("Method not implemented.");
  }
  errorLoger(...args: any[]) {
    throw new Error("Method not implemented.");
  }
}
