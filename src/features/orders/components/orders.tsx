import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { OrderColumn } from "@/features/orders/components/order-card-group";
import { Footer } from "../../../layouts/footer";
import { Header } from "../../../layouts/header";
import { mockOrders } from "../data/order-details-data";
import { OrderDetails } from "./order-details";

interface Order {
  orderId: string;
  userName: string;
  orderNumber: number;
  price: number;
}

export function Orders() {
  const fetchOrderDetails = (orderId: string) => {
    const data = mockOrders;
    return data.filter((order) => order.id === orderId)[0];
  };

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    id: "order-1",
    userName: "Diego Méndez",
    orderNumber: 10234,
    price: 289.5,
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
  });

  const orderOnClickHandler = (orderId: string) => {
    const order = fetchOrderDetails(orderId);

    setModalData(order);
    setModalOpen(true);
  };

  const checkOrderStatus = (status: string): Order[] => {
    const data = mockOrders;
    return data
      .filter((order) => order.status === status)
      .map((order) => ({
        orderId: order.id,
        userName: order.userName,
        orderNumber: order.orderNumber,
        price: order.price,
      }));
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="flex-1">
          <OrderColumn
            title="Incoming"
            orders={checkOrderStatus("incoming")}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>

        <div className="flex-1">
          <OrderColumn
            title="Preparation"
            orders={checkOrderStatus("preparation")}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>

        <div className="flex-1">
          <OrderColumn
            title="Ready"
            orders={checkOrderStatus("ready")}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        title="Orden de usuario"
      >
        <OrderDetails
          userName={modalData.userName}
          orderNumber={modalData.orderNumber}
          price={modalData.price}
          items={modalData.items}
        ></OrderDetails>
      </Modal>
    </>
  );
}
