import { useTranslation } from "react-i18next";

// Component 2: The Main Section
export const Content: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section style={{ padding: '20px' }}>
      <p>{t("content:body")}</p>
    </section>
  );
};