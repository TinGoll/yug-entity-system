
import { timing } from "./@decorators";
import { ApiEntity, ApiComponent, PropertyValue, PropertyType, PropertyAttribute, ComponentDto, EntityDto } from "./@engine-types";
import Component from "./Component";
import { Engine } from "./Engine";
import AttributeCreator from "./other/AttributeCreator";
import MultipleEmitter from "./other/MultipleEmitter";
import SingleEmitter from "./other/SingleEmitter";
import TimerController from "./other/TimerController";
import Room from "./systems/Room";
import RoomControllerHeart from "./systems/RoomControllerHeart";
import { Subscriber, SubscriberData } from "./systems/Subscriber";


// import { insertEntities, insertComponents, loadingEntities, deleteEntities, updateEntities, updateComponents } from "./testing/db-function";

// const engine = Engine.create().start();
// const events = engine.events;

// events
//     .onCreatedObjects("entity", insertEntities) // Событие записи в бд новой сущности 
//     .onCreatedObjects("component", insertComponents) // событие записи в бд нового компонента
//     .onLoad("entity", "Find One", loadingEntities) // событие загрузки сущности из бд
//     .onDeletedObjects("entity", deleteEntities) // Событие удаления сущности из бд.
//     .onUpdatableObjects("entity", updateEntities) // событие обновления в бд  сущности
//     .onUpdatableObjects("component", updateComponents) // событие обновления в бд  компонента

// events
//     .onNotify("Broadcast", async (...args: any[])=>{
     
        
//     })

// const shell =  engine.createEntityShell({
//     name: "Тест 1",
//     components: [
//         { 
//             componentName: "geo", 
//             propertyName: "h", 
//             propertyType: "number", 
//             index: 0, 
//             key: engine.keyGenerator("cmp:"), 
//             id: 0, 
//             componentDescription: "", 
//             indicators: {}, 
//             propertyDescription: "", 
//             propertyValue: 1000
//         },
//         {
//             componentName: "geo",
//             propertyName: "w",
//             propertyType: "number",
//             index: 0,
//             key: engine.keyGenerator("cmp:"),
//             id: 0,
//             componentDescription: "",
//             indicators: {},
//             propertyDescription: "",
//             propertyValue: 333,
//             propertyFormula: `
//                 const res = await ME("geo", "h");
//                RESULT = THIS;
//             `
//         }
//     ]
// });





// engine.cloneEntityShell(shell.options.key)
//     .then(entityShell => {

//         if (entityShell) {
//             entityShell.options.indicators.is_changeable = true
//             entityShell.options.indicators.is_changeable_component = true
//             entityShell.options.components = entityShell.options.components.map(c => ({...c, indicators: { ...c.indicators, is_changeable: true}}))
//             const r =  engine.updateEntityShell([entityShell])
//             console.log("Моментальный результат обновления", r);

//             engine.creator.open(entityShell.options.key).then(entity => {
//                 if (entity) {   
//                     entity.getValue("geo", "w").then(r => console.log('РЕЗУЛЬТАТ ВЫПОЛЕНЕНИЯ',r))
//                 }
//             })
//         }
//         //  engine.deleteEntityShell([entityShell!.options.key])
//         //      .then((res) => console.log("Финал", res));
        
//     });




// const cmp = new Component({ componentName: "Test", componentDescription: "Тест", entityKey: "sdvdfdnh"}, engine, )

// cmp.rename("NewNameComponent")
// .setDescription("Новое описание для компонента").removeChangeMarks()
// .add({
//     propertyName: "height",
//     propertyType: "number",
//     propertyDescription: "Высота",
//     ...cmp.createAttributes().values()
// })
// .add({
//     propertyName: "width",
//     propertyType: "number",
//     propertyDescription: "Ширина",
//     ...cmp.createAttributes().values()

// })
// .add({
//     propertyName: "depth",
//     propertyType: "number",
//     propertyDescription: "Тощина",
//     ...cmp.createAttributes().values()

// })
// .add({
//     propertyName: "amount",
//     propertyType: "number",
//     propertyDescription: "Кол-во",
//     ...cmp.createAttributes().values()

// })

// const shell = engine.createEntityShell({
//     name: "Тест 1",
//     components: [
//         ...cmp
//     ]
// });

//engine.restart()

//console.log(shell.options.components);

// const shell = engine.creator.create("entity", {
//     name: "Тестовая сущность",
//     components: [
//         {
//             "id": 1,
//             "key": "cmp:0207ff7a-17bf-4dfb-b515-dce50f2f4634",
//             "index": 1,
//             "componentName": "Test",
//             "componentDescription": "Тест",
//             "propertyName": "amount",
//             "propertyDescription": "Кол-во",
//             "propertyValue": 0,
//             "propertyType": "number",
//             "indicators": {},
//             "entityKey": "ent:354bddb4-173b-4061-9a7f-781c9c6c3d9a"
//         }
//     ]
// }, 
//     ...new Component({ componentName: "Test", componentDescription: "Тест", }, engine,)
//     .add({
//      propertyName: "amount",
//      propertyType: "number",
//      propertyDescription: "Кол-во",
//     })
// )

// const shell = engine.creator.create("component", { componentName: "testiculy", componentDescription: "Новый тестовый"}, 
//     {
//         "id": 0,
//         "key": "cmp:10f31ecd-5a13-4c2e-b192-b1cb36681394",
//         "index": 1,
//         "componentName": "Test",
//         "componentDescription": "Тест",
//         "propertyName": "amount",
//         "propertyDescription": "Кол-во",
//         "propertyValue": 0,
//         "propertyType": "number",
//         "indicators": {},
//     },
//     {
//         "id": 0,
//         "key": "cmp:10f31ecd-5a13-4c2e-b192-b1cb36681394",
//         "index": 1,
//         "componentName": "Test",
//         "componentDescription": "Тест",
//         "propertyName": "amount",
//         "propertyDescription": "Кол-во",
//         "propertyValue": 0,
//         "propertyType": "number",
//         "indicators": {},
//     }
// )

//console.log(JSON.stringify(engine.components, null, 2));


// const shell = engine.createEntityShell({
//     name: "Тест 1",
//     components: [
//         {
//             componentName: "geo",
//             propertyName: "h",
//             propertyType: "number",
//             index: 0,
//             key: engine.keyGenerator("cmp:"),
//             id: 0,
//             componentDescription: "",
//             indicators: {},
//             propertyDescription: "",
//             propertyValue: 0
//         }
//     ]
// });




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
    EntityDto
};





















