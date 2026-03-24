import React from "react";

export function Button({
  text = "Start building for free",
  icon = null,
  height = "h-12",
  width = "w-fit",
  textColor = "text-white",
  bgColor = "bg-[#5856d6]",
  fontSize = "text-base font-semibold",
  padding = "px-6",
  radius = "rounded-full",
  className = "",
  ...rest
}) {
  return (
    <button
      className={`  
        cursor-pointer
        flex items-center justify-center gap-2
        ${height} ${width}
        ${textColor} ${bgColor} ${fontSize}
        ${padding} ${radius}
        shadow-md
        transition-all duration-200 ease-in-out
        hover:brightness-110 hover:shadow-lg
        active:scale-95
        ${className}
      `}
      {...rest}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{text}</span>
    </button>
  );
}


