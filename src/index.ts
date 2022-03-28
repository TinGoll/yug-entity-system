import { Engine } from "./engine/Engine";
import { Component } from "./Models/components/Component";
import Creator from "./Models/Creator";
import { Entity } from "./Models/entities/Entity";
import { ISerializable, EngineObjectType, EngineObject } from "./types/engine-interfaces";
import { ApiComponent, ApiEntity, KeyType, PropertyAttributes, PropertyTypes, PropertyValue, Unit } from "./types/entity-types";
import { formulaExecutor } from "./utils/formulaExecutor";

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
*/

/*
const engine = new Engine();
const creator = engine.creator();
const component = creator.create('component', 'ComponentTest', {componentDescription: 'Тестовый компонент'});
component.addProperty({propertyName: 'testProperty', propertyType: 'string'})
console.log(JSON.stringify(component.build(), null, 2));
*/

/*
const engine = new Engine();
const creator = engine.creator();


const geometry = creator.create('component', "geometry", { componentDescription: "Геометрия" })
  .addProperty({ propertyName: 'height', propertyType: 'number', propertyDescription: 'Высота', propertyValue: 0, attributes: "required" })
  .addProperty({ propertyName: 'width', propertyType: 'number', propertyDescription: 'Высота', propertyValue: 0, attributes: "required" })
  .addProperty({ propertyName: 'depth', propertyType: 'number', propertyDescription: 'Высота', propertyValue: 0 })
  .addProperty({ propertyName: 'amount', propertyType: 'number', propertyDescription: 'Высота', propertyValue: 0, attributes: "required" });
const money = creator.create('component', "money", { componentDescription: "Деньги" })
  .addProperty({ propertyName: 'price', propertyType: 'number', propertyDescription: 'Цена', propertyValue: 0, attributes: "required" })
  .addProperty({ propertyName: 'cost', propertyType: 'number', propertyDescription: 'Стоимость', propertyValue: 0, attributes: "required" })
  .addProperty({ propertyName: 'type', propertyType: 'string', propertyDescription: 'Тип', propertyValue: 'Стоимость элемента', attributes: "required" });

const workSborka = creator.create('component', "workSborka", { componentDescription: "Работа сборка" })
  .addProperty({ propertyName: 'cost', propertyType: 'number', propertyDescription: 'Стоимость', propertyValue: 0, attributes: "required" });
const workShlif = creator.create('component', "workShlif", { componentDescription: "Работа шлифовка" })
  .addProperty({ propertyName: 'cost', propertyType: 'number', propertyDescription: 'Стоимость', propertyValue: 0, attributes: "required" });
const workFinishing = creator.create('component', "workFinishing", { componentDescription: "Работа отделка" })
  .addProperty({ propertyName: 'cost', propertyType: 'number', propertyDescription: 'Стоимость', propertyValue: 0, attributes: "required" });

const fasadGluhoy = creator.create('entity', 'Фасад глухой', { category: "Фасад", note: "Это описание фасада.", id: 1 });

const profileTop = creator.create('entity', 'Профиль верхний', { category: "Профиль", id: 2});
const profileLeft = creator.create('entity', 'Профиль левый', { category: "Профиль", id: 3});
const profileBot = creator.create('entity', 'Профиль нижний', { category: "Профиль", id: 4});
const profileRight = creator.create('entity', 'Профиль правый', { category: "Профиль", id: 5});

const filenka = creator.create('entity', 'Филенка Мария Ивановна', { category: "Филёнка", id: 6});
const mdfShild = creator.create('entity', 'Мдф Плита 6 мм.', { category: "МДФ", id: 7});
const rubashka = creator.create('entity', 'Рубашка 1,2 мм', { category: "Рубашка", id: 8});

fasadGluhoy.addComponent(geometry.build()).addComponent(money.build()).addComponent(workFinishing.build()).addComponent(workShlif.build()).addComponent(workSborka.build());
filenka.addComponent(geometry.build()).addComponent(money.build()).addComponent(workFinishing.build()).addComponent(workShlif.build());
profileTop.addComponent(geometry.build()).addComponent(money.build());
profileBot.addComponent(geometry.build()).addComponent(money.build());
profileLeft.addComponent(geometry.build()).addComponent(money.build());
profileRight.addComponent(geometry.build()).addComponent(money.build());

mdfShild.addComponent(geometry.build()).addComponent(money.build());
rubashka.addComponent(geometry.build()).addComponent(money.build());

fasadGluhoy.addChild(filenka.addChild(mdfShild).addChild(rubashka)).addChild(profileTop).addChild(profileBot).addChild(profileLeft).addChild(profileRight);

*/

/*
const res = formulaExecutor.bind(profileTop)(`
  RESULT = VAR_HEIGHT_GEOMETRY_ID1;
`, )
*/


//console.log(JSON.stringify(fasadGluhoy.build() , null, 2));


// Добавление методом клонирования
/*

const engine = new Engine();
const creator = engine.creator();


const ded = creator.create('entity', 'Дед', { category: 'Тестовая сущность', id: 100 });
const syn = creator.create('entity', 'Сын', { category: 'Тестовая сущность', id: 200 });
const vnyk = creator.create('entity', 'Внук', { category: 'Тестовая сущность', id: 300 });

const comp = creator.create('component', 'testComps', { componentDescription: 'Тестовый компонент', });
comp
  .addProperty({ propertyName: 'field1', propertyType: 'string', propertyDescription: 'Поле 1', propertyValue: 'Значение поля 1' })
  .addProperty({ propertyName: 'field2', propertyType: 'string', propertyDescription: 'Поле 2', propertyValue: 'Значение поля 2' });

ded.addComponent(comp.build());
syn.addComponent(comp.build());
vnyk.addComponent(comp.build());

syn.addChild(vnyk);
ded.addChild(syn);


console.log(JSON.stringify(ded.build(), null, 2));

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
  KeyType,
  formulaExecutor
};
