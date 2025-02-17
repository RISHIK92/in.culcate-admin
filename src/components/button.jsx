import { ReactElement } from "react";

const variantStyles = {
    "primary": "bg-[#FF6A34] text-white",
    "secondary": "bg-purple-300 text-purple-600",
    "custom": "bg-[#FFD9C4]"
}

const sizeStyles = {
    "sm": "py-1 px-2 rounded-sm",
    "md": "py-2 px-4 rounded-md",
    "lg": "py-4 px-6 rounded-2xl text-xl font-normal",
    "custom" : "py-3 px-14 rounded-md text-sm font-normal"
}


export const Button = (props) => {
    return <button onClick={props.onClick} className={`${variantStyles[props.variant]} ${sizeStyles[props.size]} ${props.fullWidth ? "w-full flex justify-center items-center": null} disabled=${props.loading} font-light`}> <div className="flex"> {props.startIcon ? <div className="pr-2">{props.startIcon}</div> : null} {props.text} {props.endIcon ? <div className="pl-2">{props.endIcon}</div>: null} </div></button>
}