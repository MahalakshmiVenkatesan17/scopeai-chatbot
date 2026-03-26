import Image from "next/image";
import { Button } from "../common";
import { ArrowRight, Sparkles, CheckCircle, Zap } from "lucide-react";

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
      className={`group flex flex-col md:flex-row justify-center items-center gap-12 lg:gap-16 ${reverse ? "md:flex-row-reverse" : ""
        } transition-all duration-500`}
    >
      {/* Image Container */}
      <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl">
        {/* Glow effect */}
        <div className="absolute -inset-2 dark:bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl dark:opacity-0 dark:group-hover:opacity-100 dark:transition-opacity dark:duration-500"></div>

        {/* Image */}
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            src={image}
            alt={title}
            width={520}
            height={360}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl text-center md:text-left">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 mb-4 transition-colors">
          <Zap className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI-Powered</span>
        </div>

        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed transition-colors">
          {description}
        </p>



        {/* Trust indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>No credit card required</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>2-minute setup</span>
        </div>
      </div>
    </div>
  );
}