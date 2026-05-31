import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Navbar from './components/protected/HomeNavbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FEF9E6] font-sans antialiased">
      {/* Navigation */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col items-center gap-12 py-12 md:flex-row md:py-20">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FAE27C]/20 px-4 py-1.5 text-sm font-medium text-[#1e3a5f] border border-[#FAE27C]">
                ⚡️ India's easy teaching OS
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Learning made<br />easy & organised.
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                Replace spreadsheets, WhatsApp chaos, and manual records. One structured platform for institutes, schools & independent teachers.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#" className="rounded-full bg-linear-to-r from-[#FAE27C] to-[#C3EBFA] px-6 py-3 font-semibold text-gray-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">Start Free Trial →</a>
                <a href="#" className="rounded-full border border-[#FAE27C] bg-white px-6 py-3 font-semibold text-gray-800 shadow-sm transition hover:bg-[#FAE27C]/10">Book Demo</a>
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-3xl bg-linear-to-r from-[#C3EBFA]/30 to-[#FAE27C]/20 p-6 shadow-lg border border-white/80">
              <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-white/80 shadow-md backdrop-blur-sm">
                <Image
                  src="/dashboard-preview.png" // Replace with your actual image path
                  alt="Saral LMS Dashboard Preview"
                  fill
                  className="object-cover rounded-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
          <p className="text-sm font-medium text-gray-500">Trusted by modern institutes</p>
          <div className="mt-4 flex flex-wrap justify-between gap-4 opacity-65 grayscale">
            {['delhi public school', 'akash institute', 'allen career', 'narayana group', 'vision ias'].map((name) => (
              <span key={name} className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-gray-600 border border-[#FAE27C]/30 shadow-sm min-w-[100px]">{name}</span>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-[#FAE27C]/20 px-4 py-1.5 text-xs font-medium tracking-wide text-[#1e3a5f] border border-[#FAE27C]">
              Everything you need, nothing you don't
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for the way{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative">education actually works</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 6C50 2 150 2 198 6" stroke="#FAE27C" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" />
                </svg>
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              After talking to multiple educators, we built features that solve real problems. From student management to class management, we've got you covered.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
            {/* Student Management */}
            <div className="group relative lg:col-span-3">
              <div className="h-full rounded-2xl border border-[#FAE27C]/30 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#FAE27C] hover:shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C3EBFA] to-[#FAE27C]/50 text-xl">
                    👥
                  </div>
                  <span className="text-xs font-medium text-[#FAE27C]">#1 most used</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Student Management</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  One dashboard to actually understand your students — not just manage them. Profiles, groups, and progress, all in one place.
                </p>
                <div className="mt-4 flex items-center text-xs text-[#1e3a5f] opacity-0 transition group-hover:opacity-100">
                  <span>Used by 2,000+ educators</span>
                  <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Batch Management */}
            <div className="group relative lg:col-span-3">
              <div className="h-full rounded-2xl border border-[#FAE27C]/30 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#FAE27C] hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#CFCEFF] to-[#C3EBFA] text-xl">
                  📚
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Batch Management</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Organize batches like a pro. Assign teachers, manage schedules, and keep everything humming — without the spreadsheet chaos.
                </p>
                <div className="mt-4 text-xs text-gray-400">Drag-drop scheduling • Conflict checker</div>
              </div>
            </div>

            {/* Attendance Tracking */}
            <div className="group relative lg:col-span-3">
              <div className="h-full rounded-2xl border-2 border-[#FAE27C] bg-gradient-to-br from-[#FAE27C]/10 to-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -right-2 -top-2">
                  <span className="inline-flex rounded-full bg-[#FAE27C] px-2 py-1 text-xs font-medium text-gray-800">
                    ✨ New
                  </span>
                </div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FAE27C] to-[#C3EBFA] text-xl">
                  📋
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Attendance Tracking</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Mark attendance in seconds. QR codes, NFC, or good old click — we've got you covered. Automated reports? Yes.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <span>⚡ 3-second check-in</span>
                  <span>•</span>
                  <span>📊 Smart reports</span>
                </div>
              </div>
            </div>

            {/* Course Builder */}
            <div className="group relative lg:col-span-3">
              <div className="h-full rounded-2xl border border-[#FAE27C]/30 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#FAE27C] hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C3EBFA] to-[#CFCEFF] text-xl">
                  🏗️
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Course Builder</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Build courses that actually engage. Lessons, modules, resources — drag, drop, and you're ready. No tech skills needed.
                </p>
                <div className="mt-4 text-xs text-gray-400">Rich media • Quizzes • Certificates</div>
              </div>
            </div>

            {/* Assignments & Exams */}
            <div className="lg:col-span-6">
              <div className="group relative overflow-hidden rounded-2xl border border-[#FAE27C]/30 bg-white p-6 transition-all duration-300 hover:shadow-lg">
                <div className="absolute bottom-0 right-0 -mb-8 -mr-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#FAE27C]/20 to-[#C3EBFA]/20 opacity-0 transition group-hover:opacity-100"></div>
                <div className="relative flex flex-wrap items-start gap-6 sm:flex-nowrap">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FAE27C] to-[#C3EBFA] text-2xl text-gray-800 shadow-lg">
                    📝
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xl font-semibold text-gray-900">Assignments & Exams</h3>
                      <span className="rounded-full bg-[#FAE27C]/20 px-3 py-1 text-xs font-medium text-[#1e3a5f]">Auto-grading available</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Create assignments that don't make students yawn. Auto-graded quizzes, timed exams, AI-assisted grading — or go old school with manual reviews.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>✓ 10+ question types</span>
                      <span>✓ Plagiarism check</span>
                      <span>✓ Peer reviews</span>
                      <span>✓ Rubric builder</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Analytics */}
            <div className="lg:col-span-6">
              <div className="group relative overflow-hidden rounded-2xl border border-[#FAE27C]/30 bg-white p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex flex-wrap items-start gap-6 sm:flex-nowrap">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#CFCEFF] to-[#C3EBFA] text-2xl text-gray-800 shadow-lg">
                    📊
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">Progress Analytics</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Stop guessing. Know exactly who's thriving and who needs help. Beautiful charts, clear insights, and actionable data.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full w-[73%] rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA]"></div>
                      </div>
                      <span className="text-xs text-gray-500">73% completion rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Tenant System */}
            <div className="group relative lg:col-span-6">
              <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6 transition-all duration-300 hover:border-[#FAE27C] hover:shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C3EBFA] to-[#CFCEFF] text-xl">
                    🏢
                  </div>
                  <div className="flex -space-x-2">
                    {['🏫', '🎓', '📖'].map((icon, i) => (
                      <div key={i} className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-sm">
                        {icon}
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Multi-Tenant System</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Run multiple institutes under one roof. Each gets its own portal, branding, and data — completely isolated.
                </p>
                <div className="mt-3 text-xs text-gray-400">White-label ready • Custom domains • Role-based access</div>
              </div>
            </div>

            {/* Parent App */}
            <div className="group relative lg:col-span-6">
              <div className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6 transition-all duration-300 hover:border-[#FAE27C] hover:shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FAE27C] to-[#C3EBFA] text-xl">
                    👨‍👩‍👧
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#FAE27C]">
                    <span>❤️ Parents love this</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Parent App</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Keep parents in the loop without spamming their inbox. Real-time updates, progress reports, and direct messaging.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span>📱 iOS & Android</span>
                  <span>•</span>
                  <span>🔔 Smart notifications</span>
                  <span>•</span>
                  <span>💬 Two-way chat</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust footer */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#FAE27C]/30 pt-8 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="flex h-2 w-2 rounded-full bg-[#FAE27C]"></span>
              <span>Trusted by 500+ educators who switched from spreadsheets</span>
            </div>
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#C3EBFA] to-[#FAE27C]/50 text-xs font-medium text-gray-600">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-xs text-gray-500">
                +200
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Start in minutes, not months.</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Create your institute', desc: 'Sign up, add your institute name, branding, and academic structure.' },
              { step: '2', title: 'Add teachers & students', desc: 'Bulk import or invite manually — they get access instantly.' },
              { step: '3', title: 'Manage learning easily', desc: 'Start taking attendance, share lessons, track assignments.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 border-b border-[#FAE27C]/30 pb-6 last:border-b-0 md:border-b-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#FAE27C] bg-gradient-to-br from-[#FAE27C]/20 to-white text-3xl font-bold text-[#1e3a5f] shadow-sm">{item.step}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Screenshot */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
          <div className="relative h-96 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a5f] to-[#FAE27C]/20 shadow-2xl border border-[#FAE27C]/30">
            <div className="flex h-full items-center justify-center">
              <span className="text-2xl font-medium text-white/70">⚡ Saral LMS · dashboard preview</span>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Loved by educators, trusted by institutes</h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { text: '“We moved from 5 different WhatsApp groups to Saral. Now everything from attendance to results is automated. Absolute game changer.”', name: 'Meera Nair', role: 'Director, Blossom Academy', bg: '#FAE27C' },
              { text: '“Finally an LMS that doesn’t feel like enterprise software. My teachers adopted it in 2 days. The batch analytics alone are worth it.”', name: 'Rajeev Ranjan', role: 'CEO, IITians’ hub', bg: '#C3EBFA' },
              { text: '“As an independent teacher, Saral helped me look professional. Students submit assignments, I grade — all in one place.”', name: 'Anjali Sharma', role: 'Math educator', bg: '#CFCEFF' },
            ].map((t, idx) => (
              <div key={idx} className="rounded-2xl border border-[#FAE27C]/30 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
                <p className="text-gray-800 text-lg leading-relaxed">{t.text}</p>
                <div className="mt-6 flex items-center gap-3 border-t border-[#FAE27C]/30 pt-4">
                  <div className={`h-11 w-11 rounded-xl`} style={{ backgroundColor: t.bg }}></div>
                  <div>
                    <strong className="text-gray-900">— {t.name}</strong><br />
                    <span className="text-sm text-gray-500">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-gray-600">No hidden fees. Upgrade or cancel anytime.</p>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-[#FAE27C]/30 bg-white p-6 shadow-sm transition hover:shadow-lg md:p-8">
              <h3 className="text-xl font-semibold">Starter</h3>
              <div className="mt-4 text-4xl font-bold">₹0 <span className="text-lg font-normal text-gray-500">/mo</span></div>
              <ul className="mt-6 space-y-2 text-gray-600">
                <li>✓ up to 30 students</li><li>✓ basic attendance</li><li>✓ 1 teacher</li><li>✗ analytics</li>
              </ul>
              <a href="#" className="mt-8 block w-full rounded-full border border-[#FAE27C] bg-white py-3 text-center font-semibold text-gray-800 transition hover:bg-[#FAE27C]/10">Start free</a>
            </div>
            <div className="relative rounded-3xl border-2 border-[#FAE27C] bg-white p-6 shadow-xl md:p-8">
              <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] px-3 py-0.5 text-xs font-bold uppercase text-gray-800">most popular</span>
              <h3 className="text-xl font-semibold">Growth</h3>
              <div className="mt-4 text-4xl font-bold">₹2,499 <span className="text-lg font-normal text-gray-500">/mo</span></div>
              <ul className="mt-6 space-y-2 text-gray-600">
                <li>✓ up to 300 students</li><li>✓ advanced reports</li><li>✓ 10 teachers</li><li>✓ exams & assignments</li>
              </ul>
              <a href="#" className="mt-8 block w-full rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] py-3 text-center font-semibold text-gray-800 shadow-md transition hover:-translate-y-0.5">Start free trial</a>
            </div>
            <div className="rounded-3xl border border-[#FAE27C]/30 bg-white p-6 shadow-sm transition hover:shadow-lg md:p-8">
              <h3 className="text-xl font-semibold">Institute</h3>
              <div className="mt-4 text-4xl font-bold">₹5,999 <span className="text-lg font-normal text-gray-500">/mo</span></div>
              <ul className="mt-6 space-y-2 text-gray-600">
                <li>✓ unlimited students</li><li>✓ multi‑branch</li><li>✓ dedicated support</li><li>✓ api access</li>
              </ul>
              <a href="#" className="mt-8 block w-full rounded-full border border-[#FAE27C] bg-white py-3 text-center font-semibold text-gray-800 transition hover:bg-[#FAE27C]/10">Contact sales</a>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
          <div className="rounded-3xl border border-[#FAE27C]/30 bg-gradient-to-br from-white to-[#FAE27C]/10 p-10 text-center shadow-sm md:p-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Ready to make learning easy?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">Join thousands of institutes that replaced chaos with clarity.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="#" className="rounded-full bg-gradient-to-r from-[#FAE27C] to-[#C3EBFA] px-8 py-4 font-semibold text-gray-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">Start your free trial →</a>
              <a href="#" className="rounded-full border border-[#FAE27C] bg-white px-8 py-4 font-semibold text-gray-800 shadow-sm transition hover:bg-[#FAE27C]/10">Book a demo</a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#FAE27C]/30 mt-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2">
              <div className="bg-gradient-to-r from-[#1e3a5f] to-[#FAE27C] bg-clip-text text-2xl font-bold text-transparent">Saral LMS</div>
              <p className="mt-2 text-sm text-gray-500">Learning made easy.<br />© 2026 Saral Groups.</p>
            </div>
            <div><h5 className="font-semibold text-gray-900">Product</h5><ul className="mt-3 space-y-2"><li><a href="#" className="text-sm text-gray-500 hover:text-[#fae37ca6]">Features</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Pricing</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Integrations</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Changelog</a></li></ul></div>
            <div><h5 className="font-semibold text-gray-900">Company</h5><ul className="mt-3 space-y-2"><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">About</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Careers</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Blog</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Press</a></li></ul></div>
            <div><h5 className="font-semibold text-gray-900">Support</h5><ul className="mt-3 space-y-2"><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Help center</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Documentation</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Community</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Status</a></li></ul></div>
            <div><h5 className="font-semibold text-gray-900">Legal</h5><ul className="mt-3 space-y-2"><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Privacy</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Terms</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Security</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-[#FAE27C]">Cookies</a></li></ul></div>
          </div>
          <hr className="my-8 border-[#FAE27C]/30" />
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
            <span>🇮🇳 Made in India · for the world</span>
            <div className="flex gap-6">𝕏 · LinkedIn · Instagram · YouTube</div>
          </div>
        </div>
      </footer>
    </div>
  );
}