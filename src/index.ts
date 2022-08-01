import {
  ApiEntity,
  ApiComponent,
  PropertyValue,
  PropertyType,
  PropertyAttribute,
  ComponentDto,
  EntityDto,
} from "./@engine-types";

import Component from "./Component";
import { Engine } from "./Engine";
import Entity from "./Entity";
import AttributeCreator from "./other/AttributeCreator";
import MultipleEmitter from "./other/MultipleEmitter";

import SingleEmitter from "./other/SingleEmitter";
import TimerController from "./other/TimerController";
import { Preset } from "./presets/Preset";
import Room from "./systems/Room";

import RoomControllerHeart from "./systems/RoomControllerHeart";
import { Subscriber, SubscriberData } from "./systems/Subscriber";

import {
  insertEntities,
  insertComponents,
  loadingEntities,
  deleteEntities,
  updateEntities,
  updateComponents,
  deleteComponents,
  loadComponent,
} from "./testing/db-function";

const start = async () => {
  try {
    const engine = Engine.create();
    const events = engine.events;
    const creator = engine.creator;
    events
      .onCreatedObjects("entity", insertEntities) // Событие записи в бд новой сущности
      .onCreatedObjects("component", insertComponents) // событие записи в бд нового компонента
      .onLoad("entity", "Find One", loadingEntities) // событие загрузки сущности из бд
      .onDeletedObjects("entity", deleteEntities) // Событие удаления сущности из бд.
      .onDeletedObjects("component", deleteComponents) // Событие удаления сущности из бд.
      .onUpdatableObjects("entity", updateEntities) // событие обновления в бд  сущности
      .onUpdatableObjects("component", updateComponents) // событие обновления в бд  компонента
      .onLoad("component", "Find All", loadComponent); //

    //************************************************************************************************ */

    const preset = new Preset();

    const presetCmp = preset.get("work");

    const apiCmp = await engine.createComponentApi(
      undefined,
      undefined,
      ...presetCmp!
    );

    console.log(apiCmp);

    // await engine.loadComponents({
    //   sample: true,
    // });
  } catch (e) {
    console.log("\x1b[31m%s\x1b[0m", (e as Error).message);
  }
};

start().then(() => console.log("\x1b[35m%s\x1b[0m", "Тестирование завершено."));

export default Engine;
export {
  Room,
  RoomControllerHeart,
  Subscriber,
  ApiEntity,
  ApiComponent,
  PropertyValue,
  PropertyType,
  PropertyAttribute,
  AttributeCreator,
  MultipleEmitter,
  SingleEmitter,
  TimerController,
  SubscriberData,
  Component,
  ComponentDto,
  EntityDto,
  Entity,
};
