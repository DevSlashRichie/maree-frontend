import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { OrderColumn } from "@/features/orders/components/order-card-group";
import { useBranchStore } from "@/hooks/use-branch-store";
import { patchV1OrdersIdStatus, useGetV1Orders } from "@/lib/api.ts";
import type { GetV1Orders200Item } from "@/lib/schemas";
import { OrderDetails } from "./order-details";

export function Orders() {
  const { selectedBranch } = useBranchStore();
  const { data, isLoading, mutate } = useGetV1Orders({
    branchId: selectedBranch?.id,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<GetV1Orders200Item | null>(
    null,
  );

  const handleStatusChange = async (
    orderId: string,
    action: "forward" | "backward",
  ) => {
    await patchV1OrdersIdStatus(orderId, { action });
    mutate();
  };

  const handleForward = async (orderId: string) => {
    await handleStatusChange(orderId, "forward");
    setIsModalOpen(false);
  };

  const handleBackward = async (orderId: string) => {
    await handleStatusChange(orderId, "backward");
    setIsModalOpen(false);
  };

  const orderOnClickHandler = (orderId: string) => {
    const order =
      data?.status === 200
        ? (data.data.find((o) => o.order.id === orderId) ?? null)
        : null;
    setActiveOrder(order);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Cargando...</div>;
  if (!data) return <div>Error</div>;
  if (data.status !== 200) return <div>Error: {data?.data.message}</div>;

  const orders = selectedBranch?.id
    ? data.data.filter((o) => o.order.branchId === selectedBranch.id)
    : data.data;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="flex-1">
          <OrderColumn
            title="Incoming"
            orders={orders.filter((o) => o.order.status === "incoming")}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>
        <div className="flex-1">
          <OrderColumn
            title="Preparation"
            orders={orders.filter((o) => o.order.status === "set")}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>
        <div className="flex-1">
          <OrderColumn
            title="Ready"
            orders={orders.filter((o) => o.order.status === "ready")}
            orderOnClickHandler={orderOnClickHandler}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Orden de usuario"
      >
        {activeOrder && (
          <OrderDetails
            order={activeOrder}
            onForward={() => handleForward(activeOrder.order.id)}
            onBackward={
              activeOrder.order.status !== "pending"
                ? () => handleBackward(activeOrder.order.id)
                : undefined
            }
          />
        )}
      </Modal>
    </>
  );
}
