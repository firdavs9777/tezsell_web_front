import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
}

interface ComingSoonCardProps {
  emoji: string;
  title: string;
  badge: string;
}

interface HomeProps {
  t?: (key: string) => string;
}

const Home: React.FC<HomeProps> = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
 
  const {t} = useTranslation()
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      <section className={`pt-10 pb-20 px-4 bg-gradient-to-b from-yellow-200 to-white transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
            <span className="text-yellow-500">{t("hero.title")}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-10">
            <button 
              onClick={() => navigateTo('/new-product')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-300 shadow-md"
            >
              {t("hero.startSelling")}
            </button>
            <button 
              onClick={() => navigateTo('/products')}
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-8 py-3 rounded-lg text-lg font-semibold transition duration-300 shadow-md"
            >
              {t("hero.browseProducts")}
            </button>
          </div>

          {/* Hero Image */}
          <div className="relative mx-auto max-w-4xl h-64 md:h-96 bg-gray-100 rounded-xl shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-yellow-500/20" />
            <div className="flex items-center justify-center h-full">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div 
                    key={item} 
                    className="bg-white p-2 rounded-lg shadow-md h-24 md:h-32 flex items-center justify-center"
                  >
                    <div className="w-full h-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            {t("features.title")}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              emoji="🔍"
              title={t("features.listing.title")}
              description={t("features.listing.description")}
            />
            <FeatureCard 
              emoji="📍"
              title={t("features.location.title")}
              description={t("features.location.description")}
            />
            <FeatureCard 
              emoji="📂"
              title={t("features.category.title")}
              description={t("features.category.description")}
            />
          </div>
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                {t("inspiration.title")}
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                {t("inspiration.description1")}
              </p>
              <p className="text-lg text-gray-700">
                {t("inspiration.description2")}
              </p>
            </div>
            <div className="md:w-1/2 bg-gradient-to-br from-yellow-100 to-blue-100 p-8 rounded-xl shadow-lg">
              <div className="aspect-video bg-white rounded-lg shadow flex items-center justify-center">
                <div className="text-center p-4">
                  <span className="block text-6xl mb-4">🥕</span>
                  <span className="block text-xl font-semibold text-blue-900">{t("hero.title")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16 px-4 bg-blue-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">
            {t("comingSoon.title")}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <ComingSoonCard 
              emoji="💬"
              title={t("comingSoon.chat")}
              badge={t("comingSoon.badge")}
            />
            <ComingSoonCard 
              emoji="🛡️"
              title={t("comingSoon.transactions")}
              badge={t("comingSoon.badge")}
            />
            <ComingSoonCard 
              emoji="🏢"
              title={t("comingSoon.realEstate")}
              badge={t("comingSoon.badge")}
            />
          </div>
          
          <button 
            onClick={() => navigateTo('/updates')}
            className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-6 py-3 rounded-lg text-lg font-semibold transition duration-300"
          >
            {t("comingSoon.stayUpdated")}
            <span className="ml-2">→</span>
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-yellow-300 to-yellow-400">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-xl text-blue-900 mb-8 max-w-3xl mx-auto">
            {t("cta.description")}
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button 
              onClick={() => navigateTo('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-300 shadow-md"
            >
              {t("cta.createAccount")}
            </button>
            <button 
              onClick={() => navigateTo('/about')}
              className="bg-white hover:bg-gray-100 text-blue-900 px-8 py-3 rounded-lg text-lg font-semibold transition duration-300 shadow-md"
            >
              {t("cta.learnMore")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<FeatureCardProps> = ({ emoji, title, description }) => (
  <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-gray-100">
    <div className="flex items-center justify-center h-16 mb-4">
      <span className="text-4xl">{emoji}</span>
    </div>
    <h3 className="text-xl font-semibold text-blue-900 mb-3 text-center">{title}</h3>
    <p className="text-gray-700 text-center">{description}</p>
  </div>
);

const ComingSoonCard: React.FC<ComingSoonCardProps> = ({ emoji, title, badge }) => (
  <div className="bg-blue-800 rounded-xl p-6 hover:bg-blue-700 transition duration-300">
    <div className="flex items-center justify-center h-16 mb-4">
      <span className="text-4xl">{emoji}</span>
    </div>
    <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
    <div className="inline-block px-3 py-1 bg-yellow-400 text-blue-900 text-sm font-medium rounded-full">
      {badge}
    </div>
  </div>
);

export default Home;