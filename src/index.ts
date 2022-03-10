import { Engine } from "./engine/Engine";
import { Component } from "./Models/components/Component";
import Creator from "./Models/Creator";
import { Entity } from "./Models/entities/Entity";
import { ISerializable, EngineObjectType, EngineObject } from "./types/engine-interfaces";
import { ApiComponent, ApiEntity, PropertyAttributes, PropertyTypes, PropertyValue, Unit } from "./types/entity-types";

/*
const engine = new Engine();
const creator = engine.creator();

const entity = creator.create('entity', 'Фасад глухой', { category: 'Фасад', note: 'Фасад глухой - содержит 4 профиля и 1 филёнку' });
console.log(entity.build());
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
