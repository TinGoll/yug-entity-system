import Component from "./Component";
import Engine from "./Engine";
import Entity from "./Entity";
import {
  ApiComponent,
  ApiEntity,
  PropertyTypes,
  PropertyValue,
EngineObjectType,
} from "./types/engine-types";
const createEngine = (): Engine => new Engine();



const engine = createEngine();
const creator = engine.creator();

const component = creator.create('component', 'geometry', { propertyDescription: "Геометрия"})
    .addProperty({ propertyName: 'height', propertyType: 'number', propertyDescription: "высота" })
    .addProperty({ propertyName: 'width', propertyType: 'number', propertyDescription: "ширина" })
    .addProperty({ propertyName: 'amount', propertyType: 'number', propertyDescription: "кол-во" });



const entity = creator.create('entity', 'Папа');
const entity2 = creator.create('entity', 'Сын');
const entity3 = creator.create('entity', 'Внук');


entity2.addChild(entity3);
entity.addChild(entity2.build());

console.log('assemble', JSON.stringify(entity.assemble(), null, 2));


console.log('deassemble', JSON.stringify(engine.deassembleObjectAndReturning(entity.assemble()).getName(), null, 2));




export default createEngine;
export {
  Engine,
  Entity,
  Component,
  ApiComponent,
  ApiEntity,
  PropertyTypes,
  PropertyValue,
  EngineObjectType
};
