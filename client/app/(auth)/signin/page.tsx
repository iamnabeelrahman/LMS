"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/redux/features/auth/authApi';

export default function SignInPage() {
    const router = useRouter();
    const [login, { isLoading }] = useLoginMutation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [error, setError] = useState('');


    const validateForm = () => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!password) {
            setError('Password is required');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        try {
            const result = await login({
                email: email.trim(),
                password,
                rememberMe
            }).unwrap();

            if (result.success && result.data) {
                setShowSuccessToast(true);
                // Navigate based on user role
                const data = result.data;
                setTimeout(() => {
                    if (data.organizations && data.organizations.length === 1) {
                        const role = data.organizations[0].role;
                        if (role === 'admin') router.push('/dashboard');
                        else if (role === 'teacher') router.push('/teacher');
                        else if (role === 'staff') router.push('/staff');
                        else router.push('/student');
                    } else if (data.organizations && data.organizations.length > 1) {
                        router.push('/switch');
                    } else if (data.user.systemRole === 'system_admin') {
                        router.push('/control-panel');
                    } else {
                        router.push('/student');
                    }
                }, 1500);
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (err: any) {
            setError(err.data?.message || 'Failed to sign in. Please try again.');
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            window.location.href = '/api/auth/google';
        } catch (error) {
            setError('Failed to sign in with Google');
        }
    };

    const handleGitHubSignIn = async () => {
        try {
            window.location.href = '/api/auth/github';
        } catch (error) {
            setError('Failed to sign in with GitHub');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-[#FEF9E6] font-sans antialiased">
            {/* Success Toast Notification */}
            {showSuccessToast && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-lg">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-800">Login successful!</p>
                            <p className="text-xs text-green-600">Redirecting to dashboard...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Sign In Form */}
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <Image
                            src={"/sarallmslogo.png"}
                            height={50}
                            width={50}
                            alt='Saral LMS logo'
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FAE27C] to-[#C3EBFA] shadow-lg mb-4"
                        />
                        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                        <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                            <div className="flex items-start gap-3">
                                <svg className="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-red-800">Authentication Error</p>
                                    <p className="text-xs text-red-600 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none pr-12 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                    className="w-4 h-4 rounded border-gray-300 text-[#FAE27C] focus:ring-[#FAE27C] focus:ring-offset-0 disabled:opacity-50"
                                />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm text-[#1e3a5f] hover:text-[#FAE27C] transition">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] text-gray-800 font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-xl">G</span>
                                <span className="text-sm font-medium text-gray-700">Google</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleGitHubSignIn}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-xl">🐙</span>
                                <span className="text-sm font-medium text-gray-700">GitHub</span>
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-[#1e3a5f] font-semibold hover:text-[#FAE27C] transition">
                                Sign up for free
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#FAE27C]/30 mt-12 bg-white">
                <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
                    <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
                        <span>🇮🇳 Made in India · for the world</span>
                        <div className="flex gap-6">𝕏 · LinkedIn · Instagram · YouTube</div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}