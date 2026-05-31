'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '@/app/lib/apiClient';

interface Course {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    level: string | null;
    price: number;
    isPublished: number;
    createdAt: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [level, setLevel] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
                ...(level && { level }),
            });

            const response = await apiClient.get(`/course?${params}`);
            const data = response.data;

            if (data.success) {
                setCourses(data.items);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [page, search, level]);

    const handleDelete = async () => {
        if (!selectedCourse) return;
        try {
            const response = await apiClient.delete(`/courses/${selectedCourse.id}`);
            const data = response.data;

            if (data.success) {
                fetchCourses();
                setShowDeleteModal(false);
                setSelectedCourse(null);
            }
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    const getLevelBadge = (level: string | null) => {
        const colors: Record<string, string> = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-yellow-100 text-yellow-800',
            advanced: 'bg-red-100 text-red-800',
        };
        return colors[level || ''] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-[#FEF9E6]">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
                        <p className="mt-1 text-gray-600">Manage your course catalog</p>
                    </div>
                    <Link
                        href={`courses/create`}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] px-6 py-3 font-semibold text-gray-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        <Plus className="h-5 w-5" />
                        Create Course
                    </Link>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-full border border-[#FAE27C]/30 bg-white py-2 pl-10 pr-4 focus:border-[#FAE27C] focus:outline-none focus:ring-1 focus:ring-[#FAE27C]"
                        />
                    </div>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="rounded-full border border-[#FAE27C]/30 bg-white px-4 py-2 focus:border-[#FAE27C] focus:outline-none"
                    >
                        <option value="">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FAE27C] border-t-transparent"></div>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FAE27C]/20">
                            <span className="text-2xl">📚</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">No courses yet</h3>
                        <p className="mt-2 text-gray-600">Create your first course to get started</p>
                        <Link
                            href={`courses/create`}
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] px-6 py-2 font-semibold text-gray-800"
                        >
                            <Plus className="h-4 w-4" />
                            Create Course
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="group rounded-2xl border border-[#FAE27C]/30 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative mb-4">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="h-48 w-full rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-48 w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#C3EBFA]/30 to-[#FAE27C]/20">
                                            <span className="text-4xl">📚</span>
                                        </div>
                                    )}
                                    <span
                                        className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${getLevelBadge(course.level)}`}
                                    >
                                        {course.level || 'All levels'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                                    {course.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                    {course.description}
                                </p>

                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        {course.price === 0 ? (
                                            <span className="text-lg font-bold text-green-600">Free</span>
                                        ) : (
                                            <span className="text-lg font-bold text-gray-900">
                                                ₹{course.price.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${course.isPublished
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                <div className="mt-4 flex gap-2 border-t border-[#FAE27C]/30 pt-4">
                                    <Link
                                        href={`courses/${course.id}`}
                                        className="flex flex-1 items-center justify-center gap-1 rounded-full border border-[#FAE27C] bg-white py-2 text-sm font-medium text-gray-700 transition hover:bg-[#FAE27C]/10"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View
                                    </Link>
                                    <Link
                                        href={`courses/${course.id}/edit`}
                                        className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] py-2 text-sm font-medium text-gray-800 transition hover:shadow-md"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setShowDeleteModal(true);
                                        }}
                                        className="flex flex-1 items-center justify-center gap-1 rounded-full border border-red-300 bg-white py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-full border border-[#FAE27C]/30 p-2 transition hover:bg-[#FAE27C]/10 disabled:opacity-50"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="flex items-center px-4 text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="rounded-full border border-[#FAE27C]/30 p-2 transition hover:bg-[#FAE27C]/10 disabled:opacity-50"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-xl font-semibold text-gray-900">Delete Course</h3>
                        <p className="mt-2 text-gray-600">
                            Are you sure you want to delete "{selectedCourse.title}"? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-full bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}