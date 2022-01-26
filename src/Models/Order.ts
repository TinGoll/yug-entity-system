
import Engine from "../engine/Engine";
import { getOrderOptions, OrderType } from "../utils/order-utils";
import Entity from "./entities/Entity";

class Order {
  private _header: Entity;
  private _body: Entity;
  
  constructor (type: OrderType = OrderType.STANDART) {
    const {header, body, prototypes} = getOrderOptions(type);
    this._header = Engine.create(header);
    this._body = Engine.create(body);
    
  }
}



export default Order;