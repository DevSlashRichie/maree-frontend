export const mockOrders = [
  {
    id: "order-1",
    userName: "Diego Méndez",
    orderNumber: 10234,
    price: 289.5,
    status: "incoming",
    items: [
      {
        id: "item-1",
        name: "Burger Deluxe",
        quantity: 2,
        ingredients: [
          { id: "ing-1", name: "Beef Patty" },
          { id: "ing-2", name: "Cheddar Cheese" },
          { id: "ing-3", name: "Lettuce" },
        ],
      },
      {
        id: "item-2",
        name: "Fries",
        quantity: 1,
        ingredients: [
          { id: "ing-4", name: "Potato" },
          { id: "ing-5", name: "Salt" },
        ],
      },
    ],
  },
  {
    id: "order-2",
    userName: "Ana López",
    orderNumber: 10235,
    price: 150.0,
    status: "preparation",
    items: [
      {
        id: "item-3",
        name: "Chicken Wrap",
        quantity: 1,
        ingredients: [
          { id: "ing-6", name: "Grilled Chicken" },
          { id: "ing-7", name: "Tortilla" },
          { id: "ing-8", name: "Avocado" },
        ],
      },
    ],
  },
  {
    id: "order-3",
    userName: "Carlos Ruiz",
    orderNumber: 10236,
    price: 320.75,
    status: "ready",
    items: [
      {
        id: "item-4",
        name: "Pizza Pepperoni",
        quantity: 2,
        ingredients: [
          { id: "ing-9", name: "Dough" },
          { id: "ing-10", name: "Tomato Sauce" },
          { id: "ing-11", name: "Pepperoni" },
        ],
      },
      {
        id: "item-5",
        name: "Soda",
        quantity: 2,
        ingredients: [
          { id: "ing-12", name: "Carbonated Water" },
          { id: "ing-13", name: "Sugar" },
        ],
      },
    ],
  },
];
