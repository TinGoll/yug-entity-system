import { Engine } from "../Engine";
import RoomControllerHeart from "./RoomControllerHeart";

export default class RoomController extends RoomControllerHeart {
   
    constructor(engine: Engine) {
        super(engine);
    }

    notify(action: string, entityKey: string, ...args: any[]): void {
        for (const iterator of this) {
            iterator.getEntityKeys()
                .then(keys => {
                    if (keys.find(k => k === entityKey)) {
                        iterator.sendNotificationToSubscribers(action, ...args)
                    }
                })
        }
    }


}