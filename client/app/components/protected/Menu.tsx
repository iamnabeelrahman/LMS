import { role } from "@/app/lib/data";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/dashboard",
        visible: ["admin", "teacher", "student", "parent"],
        modulePermissions: ["home.read"],
      },
      {
        icon: "/teacher.png",
        label: "Departments",
        href: "/dashboard/departments",
        visible: ["admin", "teacher"],
        modulePermissions: ["teacher.read"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/dashboard/teachers",
        visible: ["admin", "teacher"],
        modulePermissions: ["teacher.read"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/dashboard/students",
        visible: ["admin", "teacher"],
        modulePermissions: ["student.read"],

      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/dashboard/parents",
        visible: ["admin", "teacher"],
        modulePermissions: ["parent.read"],

      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/dashboard/subjects",
        visible: ["admin"],
        modulePermissions: ["subject.read"],

      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/dashboard/classes",
        visible: ["admin", "teacher"],
        modulePermissions: ["classe.read"],

      },
      {
        icon: "/lesson.png",
        label: "Courses",
        href: "/dashboard/courses",
        visible: ["admin", "teacher"],
        modulePermissions: ["lesson.read"],

      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/dashboard/exams",
        visible: ["admin", "teacher", "student", "parent"],
        modulePermissions: ["esam.read"],

      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/dashboard/assignments",
        visible: ["admin", "teacher", "student", "parent"],
        modulePermissions: ["assignment.read"],

      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/dashboard/results",
        visible: ["admin", "teacher", "student", "parent"],
        modulePermissions: ["result.read"],

      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/dashboard/attendance",
        visible: ["admin", "teacher", "student", "parent"],
        modulePermissions: ["attendance.read"],

      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/dashboard/events",
        visible: ["admin", "teacher", "student", "parent"],
        modulePermissions: ["calendar.read"],

      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/dashboard/messages",
        visible: ["admin", "teacher", "student", "parent"],
        modulePermissions: ["message.read"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/dashboard/announcements",
        visible: ["admin", "teacher", "student", "parent"],
        modulePermissions: ["announcement.read"],
      },
      {
        icon: "/integration.png",
        label: "Integrations",
        href: "/dashboard/integrations",
        visible: ["admin"],
        modulePermissions: ["integrations.read"],
      },
      {
        icon: "/integration.png",
        label: "Users",
        href: "/dashboard/users",
        visible: ["admin"],
        modulePermissions: ["integrations.read"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const Menu = () => {
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;