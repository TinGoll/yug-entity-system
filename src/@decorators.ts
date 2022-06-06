
import { performance } from "perf_hooks";

export function timing() {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {

        const value = descriptor.value as Function;
        
        descriptor.value = async function (...args: any[]) {
            const start = performance.now();
            const out = await value.apply(this, args);
            const end = performance.now();
            console.log(`${String(propertyKey)}:`, (end - start));
            return out;
        }
    }
}