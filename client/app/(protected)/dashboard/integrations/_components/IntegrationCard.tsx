import { StorageIntegration } from "../types";

interface IntegrationCardProps {
    integration: StorageIntegration
    onDownload: (fileKey: string) => void;
    isActive?: boolean;
}

const IntegrationCard = ({ integration, onDownload, isActive }: IntegrationCardProps) => {
    const getProviderDetails = () => {
        switch (integration.provider) {
            case "aws_s3":
                return {
                    name: "AWS S3",
                    icon: "🔵",
                    color: "from-blue-300 to-blue-400",
                    bgLight: "bg-blue-50",
                    textColor: "text-blue-600",
                };
            case "google_drive":
                return {
                    name: "Google Drive",
                    icon: "🟢",
                    color: "from-green-500 to-green-600",
                    bgLight: "bg-green-50",
                    textColor: "text-green-600",
                };
            case "cloudinary":
                return {
                    name: "Cloudinary",
                    icon: "🟣",
                    color: "from-purple-500 to-purple-600",
                    bgLight: "bg-purple-50",
                    textColor: "text-purple-600",
                };
            default:
                return {
                    name: integration.provider,
                    icon: "📦",
                    color: "from-gray-500 to-gray-600",
                    bgLight: "bg-gray-50",
                    textColor: "text-gray-600",
                };
        }
    };

    const details = getProviderDetails();

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className={`p-6 bg-linear-to-r ${details.color} bg-opacity-5`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${details.bgLight} rounded-xl flex items-center justify-center text-2xl`}>
                            {details.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{details.name}</h3>
                            <p className="text-xs text-gray-500 capitalize">
                                {integration?.provider?.replace("_", " ")}
                            </p>
                        </div>
                    </div>
                    {isActive && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Active
                        </span>
                    )}
                </div>

                <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-800">Connected since</span>
                        <span className="font-medium text-gray-700">
                            {new Date(integration.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    {integration.region && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-800">Region</span>
                            <span className="font-medium text-gray-700">{integration.region}</span>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                const fileKey = prompt("Enter file key/path to download:");
                                if (fileKey) onDownload(fileKey);
                            }}
                            className={`flex-1 py-2 rounded-lg ${details.bgLight} ${details.textColor} font-medium hover:opacity-80 transition-all`}
                        >
                            Download File
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationCard;