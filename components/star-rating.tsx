"use client";

export default function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`text-2xl ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          } ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
