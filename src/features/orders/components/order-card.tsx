interface OrderCardProps {
orderNumber: string;
userName: string;
}

export function OrderCard({
    orderNumber,
    userName,
                          }: OrderCardProps) {
    return (
        <>
            <p>{orderNumber}</p>
            <p>{userName}</p>
            <button>Ver Detalles</button>
        </>
    )
}
