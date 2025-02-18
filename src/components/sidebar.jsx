import { useEffect, useState } from "react";
import { Admin } from "../icons/admin";
import { Article } from "../icons/article";
import { Home } from "../icons/home";
import { Users } from "../icons/users";
import { SideBarItem } from "./sidebarItem";
import { Logout } from "../icons/logout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Creator } from "../icons/creator";
import { BACKEND_URL } from "../Url";

export function Sidebar({ activeItem, setActiveItem }) {
    const [adminName, setAdminName] = useState("User not found");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
    
        axios.get(`${BACKEND_URL}home_page/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            setAdminName(response.data.name);
        })
        .catch(() => {
            console.error("Failed to fetch admin name.");
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);
    

    if (loading) {
        return <div className="animate-spin mt-80 ml-24 rounded-full h-12 w-12 border-t-4 border-custom-orange border-opacity-50"></div>;
    }

    return (
        <div className="h-screen bg-[#FFD9C4] border-r w-64 fixed left-0 top-0 pl-6">
            <div className="text-md pt-4 ml-8 text-[#FF6A34]">
                {adminName !== "User not found" && <p>Welcome Back</p>}
                <div className="text-black text-xl font-medium">
                    <p>{adminName}</p>
                </div>
            </div>
            <div className="mt-64">
                <SideBarItem icon={<Home />} text="Home" isActive={activeItem === "Home"} onClick={() => setActiveItem("Home")} />
                <SideBarItem icon={<Article className="h-6 w-6" />} text="Article" isActive={activeItem === "Article"} onClick={() => setActiveItem("Article")} />
                <SideBarItem icon={<Users className="h-6 w-6" />} text="Consumers" isActive={activeItem === "Users"} onClick={() => setActiveItem("Users")} />
                <SideBarItem icon={<Creator className="h-6 w-6" />} text="Content Creators" isActive={activeItem === "Creators"} onClick={() => setActiveItem("Creators")} />
                <SideBarItem icon={<Admin className="h-6 w-6" />} text="Admin" isActive={activeItem === "Admin"} onClick={() => setActiveItem("Admin")} />
            </div>
            <div onClick={() => {
                localStorage.removeItem("authToken");
                navigate("/signin");
            }} className="flex absolute bottom-6 right-12 cursor-pointer">
                <p>Logout</p>
                <button className="ml-5">
                    <Logout />
                </button>
            </div>
        </div>
    );
}
