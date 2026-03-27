import { DragDropProvider } from "@dnd-kit/react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { OrderColumn } from "@/features/orders/components/order-card-group";
import {
  patchV1OrdersIdPending,
  patchV1OrdersIdReady,
  useGetV1Orders,
} from "@/lib/api.ts";
import type { GetV1Orders200Item } from "@/lib/schemas";
import { OrderDetails } from "./order-details";

export function Orders() {
  const { data, isLoading } = useGetV1Orders();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeOrderInModalId, setActiveOrderIdInModal] = useState("s");
  const [localData, setLocalData] = useState<GetV1Orders200Item[]>([]);

  useEffect(() => {
    if (data?.status === 200) {
      setLocalData(data.data);
    }
  }, [data]);

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
  // const cleanedData = data.data;

  const orderOnClickHandler = (orderId: string) => {
    setActiveOrderIdInModal(orderId);
    setIsModalOpen(true);
  };

  const handleDragEnd = async (event: any) => {
    console.log("fired");
    if (event.canceled) return;
    console.log("not canceled");
    const { source, target } = event.operation;
    if (!target) return;
    console.log("target", target);

    setLocalData((prevData) =>
      prevData.map((item) =>
        item.order.id === source.id
          ? { ...item, order: { ...item.order, status: target.id } }
          : item,
      ),
    );
    console.log("localdata set");

    try {
      if (target.id === "ready") {
        await patchV1OrdersIdReady(source.id);
        console.log("set ready");
      } else if (target.id === "pending") {
        await patchV1OrdersIdPending(source.id);
        console.log("set pending");
      } else if (target.id === "processing") {
        await patchV1OrdersIdPending(source.id);
        console.log("set processing");
      }
    } catch (error) {
      console.error("error");
      setLocalData((prevData) =>
        prevData.map((item) =>
          item.order.id === source.id
            ? { ...item, order: { ...item.order, status: source.id } }
            : item,
        ),
      );
    }
  };
  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="flex-1">
          <OrderColumn
            title="Incoming"
            displayId="pending"
            orders={localData.filter(
              (order: any) => order.order.status === "pending",
            )}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>

        <div className="flex-1">
          <OrderColumn
            title="Preparation"
            displayId="processing"
            orders={localData.filter(
              (order: any) => order.order.status === "processing",
            )}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>

        <div className="flex-1">
          <OrderColumn
            title="Ready"
            displayId="ready"
            orders={localData.filter(
              (order: any) => order.order.status === "ready",
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
    </DragDropProvider>
  );
}
