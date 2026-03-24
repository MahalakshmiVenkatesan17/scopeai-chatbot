import Image from "next/image";

export const UploadSection = () => {
  return (
    <div className="bg-white w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8 px-6 md:px-16 py-6 md:py-16">
      {/* LEFT */}
      <div className="w-full md:w-1/2">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Intelligent Upload
        </h2>

        <p className="text-gray-600 text-lg mt-2">
          Automatically extract and structure knowledge for your AI chatbot.
        </p>

        {/* Upload Box */}
        <div className="mt-8 knowledge-base-upload-box text-white p-10 md:p-12 rounded-2xl shadow-lg w-full cursor-pointer transition hover:opacity-90">
          <div className="flex flex-col items-center justify-center">
            <div className="text-4xl mb-4">
              <Image
                src="/images/knowledgeBase/upload-img.png"
                alt="Upload Document Here"
                width={100}
                height={100}
                className="img-fluid"
              />
            </div>

            <p className="text-xl font-semibold text-center">
              Drop files or click to upload
            </p>

            <p className="knowledge-base-upload-muted mt-2 text-sm text-center">
              Supports 50+ file formats with instant AI analysis
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-start mt-6 md:mt-0">
        <Image
          src="/images/knowledgeBase/upload.png"
          alt="Document upload preview"
          width={580}
          height={380}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
};
