import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Zap, Eye, Sparkles } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    animationsEnabled: true,
    autoRefresh: false,
    showPrivateRepos: false,
    compactMode: false,
    advancedMetrics: true
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Quick Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Animations</span>
            </div>
            <Button
              variant={settings.animationsEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setSettings(s => ({ ...s, animationsEnabled: !s.animationsEnabled }))}
            >
              {settings.animationsEnabled ? "On" : "Off"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Compact Mode</span>
            </div>
            <Button
              variant={settings.compactMode ? "default" : "outline"}
              size="sm"
              onClick={() => setSettings(s => ({ ...s, compactMode: !s.compactMode }))}
            >
              {settings.compactMode ? "On" : "Off"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Advanced Metrics</span>
            </div>
            <Button
              variant={settings.advancedMetrics ? "default" : "outline"}
              size="sm"
              onClick={() => setSettings(s => ({ ...s, advancedMetrics: !s.advancedMetrics }))}
            >
              {settings.advancedMetrics ? "On" : "Off"}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button className="w-full" onClick={onClose}>
              Save & Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
