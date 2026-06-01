"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  useRegisterUserMutation, 
  useVerifyEmailMutation,
  useResendOtpMutation 
} from '@/redux/features/auth/authApi';

export default function SignUpPage() {
    const router = useRouter();
    const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();
    const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
    const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        organizationName: '',
        role: 'teacher',
        age: '',
        avatar: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [error, setError] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpEmail, setOtpEmail] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!agreeTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        setError('');

        // Prepare data for API
        const registrationData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            phoneNumber: formData.phoneNumber,
            role: formData.role,
            age: formData.age ? parseInt(formData.age) : undefined,
            organizationName: formData.organizationName || undefined,
            avatar: formData.avatar || undefined
        };

        try {
            const result = await registerUser(registrationData).unwrap();
            
            if (result.success) {
                setOtpEmail(formData.email);
                setShowOtpModal(true);
            } else {
                setError(result.message || 'Registration failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.data?.message || 'An error occurred. Please try again.');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setError('');

        try {
            const result = await verifyEmail({
                email: otpEmail,
                code: otpCode
            }).unwrap();

            if (result.success) {
                setShowOtpModal(false);
                alert('Email verified successfully! Please sign in to continue.');
                router.push('/signin');
            } else {
                setError(result.message || 'Invalid OTP. Please try again.');
            }
        } catch (err: any) {
            console.error('OTP verification error:', err);
            setError(err.data?.message || 'Invalid OTP. Please try again.');
        }
    };

    const handleResendOtp = async () => {
        const registrationData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            phoneNumber: formData.phoneNumber,
            role: formData.role,
            age: formData.age ? parseInt(formData.age) : undefined,
            organizationName: formData.organizationName || undefined,
            avatar: formData.avatar || undefined
        };

        try {
            await resendOtp(registrationData).unwrap();
            alert('New OTP has been sent to your email!');
        } catch (err) {
            console.error('Resend OTP error:', err);
            alert('Failed to resend OTP. Please try again.');
        }
    };

    const isLoading = isRegistering || isVerifying || isResending;

    return (
        <div className="min-h-screen bg-linear-to-b from-white to-[#FEF9E6] font-sans antialiased">
            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#FAE27C] to-[#C3EBFA] shadow-lg mb-4">
                                <span className="text-2xl">✉️</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Verify Your Email</h3>
                            <p className="text-gray-600 mt-2">
                                We've sent a verification code to <br />
                                <span className="font-semibold">{otpEmail}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none text-center text-2xl tracking-widest"
                                    placeholder="------"
                                    maxLength={6}
                                />
                                <p className="mt-2 text-xs text-gray-500 text-center">
                                    Enter the 6-digit code sent to your email
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleVerifyOtp}
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl bg-linear-to-r from-[#FAE27C] to-[#C3EBFA] text-gray-800 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {isVerifying ? 'Verifying...' : 'Verify Email'}
                            </button>

                            <button
                                onClick={handleResendOtp}
                                disabled={isLoading}
                                className="w-full py-2 text-sm text-[#1e3a5f] hover:text-[#FAE27C] transition"
                            >
                                Resend Code
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sign Up Form */}
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Image src={"/sarallmslogo.png"} height={50} width={50} alt='Saral LMS logo' className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#FAE27C] to-[#C3EBFA] shadow-lg mb-4" />
                        <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
                        <p className="mt-2 text-gray-600">Start your journey with Saral LMS today</p>
                    </div>

                    {/* Error Message */}
                    {error && !showOtpModal && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none"
                                placeholder="+1234567890"
                                required
                            />
                        </div>

                        {/* Institute Name - Show for organization registrations */}
                        {(formData.role === 'admin' || formData.role === 'owner' || formData.role === 'teacher') && (
                            <div>
                                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                                    {formData.role === 'admin' ? 'School Name *' :
                                        formData.role === 'owner' ? 'Coaching Institute Name *' :
                                            'Academy Name *'}
                                </label>
                                <input
                                    type="text"
                                    id="organizationName"
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none"
                                    placeholder="Your Organization Name"
                                    required
                                />
                            </div>
                        )}

                        {/* Age */}
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                                Age (Optional)
                            </label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none"
                                placeholder="Your age"
                                min="1"
                                max="120"
                            />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                I am a *
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none bg-white"
                            >
                                <option value="admin">School Administrator</option>
                                <option value="owner">Coaching Institute Owner</option>
                                <option value="teacher">Teacher Academy / Educator</option>
                                <option value="student">Student</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none pr-12"
                                    placeholder="Create a strong password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FAE27C] focus:ring-2 focus:ring-[#FAE27C]/20 transition-all outline-none pr-12"
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#FAE27C] focus:ring-[#FAE27C] focus:ring-offset-0"
                            />
                            <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                                I agree to the{' '}
                                <Link href="/terms" className="text-[#1e3a5f] hover:text-[#FAE27C] transition">
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-[#1e3a5f] hover:text-[#FAE27C] transition">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!agreeTerms || isLoading}
                            className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#FAE27C] to-[#C3EBFA] text-gray-800 font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isRegistering ? 'Creating Account...' : 'Create Free Account'}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-gray-500">Or sign up with</span>
                            </div>
                        </div>

                        {/* Social Sign Up Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                            >
                                <span className="text-xl">G</span>
                                <span className="text-sm font-medium text-gray-700">Google</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                            >
                                <span className="text-xl">🐙</span>
                                <span className="text-sm font-medium text-gray-700">GitHub</span>
                            </button>
                        </div>

                        {/* Sign In Link */}
                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/signin" className="text-[#1e3a5f] font-semibold hover:text-[#FAE27C] transition">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#FAE27C]/30 mt-12 bg-white">
                <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
                    <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
                        <span>🇮🇳 Made in India · for the world to make Learning 'Saral'</span>
                        <div className="flex gap-6">𝕏 · LinkedIn · Instagram · YouTube</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}