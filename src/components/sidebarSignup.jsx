import axios from "axios";
import { Button } from "./button";
import { Input } from "./input";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Signin } from "../pages/signin";

export function SidebarSignup({ setFilter }) {
    const emailRef = useRef()
    const passwordRef = useRef();
    const navigate = useNavigate();

    async function handleSignup() {
        alert("signed up")
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        axios.post(`${""}/signup`,{
            email,
            password
        })
        navigate("/signin")
    }


    return (
        <div className="h-screen bg-white border-r rounded-2xl mb-2 w-1/3 fixed right-0 top-0 pl-6">
            <div className="flex justify-center mt-20">
                <div className="text-3xl font-semibold mt-10">
                    <p><span className="text-[#FF6A34]">in.</span><span className="text-[#151445]">culcate</span></p>
                </div>
            </div>
            <div className="flex justify-center mt-8 text-xl font-medium">
                    <p>SIGN UP</p>
            </div>
            <div className="flex justify-center mt-8 text-md font-thin">
                <p>Enter your credentials to create an account</p>
            </div>
            <div className="flex ml-4 text-sm font-extralight mt-20">
                <p>Email</p>
            </div>
            <div className="flex justify-center mt-4">
                <Input placeholder="Enter your email" reference={emailRef}/>
            </div>
            <div className="flex ml-4 text-sm font-extralight mt-6">
                <p>Password</p>
            </div>
            <div className="flex justify-center mt-4">
                <Input placeholder="Enter your password" reference={passwordRef}/>
            </div>
            <div className="flex justify-center mt-4 m-6">
                <Button variant="primary" text="Sign Up" size="lg" fullWidth={true} onClick={handleSignup}/>
            </div>
        </div>
    );
}
