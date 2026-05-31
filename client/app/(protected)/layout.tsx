import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Menu from "../components/protected/Menu";
import Navbar from "../components/protected/Navbar";

export const metadata: Metadata = {
    title: "Saral LMS - Learning Made Easy",
    description: "Saral LMS learning dashboard. lets make learning easy and fun.",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen flex">
            {/* Sidebar */}
            <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
                <Link
                    href="/"
                    className="flex items-center justify-center lg:justify-start gap-3 group"
                >
                    <Image
                        src="/sarallmslogo.png"
                        alt="Saral LMS Logo"
                        width={34}
                        height={34}
                        className="object-contain"
                    />

                    <span className="hidden lg:block text-lg font-semibold tracking-wide text-gray-800 group-hover:text-blue-600 transition-colors">
                        Saral LMS
                    </span>
                </Link>

                <Menu />
            </div>

            <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
                <Navbar  />
                {children}
            </div>
        </div>
    );
}