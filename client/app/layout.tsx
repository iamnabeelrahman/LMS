import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saral LMS - Learning Made Easy",
  description: "Saral LMS is a learning platform for Institutions, coaching and teachers to create and manage courses and classes. It provides a user-friendly interface for students to access course materials, submit assignments, and track their progress. With features like interactive quizzes, discussion forums, and real-time feedback, Saral LMS enhances the learning experience and promotes engagement. Whether you're an educator or a learner, Saral LMS is designed to make education accessible and enjoyable for everyone.",
  icons: {
    icon: "/sarallmslogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
