import { forwardRef } from "react";

export const Input = forwardRef(({ onClick, type = "text", placeholder, image }, ref) => {
    return (
        <span onClick={onClick} className="text-md px-2 py-2 mr-2 text-black cursor-pointer">
            <input 
                type={type} 
                placeholder={placeholder} 
                ref={ref} 
                className="bg-white p-5 pr-64 text-md border rounded-2xl focus:outline-custom-orange"
            />
            {image}
        </span>
    );
});
