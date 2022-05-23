import Component from "./Component";
import Engine from "./Engine";
import Entity from "./Entity";
import { FormulaImport } from "./FormulaImport";
import { History, IHistory } from "./History";
import {
  ApiComponent,
  ApiEntity,
  PropertyTypes,
  PropertyValue,
  EngineObjectType,
  PropertyAttribute,
} from "./types/engine-types";
const createEngine = (): Engine => new Engine();

/*

const formulaImport = new FormulaImport();

formulaImport.push("Не правда ли1?");
formulaImport.push("Не правда ли2?");
formulaImport.push("Не правда ли3?");

const txt = formulaImport.build();
//console.log(formulaImport.build());

interface FormulaButton {
  name: string, 
  value: string, 
  import?: string 
}

const importCollection = new FormulaImport<string>();
importCollection.loadStringData(formulaImport.build());
console.log("До удаления", importCollection.build());
importCollection.remove(null, (value) => value == "Не правда ли1?");
console.log("После удаления", importCollection.build());
*/
// функция присвоения id 
/*
const save = (apiEntity: ApiEntity[]): ApiEntity[] => {
  let genEntId = 1;
  let genCmpId = 1;
  for (const ent of apiEntity) {
    if (!ent.id) ent.id = genEntId++;
    const parnt = apiEntity.find(e => e.key === ent.parentKey)
    if (parnt) ent.parentId = parnt.id;
    for (const cmp of (ent.components || [])) {
      cmp.id = genCmpId++;
      cmp.entityId = ent.id;
    }
  }
  return apiEntity;
}

console.time('FirstWay');
const engine = createEngine();
const creator = engine.creator();
const money = creator.create('component', 'money', { componentDescription: "Деньги" })
  .addProperty({ propertyName: 'price', propertyDescription: 'Цена', propertyValue: 0, propertyType: 'number', attributes: "required;" });
const color = creator.create('component', 'finishing', { componentDescription: 'Цвет' })
  .addProperty({ propertyName: 'color', propertyDescription: 'Цвет', propertyValue: 333, propertyType: "number", attributes: "show;required;"})

const entity = creator.create('entity', 'БАТЯ', { category: 'Род сущ', note: 'Главный' }).addComponent(money).addComponent(color);
const entity2 = creator.create('entity', 'СЫН', { category: 'Кат 1', note: 'Средний', }).addComponent(money).addComponent(color);
//const entity3 = creator.create('entity', 'ВНУЧА', { category: 'Кат 2', note: 'Младшая' }).addComponent(money);

//entity2.addChild(entity3.build());
entity.addChild(entity2.build());

const saveData = save(entity.build());

const [fasad] = engine.loadAndReturning(saveData);
const cld1 = fasad.findToName("СЫН")!;
//const cld2 = cld1.findToName("ВНУЧА")!;

fasad.setPropertyFormula('money', 'price', `
  RESULT = ACCUMULATOR('money', 'price',);
`);

// Формула филенки
cld1.setPropertyFormula('money', 'price', `
  const SYN_SREDNIY_FINISHING_COLOR = EXECUTORS.get("ent-syn-notsredniy1-cmp-finishing-prop-color")?.GETTER || DUMMY_GET; 
  const S_SYN_SREDNIY_FINISHING_COLOR = EXECUTORS.get("ent-syn-notsredniy1-cmp-finishing-prop-color")?.SETTER || DUMMY_SET;
  S_SYN_SREDNIY_FINISHING_COLOR(5000);

  //console.log("EXECUTORS", EXECUTORS);
  //console.log("SYN_SREDNIY_FINISHING_COLOR", SYN_SREDNIY_FINISHING_COLOR());

  RESULT = SYN_SREDNIY_FINISHING_COLOR() + 500;
`); 


fasad.addChild(cld1);
const sun2 =  fasad.addChild(cld1).getChildren()[0];

//fasad.recalculationFormulas();

//Engine.setMode("DEV")

fasad.setPropertyValue("money", "price", 500)

console.log("fasad price", fasad.getPropertyValue("money", "price"));

sun2.setPropertyValue("finishing", "color", 2000)

console.log("fasad price 2", fasad.getPropertyValue("money", "price"));

console.log("sun2 price", sun2.getPropertyValue("finishing", "color"));


//console.log(JSON.stringify(fasad.getPreparationData(fasad.getApiComponents()[0].key), null, 2));
//console.log(fasad.getChangedEntities());
//console.log(fasad.getHistoryAndClear());

console.timeEnd('FirstWay');

*/

export default createEngine;
export {
  Engine,
  Entity,
  Component,
  ApiComponent,
  ApiEntity,
  PropertyTypes,
  PropertyValue,
  EngineObjectType,
  PropertyAttribute,
  IHistory,
  History,
  FormulaImport
};
