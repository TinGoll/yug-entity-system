import Component from "./Component";
import Engine from "./Engine";
import Entity from "./Entity";
import {
  ApiComponent,
  ApiEntity,
  PropertyTypes,
  PropertyValue,
} from "./types/engine-types";

const engine = (): Engine => new Engine();

export default engine;
export {
  Engine,
  Entity,
  Component,
  ApiComponent,
  ApiEntity,
  PropertyTypes,
  PropertyValue
};
