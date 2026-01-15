import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';

// Component 3: Status Indicator
export const Status: React.FC = () => {
  const { _ } = useLingui();
  return (
    <footer style={{ padding: '10px', fontStyle: 'italic' }}>
      {_(msg`Current Language: English`)}
    </footer>
  );
};
