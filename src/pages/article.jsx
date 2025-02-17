import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "../components/button";
import { WordCounter } from "../components/counter";
import { Delete } from "../icons/delete";
import { Card } from "../components/card";
import { List } from "../icons/list";
import { Grid } from "../icons/grid";
import { BACKEND_URL } from "../Url";
import { useCallback } from "react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; 
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export const ArticlePage = () => {
    const [articleForm, setArticleForm] = useState({
        file: null,
        imageSrc: null,
        longFile: null,
        longImageSrc: null,
        shortTitle: "",
        longTitle: "",
        shortDescription: "",
        longDescription: "",
        authorId: "",
        categoryId: "",
        tags: []
    });

    const [uiState, setUiState] = useState({
        uploading: false,
        message: "",
        showAddArticle: false,
        viewMode: "grid"
    });

    const [articles, setArticles] = useState([]);
    const fileInputRef = useRef(null);
    const longFileInputRef = useRef(null);
    const token = localStorage.getItem("authToken");

    // Message handling
    const showMessage = (msg, duration = 1800) => {
        setUiState(prev => ({ ...prev, message: msg }));
        setTimeout(() => setUiState(prev => ({ ...prev, message: "" })), duration);
    };

    // File handling
    const validateFile = (file) => {
        if (!file) return false;
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            showMessage("Only JPG, PNG, and JPEG files are allowed.");
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            showMessage("File size must be less than 2MB.");
            return false;
        }
        return true;
    };

    const handleFileSelect = useCallback((event) => {
        const file = event.target.files[0];
        if (!validateFile(file)) return;
    
        const reader = new FileReader();
        reader.onloadend = () => {
            setArticleForm(prev => ({ ...prev, file, imageSrc: reader.result }));
        };
        reader.readAsDataURL(file);
    }, []);

    const handleLongFileSelect = useCallback((event) => {
        const file = event.target.files[0];
        if (!validateFile(file)) return;
    
        const reader = new FileReader();
        reader.onloadend = () => {
            setArticleForm(prev => ({ ...prev, longFile: file, longImageSrc: reader.result }));
        };
        reader.readAsDataURL(file);
    }, []);

    // Form handling
    const handleFormChange = (field, value) => {
        setArticleForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        const { file, longFile, shortTitle, longTitle, shortDescription, longDescription, authorId, categoryId } = articleForm;
        if (!file || !longFile || !shortTitle || !longTitle || !shortDescription || !longDescription || !authorId || !categoryId) {
            showMessage("All fields are required.");
            return false;
        }
        if (isNaN(Number(authorId)) || isNaN(Number(categoryId))) {
            showMessage("Author ID and Category ID must be numbers.");
            return false;
        }
        return true;
    };
    

    // API calls
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setUiState(prev => ({ ...prev, uploading: true }));
        const formData = new FormData();
        formData.append("Short_image", articleForm.file);
        formData.append("Short_title", articleForm.shortTitle);
        formData.append("Short_content", articleForm.shortDescription);
        formData.append("Long_title", articleForm.longTitle);
        formData.append("Long_content", articleForm.longDescription);
        formData.append("Long_image", articleForm.longFile);
        formData.append("authorId", articleForm.authorId);
        formData.append("categoryId", articleForm.categoryId);
        formData.append("tags", JSON.stringify(articleForm.tags));


        try {
            await axios.post(
                `${BACKEND_URL}article/create_article`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            showMessage("Article submitted successfully!");
            fetchArticles();
            resetForm();
        } catch (error) {
            showMessage("Error submitting article. Please try again.");
            console.error("Submit error:", error);
        } finally {
            setUiState(prev => ({ ...prev, uploading: false }));
        }
    };
    
    const fetchArticles = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}article/get_all_the_Article`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (response.status === 200) {
                setArticles(response.data.knowledge_capsules || []);
            } else {
                showMessage("Failed to load articles.");
            }
        } catch (error) {
            console.error("Error fetching articles:", error.response?.data || error.message);
            showMessage("Error loading articles. Please check your network.");
        }
    };
    

const handleDelete = async (articleId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this article?");
    if (!confirmDelete) return;

    try {
        await axios.delete(`${BACKEND_URL}article/delete_article/${articleId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchArticles();
        showMessage("Article deleted successfully!");
    } catch (error) {
        console.error("Delete error:", error);
        showMessage("Error deleting article.");
    }
};


    // UI helpers
    const resetForm = () => {
        setArticleForm({
            file: null,
            imageSrc: null,
            longFile: null,
            longImageSrc: null,
            shortTitle: "",
            longTitle: "",
            shortDescription: "",
            longDescription: "",
            authorId: "",
            categoryId: "",
            tags: []
        });
    };
    

    const toggleAddArticle = () => {
        setUiState(prev => ({
            ...prev,
            showAddArticle: !prev.showAddArticle
        }));
        if (!uiState.showAddArticle) {
            resetForm();
        }
    };

    const toggleViewMode = () => {
        setUiState(prev => ({
            ...prev,
            viewMode: prev.viewMode === "grid" ? "list" : "grid"
        }));
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    // Render helper components
    const renderArticleForm = () => (
        <div className="mt-6">
            {/* Short Image Upload */}
        <div className="flex">
            <div className="flex justify-center mt-4 ml-36 mr-36">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-40 w-80 bg-gray-300 rounded-xl opacity-40 flex flex-col justify-center items-center cursor-pointer relative"
                >
                    {articleForm.imageSrc ? (
                        <img
                            src={articleForm.imageSrc}
                            alt="Preview"
                            className="h-full w-full rounded-xl object-cover"
                        />
                    ) : (
                        <p className="text-black">Upload Short Image</p>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                />
            </div>

                            {/* Long Image Upload */}
                            <div className="flex justify-center mt-4">
                    <div
                        onClick={() => longFileInputRef.current?.click()}
                        className="h-40 w-80 bg-gray-300 rounded-xl opacity-40 flex flex-col justify-center items-center cursor-pointer relative"
                    >
                        {articleForm.longImageSrc ? (
                            <img
                                src={articleForm.longImageSrc}
                                alt="Long Preview"
                                className="h-full w-full rounded-xl object-cover"
                            />
                        ) : (
                            <p className="text-black">Upload Long Image</p>
                        )}
                    </div>
                    <input
                        ref={longFileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleLongFileSelect}
                        accept="image/*"
                    />
                </div>
            </div>
            {/* Form Fields */}
            <div className="space-y-4 mx-8 mt-4">
                {/* Short Title */}
                <div>
                    <label className="text-black">Short Title</label>
                    <input
                        className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                        placeholder="Enter short title"
                        value={articleForm.shortTitle}
                        onChange={(e) => handleFormChange("shortTitle", e.target.value)}
                    />
                </div>
    
                {/* Short Description */}
                <div>
                    <label className="text-black">Short Description</label>
                    <WordCounter
                        className="bg-gray-300 h-20 w-full rounded-lg p-2 focus:outline-custom-orange"
                        placeholder="Enter short description"
                        value={articleForm.shortDescription}
                        onChange={(e) => handleFormChange("shortDescription", e.target.value)}
                    />
                </div>
    
                {/* Long Title */}
                <div>
                    <label className="text-black">Long Title</label>
                    <input
                        className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                        placeholder="Enter long title"
                        value={articleForm.longTitle}
                        onChange={(e) => handleFormChange("longTitle", e.target.value)}
                    />
                </div>
    
                {/* Long Description */}
                <div>
                    <label className="text-black">Long Description</label>
                    <WordCounter
                        className="bg-gray-300 h-44 w-full rounded-lg p-2 focus:outline-custom-orange"
                        placeholder="Enter long description"
                        value={articleForm.longDescription}
                        onChange={(e) => handleFormChange("longDescription", e.target.value)}
                    />
                </div>
    
                {/* Author ID */}
                <div>
                    <label className="text-black">Author ID</label>
                    <input
                        type="number"
                        className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                        placeholder="Enter author ID"
                        value={articleForm.authorId}
                        onChange={(e) => handleFormChange("authorId", e.target.value)}
                    />
                </div>
    
                {/* Category ID */}
                <div>
                    <label className="text-black">Category ID</label>
                    <input
                        type="number"
                        className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                        placeholder="Enter category ID"
                        value={articleForm.categoryId}
                        onChange={(e) => handleFormChange("categoryId", e.target.value)}
                    />
                </div>
    
                {/* Tags */}
                <div>
                    <label className="text-black">Tags (comma-separated)</label>
                    <input
                        className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                        placeholder="e.g. tech, science"
                        value={articleForm.tags}
                        onChange={(e) =>
                            handleFormChange("tags", e.target.value.split(",").map(tag => tag.trim()))
                        }
                    />
                </div>
    
                {/* Submit Button */}
                <div className="flex justify-end mt-2">
                    <Button
                        variant="primary"
                        text={uiState.uploading ? "Uploading..." : "Save Article"}
                        size="md"
                        onClick={handleSubmit}
                        disabled={uiState.uploading}
                    />
                </div>
            </div>
        </div>
    );
    

    const renderArticleGrid = () => (
        <div className="grid grid-cols-3 gap-4">
            {articles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-lg overflow-hidden relative">
                    <img
                        src={article.Short_image}
                        alt={article.Short_title}
                        className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                        <h3 className="text-xl font-semibold">{article.Short_title}</h3>
                        <p className="text-sm text-gray-600 mt-2">{article.Short_content}</p>
                    </div>
                    <div
                        className="absolute bottom-2 right-2 cursor-pointer"
                        onClick={() => handleDelete(article.id)}
                    >
                        <Delete />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderArticleList = () => (
        <div className="flex flex-col gap-4">
            {articles.map((article) => (
                <Card
                    key={article.id}
                    profileImage={article.Short_image}
                    name={article.Short_title}
                    email={article.Short_content}
                    userid={article.id}
                />
            ))}
        </div>
    );

    return (
        <div className="bg-custom-light">
            <div className="absolute left-2 right-2 top-2 bottom-4 bg-[#F8F8F8] rounded-2xl h-[98vh] shadow-md ml-64">
                <div className="text-3xl font-semibold mt-8 ml-6">
                    <p>
                        <span className="text-custom-orange">Article</span>
                        <span className="text-[#151445]"> Submission</span>
                    </p>
                </div>

                <div className="absolute flex justify-end w-full mt-4 px-6">
                    <div className="flex items-center gap-3">
                        {!uiState.showAddArticle && (
                            <Button
                                variant="custom"
                                text={uiState.viewMode === "grid" ? <List /> : <Grid />}
                                size="md"
                                onClick={toggleViewMode}
                            />
                        )}
                        <Button
                            variant="primary"
                            text={uiState.showAddArticle ? "Close Add Article" : "Add Article"}
                            size="md"
                            onClick={toggleAddArticle}
                        />
                    </div>
                </div>

                {uiState.showAddArticle ? renderArticleForm() : (
                    <div className="mt-20 mx-6 h-[75vh] overflow-y-auto">
                        {uiState.viewMode === "grid" ? renderArticleGrid() : renderArticleList()}
                    </div>
                )}

                {uiState.message && (
                    <p className="text-center mt-4 text-red-600">{uiState.message}</p>
                )}
            </div>
        </div>
    );
};