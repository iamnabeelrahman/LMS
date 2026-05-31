"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Plus,
    Pencil,
    Trash2,
    Users,
    UserPlus,
    X,
    Sparkles,
    Loader2,
    Search,
    ChevronRight
} from "lucide-react";
import apiClient from "@/app/lib/apiClient";

// Types
interface Department {
    id: number;
    name: string;
    organizationId: number;
    createdAt?: string;
}

interface OrganizationMember {
    id: number;
    userId: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
}

interface DepartmentMember {
    id: number;
    departmentId: number;
    userId: number;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
}

interface AIAction {
    type: "create" | "assign" | "rename" | "delete";
    data: any;
    description: string;
}

// Main Component
export default function DepartmentsPage() {
    // const params = useParams();
    const params = useParams();
    // const organizationId = parseInt(params.id as string);
    const organizationId = 3; // Temporary hardcoded for testing, replace with above line in production

    const [departments, setDepartments] = useState<Department[]>([]);
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [departmentMembers, setDepartmentMembers] = useState<DepartmentMember[]>([]);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // Form states
    const [departmentName, setDepartmentName] = useState("");
    const [editingDepartmentName, setEditingDepartmentName] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    // AI states
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<AIAction[]>([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch departments
    const fetchDepartments = async () => {
        try {
            const response = await apiClient.get(`/organizations/${organizationId}/departments`);
            setDepartments(response.data.data);
        } catch (error) {
            console.error("Failed to fetch departments:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch members
    const fetchMembers = async () => {
        try {
            const response = await apiClient.get(`/organizations/${organizationId}/members`);
            setMembers(response.data.data);
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
    };

    // Fetch department members
    const fetchDepartmentMembers = async (departmentId: number) => {
        try {
            const response = await apiClient.get(`/organizations/${organizationId}/departments/${departmentId}/members`);
            setDepartmentMembers(response.data.data);
        } catch (error) {
            console.error("Failed to fetch department members:", error);
        }
    };

    // Create department
    const createDepartment = async () => {
        if (!departmentName.trim()) return;

        setActionLoading(true);
        try {
            await apiClient.post(`/organizations/${organizationId}/departments`, {
                name: departmentName
            });
            await fetchDepartments();
            setIsCreateModalOpen(false);
            setDepartmentName("");
        } catch (error) {
            console.error("Failed to create department:", error);
            alert("Failed to create department");
        } finally {
            setActionLoading(false);
        }
    };

    // Update department
    const updateDepartment = async () => {
        if (!selectedDepartment || !editingDepartmentName.trim()) return;

        setActionLoading(true);
        try {
            await apiClient.put(
                `/organizations/${organizationId}/departments/${selectedDepartment.id}`,
                { name: editingDepartmentName }
            );
            await fetchDepartments();
            setIsEditModalOpen(false);
            setSelectedDepartment(null);
        } catch (error) {
            console.error("Failed to update department:", error);
            alert("Failed to update department");
        } finally {
            setActionLoading(false);
        }
    };

    // Delete department
    const deleteDepartment = async (departmentId: number) => {
        if (!confirm("Are you sure you want to delete this department? This will remove all member assignments.")) return;

        setActionLoading(true);
        try {
            await apiClient.delete(`/organizations/${organizationId}/departments/${departmentId}`);
            await fetchDepartments();
            if (selectedDepartment?.id === departmentId) {
                setSelectedDepartment(null);
                setDepartmentMembers([]);
            }
        } catch (error) {
            console.error("Failed to delete department:", error);
            alert("Failed to delete department");
        } finally {
            setActionLoading(false);
        }
    };

    // Assign member to department
    const assignMember = async () => {
        if (!selectedDepartment || !selectedUserId) return;

        setActionLoading(true);
        try {
            await apiClient.post(`/organizations/${organizationId}/departments/assign`, {
                departmentId: selectedDepartment.id,
                userId: selectedUserId
            });
            await fetchDepartmentMembers(selectedDepartment.id);
            setIsAssignModalOpen(false);
            setSelectedUserId(null);
        } catch (error) {
            console.error("Failed to assign member:", error);
            alert("Failed to assign member");
        } finally {
            setActionLoading(false);
        }
    };

    // Remove member from department
    const removeMember = async (userId: number) => {
        if (!selectedDepartment) return;

        if (!confirm("Remove this member from the department?")) return;

        setActionLoading(true);
        try {
            await apiClient.delete(
                `/organizations/${organizationId}/departments/${selectedDepartment.id}/members/${userId}`
            );
            await fetchDepartmentMembers(selectedDepartment.id);
        } catch (error) {
            console.error("Failed to remove member:", error);
            alert("Failed to remove member");
        } finally {
            setActionLoading(false);
        }
    };

    // AI Assistant - Get suggestions
    const getAISuggestions = async () => {
        if (!aiPrompt.trim()) return;

        setAiLoading(true);
        try {
            const response = await apiClient.post(`/ai/department-assistant`, {
                prompt: aiPrompt,
                context: {
                    organizationId,
                    departments: departments.map(d => ({ id: d.id, name: d.name })),
                    members: members.map(m => ({ id: m.userId, name: m.name, role: m.role }))
                }
            });

            setAiSuggestions(response.data.data.actions || []);
        } catch (error) {
            console.error("Failed to get AI suggestions:", error);
            alert("Failed to get AI suggestions");
        } finally {
            setAiLoading(false);
        }
    };

    // Execute AI action
    const executeAIAction = async (action: AIAction) => {
        setActionLoading(true);
        try {
            switch (action.type) {
                case "create":
                    await apiClient.post(`/organizations/${organizationId}/departments`, {
                        name: action.data.name
                    });
                    break;
                case "rename":
                    await apiClient.put(
                        `/organizations/${organizationId}/departments/${action.data.departmentId}`,
                        { name: action.data.newName }
                    );
                    break;
                case "assign":
                    await apiClient.post(`/organizations/${organizationId}/departments/assign`, {
                        departmentId: action.data.departmentId,
                        userId: action.data.userId
                    });
                    break;
                case "delete":
                    await apiClient.delete(`/organizations/${organizationId}/departments/${action.data.departmentId}`);
                    break;
            }

            await fetchDepartments();
            if (selectedDepartment) {
                await fetchDepartmentMembers(selectedDepartment.id);
            }
            setIsAIModalOpen(false);
            setAiPrompt("");
            setAiSuggestions([]);
        } catch (error) {
            console.error("Failed to execute AI action:", error);
            alert("Failed to execute action");
        } finally {
            setActionLoading(false);
        }
    };

    // Handle department selection
    const handleDepartmentClick = async (department: Department) => {
        setSelectedDepartment(department);
        await fetchDepartmentMembers(department.id);
    };

    // Filter members not already in department
    const availableMembers = members.filter(member =>
        !departmentMembers.some(dm => dm.userId === member.userId)
    );

    // Filter departments by search
    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchDepartments();
        fetchMembers();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
                            <p className="text-gray-600 mt-2">Organize your institution structure</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsAIModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                            >
                                <Sparkles className="w-4 h-4" />
                                AI Assistant
                            </button>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg"
                            >
                                <Plus className="w-4 h-4" />
                                Create Department
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Departments List */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search departments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {filteredDepartments.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No departments found</p>
                            ) : (
                                filteredDepartments.map((dept) => (
                                    <div
                                        key={dept.id}
                                        onClick={() => handleDepartmentClick(dept)}
                                        className={`p-4 rounded-lg cursor-pointer transition-all ${selectedDepartment?.id === dept.id
                                            ? "bg-blue-50 border-2 border-blue-500"
                                            : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {departmentMembers.filter(m => m.departmentId === dept.id).length} members
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedDepartment(dept);
                                                        setEditingDepartmentName(dept.name);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-1 hover:bg-gray-200 rounded transition"
                                                >
                                                    <Pencil className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteDepartment(dept.id);
                                                    }}
                                                    className="p-1 hover:bg-red-100 rounded transition"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Department Details */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                        {selectedDepartment ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedDepartment.name}</h2>
                                        <p className="text-gray-600 mt-1">Department members and management</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAssignModalOpen(true)}
                                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Add Member
                                    </button>
                                </div>

                                {/* Members List */}
                                <div className="space-y-3">
                                    {departmentMembers.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500">No members in this department</p>
                                            <button
                                                onClick={() => setIsAssignModalOpen(true)}
                                                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Add members →
                                            </button>
                                        </div>
                                    ) : (
                                        departmentMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {member.user?.name?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{member.user?.name}</p>
                                                        <p className="text-sm text-gray-500">{member.user?.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeMember(member.userId)}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition"
                                                >
                                                    <X className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-96">
                                <Users className="w-20 h-20 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">Select a department to view details</p>
                                <p className="text-gray-400 text-sm mt-2">Click on any department from the list</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Department Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Create Department</h2>
                        <input
                            type="text"
                            placeholder="Department name"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={createDepartment}
                                disabled={actionLoading}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create"}
                            </button>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Department Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Edit Department</h2>
                        <input
                            type="text"
                            placeholder="Department name"
                            value={editingDepartmentName}
                            onChange={(e) => setEditingDepartmentName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={updateDepartment}
                                disabled={actionLoading}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Update"}
                            </button>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Member Modal */}
            {isAssignModalOpen && selectedDepartment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-2">Add Member to {selectedDepartment.name}</h2>
                        <p className="text-gray-600 mb-4">Select a member to add to this department</p>

                        <select
                            value={selectedUserId || ""}
                            onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a member</option>
                            {availableMembers.map((member) => (
                                <option key={member.userId} value={member.userId}>
                                    {member.name} ({member.role})
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-3">
                            <button
                                onClick={assignMember}
                                disabled={!selectedUserId || actionLoading}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Add Member"}
                            </button>
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Assistant Modal */}
            {isAIModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-purple-500" />
                                <h2 className="text-2xl font-bold">AI Department Assistant</h2>
                            </div>
                            <button
                                onClick={() => setIsAIModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">What would you like to do?</label>
                            <textarea
                                placeholder="Example: Create a Computer Science department and assign John Doe as the head"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                onClick={getAISuggestions}
                                disabled={aiLoading}
                                className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                            >
                                {aiLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Get Suggestions"}
                            </button>
                        </div>

                        {aiSuggestions.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-lg mb-3">AI Suggestions</h3>
                                <div className="space-y-3">
                                    {aiSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                                        >
                                            <p className="text-gray-800 mb-3">{suggestion.description}</p>
                                            <button
                                                onClick={() => executeAIAction(suggestion)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                                            >
                                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Execute"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}