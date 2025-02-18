import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "../components/button";
import { WordCounter } from "../components/counter";
import { Delete } from "../icons/delete";
import { Card } from "../components/card";
import { ListFillter } from "../icons/list";
import { Grid } from "../icons/grid";
import { BACKEND_URL } from "../Url";
import { useCallback } from "react";
import { Search } from "../components/search";
import { SearchIcon } from "../icons/search";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import ReactMarkdown from "react-markdown";

const ArticleContent = ({ content }) => {
    return (
        <div className="prose">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};


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
        viewMode: "grid",
        searchQuery: ""
    });

    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const fileInputRef = useRef(null);
    const longFileInputRef = useRef(null);
    const editorRef = useRef(null);
    const editorInstance = useRef(null);
    const token = localStorage.getItem("authToken");
    const [categories, setCategories] = useState([]);

    // Initialize Editor.js
    useEffect(() => {
        if (uiState.showAddArticle && editorRef.current && !editorInstance.current) {
            const editor = new EditorJS({
                holder: editorRef.current,
                tools: {
                    header: {
                        class: Header,
                        inlineToolbar: ['link']
                    },
                    list: {
                        class: List,
                        inlineToolbar: true
                    },
                    paragraph: {
                        class: Paragraph,
                        inlineToolbar: true
                    }
                },
                data: articleForm.longDescription ? JSON.parse(articleForm.longDescription) : {},
                onChange: async () => {
                    const savedData = await editorInstance.current.save();
                    handleFormChange("longDescription", JSON.stringify(savedData));
                }
            });

            editorInstance.current = editor;
        }

        return () => {
            if (editorInstance.current) {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
    }, [uiState.showAddArticle]);

    async function fetchCategories() {
        try {
            const response = await axios.get(`${BACKEND_URL}home_page`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCategories(response.data.categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    const showMessage = (msg, duration = 1800) => {
        setUiState(prev => ({ ...prev, message: msg }));
        setTimeout(() => setUiState(prev => ({ ...prev, message: "" })), duration);
    };

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
            toggleAddArticle();
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
                const articles = response.data.knowledge_capsules || [];
                setArticles(articles);
                handleSearch(uiState.searchQuery, articles);
            } else {
                showMessage("Failed to load articles.");
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
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

    const handleSearch = (query, articleList = articles) => {
        setUiState(prev => ({ ...prev, searchQuery: query }));
        
        if (!query.trim()) {
            setFilteredArticles(articleList);
            return;
        }

        const searchResults = articleList.filter(article => 
            article.Short_title.toLowerCase().includes(query.toLowerCase()) ||
            article.Short_content.toLowerCase().includes(query.toLowerCase())
        );
        
        setFilteredArticles(searchResults);
    };

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

        // Reset Editor.js content
        if (editorInstance.current) {
            editorInstance.current.clear();
        }
    };

    const toggleAddArticle = () => {
        setUiState(prev => {
            const newShowAddArticle = !prev.showAddArticle;
            if (newShowAddArticle) {
                fetchCategories();
            }
            return {
                ...prev,
                showAddArticle: newShowAddArticle
            };
        });
    
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

    const renderArticleForm = () => (
        <div className="mt-6">
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

            <div className="space-y-4 mx-8 mt-4">
                <div>
                    <label className="text-black">Short Title</label>
                    <input
                        className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                        placeholder="Enter short title"
                        value={articleForm.shortTitle}
                        onChange={(e) => handleFormChange("shortTitle", e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-black">Short Description</label>
                    <WordCounter
                        className="bg-gray-300 h-20 w-full rounded-lg p-2 focus:outline-custom-orange"
                        placeholder="Enter short description"
                        value={articleForm.shortDescription}
                        onChange={(e) => handleFormChange("shortDescription", e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-black">Long Title</label>
                    <input
                        className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                        placeholder="Enter long title"
                        value={articleForm.longTitle}
                        onChange={(e) => handleFormChange("longTitle", e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-black">Long Description</label>
                    <div 
                        className="bg-gray-100 min-h-44 w-full rounded-lg p-2 shadow-inner border"
                        ref={editorRef}
                    />
                </div>

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

                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <label className="text-black">Category</label>
                        <select
                            className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                            value={articleForm.categoryId}
                            onChange={(e) => handleFormChange("categoryId", e.target.value)}
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-1/2">
                        <label className="text-black">Tags (comma-separated)</label>
                        <input
                            className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                            placeholder="e.g. tech, science"
                            value={articleForm.tags.join(", ")}
                            onChange={(e) =>
                                handleFormChange("tags", e.target.value.split(",").map(tag => tag.trim()))
                            }
                        />
                    </div>
                </div>

                {uiState.message && (
                    <p className="text-center text-red-600">{uiState.message}</p>
                )}
                {!uiState.message && (<div className="bottom-4 flex justify-end mt-2">
                    <Button
                        variant="primary"
                        text={uiState.uploading ? "Uploading..." : "Upload Article"}
                        size="md"
                        onClick={handleSubmit}
                        disabled={uiState.uploading}
                    />
                </div> )}
            </div>
        </div>
    );
    const [selectedArticle, setSelectedArticle] = useState(null);

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
    };

    const handleBackToList = () => {
        setSelectedArticle(null);
    };

    const renderArticleDetail = () => {
        if (!selectedArticle) return null;
        
        return (
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold text-[#151445]">{selectedArticle.Long_title || selectedArticle.Short_title}</h2>
                    <button 
                        onClick={handleBackToList}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200"
                    >
                        Back to List
                    </button>
                </div>
                
                {selectedArticle.Long_image && (
                    <div className="relative w-full h-64 md:h-96 overflow-hidden">
                        <img 
                            src={selectedArticle.Long_image} 
                            alt={selectedArticle.Long_title || selectedArticle.Short_title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                
                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Description</h3>
                        {selectedArticle.Long_content ? (
                            // <div dangerouslySetInnerHTML={{ __html: selectedArticle.Long_content }} />
                            <ArticleContent content={selectedArticle.Long_content} />
                        ) : (
                            <ArticleContent content={selectedArticle.Short_content} />
                        )}
                    </div>
                    
                    {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-md font-medium mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedArticle.tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="text-sm text-gray-500 mt-8">
                        {selectedArticle.author && (
                            <p>Author: {selectedArticle.author.name || `ID: ${selectedArticle.authorId}`}</p>
                        )}
                        {selectedArticle.created_at && (
                            <p>Published: {new Date(selectedArticle.created_at).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderArticleGrid = () => {
        if (filteredArticles.length === 0) {
            return (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">No articles found</p>
                </div>
            );
        }
        
        return (
            <div className="grid grid-cols-3 gap-4">
                {filteredArticles.map((article) => (
                    <div key={article.id} 
                         className="bg-white rounded-lg shadow-lg overflow-hidden relative cursor-pointer"
                         onClick={() => handleArticleClick(article)}>
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
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering article click
                                handleDelete(article.id);
                            }}
                        >
                            <Delete />
                        </div>
                    </div>
                ))}
            </div>
        );
    };


    const renderArticleList = () => {
        if (filteredArticles.length === 0) {
            return (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">No articles found</p>
                </div>
            );
        }
        
        return (
            <div className="flex flex-col gap-4 overflow-y-auto">
                {filteredArticles.map((article) => {
                    // Limit to approximately 2 lines
                    const maxLength = 120;
                    const truncatedContent = article.Short_content.length > maxLength
                        ? article.Short_content.substring(0, maxLength) + '...'
                        : article.Short_content;
                    
                    return (
                        <div key={article.id} 
                             onClick={() => handleArticleClick(article)}
                             className="cursor-pointer">
                            <Card
                                profileImage={article.Short_image}
                                name={article.Short_title}
                                userid={article.id}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-custom-light">
            <div className="absolute left-2 right-2 top-2 bottom-4 rounded-2xl h-[98vh] ml-64">
                <div className="text-3xl font-semibold mt-8 ml-6">
                    <p>
                        <span className="text-custom-orange">Article</span>
                        <span className="text-[#151445]"> Submission</span>
                    </p>
                </div>
    
                <div className="absolute flex justify-between w-full mt-4 px-6">
                    <div className="flex items-center">
                        {!uiState.showAddArticle && !selectedArticle && (
                            <div className="relative">
                                <Search image={<SearchIcon className="w-3 h-3 text-gray-400" />} 
                                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-custom-orange w-64" 
                                        type="text" 
                                        size={20} 
                                        placeholder="Search articles..." 
                                        value={uiState.searchQuery} 
                                        onChange={(e) => handleSearch(e.target.value)} />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {!uiState.showAddArticle && !selectedArticle && (
                            <Button
                                variant="custom"
                                text={uiState.viewMode === "grid" ? <ListFillter /> : <Grid />}
                                size="md"
                                onClick={toggleViewMode}
                            />
                        )}
                        
                        {!selectedArticle && (
                            <Button
                                variant="primary"
                                text={uiState.showAddArticle ? "Close Add Article" : "Add Article"}
                                size="md"
                                onClick={toggleAddArticle}
                            />
                        )}
                    </div>
                </div>
    
                {selectedArticle ? (
                    <div className="mt-20 mx-6 h-[75vh] overflow-y-auto">
                        {renderArticleDetail()}
                    </div>
                ) : (
                    uiState.showAddArticle ? renderArticleForm() : (
                        <div className="mt-20 mx-6 h-[75vh] overflow-y-auto">
                            {uiState.viewMode === "grid" ? renderArticleGrid() : renderArticleList()}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}