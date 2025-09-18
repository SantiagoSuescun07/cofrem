export interface User {
  name: string;
  email: string;
  avatar: string;
  role: string;
  area: string;
  sede: string;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: 'RRHH' | 'Bienestar' | 'Formación';
  author: string;
  reactions: number;
  comments: number;
  priority: 'high' | 'medium' | 'low';
}

export interface QuickAccessItem {
  name: string;
  icon: string;
  category: 'personal' | 'sistemas' | 'documentos' | 'comunicacion';
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  url: string
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'training' | 'event';
}

export interface Birthday {
  id: string;
  name: string;
  area: string;
  date: string;
}

export type ModuleType = 'dashboard' | 'news' | 'directory' | 'documents' | 'calendar' | 'employee' | 'games' | 'settings';