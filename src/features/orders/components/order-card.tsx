interface OrderCardProps {
  orderNumber: string;
  userName: string;
}

export function OrderCard({ orderNumber, userName }: OrderCardProps) {
  return (
    <div className="group bg-white rounded-t-[50%] rounded-b-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)] border border-pink-powder p-4 relative mt-12 flex items-center justify-space-between transition-all hover:shadow-[0_8px_30px_rgba(232,213,213,0.5)]">
      
      <div>
        <p className="text-xs text-text-main/60 font-light leading-relaxed mb-8 px-4 h-10">{orderNumber}</p>
        <p>{userName}</p>
      </div>

      <div>
        <p>Precio Total:</p>
        <p>$400</p>
      </div>

    </div>
  );
}
