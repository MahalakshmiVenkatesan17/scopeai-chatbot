import Image from 'next/image';


export default function FullPageLoader({}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="flex flex-col items-center space-y-6">
        {/* Large AI Loader SVG */}
        <div className="relative">
          <Image 
            src="/4-dots-rotate.svg" 
            alt="Loading" 
            width={120} 
            height={120}
            // className="animate-spin"
            priority
          />
          {/* Pulse effect behind the loader */}
          {/* <div className="absolute inset-0 -z-10 animate-ping opacity-20">
            <Image 
              src="/ai-loader.svg" 
              alt="" 
              width={120} 
              height={120}
            />
          </div> */}
        </div>
        
        {/* Loading Text */}
        {/* <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-gray-600 animate-pulse">
            {subtitle}
          </p>
        </div> */}

        {/* Animated Progress Dots */}
        {/* <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div> */}
      </div>
    </div>
  );
}