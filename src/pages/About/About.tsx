import React from 'react';
import { useTranslation } from 'react-i18next';
import './About.css'
const About = () => {
  const { t } = useTranslation();

  return (
    <div className="about-container">
      <header className="about-header">
        <h1 className="about-title">{t('about')}</h1>
      </header>

      <section className="about-content">
        <p>{t('about_content')}</p>
      </section>
    </div>
  );
};

export default About;
