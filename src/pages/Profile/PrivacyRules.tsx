import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Globe, Mail, MapPin, Gavel, ChevronLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xl font-bold text-blue-600 mt-6 mb-3">{children}</h2>
  );

  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <p className="text-gray-700 leading-relaxed mb-3 text-justify">
      {children}
    </p>
  );

  const BulletPoint = ({ children }: { children: React.ReactNode }) => (
    <li className="text-gray-700 leading-relaxed ml-6 mb-2 list-disc">
      {children}
    </li>
  );

  const ContactRow = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-gray-600" />
      <span className="text-gray-700 text-sm">{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 px-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-blue-700 rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold">{t("privacy.title")}</h1>
          </div>

          {/* Language Selector */}
          <select
            value={currentLang}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-blue-700 text-white px-3 py-2 rounded-lg border border-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="en">🇬🇧 English</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="uz">🇺🇿 O'zbek</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 pb-8">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">
              TEZSELL CORPORATION
            </h2>
            <p className="text-gray-700 font-medium mb-1">
              {t("privacy.title")}
            </p>
            <p className="text-sm text-gray-600 italic">
              {t("privacy.lastUpdated")}: October 10, 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <SectionTitle>{t("privacy.section1.title")}</SectionTitle>
          <Paragraph>{t("privacy.section1.para1")}</Paragraph>
          <Paragraph>{t("privacy.section1.para2")}</Paragraph>

          <SectionTitle>{t("privacy.section2.title")}</SectionTitle>
          <Paragraph>{t("privacy.section2.intro")}</Paragraph>

          <h3 className="font-semibold text-gray-800 mt-4 mb-2">
            {t("privacy.section2.personalInfo.title")}
          </h3>
          <ul className="mb-4">
            <BulletPoint>
              {t("privacy.section2.personalInfo.account")}
            </BulletPoint>
            <BulletPoint>
              {t("privacy.section2.personalInfo.profile")}
            </BulletPoint>
            <BulletPoint>
              {t("privacy.section2.personalInfo.listing")}
            </BulletPoint>
            <BulletPoint>
              {t("privacy.section2.personalInfo.communication")}
            </BulletPoint>
            <BulletPoint>
              {t("privacy.section2.personalInfo.payment")}
            </BulletPoint>
          </ul>

          <h3 className="font-semibold text-gray-800 mt-4 mb-2">
            {t("privacy.section2.autoCollected.title")}
          </h3>
          <ul className="mb-4">
            <BulletPoint>
              {t("privacy.section2.autoCollected.device")}
            </BulletPoint>
            <BulletPoint>
              {t("privacy.section2.autoCollected.usage")}
            </BulletPoint>
            <BulletPoint>
              {t("privacy.section2.autoCollected.location")}
            </BulletPoint>
            <BulletPoint>
              {t("privacy.section2.autoCollected.cookies")}
            </BulletPoint>
          </ul>

          <SectionTitle>{t("privacy.section3.title")}</SectionTitle>
          <Paragraph>{t("privacy.section3.intro")}</Paragraph>
          <ul className="mb-4">
            <BulletPoint>{t("privacy.section3.provision")}</BulletPoint>
            <BulletPoint>{t("privacy.section3.improvement")}</BulletPoint>
            <BulletPoint>{t("privacy.section3.communication")}</BulletPoint>
            <BulletPoint>{t("privacy.section3.safety")}</BulletPoint>
            <BulletPoint>{t("privacy.section3.legal")}</BulletPoint>
            <BulletPoint>{t("privacy.section3.marketing")}</BulletPoint>
          </ul>

          <SectionTitle>{t("privacy.section4.title")}</SectionTitle>
          <Paragraph>{t("privacy.section4.intro")}</Paragraph>
          <ul className="mb-4">
            <BulletPoint>{t("privacy.section4.users")}</BulletPoint>
            <BulletPoint>{t("privacy.section4.providers")}</BulletPoint>
            <BulletPoint>{t("privacy.section4.legal")}</BulletPoint>
            <BulletPoint>{t("privacy.section4.business")}</BulletPoint>
            <BulletPoint>{t("privacy.section4.consent")}</BulletPoint>
          </ul>
          <Paragraph>
            <strong>{t("privacy.section4.noSell")}</strong>
          </Paragraph>

          <SectionTitle>{t("privacy.section5.title")}</SectionTitle>
          <Paragraph>{t("privacy.section5.intro")}</Paragraph>
          <ul className="mb-4">
            <BulletPoint>{t("privacy.section5.encryption")}</BulletPoint>
            <BulletPoint>{t("privacy.section5.password")}</BulletPoint>
            <BulletPoint>{t("privacy.section5.assessment")}</BulletPoint>
            <BulletPoint>{t("privacy.section5.access")}</BulletPoint>
          </ul>
          <Paragraph>{t("privacy.section5.disclaimer")}</Paragraph>

          <SectionTitle>{t("privacy.section6.title")}</SectionTitle>
          <Paragraph>{t("privacy.section6.intro")}</Paragraph>
          <ul className="mb-4">
            <BulletPoint>{t("privacy.section6.access")}</BulletPoint>
            <BulletPoint>{t("privacy.section6.correction")}</BulletPoint>
            <BulletPoint>{t("privacy.section6.deletion")}</BulletPoint>
            <BulletPoint>{t("privacy.section6.restriction")}</BulletPoint>
            <BulletPoint>{t("privacy.section6.portability")}</BulletPoint>
            <BulletPoint>{t("privacy.section6.objection")}</BulletPoint>
            <BulletPoint>{t("privacy.section6.withdraw")}</BulletPoint>
          </ul>
          <Paragraph>{t("privacy.section6.contact")}</Paragraph>

          <SectionTitle>{t("privacy.section7.title")}</SectionTitle>
          <Paragraph>{t("privacy.section7.content")}</Paragraph>

          <SectionTitle>{t("privacy.section8.title")}</SectionTitle>
          <Paragraph>{t("privacy.section8.content")}</Paragraph>
        </div>

        {/* Contact Card */}
        <div className="bg-gray-100 rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold">{t("privacy.contactInfo")}</h3>
          </div>
          <ContactRow icon={Mail} text="support@tezsell.uz" />
          <ContactRow icon={Gavel} text="legal@tezsell.uz" />
          <ContactRow icon={MapPin} text="Tashkent, Uzbekistan" />
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
