import { Languages, Eye, Volume2, Save, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-muted-foreground">
          Personalize your casino experience and adjust accessibility preferences.
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* Localization & Language */}
        <Card className="border-sidebar-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary" />
              Language & Region
            </CardTitle>
            <CardDescription>Select your preferred language for the interface.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="language">Interface Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="language" className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (Default)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Visual Accessibility */}
        <Card className="border-sidebar-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Visual Accessibility
            </CardTitle>
            <CardDescription>Adjust colors and text sizes for better visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Colorblind Mode Select */}
              <div className="space-y-2">
                <Label htmlFor="colorblind">Colorblind Filter</Label>
                <Select defaultValue="none">
                  <SelectTrigger id="colorblind">
                    <SelectValue placeholder="Default Colors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Standard)</SelectItem>
                    <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia (Green-Blind)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia (Blue-Blind)</SelectItem>
                    <SelectItem value="monochrome">Monochrome (High Contrast)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> Adjusts UI colors to improve card recognition.
                </p>
              </div>

              {/* Font Size Select */}
              <div className="space-y-2">
                <Label htmlFor="font-size">Text Scaling</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (12px)</SelectItem>
                    <SelectItem value="medium">Medium (Standard)</SelectItem>
                    <SelectItem value="large">Large (18px)</SelectItem>
                    <SelectItem value="extra-large">Extra Large (24px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio & Speech */}
        <Card className="border-sidebar-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              Audio & Assistance
            </CardTitle>
            <CardDescription>Configure text-to-speech and audio cues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tts">Text-to-Speech (Screen Reader)</Label>
              <Select defaultValue="disabled">
                <SelectTrigger id="tts" className="w-full md:w-[300px]">
                  <SelectValue placeholder="Speech Options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="lessons">Lessons Only</SelectItem>
                  <SelectItem value="gameplay">Gameplay & Notifications</SelectItem>
                  <SelectItem value="full">Full Narrative Mode</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Automatically reads aloud lesson content and game results.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline">Reset Defaults</Button>
          <Button className="min-w-[140px] font-bold shadow-md">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}