"use client"
import { RootState } from '@/redux/store';
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useSelector } from 'react-redux';

const Navbar = () => {
  const auth = useSelector((state: RootState) => state.auth);

  console.log("auth state in Navbar:", auth);
  return (
    <nav className="sticky top-0 z-10 mx-auto flex max-w-[1400px] items-center justify-between bg-white/80 px-4 py-4 backdrop-blur-sm md:px-8 border-b border-gray-100/80">

      <Link
        href="/"
        className="flex items-center justify-center lg:justify-start gap-3 group"
      >
        <Image
          src="/sarallmslogo.png"
          alt="Saral LMS Logo"
          width={54}
          height={54}
          className="object-contain"
        />
      </Link>
      <div className="hidden items-center gap-6 md:flex">
        <a href="#" className="text-sm font-medium text-gray-600 transition hover:text-yellow-500">Features</a>
        <a href="#" className="text-sm font-medium text-gray-600 transition hover:text-yellow-500">Pricing</a>
        <a href="#" className="text-sm font-medium text-gray-600 transition hover:text-yellow-500">For Schools</a>
        <a href="#" className="text-sm font-medium text-gray-600 transition hover:text-yellow-500">For Coaching</a>
        <a href="#" className="text-sm font-medium text-gray-600 transition hover:text-yellow-500">Independent Teacher Login</a>

        <a href="#" className="rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] px-5 py-2 text-sm font-semibold text-gray-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
          Start Free Trial
        </a>
      </div>
    </nav>)
}

export default Navbar