import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaApple, FaGooglePlay } from "react-icons/fa";

const DownloadApp: React.FC = () => {
  const { t } = useTranslation();
  const appStoreUrl =
    "https://apps.apple.com/kr/app/tezsell/id6755512731?l=en-GB";
  const playStoreUrl = "https://play.google.com/store"; // Update when available

  useEffect(() => {
    // Detect device and auto-redirect on mobile
    const userAgent = navigator.userAgent || navigator.vendor;

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setTimeout(() => {
        window.location.href = appStoreUrl;
      }, 500);
    }
    // Android detection - uncomment when Play Store is ready
    // else if (/android/i.test(userAgent)) {
    //   setTimeout(() => {
    //     window.location.href = playStoreUrl;
    //   }, 500);
    // }
  }, [appStoreUrl, playStoreUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 px-4">
      <div className="max-w-md w-full text-center text-white">
        {/* Logo/Icon */}
        <div className="text-6xl mb-6">📱</div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">
          {t("download_mobile_app") || "Download TezSell"}
        </h1>

        {/* Description */}
        <p className="text-lg mb-8 text-purple-100">
          {t("app_download_description") ||
            "Your marketplace for everything in Uzbekistan"}
        </p>

        {/* Download Buttons */}
        <div className="space-y-4">
          {/* App Store Button */}
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <FaApple className="text-3xl" />
            <div className="text-left">
              <div className="text-xs text-gray-600">Download on the</div>
              <div className="text-base font-bold">App Store</div>
            </div>
          </a>

          {/* Google Play Button */}
          <div className="relative">
            <button
              disabled
              className="flex items-center justify-center gap-3 w-full bg-white bg-opacity-50 text-gray-700 py-4 px-6 rounded-xl font-semibold text-lg cursor-not-allowed shadow-lg"
            >
              <FaGooglePlay className="text-3xl" />
              <div className="text-left">
                <div className="text-xs">GET IT ON</div>
                <div className="text-base font-bold">Google Play</div>
              </div>
            </button>
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {t("coming_soon") || "COMING SOON"}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-sm text-purple-200">
          <p>{t("scan_qr_code") || "Scan the QR code on our website"}</p>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
