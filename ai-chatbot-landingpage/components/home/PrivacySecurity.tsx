import React from "react";
import Image from "next/image";

export function PrivacySecurity() {
  return (
    <>
      <section className=" py-15 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT CONTENT */}
          <div>
            <p className="w-fit mx-auto px-4 py-1 text-xs font-semibold text-gray-700 border border-gray-400 bg-white rounded-full mb-5">
              🔒 Privacy & Security
            </p>

            <h2 className="md:text-4xl font-semibold text-gray-900 mb-5 text-center max-w-md mx-auto text-2xl">
              We'll never let you lose sleep over privacy and security concerns
            </h2>

            <p className="text-gray-600 max-w-lg text-center mx-auto">
              At Tars, we take privacy and security very seriously. We are
              compliant with SOC 2, GDPR, ISO, and HIPAA.
            </p>
          </div>

          {/* RIGHT CERT GRID */}

          <div className="p-6 rounded-2xl ">
            <Image
              src="/images/articles/privacy-security.png"
              alt="Privacy and Security"
              width={500}
              height={300}
            />
          </div>
        </div>
      </section>
    </>
  );
}
