import { Engine } from "./engine/Engine";
import { Component } from "./Models/components/Component";
import Creator from "./Models/Creator";
import { Entity } from "./Models/entities/Entity";
import { ISerializable, EngineObjectType, EngineObject } from "./types/engine-interfaces";
import { ApiComponent, ApiEntity, PropertyAttributes, PropertyTypes, PropertyValue, Unit } from "./types/entity-types";

/*
const engine = new Engine();
const creator = engine.creator();
const component = creator.create('component', 'geometry', {componentDescription: 'Геометрия'});

const entity = creator.create('entity', 'Фасад глухой', { category: 'Фасад', note: 'Фасад глухой - содержит 4 профиля и 1 филёнку' });
component
  .addProperty({ propertyName: 'height', propertyType: 'number', propertyDescription: 'Высота', propertyValue: 0 })
  .addProperty({ propertyName: 'width', propertyType: 'number', propertyDescription: 'Ширина', propertyValue: 0 })
  .addProperty({ propertyName: 'amount', propertyType: 'number', propertyDescription: 'Кол-во', propertyValue: 0 });

entity.addComponent(component.build());
console.log(entity.build()[0].components);
*/

export default Engine;
export {
  ApiEntity,
  ApiComponent,
  Entity,
  Component,
  ISerializable,
  EngineObjectType,
  EngineObject,
  PropertyTypes,
  PropertyValue,
  PropertyAttributes,
  Unit,
  Creator
};
