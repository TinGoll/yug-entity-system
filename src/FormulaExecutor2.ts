import Entity from "./Entity";
import { ApiComponent, PropertyTypes, PropertyValue } from "./types/engine-types";


interface FormulaComponentOptions extends Partial<ApiComponent> {
    key: string;
}

type FormulaGetters = () => PropertyValue | null;
type FormulaSetters = (value: PropertyValue) => void;

interface FormulaExecutor {
    KEY: string;
    GETTER: FormulaGetters;
    SETTER: FormulaSetters;
    ENTITY_NAME: string
    COMPONENT_NAME: string;
    COMPONENT_DESC: string;
    PROPERTY_NAME: string;
    PROPERTY_DESC: string;
    GETTER_NAME: string;
    SETTER_NAME: string;
    ENTITY_NOTE: string;
    IS_CURRENT_PROPERTY: boolean;
    CODE: string;
}

/** Интерфейс кнопок, для отображения в редакторе формул. */
interface FormulaButton {
    group: string;
    components: Array<{
        componentName: string,
        buttons: Array<{ name: string, value: string }>
        setters: Array<{ name: string, value: string }>
    }>;
}

export function formulaExecutor2(this: Entity, { componentName, propertyName, propertyValue, key }: FormulaComponentOptions, code: string = '', type: 'execution' | 'preparation' = 'execution') {
    try {
        /** **************************************** */
        /** ********** Текущие значения ************ */
        const currentComponentName = componentName;
        const currentPropertyName = propertyName;
        const currentPropertyValue = propertyValue || null;
        const currentEntity = this;
        /** **************************************** */
        /** ****** Дополнительные переменные ******* */
        const ME = currentEntity;
        const NAME = ME.getName();
        const FATHER = ME.getParent();
        const CHILDS = ME.getChildren() || [];
        const BROTHERS = FATHER?.getChildren() || [];
        const GRAND_FATHER = ME.getGrandFather();
        /** **************************************** */
        const entities = GRAND_FATHER?.getDynasty() || ME.getDynasty();

        const EXECUTORS = new Map<string, FormulaExecutor> ();
        const DUMMY_GET = () => null; // Пустышка геттер
        const DUMMY_SET = (value: string) => console.log('Недоступное свойство.'); // Пустышка сеттер.

        //Executors
        for (const entity of entities) {
            for (const cmp of entity.getApiComponents()) {
                const KEY = `Entity ${entity.name} Cmp ${cmp.componentName} Prob ${cmp.propertyName} Id ${cmp.id}`;
                const IS_CURRENT_PROPERTY = key === cmp.key;
                const PROPERTY_VALUE = cmp.propertyValue;
                const GETTER = entity.getterExecutor(cmp.componentName, cmp.propertyName);
                const SETTER = entity.setterExecutor(cmp.componentName, cmp.propertyName);
                const ENTITY_NAME = entity.name; // Название сущности.
                const ENTITY_NOTE = entity.getNote(); // note :)
                const COMPONENT_NAME =  cmp.componentName; // Название компонента.
                const COMPONENT_DESC = cmp.componentDescription; // Название на русском.
                const PROPERTY_NAME = cmp.propertyName; // Название свойства.
                const PROPERTY_DESC =  cmp.propertyDescription; // Название свойства на русском.
                const GETTER_NAME = IS_CURRENT_PROPERTY ? `THIS` : `G_${PROPERTY_NAME.toUpperCase()}_ID${cmp.id}`;
                const SETTER_NAME = `S_${PROPERTY_NAME.toUpperCase() }_ID${cmp.id}`;
                const CODE = IS_CURRENT_PROPERTY 
                    ? `const ${GETTER_NAME} = ${PROPERTY_VALUE}; const ${SETTER_NAME} = EXECUTORS.get("${KEY}")?.SETTER || DUMMY_SET;`
                    : `const ${GETTER_NAME} = EXECUTORS.get("${KEY}")?.GETTER || DUMMY_GET; const ${SETTER_NAME} = EXECUTORS.get("${KEY}")?.SETTER || DUMMY_SET;`

                EXECUTORS.set(KEY, {
                    KEY,
                    GETTER,
                    SETTER,
                    ENTITY_NAME,
                    COMPONENT_NAME,
                    COMPONENT_DESC,
                    PROPERTY_NAME,
                    PROPERTY_DESC,
                    GETTER_NAME,
                    SETTER_NAME,
                    ENTITY_NOTE,
                    IS_CURRENT_PROPERTY,
                    CODE
                })
            }
        }

        /** **************************************** */
        /** ************* Функции **************** */
        function ROUND(number: number, fixed: number) {
            return number.toFixed(fixed)
        }
        function RUB(number: number) {
            return number.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
        }
        function COSINUS(number: number) {
            return Math.cos(number * Math.PI / 180);
        }
        /** **************************************** */
        /** **************************************** */

        const arrCode: string[] = [];
        for (const EXCT of EXECUTORS.values()) {
            arrCode.push(EXCT.CODE)
        }

        const baseCode = `
        const executor = () => {
                ${arrCode.join('\n')}
                let Q,W,E,R,T,Y,U,I,O,P,A,S,D,F,G,H,J,K,L,X,C,V,B,N,M;
                let PI = Math.PI;
                let RESULT = currentPropertyValue; // Результат
                ${code}
                return RESULT;
        }
        executor();`;
        if (type === 'execution') return eval(baseCode);
        const clientButtons: FormulaButton[] = [];
        const executorArr = [...EXECUTORS].map(e => e[1]);
        const groupSet = [...new Set(executorArr.map(e => (e.ENTITY_NAME + '~' + e.ENTITY_NOTE)))]
                    .map(g => g.split("~")).map(g => ({ name: g[0], note: g[1] || '' }));
        for (const group of groupSet) {
            const componentNames = [...new Set(executorArr.filter(e => e.ENTITY_NAME === group.name && e.ENTITY_NOTE === group.note ).map(e => e.COMPONENT_NAME))];
            const components: Array<{
                componentName: string,
                buttons: Array<{ name: string, value: string }>
                setters: Array<{ name: string, value: string }>
            }> = [];
            for (const componentName of componentNames) {
                const buttons: Array<{ name: string, value: string }> = [];
                const setters: Array<{ name: string, value: string }> = [];
                buttons.push(...executorArr.filter(e => e.ENTITY_NAME === group.name && e.ENTITY_NOTE === group.note && e.COMPONENT_NAME === componentName)
                        .map(e => ({ name: e.PROPERTY_DESC, value: `${e.GETTER_NAME}${e.IS_CURRENT_PROPERTY ? '' : "()"}`})));

                setters.push(...executorArr.filter(e => e.ENTITY_NAME === group.name && e.ENTITY_NOTE === group.note && e.COMPONENT_NAME === componentName)
                        .map(e => ({ name: e.PROPERTY_DESC, value: `${e.SETTER_NAME}( /*ЗНАЧЕНИЕ*/ )`})));
                components.push({
                    componentName,
                    buttons,
                    setters
                });
            }
            clientButtons.push({
                group: `${group.name}${(!group.note || group.note === '') ? '' : ' (' + group.note + ')'}`,
                components
            });
        }

        let startCode = '';
        startCode += `/*************************************************************/\n`;
        startCode += `/*  ME - Текущий объект, FATHER - родитель,                  */\n`;
        startCode += `/*  CHILDS - детки, BROTHERS - братья, GRAND_FATHER - дед    */\n`;
        startCode += `/*  RESULT - в эту переменную внесите результат.             */\n`;
        startCode += `/*  Остальное в кнопках на панели. Писать в верхнем регистре.*/\n`;
        startCode += `/*************************************************************/\n`;
        startCode += `// Тут пишите ваш код, удачи!\n\n\n`;
        return { clientButtons, startCode }

    } catch (e) {
        console.log(e);
        return null;
    }
}
