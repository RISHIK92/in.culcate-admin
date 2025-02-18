import { Box } from "../components/box";
import { Search } from "../components/search";
import { Sidebar } from "../components/sidebar";
import { Admin } from "../icons/admin";
import { Article } from "../icons/article";
import { Home } from "../icons/home";
import { Notification } from "../icons/notifications";
import { SearchIcon } from "../icons/search";
import { Users } from "../icons/users";
import { useState, useEffect } from "react";
import axios from "axios";
import { ArticlePage } from "./article";
import { AdminPage } from "./admin";
import { UserPage } from "./user";
import { CreatorPage } from "./creator";
import { Creator } from "../icons/creator";
import { BACKEND_URL } from "../Url";

export function Dashboard() {
    const [activeItem, setActiveItem] = useState("Home");
    const [totalUsers, setTotalUsers] = useState(null);
    const [totalCreators, setTotalCreators] = useState(null);
    const [numArticles, setNumArticles] = useState(null);
    const [totalAdmin, setTotalAdmin] = useState(null);
    const [totalCategories,setTotalCategories] = useState(null);
    const [totalTags,setTotalTags] = useState(null);


    useEffect(() => {
        const token = localStorage.getItem("authToken");

        axios.get(`${BACKEND_URL}home_page`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        
        .then(response => {
            setTotalUsers(response.data.consumer_count);
            setNumArticles(response.data.knowledge_capsule_count);
            setTotalCreators(response.data.content_creator_count);
            setTotalAdmin(response.data.admin_count);
            setTotalCategories(response.data.category_count);
            setTotalTags(response.data.tag_count);
        })
        .catch(() => {
            console.error("Failed to fetch admin name.");
        })
    }, []);

    const renderContent = () => {
        switch (activeItem) {
            case "Article":
                return <ArticlePage />;
            case "Users":
                return <UserPage />;
            case "Creators":
                return <CreatorPage />;
            case "Admin":
                return <AdminPage />;
            default:
                return (
                    <div className="flex flex-wrap gap-8 mt-24 ml-72 bg-white">
                        <Box Icon={Admin} color="bg-custom-orange" text={totalAdmin} textColor="text-white" heading="Total Admin" />
                        <Box Icon={Creator} color="bg-custom-orange" textColor="text-white" text={totalCreators} heading="Total Content Creator" />
                        <Box Icon={Users} color="bg-custom-orange" text={totalUsers} textColor="text-white" heading="Total Consumer" />
                        <Box Icon={Article} color="bg-custom-light" text={numArticles} heading="Number of Knowledge Capsule" />
                        <Box Icon={Article} color="bg-custom-light" text={totalTags} textColor="text-black" heading="Total Tags" />
                        <Box Icon={Article} color="bg-custom-light" text={totalCategories} textColor="text-black" heading="Total Categories" />
                        <div className="absolute right-4 top-3 flex items-center gap-4">
                            <div className="relative w-[140px] overflow-hidden transition-all duration-300 focus-within:w-64">
                                <Search type="text" placeholder="Search..." image={<SearchIcon className="w-3 h-3 text-gray-400" />} />
                            </div>
                                <button className="text-gray-400">
                                    <Notification />
                                </button>
                        </div>
                    </div>
                    
                );
        }
    };

    return (
        <div className="flex">
            <div>
                <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
            </div>

            <div className="flex-1">
                {renderContent()}
            </div>
        </div>
    );
}
