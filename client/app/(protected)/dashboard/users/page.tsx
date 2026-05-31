"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Plus,
    Pencil,
    Trash2,
    Mail,
    Phone,
    Calendar,
    X,
    Loader2,
    Search,
    Filter,
    Shield,
    Users,
    UserCheck,
    UserX,
    Crown,
    Star,
    GraduationCap
} from "lucide-react";
import apiClient from "@/app/lib/apiClient";

// Types
interface Member {
    id: number;
    userId: number;
    organizationId: number;
    role: "admin" | "teacher" | "staff";
    joinedAt: string;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        phoneNumber?: string;
    };
}

interface AddMemberData {
    email: string;
    role: "admin" | "teacher" | "staff";
}

// Role configuration
const roleConfig = {
    admin: {
        label: "Administrator",
        color: "bg-purple-100 text-purple-800",
        icon: Crown,
        description: "Full access to all features and settings",
        permissions: ["Manage all", "Add/Remove members", "Configure settings"]
    },
    teacher: {
        label: "Teacher",
        color: "bg-blue-100 text-blue-800",
        icon: GraduationCap,
        description: "Create and manage courses, grade students",
        permissions: ["Create courses", "Manage lessons", "Grade assignments"]
    },
    staff: {
        label: "Staff",
        color: "bg-green-100 text-green-800",
        icon: Users,
        description: "Administrative support and management",
        permissions: ["Manage students", "Handle payments", "Support tickets"]
    }
};

export default function MembersPage() {
    const params = useParams();
    // const organizationId = parseInt(params.id as string);
    const organizationId = 3;

    const [members, setMembers] = useState<Member[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    // Form states
    const [email, setEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState<"admin" | "teacher" | "staff">("teacher");
    const [editRole, setEditRole] = useState<"admin" | "teacher" | "staff">("teacher");

    // Loading states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch members
    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/organizations/${organizationId}/members`);
            setMembers(response.data.data);
            setFilteredMembers(response.data.data);
            setError(null);
        } catch (error: any) {
            console.error("Failed to fetch members:", error);
            setError(error.response?.data?.message || "Failed to fetch members");
        } finally {
            setLoading(false);
        }
    };

    // Add member
    const addMember = async () => {
        if (!email.trim()) {
            alert("Please enter an email address");
            return;
        }

        setActionLoading(true);
        try {
            await apiClient.post(`/organizations/${organizationId}/members`, {
                email: email.trim(),
                role: selectedRole
            });
            await fetchMembers();
            setIsAddModalOpen(false);
            setEmail("");
            setSelectedRole("teacher");
        } catch (error: any) {
            console.error("Failed to add member:", error);
            alert(error.response?.data?.message || "Failed to add member");
        } finally {
            setActionLoading(false);
        }
    };

    // Update member role
    const updateMemberRole = async () => {
        if (!selectedMember) return;

        setActionLoading(true);
        try {
            await apiClient.put(`/organizations/${organizationId}/members`, {
                memberId: selectedMember.id,
                role: editRole
            });
            await fetchMembers();
            setIsEditModalOpen(false);
            setSelectedMember(null);
        } catch (error: any) {
            console.error("Failed to update member role:", error);
            alert(error.response?.data?.message || "Failed to update member role");
        } finally {
            setActionLoading(false);
        }
    };

    // Remove member
    const removeMember = async (memberId: number, memberName: string) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from the organization?`)) return;

        setActionLoading(true);
        try {
            await apiClient.delete(`/organizations/${organizationId}/members/${memberId}`);
            await fetchMembers();
        } catch (error: any) {
            console.error("Failed to remove member:", error);
            alert(error.response?.data?.message || "Failed to remove member");
        } finally {
            setActionLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter members based on search and role
    useEffect(() => {
        let filtered = members;

        if (searchTerm) {
            filtered = filtered.filter(member =>
                member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (roleFilter !== "all") {
            filtered = filtered.filter(member => member.role === roleFilter);
        }

        setFilteredMembers(filtered);
    }, [searchTerm, roleFilter, members]);

    // Get statistics
    const stats = {
        total: members.length,
        admins: members.filter(m => m.role === "admin").length,
        teachers: members.filter(m => m.role === "teacher").length,
        staff: members.filter(m => m.role === "staff").length,
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading members...</p>
                </div>
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
                            <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
                            <p className="text-gray-600 mt-2">Manage your organization's team and their roles</p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <Plus className="w-4 h-4" />
                            Add Member
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Members</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Administrators</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.admins}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Crown className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Teachers</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.teachers}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Staff</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{stats.staff}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Administrators</option>
                                <option value="teacher">Teachers</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Members List */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {filteredMembers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No members found</p>
                            <p className="text-gray-400 text-sm mt-2">
                                {searchTerm || roleFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Click 'Add Member' to invite someone to your organization"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Member</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Joined</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredMembers.map((member) => {
                                        const RoleIcon = roleConfig[member.role].icon;
                                        return (
                                            <tr key={member.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {member.user?.name?.charAt(0).toUpperCase() || member.user?.email?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{member.user?.name || "Unknown"}</p>
                                                            <p className="text-sm text-gray-500">{member.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${roleConfig[member.role].color}`}>
                                                        <RoleIcon className="w-3 h-3" />
                                                        {roleConfig[member.role].label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(member.joinedAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="w-4 h-4" />
                                                        <span className="truncate max-w-[200px]">{member.user?.email}</span>
                                                    </div>
                                                    {member.user?.phoneNumber && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{member.user.phoneNumber}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMember(member);
                                                                setEditRole(member.role);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="p-2 hover:bg-blue-100 rounded-lg transition group"
                                                            title="Edit role"
                                                        >
                                                            <Pencil className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeMember(member.id, member.user?.name || "this member")}
                                                            className="p-2 hover:bg-red-100 rounded-lg transition group"
                                                            title="Remove member"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md transform transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Add Team Member</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    The user must have an account in the system
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(roleConfig).map(([role, config]) => {
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={role}
                                                onClick={() => setSelectedRole(role as any)}
                                                className={`p-3 rounded-lg border-2 transition-all ${selectedRole === role
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <Icon className={`w-6 h-6 mx-auto mb-2 ${selectedRole === role ? "text-blue-600" : "text-gray-400"
                                                    }`} />
                                                <p className={`text-sm font-medium ${selectedRole === role ? "text-blue-600" : "text-gray-600"
                                                    }`}>
                                                    {config.label}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {roleConfig[selectedRole].description}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={addMember}
                                disabled={actionLoading}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Add Member"}
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Role Modal */}
            {isEditModalOpen && selectedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Change Role</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-gray-600">Member</p>
                                <p className="font-medium text-gray-900">{selectedMember.user?.name || selectedMember.user?.email}</p>
                                <p className="text-sm text-gray-500">{selectedMember.user?.email}</p>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Role
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(roleConfig).map(([role, config]) => {
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={role}
                                            onClick={() => setEditRole(role as any)}
                                            className={`p-3 rounded-lg border-2 transition-all ${editRole === role
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 mx-auto mb-2 ${editRole === role ? "text-blue-600" : "text-gray-400"
                                                }`} />
                                            <p className={`text-sm font-medium ${editRole === role ? "text-blue-600" : "text-gray-600"
                                                }`}>
                                                {config.label}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                {roleConfig[editRole].description}
                            </p>
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-medium text-gray-700 mb-2">Permissions included:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    {roleConfig[editRole].permissions.map((perm, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <Shield className="w-3 h-3" />
                                            {perm}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={updateMemberRole}
                                disabled={actionLoading}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Update Role"}
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
        </div>
    );
}