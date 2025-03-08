import { IOrder, IProduct, IOrderForm,FormErrors, PaymentType } from '../../../types';
import { Model } from '../../base/Model';
import { IAppState } from '../../../types';

export class Product extends Model<IProduct> {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
  selected: boolean;
}

export class AppState extends Model<IAppState> {
  basket: Product[] = [];
  store: Product[];
  formErrors:FormErrors;
  order: IOrder = {
    items: [],
    payment: null,
    total: null,
    address: '',
    email: '',
    phone: '',
  };

  addToBasket(value: Product) {
    this.basket.push(value);
  }

  deleteFromBasket(id: string) {
    this.basket = this.basket.filter(item => item.id !== id)
  }

  clearBasket() {
    this.basket.length = 0;
  }

  getBasketAmount() {
    return this.basket.length;
  }

  setItems() {
    this.order.items = this.basket.map(item => item.id)
  }
  validateContacts() {
    const errors: typeof this.formErrors = {};
    if (!this.order.email) {
      errors.email = 'Необходимо указать email';
    }
    if (!this.order.phone) {
      errors.phone = 'Необходимо указать телефон';
    }
    this.formErrors = errors;
    this.events.emit('contactsFormErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  validateOrder() {
    const errors: typeof this.formErrors = {};
    if (!this.order.address) {
      errors.address = 'Необходимо указать адрес';
    }
    if (!this.order.payment) {
      errors.payment = 'Необходимо указать способ оплаты';
    }
    this.formErrors = errors;
    this.events.emit('orderFormErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }
  setOrderField(field: keyof IOrderForm, value: string|PaymentType) {
    if (field=="payment") this.order[field] = value as PaymentType;
    else this.order[field] = value

    if (this.validateContacts()) {
      this.events.emit('contacts:ready', this.order)
    }
    if (this.validateOrder()) {
      this.events.emit('order:ready', this.order);
    }
    }


  refreshOrder() {
    this.order = {
      items: [],
      total: null,
      address: '',
      email: '',
      phone: '',
      payment: null
    };
  }

  getTotalBasketPrice() {
    return this.basket.reduce((sum, next) => sum + next.price, 0);
  }

  setStore(items: IProduct[]) {
    this.store = items.map((item) => new Product({ ...item, selected: false }, this.events));
    this.emitChanges('items:changed', { store: this.store });
  }

  resetSelected() {
    this.store.forEach(item => item.selected = false)
  }
}
