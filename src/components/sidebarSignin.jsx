import axios from "axios";
import { Button } from "./button";
import { Input } from "./input";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../Url";

export function SidebarSignin() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignin() {
        const email = emailRef.current?.value.trim();
        const password = passwordRef.current?.value.trim();
        
        if (!email || !password) {
            setError("Email and password are required!");
            return;
        }
        
        setLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}login`, {
                email,
                password
            });
        
            // Store token on successful login
            localStorage.setItem("authToken", response.data.token);
            navigate("/dashboard");
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Username and Password doesn't match.");
            } else {
                setError(err.response?.data?.message || "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }        
    }

    return (
        <div className="fixed right-0 top-0 w-1/3 h-screen bg-white border-r rounded-2xl">
            <div className="flex flex-col items-center px-8 pt-20">
                {/* Logo */}
                <div className="text-3xl font-semibold mt-10">
                    <span className="text-[#FF6A34]">in.</span>
                    <span className="text-[#151445]">culcate</span>
                </div>

                {/* Header */}
                <h1 className="mt-8 text-xl font-medium">SIGN IN</h1>
                <p className="mt-8 text-md font-thin text-center">
                    Enter your credentials to access your account
                </p>

                {/* Error Message */}
                {error && (
                    <div className="mt-2 text-red-600 text-sm text-center">{error}</div>
                )}

                {/* Form */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSignin();
                }} className="w-full mt-16 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-extralight">Email</label>
                        <Input 
                            placeholder="Enter your email" 
                            ref={emailRef}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-extralight">Password</label>
                        <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            ref={passwordRef}
                        />
                    </div>

                    <div className="mt-6">
                        {loading ? (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-custom-orange border-opacity-50"></div>
                            </div>
                        ) : (
                            <Button 
                                variant="primary" 
                                text="Sign In" 
                                size="lg" 
                                fullWidth={true} 
                                onClick={handleSignin} 
                                type="submit"
                            />
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}