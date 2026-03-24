import { TestimonialItems } from "@/lib/Constants";


export function  Testimonial() {
  return (
    <section className="w-full py-24 px-6 bg-white">
      <div
        className="
          max-w-7xl mx-auto
          columns-1 md:columns-3
          gap-6
          space-y-6
        "
      >
        {TestimonialItems.map((item, index) => (
          <div
            key={index}
            className="
              break-inside-avoid
              rounded-2xl
              border border-gray-200
              bg-white
              shadow-sm
              overflow-hidden
            "
          >
             {/* IMAGE CARD */}
            {item.type === "image" && item.img && (
              <div className="relative">
                <img 
                  src={item.img} 
                  alt={item.label || ''} 
                  className="w-full h-65 object-cover" 
                />


                <span
                  className="
                    absolute bottom-3 left-3
                    bg-black/70 
                    text-white
                    text-xs
                    px-3 py-1
                    rounded-full
                  "
                >
                  {item.label}
                </span>
              </div>
            )}

            {/* TEXT CARD */}
            {item.type === "text" && (
              <div className="p-6">
                {/* Rating */}
                {item.rating && (
                  <div className="flex items-center gap-1 mb-3 text-orange-500 text-sm">
                    ★★★★★
                  </div>
                )}

                {/* Quote */}
                {item.quote && (
                  <div className="text-5xl leading-none text-gray-200 mb-3">
                    “
                  </div>
                )}

                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {item.text}
                </p>

                {(item.name || item.company) && (
                  <div>
                    {item.name && (
                      <p className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </p>
                    )}
                    {item.company && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        {item.company}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
