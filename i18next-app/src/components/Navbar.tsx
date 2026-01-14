import { useTranslation } from "react-i18next";
import i18nInstance from '../i18n';

// Component 1: The Navbar/Header
export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  console.log(i18nInstance)

  const toggle = () => {
    const newLang = i18nInstance.language === 'en' ? 'es' : 'en';
    console.log(newLang)
    i18nInstance.changeLanguage(newLang);
  };

  return (
    <nav style={{ padding: '1rem', background: '#222', color: '#fff' }}>
      <h2>{t("app:title")}</h2>
      <button onClick={toggle}>{t("app:switch")}</button>
    </nav>
  );
};
