import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { OrderColumn } from "@/features/orders/components/order-card-group";
import { useGetV1Orders } from "@/lib/api.ts";
import { OrderDetails } from "./order-details";

export function Orders() {
  const { data, isLoading } = useGetV1Orders();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeOrderInModalId, setActiveOrderIdInModal] = useState("s");

  if (isLoading) {
    return <div>Cargando...</div>;
  }
  if (!data) {
    return <div>`Error`</div>;
  }

  if (data.status !== 200) {
    return <div>`Error: ${data?.data.message}`</div>;
  }

  // const cleanedData = data.data.map((item) => ({
  //   order: {
  //     ...item.order,
  //     total: Number(item.order.total) || 0,
  //   },
  //   user: item.user,
  // }));
  const cleanedData = data.data;

  const orderOnClickHandler = (orderId: string) => {
    setActiveOrderIdInModal(orderId);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="flex-1">
          <OrderColumn
            title="Incoming"
            orders={cleanedData.filter(
              (order) => order.order.status === "pending",
            )}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>

        <div className="flex-1">
          <OrderColumn
            title="Preparation"
            orders={cleanedData.filter(
              (order) => order.order.status === "processing",
            )}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>

        <div className="flex-1">
          <OrderColumn
            title="Ready"
            orders={cleanedData.filter(
              (order) => order.order.status === "ready",
            )}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title="Orden de usuario"
      >
        <OrderDetails id={activeOrderInModalId}></OrderDetails>
      </Modal>
    </>
  );
}
