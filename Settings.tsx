import React from 'react';
import CanonicalLink from './CanonicalLink';

const Settings: React.FC = () => {
  return (
    <>
      <CanonicalLink path="/settings" />
      <div className="space-y-4">
        <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-xl font-bold text-theme-text-primary">Settings</h2>
              <p className="text-sm text-theme-accent">Customize your experience</p>
            </div>
          </div>

          {/* Empty state with coming soon message */}
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-theme-text-primary mb-2">Settings features are being updated</p>
              <p className="text-sm text-theme-text-secondary">
                Use the token search above to explore cryptocurrencies
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;