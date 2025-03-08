export type CategoryType ='другое'|'софт-скил'|'дополнительное'|'кнопка'|'хард-скил'
export type PaymentType = 'card'|'cash'|null;
export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

export interface IProduct {
    // ID продукта
    id: string;
  
    // описание
    description: string;
  
    // картинка
    image: string;
  
    // название
    title: string;
  
    // категория
    category: CategoryType;
  
    // цена товара(null, если бесценна)
    price: number | null;
  
    // выбран товар или нет
    selected: boolean;
  }
export interface ApiResponse {
    items: IProduct[];
  }
    
// Интерфейс, описывающий поля заказа товара
  export interface IOrder {
    // Массив ID купленных товаров
    items: string[];
  
    // Способ оплаты
    payment: PaymentType;
  
    // Сумма заказа
    total: number;
  
    // Адрес доставки
    address: string;
  
    // Электронная почта
    email: string;
  
    // Телефон
    phone: string;
  }
  // Поля формы заказа
  export interface IOrderForm {
    payment: PaymentType;
    address: string;
    email: string;
    phone: string;
  }
  
  export interface IAppState {
    // Корзина с товарами
    basket: IProduct[];
    // Массив карточек товара
    store: IProduct[];
    // Информация о заказе при покупке товара
    order: IOrder;
    //Ошибки при валидации форм
    formErrors: FormErrors;
    // Метод для добавления товара в корзину
    addToBasket(value: IProduct): void;
    // Метод для удаления товара из корзины
    deleteFromBasket(id: string): void;
    // Метод для полной очистки корзины
    clearBasket(): void;
    // Метод для получения количества товаров в корзине
    getBasketAmount(): number;
    // Метод для получения суммы цены всех товаров в корзине
    getTotalBasketPrice(): number;
    // Метод для добавления ID товаров в корзине в поле items для order
    setItems(): void;
    // Метод для заполнения полей email, phone, address, payment в order
    setOrderField(field: keyof IOrderForm, value: string): void;
    // Валидация форм для окошка "контакты"
    validateContacts(): boolean;
    // Валидация форм для окошка "заказ"
    validateOrder(): boolean;
    // Очистить order после покупки товаров
    refreshOrder(): boolean;
    // Метод для превращения данных, полученых с сервера в тип данных приложения
    setStore(items: IProduct[]): void;
    // Метод для обновления поля selected во всех товарах после совершения покупки
    resetSelected(): void;
  }
  