import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { Add } from "../components/add";
import { BACKEND_URL } from "../Url";

export function UserPage() {
    const [showAddUser, setShowAddUser] = useState(false);
    const [users, setUsers] = useState([]);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}consumer/consumer/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleDelete = async (userid) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this User?");
        if (!confirmDelete) return;
        try {
            await axios.delete(`${BACKEND_URL}consumer/consumer_delete/${userid}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchUsers();
        } catch(error) {
            console.log("Error Deleting User:",error);
        }
    }

    return (
        <div>
            <div className="bg-custom-light">
                <div className="absolute left-1 right-2 top-2 bottom-4 bg-[#F8F8F8] rounded-2xl h-[100vh] shadow-md ml-64">
                    <div className="text-2xl font-semibold mt-12">
                        <div className="flex justify-between">
                            <p className="ml-6">
                                <span className="text-[#151445]">User List</span>
                            </p>
                            <Button variant="primary" text={showAddUser ? "Close" : "Add User"} size="custom" onClick={() => setShowAddUser(prev => !prev)} />

                        </div>
                        <hr className="mt-4 border m-8"></hr>
                    </div>

                    {showAddUser ? (
                        <div className="flex justify-center items-center mt-6">
                            <Add name="User" role="User" onClose={() => setShowAddUser(false)} fetch={() => fetchUsers()}/>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 ml-6 mr-6 max-h-[80vh] overflow-y-auto">
                            {users.map((user, index) => (
                                <Card key={index} profileImage="src/icons/OIP.jpeg" name={user.name} email={user.email} userid={user.id} date={user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A'} onClick={() => handleDelete(user.id)}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}