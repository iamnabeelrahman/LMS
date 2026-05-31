'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Upload,
    X
} from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/app/lib/apiClient';

interface Benefit {
    title: string;
}

interface Prerequisite {
    title: string;
}

interface LinkType {
    title: string;
    url: string;
}

interface Resource {
    title: string;
    url: string;
}

interface Lesson {
    id?: number;
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail: string;
    videoLength: number;
    position: number;
    isPreview: boolean;
    links: LinkType[];
    resources: Resource[];
}

interface Section {
    id?: number;
    title: string;
    position: number;
    lessons: Lesson[];
}

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    demoUrl: string;
    level: string;
    price: number;
    estimatedPrice: number;
    tags: string[];
    benefits: Benefit[];
    prerequisites: Prerequisite[];
    sections: Section[];
    isPublished: number;
}

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, []);

    const fetchCourse = async () => {
        try {
            const res = await apiClient.get(`/course/${params.id}`);
            const data = res.data;

            if (data.success) {
                setCourse({
                    ...res.data,
                    tags: res.data.tags?.map((t: any) => t.name) || [],
                });
            } else {
                router.push('/dashboard/courses');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, purpose: string) => {
        try {
            setUploading(true);

            const urlData = await apiClient.post('/courses/upload-url', {
                fileName: file.name,
                fileType: file.type,
                filePurpose: purpose,
            });

            const uplodedData = urlData.data

            if (!uplodedData.success) return null;

            await fetch(urlData.data.url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            return urlData.data.key;
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleThumbnailUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file || !course) return;

        const key = await handleFileUpload(file, 'thumbnail');

        if (key) {
            setCourse({
                ...course,
                thumbnail: key,
            });
        }
    };

    const saveCourse = async () => {
        if (!course) return;

        try {
            setSaving(true);

            const res = await apiClient.put(`/courses/${course.id}`, {
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail,
                demoUrl: course.demoUrl,
                level: course.level,
                price: course.price,
                estimatedPrice: course.estimatedPrice,
                tags: course.tags,
                benefits: course.benefits,
                prerequisites: course.prerequisites,
            });

            const data = res.data;

            if (data.success) {
                router.push(`/courses/${course.id}`);
            } else {
                alert(data.error || 'Failed to save course');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FAE27C] border-t-transparent"></div>
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-[#FEF9E6]">
            <div className="mx-auto max-w-7xl px-4 py-8">

                {/* Header */}

                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">

                        <Link
                            href={`/courses/${course.id}`}
                            className="rounded-full p-2 hover:bg-[#FAE27C]/20"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>

                        <div>
                            <h1 className="text-3xl font-bold">Edit Course</h1>
                            <p className="text-gray-600">
                                Manage course details
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={saveCourse}
                        disabled={saving}
                        className="rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] px-6 py-2 font-semibold"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Basic Info */}

                <div className="rounded-2xl border p-6 bg-white">

                    <div className="mb-4">
                        <label className="text-sm font-medium">Title</label>

                        <input
                            value={course.title}
                            onChange={(e) =>
                                setCourse({
                                    ...course,
                                    title: e.target.value,
                                })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-sm font-medium">
                            Description
                        </label>

                        <textarea
                            value={course.description}
                            onChange={(e) =>
                                setCourse({
                                    ...course,
                                    description: e.target.value,
                                })
                            }
                            rows={4}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Thumbnail
                        </label>

                        <div className="flex gap-4 mt-2">

                            {course.thumbnail ? (
                                <div className="relative">

                                    <img
                                        src={course.thumbnail}
                                        className="h-24 w-36 object-cover rounded"
                                    />

                                    <button
                                        onClick={() =>
                                            setCourse({
                                                ...course,
                                                thumbnail: '',
                                            })
                                        }
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="border-dashed border-2 p-4 rounded-lg cursor-pointer flex flex-col items-center">

                                    <Upload className="mb-1" />

                                    <span className="text-sm">
                                        Upload thumbnail
                                    </span>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleThumbnailUpload}
                                    />
                                </label>
                            )}

                            {uploading && (
                                <span className="text-sm text-gray-500">
                                    Uploading...
                                </span>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}