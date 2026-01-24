import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-between">
          <span className="text-sm font-medium text-gray-900">
            Sara Pharma
          </span>

          <span className="text-sm text-gray-600">
            Thillai Nagar, Tiruchirappalli
          </span>
        </div>

        <div className="mt-2 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Sara Pharma. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
