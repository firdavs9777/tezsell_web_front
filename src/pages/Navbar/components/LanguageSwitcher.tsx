import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItem } from "@components/ui";
import { cn } from "@utils/cn";

const LANGUAGES = [
  { code: "uz", labelKey: "language_uz" },
  { code: "ru", labelKey: "language_ru" },
  { code: "en", labelKey: "language_en" },
] as const;

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  return (
    <Dropdown
      align="right"
      trigger={
        <span className="flex items-center gap-1 rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground">
          <Globe className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase">{i18n.language}</span>
        </span>
      }
    >
      {LANGUAGES.map((lang) => (
        <DropdownItem
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={cn(i18n.language === lang.code && "font-semibold text-primary")}
        >
          {t(lang.labelKey)}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
