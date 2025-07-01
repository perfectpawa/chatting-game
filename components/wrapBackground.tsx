import React, { ReactNode } from "react";
import Header from "./header";

const WrapBackground: React.FC<{children: ReactNode }> = ({ children }) => (
  <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#181926]">
    <div
      className="
        flex flex-col items-center justify-center 
        w-[95%] h-[95%]
        lg:h-[80%] lg:max-w-2xl
        md:h-[85%] md:max-w-2xl
        backdrop-blur-md
        rounded-lg shadow-[0_4px_32px_0_#181926] bg-[#24273a]
        p-0
      "
    >
      <div className="w-full h-full">
        <div className="h-[10%]">
            <Header />
        </div>
        <div className="h-[90%]">
            {children}
        </div>
      </div>
    </div>
  </div>
);

export default WrapBackground;
