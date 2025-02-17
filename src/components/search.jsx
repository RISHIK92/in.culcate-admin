export const Search = ({ onClick, type, placeholder, image }) => {
    return (
        <div onClick={onClick} className="relative flex items-center text-md px-2 py-2 cursor-pointer">
            <input type={type} placeholder={placeholder} className="bg-white px-4 py-3 pr-10 font-extralight text-sm border border-gray-500 rounded-2xl w-full" />
            <span className="absolute right-4">{image}</span>
        </div>
    );
};