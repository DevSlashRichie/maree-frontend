interface OrderCardProps {
  orderNumber: string;
  userName: string;
}

export function OrderCard({ orderNumber, userName }: OrderCardProps) {
  return (
    <>
      <p>{orderNumber}</p>
      <p>{userName}</p>
      <button type="button">Ver Detalles</button>
    </>
  );
}
