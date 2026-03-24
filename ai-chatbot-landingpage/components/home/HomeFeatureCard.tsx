import Image from "next/image";
import { Button } from "../common";

type HomeFeatureCardProps = {
  title: string;
  description: string;
  image: string;
  btnText: string;
  reverse?: boolean;
};

export default function HomeFeatureCard({
  title,
  description,
  image,
  btnText,
  reverse = false,
}: HomeFeatureCardProps) {
  return (
    <div
      className={`flex flex-col md:flex-row justify-center items-center gap-12 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      <Image src={image} alt={title} width={520} height={360} />

      <div className="max-w-xl">
        <h3 className="text-2xl font-semibold mb-4 text-black">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        {/* <Button>{btnText}</Button> */}
      </div>
    </div>
  );
}
