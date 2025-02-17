import { forwardRef } from "react";

export const Input = forwardRef(({ onClick, type = "text", placeholder, image }, ref) => {
    return (
        <span onClick={onClick} className="inline-flex items-center">
            <input
                type={type}
                placeholder={placeholder}
                ref={ref}
                className="bg-white px-3 h-[70px] text-md border rounded-2xl w-[430px] focus:outline-custom-orange"
            />
            {image && <span className="ml-2">{image}</span>}
        </span>
    );
});

export default Input;