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

// import {
//   insertEntities,
//   insertComponents,
//   loadingEntities,
//   deleteEntities,
//   updateEntities,
//   updateComponents,
//   deleteComponents,
//   loadComponent,
// } from "./testing/db-function";

// const start = async () => {
//   try {
//     const engine = Engine.create().start();
//     const events = engine.events;
//     const creator = engine.creator;
//     events
//       .onCreatedObjects("entity", insertEntities) // Событие записи в бд новой сущности
//       .onCreatedObjects("component", insertComponents) // событие записи в бд нового компонента
//       .onLoad("entity", "Find One", loadingEntities) // событие загрузки сущности из бд
//       .onDeletedObjects("entity", deleteEntities) // Событие удаления сущности из бд.
//       .onDeletedObjects("component", deleteComponents) // Событие удаления сущности из бд.
//       .onUpdatableObjects("entity", updateEntities) // событие обновления в бд  сущности
//       .onUpdatableObjects("component", updateComponents) // событие обновления в бд  компонента
//       .onLoad("component", "Find All", loadComponent); //

//     //************************************************************************************************ */

//     const geo = await creator.create("component", {
//       componentName: "geometry",
//       componentDescription: "Геометрия",
//       componentCategory: "Geometry",
//     });

//     geo.add({
//       propertyName: "height",
//       propertyDescription: "Высота",
//       propertyType: "number",
//       propertyValue: "0",
//     });
//     geo.add({
//       propertyName: "width",
//       propertyDescription: "Ширина",
//       propertyType: "number",
//       propertyValue: "0",
//     });
//     geo.add({
//       propertyName: "amount",
//       propertyDescription: "Высота",
//       propertyType: "number",
//       propertyValue: "0",
//     });
//     geo.add({
//       propertyName: "square",
//       propertyDescription: "Высота",
//       propertyType: "number",
//       propertyValue: "0",
//       propertyFormula: `
//         H = (await ME("geometry", "height")); // number
//         W = (await ME("geometry", "width")); // number
//         A = (await ME("geometry", "amount")); // number
//         MM = 1000;
//         RESULT = H / MM * W / MM * A;
//       `,
//     });

//     const order = await creator.create("entity", {
//       name: "Заказ",
//       category: "order",
//       note: "",
//     });

//     const fasade = await creator.create("entity", {
//       name: "Фасад",
//       category: "fasade",
//       note: "",
//     });

//     fasade.addApiComponents(...geo);

//     for (let i = 0; i < 10; i++) {
//       const f = await order.addChildToKey(fasade.key);
//       f?.setValue("geometry", "height", Math.floor(Math.random() * 916 + 256));
//       f?.setValue("geometry", "width", Math.floor(Math.random() * 916 + 256));
//       f?.setValue("geometry", "amount", Math.floor(Math.random() * 10 + 1));
//     }

//     const roomController = engine.roomController;
//     const room = new DefaultRoom(order.key, engine, order);

//     roomController.add(room.key, room);

//     room.systemsProcessing();

//   } catch (e) {
//     console.log("\x1b[31m%s\x1b[0m", (e as Error).message);
//   }
// };

// start().then(() => console.log("\x1b[35m%s\x1b[0m", "Тестирование завершено."));

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
  Preset,
};
