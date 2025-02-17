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
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;
        console.log(email, password);
        if (!email || !password) {
            setError("Email and password are required!");
            return;
        }
        setLoading(true); // Set loading to true when the request starts

        try {
            const response = await axios.post(`${BACKEND_URL}login`, {
                email,
                password
            });

            localStorage.setItem('authToken', response.data.token);
            navigate("/dashboard");

        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false); // Set loading to false when the request completes
        }
    }

    return (
        <div className="h-screen bg-white border-r rounded-2xl mb-2 w-1/3 fixed right-0 top-0 pl-6">
            <div className="flex justify-center mt-20">
                <div className="text-3xl font-semibold mt-10">
                    <p><span className="text-[#FF6A34]">in.</span><span className="text-[#151445]">culcate</span></p>
                </div>
            </div>
            <div className="flex justify-center mt-8 text-xl font-medium">
                <p>SIGN IN</p>
            </div>
            <div className="flex justify-center mt-8 text-md font-thin">
                <p>Enter your credentials to access your account</p>
            </div>
            {error && (
                <div className="text-red-600 text-sm text-center mt-2">{error}</div>
            )}
            <div className="flex ml-4 text-sm font-extralight mt-20">
                <p>Email</p>
            </div>
            <div className="flex justify-center mt-4">
                <Input placeholder="Enter your email" ref={emailRef} />
            </div>
            <div className="flex ml-4 text-sm font-extralight mt-6">
                <p>Password</p>
            </div>
            <div className="flex justify-center mt-4">
                <Input type="password" placeholder="Enter your password" ref={passwordRef} />
            </div>
            <div className="flex justify-center mt-4 m-6">
                {!loading ? (
                    <Button variant="primary" text="Sign In" size="lg" fullWidth={true} onClick={handleSignin} />
                ):                 <div className="flex justify-center mt-4">
                    {/* Spinner */}
                    <div className="w-8 h-8 border-4 border-t-4 border-[#FF6A34] border-solid rounded-full animate-spin"></div>
                </div>}
            </div>
        </div>
    );
}
