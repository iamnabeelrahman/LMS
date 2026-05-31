import Image from "next/image";

const UserCard = ({ type }: { type: string }) => {
  // Dynamic colors based on user type
  const getTypeColors = () => {
    switch (type.toLowerCase()) {
      case "student":
        return {
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          icon: "text-blue-500",
          gradient: "from-blue-50 to-transparent"
        };
      case "teacher":
        return {
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: "text-emerald-500",
          gradient: "from-emerald-50 to-transparent"
        };
      case "parent":
        return {
          badge: "bg-purple-50 text-purple-700 border-purple-200",
          icon: "text-purple-500",
          gradient: "from-purple-50 to-transparent"
        };
      default:
        return {
          badge: "bg-gray-50 text-gray-700 border-gray-200",
          icon: "text-gray-500",
          gradient: "from-gray-50 to-transparent"
        };
    }
  };

  const colors = getTypeColors();

  return (
    <div className="group relative flex-1 min-w-40 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">

      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Decorative accent line */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors?.icon?.replace('text', 'to')} from-${colors.icon.split('-')[1]}-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />

      <div className="relative p-5">

        {/* Top Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${colors.badge} transition-all duration-200 group-hover:scale-105`}>
              2024/25
            </span>
            {/* Optional: Add an icon for context */}
            <div className={`text-xs font-medium ${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
              •
            </div>
          </div>

          <div className="relative">
            <Image
              src="/more.png"
              alt="more options"
              width={20}
              height={20}
              className="opacity-40 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
            />
          
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              1,234
            </h1>
            {/* Trend indicator */}
            <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
              +12%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 capitalize tracking-wide">
              Total {type}s
            </p>
            {/* Optional: Detail link */}
            <button className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
              View all →
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};

export default UserCard;