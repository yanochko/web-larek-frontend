import { Element } from './models/Element';

interface ISuccessActions {
  onClick: (event: MouseEvent) => void;
}

export interface ISuccess {
  description: number;
}

export class Success extends Element<ISuccess> {
  protected _button: HTMLButtonElement;
  protected _description: HTMLElement;

  constructor(
    protected blockName: string,
    container: HTMLElement,
    actions?: ISuccessActions
  ) {
    super(container);

    this._button = container.querySelector(`.${blockName}__close`);
    this._description = container.querySelector(`.${blockName}__description`);

    if (actions?.onClick) {
      if (this._button) {
        this._button.addEventListener('click', actions.onClick)
      }
    }
  }

  set description(value: number) {
    this._description.textContent = 'Списано ' + value + ' синапсов'
  }
}
