import Engine from "./engine/Engine";
import { EntityOptions, GeometryComponent, FinishingComponent, PriceComponent, ApiEntity, NomenclatureCreatorOptions, ApiComponent } from "./types/entity-types";
import { DefaultSample } from "./utils/default-sample";
import { EntityType } from "./utils/entity-units";

import { StageType } from "./utils/order-utils";


const a: ApiComponent [] = [
    {
        id: 1,
        entityId: 1,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "height",
        propertyDescription: "Высота",
        propertyValue: 916,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 2,
        entityId: 1,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "width",
        propertyDescription: "Ширина",
        propertyValue: 396,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 3,
        entityId: 1,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "depth",
        propertyDescription: "Толщина",
        propertyValue: 30,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 4,
        entityId: 1,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "amount",
        propertyDescription: "Кол-во",
        propertyValue: 30,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 5,
        entityId: 1,
        componentName: "finishing",
        componentDescription: "Отделка",
        propertyName: "color",
        propertyDescription: "Цвет",
        propertyValue: 30,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 6,
        entityId: 1,
        componentName: "finishing",
        componentDescription: "Отделка",
        propertyName: "patina",
        propertyDescription: "Патина",
        propertyValue: 30,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 7,
        entityId: 1,
        componentName: "finishing",
        componentDescription: "Отделка",
        propertyName: "varnish",
        propertyDescription: "Лак",
        propertyValue: 30,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 8,
        entityId: 1,
        componentName: "price",
        componentDescription: "Цена",
        propertyName: "price",
        propertyDescription: "Цена",
        propertyValue: 3000,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
];

const entity = Engine.create({
    signature: {
        name: 're-re'
    },
    components: [...a]
})

console.log(entity.setProperty('geometry', 'height', 1000).build());



/*

interface ComponentApi {
    id?: number;
    entityId?: number;
    componentName: string;
    componentDescription: string;
    propertyName: string;
    propertyDescription: string;
    propertyValue: string | number | Date;
    propertyFormula?: string;
    propertyType?: 'string' | 'number' | 'date';
    attributes?: string;
    bindingToList?: boolean;
}
const a: ComponentApi[] = [
    {
        id: 1,
        entityId: 1,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "height",
        propertyDescription: "Высота",
        propertyValue: 916,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 2,
        entityId: 1,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "width",
        propertyDescription: "Ширина",
        propertyValue: 396,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 3,
        entityId: 1,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "depth",
        propertyDescription: "Толщина",
        propertyValue: 30,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 4,
        entityId: 1,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "amount",
        propertyDescription: "Кол-во",
        propertyValue: 30,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 5,
        entityId: 1,
        componentName: "finishing",
        componentDescription: "Отделка",
        propertyName: "color",
        propertyDescription: "Цвет",
        propertyValue: 30,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 6,
        entityId: 1,
        componentName: "finishing",
        componentDescription: "Отделка",
        propertyName: "patina",
        propertyDescription: "Патина",
        propertyValue: 30,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 7,
        entityId: 1,
        componentName: "finishing",
        componentDescription: "Отделка",
        propertyName: "varnish",
        propertyDescription: "Лак",
        propertyValue: 30,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
    {
        id: 8,
        entityId: 1,
        componentName: "price",
        componentDescription: "Цена",
        propertyName: "price",
        propertyDescription: "Цена",
        propertyValue: 3000,
        propertyType: "number",
        propertyFormula: "",
        attributes: "",
        bindingToList: false,
    },
];

*/

//console.log(Engine.componentConverterArrayToObject(a));
/*
console.log(Engine.componentConverterObjectToArray(Engine.componentConverterArrayToObject(a)));



const groupBy = <T>(array: T[], predicate: (compEntry: T) => string) => {
    return array.reduce((acc, value, index, arr) => {
            (acc[predicate(value)] ||= []).push(value);
            return acc;
        }, {} as { [key: string]: T[] }
    );
}


const componentDestructuring = (obj: ComponentApi) => {
    const { propertyDescription, propertyValue, propertyType, propertyFormula, attributes, bindingToList, entityId, id } = obj;
    return {
        id,
        entityId,
        propertyDescription,
        propertyValue,
        propertyType,
        propertyFormula,
        attributes,
        bindingToList
    }
}



const components = Object.fromEntries(Object.entries(
    groupBy<ComponentApi>(a, (it) => {
        return it.componentName;
    })
).map(e => {
    return [e[0], 
        Object.fromEntries([
            ['componentDescription', e[1][0]?.componentDescription,],
            ...e[1].map(e => {
                return [e.propertyName, componentDestructuring(e)]
            })
        ])
    ]
})
)

*/

/***********************Обратно*********************** */
/*
const convert = Object.entries(components).map(c => {
    const component: ComponentApi ={
        componentName: c[0],
        componentDescription: c[1].componentDescription,
        propertyName: "",
        propertyDescription: "",
        propertyValue: "",
        propertyType: "string"
    }
    return component
    
})


const reduce = Object.entries(components).reduce((acc: ComponentApi[], value): ComponentApi[]=> {
    const { componentDescription, ...properties } = value[1];
    const props: ComponentApi[] = Object.entries(properties).map(p => {
        const component: ComponentApi = {
            componentName: value[0],
            componentDescription: componentDescription,
            propertyName: p[0],
            ...p[1] as any,
        }
        return component
    });
    acc.push(...props)
    return acc;

}, [] as ComponentApi[])

*/
/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * {
  geometry: {
    componentDescription: 'Геометрия',
    height: {
      propertyDescription: 'Высота',
      propertyValue: 916,
      propertyType: 'number',
      propertyFormula: '',
      attributes: '',
      bindingToList: false
    },
    width: {
      propertyDescription: 'Ширина',
      propertyValue: 396,
      propertyType: 'number',
      propertyFormula: '',
      attributes: '',
      bindingToList: false
    },
    depth: {
      propertyDescription: 'Толщина',
      propertyValue: 30,
      propertyType: 'number',
      propertyFormula: '',
      attributes: '',
      bindingToList: false
    },
    amount: {
      propertyDescription: 'Кол-во',
      propertyValue: 30,
      propertyType: 'number',
      propertyFormula: '',
      attributes: '',
      bindingToList: false
    }
  },
  finishing: {
    componentDescription: 'Отделка',
    color: {
      propertyDescription: 'Цвет',
      propertyValue: 30,
      propertyType: 'number',
      propertyFormula: '',
      attributes: '',
      bindingToList: false
    },
    patina: {
      propertyDescription: 'Патина',
      propertyValue: 30,
      propertyType: 'number',
      propertyFormula: '',
      attributes: '',
      bindingToList: false
    },
    varnish: {
      propertyDescription: 'Лак',
      propertyValue: 30,
      propertyType: 'number',
      propertyFormula: '',
      attributes: '',
      bindingToList: false
    }
  },
  price: {
    componentDescription: 'Цена',
    price: {
      propertyDescription: 'Цена',
      propertyValue: 3000,
      propertyType: 'number',
      propertyFormula: '',
      attributes: '',
      bindingToList: false
    }
  }
}
 * [
        [
            'geometry',
            {
            componentDescription: 'Геометрия',
            height: [Object],
            width: [Object],
            depth: [Object],
            amount: [Object]
            }
        ],

        [
            'finishing',
            {
            componentDescription: 'Отделка',
            color: [Object],
            patina: [Object],
            varnish: [Object]
            }
        ],

        [ 
            'price', 
            { 
                componentDescription: 'Цена', price: [Object] 
            } 
        ]
]
 */


/****************************************************** */



export default Engine;
export {
    DefaultSample,
    NomenclatureCreatorOptions,
    EntityOptions, 
    GeometryComponent, 
    FinishingComponent, 
    PriceComponent, 
    ApiEntity, 
    EntityType,
    StageType,
}



