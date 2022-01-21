import { OrderListElement, OrderOptions } from "../types/order-types";

class Order {
  private options: OrderOptions;
  private elements: OrderListElement[] = []
  constructor(options: OrderOptions) {this.options = {...options};}
  getOptions(): OrderOptions {return this.options;}
  setOptions(options: OrderOptions): Order {this.options = { ...this.options, ...options}; return this;}
}

export default Order;