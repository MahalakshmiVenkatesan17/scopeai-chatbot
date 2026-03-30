import Image from "next/image";
import { Upload, FileText, File, Image as ImageIcon, Music, Video, Archive, CheckCircle, Sparkles } from "lucide-react";

export const UploadSection = () => {
  const supportedFormats = [
    { icon: FileText, label: "PDF", color: "text-red-500" },
    { icon: File, label: "DOCX", color: "text-blue-500" },
    // { icon: ImageIcon, label: "JPG/PNG", color: "text-green-500" },
    // { icon: Music, label: "MP3", color: "text-purple-500" },
    // { icon: Video, label: "MP4", color: "text-pink-500" },
    // { icon: Archive, label: "ZIP", color: "text-orange-500" },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-12 px-6 md:px-16 py-12 md:py-20 transition-colors">
      {/* LEFT - Content */}
      <div className="w-full md:w-1/2">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-4 transition-colors">
          <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI-Powered Processing</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight transition-colors">
          Intelligent Upload
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-lg mt-3 transition-colors">
          Automatically extract and structure knowledge for your ScopeAIChat.
        </p>

        {/* Supported formats */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors">
            Supported formats:
          </p>
          <div className="flex flex-wrap gap-2">
            {supportedFormats.map((format, idx) => {
              const Icon = format.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <Icon className={`w-3.5 h-3.5 ${format.color} dark:${format.color.replace('text-', 'dark:text-')}`} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{format.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Processing info */}
        <div className="mt-8 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span>AI ready</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Auto-extract</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Smart indexing</span>
          </div>
        </div>
      </div>

      {/* RIGHT - Upload Box */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0">
        <div className="relative group w-full max-w-md">
          {/* Glow effect on hover */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative knowledge-base-upload-box bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-10 md:p-12 rounded-2xl shadow-xl w-full cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex flex-col items-center justify-center">
              {/* Upload icon */}
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>

              <p className="text-xl font-semibold text-center group-hover:text-white/90 transition-colors">
                Drop files or click to upload
              </p>

              <p className="knowledge-base-upload-muted mt-3 text-sm text-center text-white/70">
                Supports 50+ file formats with instant AI analysis
              </p>

              {/* File size limit */}
              <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
                <CheckCircle className="w-3 h-3" />
                <span>Up to 100MB per file</span>
                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                <CheckCircle className="w-3 h-3" />
                <span>Secure & encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};