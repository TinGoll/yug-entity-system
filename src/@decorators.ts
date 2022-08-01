import { performance } from "perf_hooks";

type HandlerFunction = (error: Error, ctx: any) => void;

export function timing() {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const value = descriptor.value as Function;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const out = await value.apply(this, args);
      const end = performance.now();
      console.log(`${String(propertyKey)}:`, end - start);
      return out;
    };
  };
}

export const Catch = (errorType: any, handler: HandlerFunction): any => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Сохраните ссылку на исходный метод
    const originalMethod = descriptor.value;

    // Перепишите исходный метод с помощью оболочки try/catch
    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);

        // Проверить, является ли метод асинхронным
        if (result && result instanceof Promise) {
          // Вернуть  promise
          return result.catch((error: any) => {
            _handleError(this, errorType, handler, error);
          });
        }

        // Вернуть фактический результат
        return result;
      } catch (error) {
        _handleError(this, errorType, handler, error as Error);
      }
    };

    return descriptor;
  };
};

export const CatchAll = (handler: HandlerFunction): any =>
  Catch(Error, handler);

function _handleError(
  ctx: any,
  errorType: any,
  handler: HandlerFunction,
  error: Error
) {
  // Проверить, является ли ошибка экземпляром данного типа ошибки
  if (typeof handler === "function" && error instanceof errorType) {
    // Запустить обработчик с объектом ошибки и контекстом класса
    handler.call(null, error, ctx);
  } else {
    // Бросаем ошибку дальше
    // Следующий декоратор в цепочке может поймать его
    throw error;
  }
}
