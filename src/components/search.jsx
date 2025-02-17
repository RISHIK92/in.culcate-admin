export const Search = ({ onClick, type, placeholder, image, value, onChange }) => {
    return (
        <div onClick={onClick} className="relative flex items-center text-md px-2 py-2 cursor-pointer">
            <input
                type={type}
                placeholder={placeholder}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-custom-orange w-64"
                value={value}
                onChange={onChange}
            />
            <span className="absolute left-4">{image}</span>
        </div>
    );
};
