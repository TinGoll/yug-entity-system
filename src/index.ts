import { timing } from "./@decorators";
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
import AttributeCreator from "./other/AttributeCreator";
import MultipleEmitter from "./other/MultipleEmitter";

import SingleEmitter from "./other/SingleEmitter";
import TimerController from "./other/TimerController";
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

    await engine.loadComponents({
      sample: true,
    });

    const entity = await engine.creator.create("entity", {
      name: "Тестовая сущность 1",
      category: "Фасад",
    });

    // entity.addComponentToKeys(
    //   'cmp:e15ff655-cdf1-4884-a570-a6864599227f',
    //   'cmp:0613cf3b-380f-46d5-97e5-0e1f6f960107',
    //   'cmp:26799a43-05c4-4747-9e23-ed04e2636170'
    // );
    // await entity.save()

    entity.addChildToKey(entity.key, async ([ent_1]) => {
      const ent1 = engine.creator.shellToEntity(ent_1);
      ent1.addChildToKey(entity.key, async ([ent_2]) => {
        const ent2 = engine.creator.shellToEntity(ent_2);
        ent2.addChildToKey(entity.key, async ([ent_3]) => {
          const tree = await entity.assembleTree();
          //console.log(JSON.stringify(tree, null, 2));


          const clone = await engine.creator.CreateFromTemplateKey(entity.key, (data) => {
            //console.log(data);
             console.log(engine.get(clone!.key));
          });

        });
      });
    });

 
 
    

    // console.log(entity.getComponents());
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
};
