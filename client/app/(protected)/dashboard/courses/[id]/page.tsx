'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Plus, ChevronDown, ChevronRight, Play, Link2, FileText } from 'lucide-react';
import apiClient from '@/app/lib/apiClient';

interface Lesson {
    id: number;
    title: string;
    description: string;
    videoUrl: string;
    videoLength: number;
    position: number;
    isPreview: number;
    links: Array<{ title: string; url: string }>;
    resources: Array<{ title: string; url: string }>;
}

interface Section {
    id: number;
    title: string;
    position: number;
    lessons: Lesson[];
}

interface Course {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    demoUrl: string;
    level: string;
    price: number;
    estimatedPrice: number;
    isPublished: number;
    benefits: Array<{ title: string }>;
    prerequisites: Array<{ title: string }>;
    tags: Array<{ name: string }>;
    sections: Section[];
}

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchCourse();
    }, []);

    const fetchCourse = async () => {
        try {
            const response = await apiClient.get(`/course/${params.id}`);
            const data = response.data;

            if (data.success) {
                setCourse(data.data);
                // Expand first section by default
                if (data.data.sections?.length) {
                    setExpandedSections(new Set([data.data.sections[0].id]));
                }
            } else {
                // router.push('/courses');
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            // router.push('/courses');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (sectionId: number) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0 min';
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
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
            {/* Header */}
            <div className="border-b border-[#FAE27C]/30 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/courses"
                                className="rounded-full p-2 transition hover:bg-[#FAE27C]/20"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                    <span>{course.level || 'All levels'}</span>
                                    <span>•</span>
                                    <span>{course.sections?.length || 0} sections</span>
                                    <span>•</span>
                                    <span>
                                        {course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} lessons
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/courses/${course.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] px-4 py-2 font-semibold text-gray-800 shadow-md transition hover:-translate-y-0.5"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Course
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Thumbnail */}
                        {course.thumbnail && (
                            <div className="mb-6 overflow-hidden rounded-2xl">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-6 rounded-2xl border border-[#FAE27C]/30 bg-white p-6">
                            <h2 className="mb-3 text-xl font-semibold text-gray-900">Description</h2>
                            <p className="text-gray-600">{course.description}</p>
                        </div>

                        {/* Course Content */}
                        <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">Course Content</h2>
                            <div className="space-y-3">
                                {course.sections?.map((section) => (
                                    <div key={section.id} className="rounded-xl border border-gray-200">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                {expandedSections.has(section.id) ? (
                                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-gray-500" />
                                                )}
                                                <span className="font-medium text-gray-900">{section.title}</span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {section.lessons?.length || 0} lessons
                                            </span>
                                        </button>
                                        {expandedSections.has(section.id) && (
                                            <div className="border-t border-gray-100 p-4">
                                                <div className="space-y-3">
                                                    {section.lessons?.map((lesson) => (
                                                        <div
                                                            key={lesson.id}
                                                            className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Play className="h-4 w-4 text-[#FAE27C]" />
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{lesson.title}</p>
                                                                    {lesson.description && (
                                                                        <p className="text-sm text-gray-500 line-clamp-1">
                                                                            {lesson.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {lesson.links?.length > 0 && (
                                                                    <Link2 className="h-4 w-4 text-gray-400" />
                                                                )}
                                                                {lesson.resources?.length > 0 && (
                                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                                )}
                                                                <span className="text-sm text-gray-500">
                                                                    {formatDuration(lesson.videoLength)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6">
                            <div className="text-center">
                                {course.price === 0 ? (
                                    <span className="text-3xl font-bold text-green-600">Free</span>
                                ) : (
                                    <>
                                        <span className="text-3xl font-bold text-gray-900">
                                            ₹{course.price.toLocaleString()}
                                        </span>
                                        {course.estimatedPrice && course.estimatedPrice > course.price && (
                                            <span className="ml-2 text-sm text-gray-400 line-through">
                                                ₹{course.estimatedPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Status</span>
                                    <span
                                        className={`font-medium ${course.isPublished ? 'text-green-600' : 'text-yellow-600'
                                            }`}
                                    >
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                {course.demoUrl && (
                                    <a
                                        href={course.demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block rounded-full bg-[#FAE27C]/20 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-[#FAE27C]/30"
                                    >
                                        Watch Demo
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Benefits */}
                        {course.benefits?.length > 0 && (
                            <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6">
                                <h3 className="mb-3 font-semibold text-gray-900">What you'll learn</h3>
                                <ul className="space-y-2">
                                    {course.benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-0.5 text-[#FAE27C]">✓</span>
                                            {benefit.title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Prerequisites */}
                        {course.prerequisites?.length > 0 && (
                            <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6">
                                <h3 className="mb-3 font-semibold text-gray-900">Requirements</h3>
                                <ul className="space-y-2">
                                    {course.prerequisites.map((prereq, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-0.5 text-gray-400">•</span>
                                            {prereq.title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tags */}
                        {course.tags?.length > 0 && (
                            <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6">
                                <h3 className="mb-3 font-semibold text-gray-900">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((tag) => (
                                        <span
                                            key={tag.name}
                                            className="rounded-full bg-[#FAE27C]/20 px-3 py-1 text-sm text-gray-700"
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}