import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  color?: string;
}

export interface UserLinkGroup {
  id: string;
  name: string;
  links: UserLink[];
  color?: string;
}

export interface UserLinksSettings {
  showFrames: boolean;
  startMaximized: boolean;
}

interface UserLinksContextType {
  groups: UserLinkGroup[];
  settings: UserLinksSettings;
  addGroup: (name: string, color?: string) => void;
  removeGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<UserLinkGroup>) => void;
  addLink: (groupId: string, link: Omit<UserLink, 'id'>) => void;
  removeLink: (groupId: string, linkId: string) => void;
  reorderGroups: (newGroups: UserLinkGroup[]) => void;
  reorderLinks: (groupId: string, newLinks: UserLink[]) => void;
  updateSettings: (updates: Partial<UserLinksSettings>) => void;
  importConfig: (config: { groups: any[], settings: any }) => void;
}

const UserLinksContext = createContext<UserLinksContextType | undefined>(undefined);

const defaultSettings: UserLinksSettings = {
  showFrames: true,
  startMaximized: false,
};

export const UserLinksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<UserLinkGroup[]>(() => {
    const saved = localStorage.getItem('sknii-link-groups-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved link groups', e);
        return [];
      }
    }
    return [];
  });

  const [settings, setSettings] = useState<UserLinksSettings>(() => {
    const saved = localStorage.getItem('sknii-link-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('sknii-link-groups-v2', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('sknii-link-settings', JSON.stringify(settings));
  }, [settings]);

  const addGroup = (name: string, color?: string) => {
    setGroups(prev => [...prev, { id: crypto.randomUUID(), name, links: [], color }]);
  };

  const removeGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const updateGroup = (id: string, updates: Partial<UserLinkGroup>) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const addLink = (groupId: string, link: Omit<UserLink, 'id'>) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          links: [...g.links, { ...link, id: crypto.randomUUID() }]
        };
      }
      return g;
    }));
  };

  const removeLink = (groupId: string, linkId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          links: g.links.filter(l => l.id !== linkId)
        };
      }
      return g;
    }));
  };

  const reorderGroups = (newGroups: UserLinkGroup[]) => {
    setGroups(newGroups);
  };

  const reorderLinks = (groupId: string, newLinks: UserLink[]) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, links: newLinks } : g));
  };

  const updateSettings = (updates: Partial<UserLinksSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const importConfig = (config: { groups: UserLinkGroup[], settings: UserLinksSettings }) => {
    if (config.groups) setGroups(config.groups);
    if (config.settings) setSettings(config.settings);
  };

  return (
    <UserLinksContext.Provider value={{ 
      groups, 
      settings,
      addGroup, 
      removeGroup, 
      updateGroup, 
      addLink, 
      removeLink, 
      reorderGroups, 
      reorderLinks,
      updateSettings,
      importConfig
    }}>
      {children}
    </UserLinksContext.Provider>
  );
};

export const useUserLinks = () => {
  const context = useContext(UserLinksContext);
  if (!context) throw new Error('useUserLinks must be used within a UserLinksProvider');
  return context;
};
