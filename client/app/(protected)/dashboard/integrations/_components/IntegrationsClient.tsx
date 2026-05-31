// app/integrations/IntegrationsClient.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { StorageIntegration, UploadUrlResponse } from "../types";
import IntegrationCard from "./IntegrationCard";
import ConnectStorageModal from "./ConnectStorageModal";
import UploadFileModal from "./UploadFileModal";
import axios from "axios";
import apiClient from "@/app/lib/apiClient";

const IntegrationsClient = () => {
    const [integrations, setIntegrations] = useState<StorageIntegration[]>([]);
    const [activeIntegration, setActiveIntegration] = useState<StorageIntegration | null>(null);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const isProviderConnected = (provider: string) => {
        return activeIntegration?.provider === provider;
    };

    // Fetch active integration on load
    const fetchActiveIntegration = async () => {
        try {
            const response = await apiClient.get("/storage/active");
            const integration = response.data?.data?.[0] || null;
            if (integration) {
                setActiveIntegration(integration);
                setIntegrations([integration]);
            } else {
                setActiveIntegration(null);
                setIntegrations([]);
            }
        } catch (error) {
            console.error("Error fetching active integration:", error);
            setActiveIntegration(null);
            setIntegrations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveIntegration();
    }, []);

    const handleConnectStorage = async (provider: string, config: any) => {
        try {
            const response = await apiClient.post('/storage/connect', {
                provider,
                config,
            });

            if (response.data) {
                setActiveIntegration(response.data);
                setIntegrations([response.data]);
                setIsConnectModalOpen(false);
            }
        } catch (error: any) {
            console.error("Error connecting storage:", error);
            alert(error.response?.data?.error || "Failed to connect storage");
        }
    };

    const handleUploadFile = async (file: File) => {
        if (!activeIntegration) {
            alert("No active storage integration found");
            return;
        }

        setUploading(true);
        try {
            // Get upload URL
            const uploadUrlResponse = await apiClient.post<UploadUrlResponse>('/storage/upload-url', {
                fileName: file.name,
                fileType: file.type,
            });

            const { uploadUrl, key } = uploadUrlResponse.data;

            // Upload file to the generated URL
            await axios.put(uploadUrl, file, {
                headers: {
                    "Content-Type": file.type,
                },
            });

            alert(`File "${file.name}" uploaded successfully!`);
            setIsUploadModalOpen(false);
            setSelectedFile(null);
        } catch (error: any) {
            console.error("Error uploading file:", error);
            alert(error.response?.data?.error || "Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadFile = async (fileKey: string) => {
        if (!activeIntegration) {
            alert("No active storage integration found");
            return;
        }

        try {
            const response = await apiClient.get(`/storage/download-url/${encodeURIComponent(fileKey)}`);
            const { url } = response.data;
            window.open(url, "_blank");
        } catch (error: any) {
            console.error("Error downloading file:", error);
            alert(error.response?.data?.error || "Failed to generate download link");
        }
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case "aws_s3":
                return "/aws-icon.png";
            case "cloudinary":
                return "/cloudinary-icon.png";
            case "google_drive":
                return "/google-drive-icon.png";
            default:
                return "/storage-icon.png";
        }
    };

    if (loading) {
        return (
            <div className="p-4 flex justify-center items-center min-h-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lamaSky"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Storage Integrations
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Connect and manage your cloud storage providers
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {activeIntegration && (
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="px-5 py-2.5 bg-linear-to-r from-lamaSky to-lamaYellow text-gray-700 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Upload File
                            </button>
                        )}
                        <button
                            onClick={() => setIsConnectModalOpen(true)}
                            className="px-5 py-2.5 bg-white border-2 border-lamaSky text-gray-700 font-semibold rounded-xl hover:bg-lamaSky/10 transition-all duration-300 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Connect New Storage
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Integration Card */}
            {activeIntegration && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-yellow-100llow rounded-full"></span>
                        Active Integration
                    </h2>
                    <IntegrationCard
                        integration={activeIntegration}
                        onDownload={handleDownloadFile}
                        isActive={true}
                    />
                </div>
            )}

            {/* Available Integrations Section */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-lamaSky rounded-full"></span>
                    Available Providers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* AWS S3 Card */}
                    <div className="relative group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                    Recommended
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">AWS S3</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Amazon Simple Storage Service - Scalable, secure cloud storage
                            </p>
                            <button
                                onClick={() => setIsConnectModalOpen(true)}
                                disabled={isProviderConnected("aws_s3")}
                                className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 ${isProviderConnected("aws_s3")
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                    }`}
                            >
                                {isProviderConnected("aws_s3") ? "Already Connected" : "Connect"}
                            </button>
                        </div>
                    </div>

                    {/* Google Drive Card */}
                    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Google Drive</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Seamless integration with Google Workspace
                            </p>
                            <button
                                onClick={() => setIsConnectModalOpen(true)}
                                disabled={isProviderConnected("google_drive")}
                                className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 ${activeIntegration?.provider === "google_drive"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                                    }`}
                            >
                                {activeIntegration?.provider === "google_drive" ? "Already Connected" : "Connect"}
                            </button>
                        </div>
                    </div>

                    {/* Cloudinary Card */}
                    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-7 h-7 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 16l4-4-4-4M20 16l-4-4 4-4" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Cloudinary</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Media management and optimization platform
                            </p>
                            <button
                                onClick={() => setIsConnectModalOpen(true)}
                                disabled={isProviderConnected("cloudinary")}
                                className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 ${activeIntegration?.provider === "cloudinary"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                                    }`}
                            >
                                {activeIntegration?.provider === "cloudinary" ? "Already Connected" : "Connect"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConnectStorageModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                onConnect={handleConnectStorage}
            />

            <UploadFileModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadFile}
                uploading={uploading}
            />
        </div>
    );
};

export default IntegrationsClient;