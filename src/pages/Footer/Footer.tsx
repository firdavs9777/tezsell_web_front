import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaApple,
  FaFacebookF,
  FaGooglePlay,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/products", key: "products_title" },
  { to: "/service", key: "services_title" },
  { to: "/properties", key: "real_estate" },
  { to: "/about", key: "about" },
] as const;

const SOCIAL_LINKS = [
  { href: "https://facebook.com", Icon: FaFacebookF, label: "Facebook" },
  { href: "https://twitter.com", Icon: FaTwitter, label: "Twitter" },
  { href: "https://instagram.com", Icon: FaInstagram, label: "Instagram" },
  { href: "https://linkedin.com", Icon: FaLinkedinIn, label: "LinkedIn" },
] as const;

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container grid gap-10 py-12 md:grid-cols-3">
        <div className="space-y-4">
          <p className="text-lg font-bold text-foreground">Tezsell</p>
          <p className="max-w-xs text-sm text-muted">{t("footer.tagline")}</p>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <nav className="grid grid-cols-2 content-start gap-3 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-muted transition-colors hover:text-foreground"
            >
              {t(link.key)}
            </Link>
          ))}
          <a
            href="https://t.me/tezsell_menejer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-foreground"
          >
            {t("support")}
          </a>
        </nav>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="rounded-xl border border-border bg-white p-2">
            <QRCode value="https://www.webtezsell.com/download" size={96} />
          </div>
          <p className="text-sm font-medium text-foreground">
            {t("download_mobile_app")}
          </p>
          <div className="flex gap-3">
            <a
              href="https://apps.apple.com/kr/app/tezsell/id6755512731?l=en-GB"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="App Store"
              className="text-muted transition-colors hover:text-foreground"
            >
              <FaApple className="h-7 w-7" />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=uz.tezsell.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Play"
              className="text-muted transition-colors hover:text-foreground"
            >
              <FaGooglePlay className="h-7 w-7" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4">
        <p className="container text-xs text-muted">
          © {new Date().getFullYear()} Tezsell. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
