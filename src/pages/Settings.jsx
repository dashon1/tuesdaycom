import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Bell, 
  Palette, 
  Keyboard, 
  Save, 
  Moon, 
  Sun, 
  Monitor,
  Mail,
  Clock,
  Languages,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    // Profile
    full_name: '',
    bio: '',
    timezone: 'UTC',
    language: 'en',
    
    // Notifications
    email_notifications: true,
    push_notifications: true,
    notify_assignments: true,
    notify_comments: true,
    notify_deadlines: true,
    notify_status_changes: true,
    daily_digest: false,
    
    // Appearance
    theme: 'light',
    compact_mode: false,
    show_animations: true,
    
    // Keyboard shortcuts
    shortcuts_enabled: true
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    const userData = await base44.auth.me();
    setUser(userData);
    setSettings(prev => ({
      ...prev,
      full_name: userData?.full_name || '',
      bio: userData?.bio || '',
      timezone: userData?.timezone || 'UTC',
      language: userData?.language || 'en',
      ...userData?.settings
    }));
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await base44.auth.updateMe({
      full_name: settings.full_name,
      bio: settings.bio,
      timezone: settings.timezone,
      language: settings.language,
      settings: {
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        notify_assignments: settings.notify_assignments,
        notify_comments: settings.notify_comments,
        notify_deadlines: settings.notify_deadlines,
        notify_status_changes: settings.notify_status_changes,
        daily_digest: settings.daily_digest,
        theme: settings.theme,
        compact_mode: settings.compact_mode,
        show_animations: settings.show_animations,
        shortcuts_enabled: settings.shortcuts_enabled
      }
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-[#F5F6F8] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F5F6F8] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#323338]">Settings</h1>
            <p className="text-[#676879] mt-1">Manage your account and preferences</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-[#0073EA] hover:bg-[#0056B3]"
          >
            {isSaving ? (
              <>Saving...</>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white shadow-sm rounded-xl p-1">
            <TabsTrigger value="profile" className="rounded-lg">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="rounded-lg">
              <Keyboard className="w-4 h-4 mr-2" />
              Shortcuts
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                        {getInitials(settings.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">{user?.email}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {user?.role || 'Member'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={settings.full_name}
                        onChange={(e) => setSettings({ ...settings, full_name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={settings.bio}
                        onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="timezone">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Timezone
                        </Label>
                        <Select
                          value={settings.timezone}
                          onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                            <SelectItem value="Europe/London">London</SelectItem>
                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="language">
                          <Languages className="w-4 h-4 inline mr-2" />
                          Language
                        </Label>
                        <Select
                          value={settings.language}
                          onValueChange={(value) => setSettings({ ...settings, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="he">Hebrew</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive updates via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.email_notifications}
                        onCheckedChange={(checked) => 
                          setSettings({ ...settings, email_notifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-gray-500">Browser notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.push_notifications}
                        onCheckedChange={(checked) => 
                          setSettings({ ...settings, push_notifications: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Notify me about:</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'notify_assignments', label: 'Task assignments' },
                        { key: 'notify_comments', label: 'New comments' },
                        { key: 'notify_deadlines', label: 'Upcoming deadlines' },
                        { key: 'notify_status_changes', label: 'Status changes' },
                        { key: 'daily_digest', label: 'Daily digest summary' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{item.label}</span>
                          <Switch
                            checked={settings[item.key]}
                            onCheckedChange={(checked) => 
                              setSettings({ ...settings, [item.key]: checked })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how the app looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Theme</Label>
                    <div className="flex gap-3">
                      {[
                        { value: 'light', icon: Sun, label: 'Light' },
                        { value: 'dark', icon: Moon, label: 'Dark' },
                        { value: 'system', icon: Monitor, label: 'System' }
                      ].map(theme => (
                        <button
                          key={theme.value}
                          onClick={() => setSettings({ ...settings, theme: theme.value })}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                            settings.theme === theme.value
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <theme.icon className="w-5 h-5" />
                          <span className="font-medium">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Compact Mode</p>
                        <p className="text-sm text-gray-500">Reduce spacing and padding</p>
                      </div>
                      <Switch
                        checked={settings.compact_mode}
                        onCheckedChange={(checked) => 
                          setSettings({ ...settings, compact_mode: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Animations</p>
                        <p className="text-sm text-gray-500">Enable smooth transitions</p>
                      </div>
                      <Switch
                        checked={settings.show_animations}
                        onCheckedChange={(checked) => 
                          setSettings({ ...settings, show_animations: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Keyboard Shortcuts</CardTitle>
                  <CardDescription>Speed up your workflow with shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Keyboard Shortcuts</p>
                      <p className="text-sm text-gray-500">Use keyboard to navigate faster</p>
                    </div>
                    <Switch
                      checked={settings.shortcuts_enabled}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, shortcuts_enabled: checked })
                      }
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Available Shortcuts</h4>
                    <div className="grid gap-3">
                      {[
                        { keys: ['Ctrl', 'N'], action: 'Create new item' },
                        { keys: ['Ctrl', 'B'], action: 'Create new board' },
                        { keys: ['Ctrl', 'K'], action: 'Quick search' },
                        { keys: ['Ctrl', '/'], action: 'Show shortcuts' },
                        { keys: ['Esc'], action: 'Close modal / Cancel' },
                        { keys: ['↑', '↓'], action: 'Navigate items' },
                        { keys: ['Enter'], action: 'Open selected item' }
                      ].map((shortcut, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-700">{shortcut.action}</span>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key, j) => (
                              <kbd 
                                key={j}
                                className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}