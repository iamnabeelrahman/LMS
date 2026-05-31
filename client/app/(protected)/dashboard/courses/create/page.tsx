'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/app/lib/apiClient';

interface Benefit {
    title: string;
}

interface Prerequisite {
    title: string;
}

export default function CreateCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail: '',
        demoUrl: '',
        level: '',
        price: 0,
        estimatedPrice: 0,
        tags: [] as string[],
        benefits: [] as Benefit[],
        prerequisites: [] as Prerequisite[],
    });
    const [newTag, setNewTag] = useState('');
    const [newBenefit, setNewBenefit] = useState('');
    const [newPrerequisite, setNewPrerequisite] = useState('');

    const handleFileUpload = async (file: File, purpose: string) => {
        setUploading(true);
        try {
            // Get upload URL
            const urlResponse = await apiClient.post('/storage/upload-url', {
                fileName: file.name,
                fileType: file.type,
                filePurpose: purpose,
            });
            const urlData = urlResponse.data;

            if (urlData.success) {
                // Upload file to the URL
                await fetch(urlData.data.url, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type,
                    },
                });
                return urlData.data.key;
            }
            throw new Error('Failed to get upload URL');
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const key = await handleFileUpload(file, 'thumbnail');
            if (key) {
                setFormData((prev) => ({ ...prev, thumbnail: key }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await apiClient.post('/courses', formData);
            const data = response.data;

            if (data.success) {
                router.push('/courses');
            } else {
                alert(data.error || 'Failed to create course');
            }
        } catch (error) {
            console.error('Error creating course:', error);
            alert('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()],
            }));
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
        }));
    };

    const addBenefit = () => {
        if (newBenefit.trim()) {
            setFormData((prev) => ({
                ...prev,
                benefits: [...prev.benefits, { title: newBenefit.trim() }],
            }));
            setNewBenefit('');
        }
    };

    const removeBenefit = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            benefits: prev.benefits.filter((_, i) => i !== index),
        }));
    };

    const addPrerequisite = () => {
        if (newPrerequisite.trim()) {
            setFormData((prev) => ({
                ...prev,
                prerequisites: [...prev.prerequisites, { title: newPrerequisite.trim() }],
            }));
            setNewPrerequisite('');
        }
    };

    const removePrerequisite = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            prerequisites: prev.prerequisites.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-[#FEF9E6]">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/courses"
                        className="rounded-full p-2 transition hover:bg-[#FAE27C]/20"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
                        <p className="mt-1 text-gray-600">Fill in the details to create a new course</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Course Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FAE27C] focus:outline-none focus:ring-1 focus:ring-[#FAE27C]"
                                    placeholder="e.g., Complete Web Development Bootcamp"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Description *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FAE27C] focus:outline-none focus:ring-1 focus:ring-[#FAE27C]"
                                    placeholder="Describe what students will learn..."
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Thumbnail
                                </label>
                                <div className="flex items-center gap-4">
                                    {formData.thumbnail ? (
                                        <div className="relative">
                                            <img
                                                src={formData.thumbnail}
                                                alt="Thumbnail preview"
                                                className="h-32 w-48 rounded-lg object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData((prev) => ({ ...prev, thumbnail: '' }))}
                                                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#FAE27C]/50 bg-[#FAE27C]/5 p-4 transition hover:bg-[#FAE27C]/10">
                                            <Upload className="mb-2 h-8 w-8 text-[#FAE27C]" />
                                            <span className="text-sm text-gray-600">Upload thumbnail</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleThumbnailUpload}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                        </label>
                                    )}
                                    {uploading && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FAE27C] border-t-transparent"></div>
                                            Uploading...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Level</label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FAE27C] focus:outline-none"
                                    >
                                        <option value="">Select level</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Demo URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.demoUrl}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, demoUrl: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FAE27C] focus:outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FAE27C] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Estimated Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.estimatedPrice || ''}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, estimatedPrice: parseInt(e.target.value) || 0 }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FAE27C] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 rounded-full bg-[#FAE27C]/20 px-3 py-1 text-sm"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-1 text-gray-500 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Add a tag..."
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FAE27C] focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="rounded-lg bg-[#FAE27C]/20 px-4 py-2 font-medium text-gray-700 transition hover:bg-[#FAE27C]/30"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Benefits</h2>
                        <div className="space-y-2">
                            {formData.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="flex-1 rounded-lg bg-gray-50 px-4 py-2 text-gray-700">
                                        {benefit.title}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeBenefit(index)}
                                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={newBenefit}
                                onChange={(e) => setNewBenefit(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                                placeholder="Add a benefit..."
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FAE27C] focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={addBenefit}
                                className="rounded-lg bg-[#FAE27C]/20 px-4 py-2 font-medium text-gray-700 transition hover:bg-[#FAE27C]/30"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Prerequisites */}
                    <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Prerequisites</h2>
                        <div className="space-y-2">
                            {formData.prerequisites.map((prereq, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="flex-1 rounded-lg bg-gray-50 px-4 py-2 text-gray-700">
                                        {prereq.title}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removePrerequisite(index)}
                                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={newPrerequisite}
                                onChange={(e) => setNewPrerequisite(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                                placeholder="Add a prerequisite..."
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FAE27C] focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={addPrerequisite}
                                className="rounded-lg bg-[#FAE27C]/20 px-4 py-2 font-medium text-gray-700 transition hover:bg-[#FAE27C]/30"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
                        <Link
                            href="/courses"
                            className="rounded-full border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] px-6 py-2 font-semibold text-gray-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}