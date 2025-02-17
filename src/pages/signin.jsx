import React from "react";
import { SidebarSignin } from "../components/sidebarSignin";

export function Signin() {
    localStorage.removeItem('authToken')
    return (
        <div className="bg-[#fff5ef] h-screen flex">
            <div className="flex-1 relative">
                <div className="flex flex-col items-start justify-center h-full ml-72">
                    <div className="text-[110px] font-semibold m-0 leading-none">
                        <span className="text-[#FF6A34]">in.</span>
                        <span className="text-[#151445]">culcate</span>
                    </div>
                    <p className="text-4xl ml-[128px] font-semibold text-[#FF6A34] leading-none">Rediscovering Bharat.</p>
                </div>
                <div className="absolute bottom-0 left-0">
                    <img src="https://res.cloudinary.com/dvweoxpun/image/upload/v1739790566/Vector_me1sxx.png" alt="Vector 1" />
                </div>
                <div className="absolute top-0 right-0 mr-10">
                    <img src="https://res.cloudinary.com/dvweoxpun/image/upload/v1739790580/Vector2_fptoa7.png" alt="Vector 2" />
                </div>
            </div>
            <div className="w-[300px] bg-white shadow-lg">
                <SidebarSignin />
            </div>
        </div>
    );
}
