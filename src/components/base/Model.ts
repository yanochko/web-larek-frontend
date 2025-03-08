import { IEvents } from './events';

/**
 * Базовая модель
 */
export abstract class Model<T> {
  constructor(data: Partial<T>, protected events: IEvents) {
    Object.assign(this, data);
  }

  emitChanges(event: string, payload?: object) {
    this.events.emit(event, payload ?? {});
  }
}
