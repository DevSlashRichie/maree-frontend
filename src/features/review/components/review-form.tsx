import { useState } from "react";
import { usePostV1Review } from "@/lib/api";

const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <fieldset
      aria-label="Seleccionar calificación"
      style={{
        display: "flex",
        gap: "6px",
        border: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          aria-label={`${v} estrella${v > 1 ? "s" : ""}`}
          onMouseEnter={() => setHovered(v)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(v)}
          style={{
            width: "44px",
            height: "44px",
            cursor: "pointer",
            clipPath:
              "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
            background: v <= (hovered || value) ? "#b08080" : "#eae6df",
            transform: v <= (hovered || value) ? "scale(1.15)" : "scale(1)",
            transition: "background 0.12s, transform 0.1s",
            border: "none",
            padding: 0,
          }}
        />
      ))}
    </fieldset>
  );
};

export default function ReviewForm({
  orderId,
  userId,
  branchId,
}: {
  orderId: string;
  userId: string;
  branchId: string;
}) {
  const { trigger, isMutating } = usePostV1Review();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const requiresComment = rating > 0 && rating < 5;
  const isDisabled = !rating || (requiresComment && !text.trim()) || isMutating;

  const handleSubmit = async () => {
    if (isDisabled) return;
    await trigger({
      orderId,
      userId,
      branchId,
      satisfactionRate: rating,
      notes: text || undefined,
    });
    setRating(0);
    setText("");
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "0.5px solid rgba(58,64,66,0.12)",
        borderRadius: "16px",
        padding: "20px 22px",
        fontFamily: "'Lato', sans-serif",
        maxWidth: "480px",
      }}
    >
      <div
        style={{
          marginBottom: "14px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "#5e6c75",
            letterSpacing: "0.06em",
            marginBottom: "6px",
          }}
        >
          Tu calificación
        </span>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {requiresComment && (
        <div style={{ marginBottom: "14px" }}>
          <label
            htmlFor="review-comment"
            style={{
              display: "block",
              fontSize: "12px",
              color: "#5e6c75",
              letterSpacing: "0.06em",
              marginBottom: "6px",
            }}
          >
            ¿Qué podríamos mejorar?
          </label>
          <textarea
            id="review-comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cuéntanos qué salió mal o qué podríamos hacer mejor..."
            style={{
              width: "100%",
              minHeight: "80px",
              resize: "vertical",
              border: "0.5px solid rgba(58,64,66,0.18)",
              borderRadius: "10px",
              padding: "10px 12px",
              fontFamily: "'Lato', sans-serif",
              fontSize: "14px",
              color: "#2d2a26",
              background: "#f7f5f0",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {rating > 0 && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          style={{
            width: "100%",
            padding: "12px",
            background: isDisabled ? "#a0a8ab" : "#3a4042",
            color: "#f2efe9",
            border: "none",
            borderRadius: "10px",
            fontFamily: "'Lato', sans-serif",
            fontSize: "14px",
            letterSpacing: "0.04em",
            cursor: isDisabled ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {isMutating ? "Enviando..." : "Publicar reseña"}
        </button>
      )}
    </div>
  );
}
