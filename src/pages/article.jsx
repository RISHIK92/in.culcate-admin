import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Button } from "../components/button";
import { WordCounter } from "../components/counter";
import { Delete } from "../icons/delete";
import { Card } from "../components/card";
import { BACKEND_URL } from "../Url";
import { Search } from "../components/search";
import { SearchIcon } from "../icons/search";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import ReactMarkdown from "react-markdown";

const ArticleContent = ({ content }) => {
    return (
        <div className="prose">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ITEMS_PER_PAGE = 9;

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
        tags: [],
    });

    const [uiState, setUiState] = useState({
        uploading: false,
        message: "",
        showAddArticle: false,
        viewMode: "grid",
        searchQuery: "",
    });

    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [categories, setCategories] = useState([]);
    const [id, setId] = useState("");
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedArticles, setPaginatedArticles] = useState([]);

    const fileInputRef = useRef(null);
    const longFileInputRef = useRef(null);
    const editorRef = useRef(null);
    const editorInstance = useRef(null);
    const token = localStorage.getItem("authToken");

    // Initialize Editor.js
    useEffect(() => {
        if (uiState.showAddArticle && editorRef.current && !editorInstance.current) {
            const editor = new EditorJS({
                holder: editorRef.current,
                tools: {
                    header: Header,
                    list: List,
                    paragraph: Paragraph,
                },
                data: articleForm.longDescription ? JSON.parse(articleForm.longDescription) : {},
                onChange: async () => {
                    try {
                        const savedData = await editor.save();
                        handleFormChange("longDescription", JSON.stringify(savedData));
                    } catch (error) {
                        console.error("Error saving editor data:", error);
                    }
                },
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

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}home_page`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCategories(response.data.categories || []);
            if (response.data.id) {
                setId(response.data.id);
                handleFormChange("authorId", response.data.id);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            showMessage("Failed to fetch categories");
        }
    }, [token]);

    // Show message
    const showMessage = useCallback((msg, duration = 1800) => {
        setUiState((prev) => ({ ...prev, message: msg }));
        setTimeout(() => setUiState((prev) => ({ ...prev, message: "" })), duration);
    }, []);

    // Validate file
    const validateFile = useCallback((file) => {
        if (!file) return false;
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            showMessage("Only JPG, PNG, and JPEG files are allowed.");
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            showMessage("File size must be less than 10MB.");
            return false;
        }
        return true;
    }, [showMessage]);

    // Handle file selection
    const handleFileSelect = useCallback((event) => {
        const file = event.target.files[0];
        if (!validateFile(file)) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setArticleForm((prev) => ({ ...prev, file, imageSrc: reader.result }));
        };
        reader.readAsDataURL(file);
    }, [validateFile]);

    // Handle long file selection
    const handleLongFileSelect = useCallback((event) => {
        const file = event.target.files[0];
        if (!validateFile(file)) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setArticleForm((prev) => ({ ...prev, longFile: file, longImageSrc: reader.result }));
        };
        reader.readAsDataURL(file);
    }, [validateFile]);

    // Handle form change
    const handleFormChange = useCallback((field, value) => {
        setArticleForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // Validate form
    const validateForm = useCallback(() => {
        const { file, longFile, shortTitle, longTitle, shortDescription, longDescription, categoryId } = articleForm;

        if (!file) {
            showMessage("Short image is required.");
            return false;
        }
        if (!longFile) {
            showMessage("Long image is required.");
            return false;
        }
        if (!shortTitle) {
            showMessage("Short title is required.");
            return false;
        }
        if (!longTitle) {
            showMessage("Long title is required.");
            return false;
        }
        if (!shortDescription) {
            showMessage("Short description is required.");
            return false;
        }
        if (!longDescription) {
            showMessage("Long description is required.");
            return false;
        }
        if (!id) {
            showMessage("Author ID is missing. Please reload the page.");
            return false;
        }
        if (!categoryId) {
            showMessage("Category is required.");
            return false;
        }
        return true;
    }, [articleForm, id, showMessage]);

    // Reset form
    const resetForm = useCallback(() => {
        setArticleForm({
            file: null,
            imageSrc: null,
            longFile: null,
            longImageSrc: null,
            shortTitle: "",
            longTitle: "",
            shortDescription: "",
            longDescription: "",
            authorId: id,
            categoryId: "",
            tags: [],
        });

        if (editorInstance.current) {
            editorInstance.current.clear();
        }
    }, [id]);

    // Fetch articles
    const fetchArticles = useCallback(async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}article/get_all_the_Article`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                const articlesData = response.data.knowledge_capsules || [];
                setArticles(articlesData);
                handleSearch(uiState.searchQuery, articlesData);
            } else {
                showMessage("Failed to load articles.");
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
            showMessage("Error loading articles. Please check your network.");
        } finally {
            setLoading(false);
        }
    }, [token, uiState.searchQuery, showMessage]);

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setUiState((prev) => ({ ...prev, uploading: true }));
        const formData = new FormData();
        formData.append("Short_image", articleForm.file);
        formData.append("Short_title", articleForm.shortTitle);
        formData.append("Short_content", articleForm.shortDescription);
        formData.append("Long_title", articleForm.longTitle);
        formData.append("Long_content", articleForm.longDescription);
        formData.append("Long_image", articleForm.longFile);
        formData.append("authorId", id);
        formData.append("categoryId", articleForm.categoryId);
        formData.append("tags", JSON.stringify(articleForm.tags));

        try {
            await axios.post(`${BACKEND_URL}article/create_article`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            showMessage("Article submitted successfully!");
            fetchArticles();
            resetForm();
            toggleAddArticle();
        } catch (error) {
            showMessage("Error submitting article. Please try again.");
            console.error("Submit error:", error);
        } finally {
            setUiState((prev) => ({ ...prev, uploading: false }));
        }
    };

    // Handle article deletion
    const handleDelete = async (articleId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this article?");
        if (!confirmDelete) return;

        try {
            setLoading(true);
            await axios.delete(`${BACKEND_URL}article/delete_article/${articleId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchArticles();
            showMessage("Article deleted successfully!");
        } catch (error) {
            console.error("Delete error:", error);
            showMessage("Error deleting article.");
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        }
    };

    // Handle search
    const handleSearch = useCallback((query, articleList = articles) => {
        setUiState((prev) => ({ ...prev, searchQuery: query }));

        if (!query.trim()) {
            setFilteredArticles(articleList);
            return;
        }

        const searchResults = articleList.filter(
            (article) =>
                article.Short_title.toLowerCase().includes(query.toLowerCase()) ||
                article.Short_content.toLowerCase().includes(query.toLowerCase())
        );

        setFilteredArticles(searchResults);
        setCurrentPage(1);
    }, [articles]);

    // Toggle add article form
    const toggleAddArticle = useCallback(() => {
        setUiState((prev) => {
            const newShowAddArticle = !prev.showAddArticle;
            if (newShowAddArticle) {
                fetchCategories();
            }
            return {
                ...prev,
                showAddArticle: newShowAddArticle,
            };
        });

        if (!uiState.showAddArticle) {
            resetForm();
        }
    }, [uiState.showAddArticle, fetchCategories, resetForm]);

    // Toggle view mode
    const toggleViewMode = useCallback(() => {
        setUiState((prev) => ({
            ...prev,
            viewMode: prev.viewMode === "grid" ? "list" : "grid",
        }));
    }, []);

    // Handle article click
    const handleArticleClick = useCallback((article) => {
        setSelectedArticle(article);
    }, []);

    // Handle back to list
    const handleBackToList = useCallback(() => {
        setSelectedArticle(null);
    }, []);

    // Pagination handlers
    const goToPage = useCallback((pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    }, [totalPages]);

    const goToNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    }, [currentPage, totalPages]);

    const goToPrevPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage]);

    // Update paginated articles
    useEffect(() => {
        const total = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
        setTotalPages(total > 0 ? total : 1);

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setPaginatedArticles(filteredArticles.slice(startIndex, endIndex));

        if (currentPage > total && total > 0) {
            setCurrentPage(total);
        }
    }, [filteredArticles, currentPage]);

    // Fetch articles and categories on mount
    useEffect(() => {
        fetchArticles();
        fetchCategories();
    }, [fetchArticles, fetchCategories]);

    // Handle search query change
    useEffect(() => {
        handleSearch(uiState.searchQuery);
    }, [articles, uiState.searchQuery, handleSearch]);

    // Render pagination
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center space-x-2 mt-6 mb-4">
                <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-custom-orange text-white hover:bg-orange-600'}`}
                >
                    Previous
                </button>

                <div className="flex items-center space-x-1">
                    {renderPageNumbers()}
                </div>

                <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-custom-orange text-white hover:bg-orange-600'}`}
                >
                    Next
                </button>
            </div>
        );
    };

    // Render page numbers
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(
                <button
                    key={1}
                    onClick={() => goToPage(1)}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                    1
                </button>
            );

            if (startPage > 2) {
                pageNumbers.push(<span key="ellipsis1" className="px-1">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-1 rounded ${i === currentPage ? 'bg-custom-orange text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(<span key="ellipsis2" className="px-1">...</span>);
            }

            pageNumbers.push(
                <button
                    key={totalPages}
                    onClick={() => goToPage(totalPages)}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                    {totalPages}
                </button>
            );
        }

        return pageNumbers;
    };

    // Render article form
    const renderArticleForm = () => (
        <div className="mt-6">
            <div className="flex flex-col md:flex-row md:justify-center gap-4 px-4 md:px-0">
                <div className="flex justify-center mt-4 md:mx-8">
                    <div
                        onClick={() => !uiState.uploading && fileInputRef.current?.click()}
                        className={`h-40 w-full max-w-xs md:w-80 bg-gray-300 rounded-xl ${uiState.uploading ? "opacity-20 cursor-not-allowed" : "opacity-40 cursor-pointer"} flex flex-col justify-center items-center relative`}
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
                        disabled={uiState.uploading}
                    />
                </div>

                <div className="flex justify-center mt-4">
                    <div
                        onClick={() => !uiState.uploading && longFileInputRef.current?.click()}
                        className={`h-40 w-full max-w-xs md:w-80 bg-gray-300 rounded-xl ${uiState.uploading ? "opacity-20 cursor-not-allowed" : "opacity-40 cursor-pointer"} flex flex-col justify-center items-center relative`}
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
                        disabled={uiState.uploading}
                    />
                </div>
            </div>

            <div className="space-y-4 mx-4 md:mx-8 mt-4">
                <div>
                    <label className="text-black">Short Title</label>
                    <input
                        className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                        placeholder="Enter short title"
                        value={articleForm.shortTitle}
                        onChange={(e) => handleFormChange("shortTitle", e.target.value)}
                        disabled={uiState.uploading}
                    />
                </div>

                <div>
                    <label className="text-black">Short Description</label>
                    <WordCounter
                        className="bg-gray-300 h-20 w-full rounded-lg p-2 focus:outline-custom-orange"
                        placeholder="Enter short description"
                        value={articleForm.shortDescription}
                        onChange={(e) => handleFormChange("shortDescription", e.target.value)}
                        disabled={uiState.uploading}
                    />
                </div>

                <div>
                    <label className="text-black">Long Title</label>
                    <input
                        className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                        placeholder="Enter long title"
                        value={articleForm.longTitle}
                        onChange={(e) => handleFormChange("longTitle", e.target.value)}
                        disabled={uiState.uploading}
                    />
                </div>

                <div>
                    <label className="text-black">Long Description</label>
                    <div
                        className="bg-gray-100 min-h-44 w-full rounded-lg p-2 shadow-inner border"
                        ref={editorRef}
                    />
                </div>

                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                    <div className="w-full md:w-1/2">
                        <label className="text-black">Category</label>
                        <select
                            className="bg-gray-300 h-10 w-full rounded-lg px-3 focus:outline-custom-orange"
                            value={articleForm.categoryId}
                            onChange={(e) => handleFormChange("categoryId", e.target.value)}
                            disabled={uiState.uploading}
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
                            disabled={uiState.uploading}
                        />
                    </div>
                </div>

                {uiState.message && (
                    <p className="text-center text-red-600">{uiState.message}</p>
                )}

                <div className="bottom-4 flex justify-end mt-2">
                    <Button
                        variant="primary"
                        text={uiState.uploading ? "Saving Article..." : "Save Article"}
                        size="md"
                        onClick={handleSubmit}
                        disabled={uiState.uploading}
                    />
                </div>
            </div>
        </div>
    );

    // Render article detail
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
                            <ArticleContent content={selectedArticle.Short_content} />
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
                </div>
            </div>
        );
    };

    // Render article grid
    const renderArticleGrid = () => {
        if (paginatedArticles.length === 0) {
            return (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">No articles found</p>
                </div>
            );
        }

        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedArticles.map((article) => (
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
                {renderPagination()}
            </>
        );
    };

    // Render article list
    const renderArticleList = () => {
        if (paginatedArticles.length === 0) {
            return (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">No articles found</p>
                </div>
            );
        }

        return (
            <>
                <div className="flex flex-col gap-4 overflow-y-auto">
                    {paginatedArticles.map((article) => (
                        <div key={article.id}
                            onClick={() => handleArticleClick(article)}
                            className="cursor-pointer">
                            <Card
                                profileImage={article.Short_image}
                                name={article.Short_title}
                                userid={article.id}
                            />
                        </div>
                    ))}
                </div>
                {renderPagination()}
            </>
        );
    };

    return (
        <div className="bg-custom-light">
            <div className="absolute left-2 right-2 top-2 bottom-4 rounded-2xl h-[98vh] ml-0 md:ml-64">
                <div className="text-2xl md:text-3xl font-semibold mt-4 md:mt-8 ml-4 md:ml-6">
                    <p>
                        <span className="text-custom-orange">Article</span>
                        <span className="text-[#151445]"> Submission</span>
                    </p>
                </div>

                <div className="absolute flex flex-col md:flex-row justify-between w-full mt-4 px-4 md:px-6">
                    <div className="flex items-center mb-4 md:mb-0">
                        {!uiState.showAddArticle && !selectedArticle && (
                            <div className="relative w-full md:w-auto">
                                <Search
                                    image={<SearchIcon className="w-3 h-3 text-gray-400" />}
                                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-custom-orange w-full md:w-64"
                                    type="text"
                                    size={20}
                                    placeholder="Search articles..."
                                    value={uiState.searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 justify-end">
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

                {loading ? (
                    <div className="flex mt-24 justify-center items-center h-[70vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-custom-orange border-opacity-50"></div>
                    </div>
                ) : (
                    selectedArticle ? (
                        <div className="mt-20 mx-6 h-[75vh] overflow-y-auto">
                            {renderArticleDetail()}
                        </div>
                    ) : (
                        uiState.showAddArticle ? renderArticleForm() : (
                            <div className="mt-20 mx-6 h-[75vh] overflow-y-auto">
                                {uiState.viewMode === "grid" ? renderArticleGrid() : renderArticleList()}
                            </div>
                        )
                    )
                )}
            </div>
        </div>
    );
};