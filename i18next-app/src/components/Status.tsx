import { useTranslation } from "react-i18next";

// Component 3: Status Indicator
export const Status: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer style={{ padding: '10px', fontStyle: 'italic' }}>
      {t("status:label")}
    </footer>
  );
};