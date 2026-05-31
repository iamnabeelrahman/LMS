// app/integrations/components/ConnectStorageModal.tsx
"use client";

import { useState } from "react";

interface ConnectStorageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (provider: string, config: any) => void;
}

const ConnectStorageModal = ({ isOpen, onClose, onConnect }: ConnectStorageModalProps) => {
    const [selectedProvider, setSelectedProvider] = useState<string>("aws_s3");
    const [config, setConfig] = useState<any>({});

    if (!isOpen) return null;

    const providers = [
        { id: "aws_s3", name: "AWS S3", fields: ["accessKeyId", "secretAccessKey", "bucket", "region"] },
        { id: "google_drive", name: "Google Drive", fields: ["clientId", "clientSecret", "refreshToken", "region"] },
        { id: "cloudinary", name: "Cloudinary", fields: ["cloudName", "apiKey", "apiSecret", "region"] },
    ];

    const currentProvider = providers.find(p => p.id === selectedProvider);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Send the data in the correct structure
        onConnect(selectedProvider, config);
    };

    const handleInputChange = (field: string, value: string) => {
        setConfig({ ...config, [field]: value });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Connect Storage</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Provider
                            </label>
                            <select
                                value={selectedProvider}
                                onChange={(e) => {
                                    setSelectedProvider(e.target.value);
                                    setConfig({});
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lamaSky focus:border-transparent outline-none"
                            >
                                {providers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {currentProvider?.fields.map(field => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {field?.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                <input
                                    type={field.includes("secret") || field.includes("key") ? "password" : "text"}
                                    value={config[field] || ""}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lamaSky focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                        ))}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-linear-to-r from-lamaSky to-lamaYellow text-gray-700 font-semibold rounded-lg hover:shadow-lg transition-all"
                            >
                                Connect
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConnectStorageModal;