import { Engine } from "./engine/Engine";
import { Component } from "./Models/components/Component";
import Creator from "./Models/Creator";
import { Entity } from "./Models/entities/Entity";
import { ISerializable, EngineObjectType, EngineObject } from "./types/engine-interfaces";
import { ApiComponent, ApiEntity, KeyType, PropertyAttributes, PropertyTypes, PropertyValue, Unit } from "./types/entity-types";

/*
 const engine = new Engine();
  const creator = engine.creator();
  const component = creator.create('component', 'geometry', { componentDescription: 'Геометрия' });
  component
  .addProperty({ propertyName: 'height', propertyType: 'number', propertyDescription: 'Высота', propertyValue: 0 })
  .addProperty({ propertyName: 'width', propertyType: 'number', propertyDescription: 'Ширина', propertyValue: 0 })
  .addProperty({ propertyName: 'amount', propertyType: 'number', propertyDescription: 'Кол-во', propertyValue: 0 });

  const entity = creator.create('entity', 'Фасад глухой', { category: 'Фасад', note: 'Фасад глухой - содержит 4 профиля и 1 филёнку' });
  const entityFilenka = creator.create('entity', 'Филёнка', { category: 'Филёнка', note: 'Филёнка фасада глухого' }).addComponent(component.build());
  const entityProfile1 = creator.create('entity', 'Профиль левый', { category: 'Профиль', note: 'Профиль фасада глухого' }).addComponent(component.build());
  const entityProfile2 = creator.create('entity', 'Профиль правый', { category: 'Профиль', note: 'Профиль фасада глухого' }).addComponent(component.build());
  const entityProfile3 = creator.create('entity', 'Профиль нижний', { category: 'Профиль', note: 'Профиль фасада глухого' }).addComponent(component.build());
  const entityProfile4 = creator.create('entity', 'Профиль верхный', { category: 'Профиль', note: 'Профиль фасада глухого' }).addComponent(component.build());

  entity.addChild(entityFilenka).addChild(entityProfile1).addChild(entityProfile2).addChild(entityProfile3).addChild(entityProfile4)


entity.addComponent(component.build());
console.log(entity.build());

const engine = new Engine();
const creator = engine.creator();
const component = creator.create('component', 'ComponentTest', {componentDescription: 'Тестовый компонент'});
component.addProperty({propertyName: 'testProperty', propertyType: 'string'})
console.log(JSON.stringify(component.build(), null, 2));
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
  Creator,
  KeyType
};
