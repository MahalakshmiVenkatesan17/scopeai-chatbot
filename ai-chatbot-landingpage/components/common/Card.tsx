import Image from "next/image";
import { Button } from "../common";

type CardProps = {
  title?: string;
  titleClassName?: string; // NEW
  description: string;
  ctaText?: string;
  imageSrc: string;
  layout?: "split" | "stacked";
};

export function Card({
  title,
  titleClassName,
  description,
  ctaText,
  imageSrc,
  layout = "split",
}: CardProps) {
  const isSplit = layout === "split";

  return (
    <div
      className={`rounded-2xl bg-white border border-gray-200 p-6 shadow-sm ${
        isSplit
          ? "grid md:grid-cols-2 gap-6 items-center"
          : "flex flex-col gap-6"
      }`}
    >
      {/* TEXT */}
      <div>
        {title && (
          <h3
            className={`text-center font-semibold text-gray-900 mb-2 ${
              titleClassName ?? "text-2xl"
            }`}
          >
            {title}
          </h3>
        )}

        <p className=" text-gray-600 mb-4 max-w-2xl text-center mx-auto">
          {description}
        </p>

        {ctaText && (
          <Button
            radius="rounded-lg"
            text={ctaText}
            className="mx-auto"
          ></Button>
        )}
      </div>

      {/* IMAGE */}
      <div className="mt-auto rounded-xl bg-gray-50 border border-gray-100 p-4">
        <Image
          src={imageSrc}
          alt={title ?? "Card image"}
          width={1200}
          height={400}
          className="w-full h-auto rounded-md"
        />
      </div>
    </div>
  );
}
