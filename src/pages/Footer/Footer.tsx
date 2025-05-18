import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaApple,
  FaGooglePlay,
} from "react-icons/fa";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const qrCodeValue = "https://www.tezsell.com";
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Left Section */}
          <div className="flex-1 space-y-6">
            {/* Footer Menu */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <Link to="/" className="hover:text-gray-300 transition-colors">
                  {t("products_title")}
                </Link>
              </div>
              <div>
                <Link
                  to="/service"
                  className="hover:text-gray-300 transition-colors"
                >
                  {t("services_title")}
                </Link>
              </div>
              <div>
                <Link
                  to="/about"
                  className="hover:text-gray-300 transition-colors"
                >
                  {t("about")}
                </Link>
              </div>
              <div>
                <a
                  href="https://t.me/tezsell_menejer"
                  className="hover:text-gray-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("support")}
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                <FaLinkedinIn className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              ©2025 TEZSELL. All Rights Reserved.
            </p>
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            <QRCode value={qrCodeValue} size={128} className="w-32 h-32" />
            <h2 className="text-lg font-medium">{t("download_mobile_app")}</h2>
            <div className="flex space-x-4">
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                <FaApple className="w-10 h-10" />
              </a>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                <FaGooglePlay className="w-10 h-10" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
