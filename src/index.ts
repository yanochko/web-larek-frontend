import './scss/styles.scss';
import { Page } from './components/Page';
import { Api, ApiListResponse } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Modal } from './components/base/Modal';
import { Card, ItemPreview} from './components/Card';
import { AppState, Product } from './components/models/global/AppData';
import { ensureElement, cloneTemplate } from './utils/utils';
import { ApiResponse, IOrderForm, IProduct } from './types';
import { API_URL } from './utils/constants';
import { Basket, StoreItemBasket } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';

const api = new Api(API_URL);
const events = new EventEmitter();

const storeProductTemplate =
  ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success')

// Модель состояния приложения
const appData = new AppState({}, events);

// Контейнер страница и модальное окно
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Часто используемые компоненты
const basket = new Basket('basket', cloneTemplate(basketTemplate), events);
const order = new Order('order', cloneTemplate(orderTemplate), events)
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success('order-success', cloneTemplate(successTemplate), {
  onClick: () => {
    events.emit('modal:close')
    modal.close()
  }
})

// Получаем товары через API
api
  .get('/product')
  .then((res: ApiResponse) => {
    appData.setStore(res.items as IProduct[]);
  })
  .catch((err) => {
    console.error(err);
  });

// Событие изменения элементов каталога(добавление в стор)
events.on('items:changed', () => {
  page.store = appData.store.map((item) => {
    const product = new Card('card',cloneTemplate(storeProductTemplate), {
      onClick: () => events.emit('card:select', item),
    });
    return product.render({
      id: item.id,
      title: item.title,
      image: item.image,
      category: item.category,
      price: item.price,
    });
  });
});

// Открытие карточки
events.on('card:select', (item: Product) => {
  page.locked = true;
  const product = new ItemPreview(cloneTemplate(cardPreviewTemplate), {
    onClick: () => {
      events.emit('card:addToBasket', item)
    },
  });
  modal.render({
    content: product.render({
      id: item.id,
      title: item.title,
      image: item.image,
      category: item.category,
      description: item.description,
      price: item.price,
      selected: item.selected
    }),
  });
});

// Добавление товара в корзину
events.on('card:addToBasket', (item: Product) => {
  item.selected = true;
  appData.addToBasket(item);
  page.counter = appData.getBasketAmount();
  modal.close();
})

// Открытие корзины
events.on('basket:open', () => {
  page.locked = true
  const basketItems = appData.basket.map((item, index) => {
    const storeItem = new StoreItemBasket(
      'card',
      cloneTemplate(cardBasketTemplate),
      {
        onClick: () => events.emit('basket:delete', item)
      }
    );
    return storeItem.render({
      title: item.title,
      price: item.price,
      index: index + 1,
    });
  });
  modal.render({
    content: basket.render({
      list: basketItems,
      price: appData.getTotalBasketPrice(),
    }),
  });
});

// Удалить товар из корзины
events.on('basket:delete', (item: Product) => {
  appData.deleteFromBasket(item.id);
  item.selected = false;
  basket.refreshIndices();
  basket.price = appData.getTotalBasketPrice();
  page.counter = appData.getBasketAmount();
})

// Оформить заказ
events.on('basket:order', () => {
  modal.render({
    content: order.render(
      {
        address: '',
        valid: false,
        errors: []
      }
    ),
  });
});

// Изменилось состояние валидации заказа
events.on('orderFormErrors:change', (errors: Partial<IOrderForm>) => {
  const { payment, address } = errors;
  order.valid = !payment && !address;
  order.errors = Object.values({ payment, address }).filter(i => !!i).join('; ');
});

// Изменилось состояние валидации контактов
events.on('contactsFormErrors:change', (errors: Partial<IOrderForm>) => {
  const { email, phone } = errors;
  contacts.valid = !email && !phone;
  contacts.errors = Object.values({ phone, email }).filter(i => !!i).join('; ');
});

// Изменились введенные данные
events.on('orderInput:change', (data: { field: keyof IOrderForm, value: string }) => {
  appData.setOrderField(data.field, data.value);
});

// Заполнить телефон и почту
events.on('order:submit', () => {
  appData.order.total = appData.getTotalBasketPrice()
  appData.setItems();
  modal.render({
    content: contacts.render(
      {
        valid: false,
        errors: []
      }
    ),
  });
})

// Покупка товаров
events.on('contacts:submit', () => {
    if (appData.validateOrder() && appData.validateContacts()){
  api.post('/order', appData.order)
    .then((res) => {
      events.emit('order:success', res);
      appData.clearBasket();
      appData.refreshOrder();
      order.disableButtons();
      page.counter = 0;
      appData.resetSelected();
    })
    .catch((err) => {
      console.log(err)
    })
}
})

// Окно успешной покупки
events.on('order:success', (res: ApiListResponse<string>) => {
  modal.render({
    content: success.render({
      description: res.total
    })
  })
})

// Закрытие модального окна
events.on('modal:close', () => {
  page.locked = false;
  appData.refreshOrder();
});
