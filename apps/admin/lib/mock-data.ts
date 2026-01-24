// Mock data for dashboard - will be replaced with real API calls later

export interface DashboardStats {
  visitorsToday: number;
  visitorsTrend: number;
  postsThisMonth: number;
  postsTrend: number;
  totalDocuments: number;
  documentsTrend: number;
  unreadMessages: number;
  messagesTrend: number;
}

export const mockDashboardStats: DashboardStats = {
  visitorsToday: 127,
  visitorsTrend: 12,
  postsThisMonth: 8,
  postsTrend: -5,
  totalDocuments: 234,
  documentsTrend: 3,
  unreadMessages: 5,
  messagesTrend: 0,
};

export interface VisitorDataPoint {
  date: string;
  visitors: number;
}

// Last 7 days visitor data
export const mockVisitorData: VisitorDataPoint[] = [
  { date: 'Pon', visitors: 89 },
  { date: 'Uto', visitors: 112 },
  { date: 'Sri', visitors: 98 },
  { date: 'Čet', visitors: 145 },
  { date: 'Pet', visitors: 167 },
  { date: 'Sub', visitors: 78 },
  { date: 'Ned', visitors: 127 },
];

export interface ContentByCategoryDataPoint {
  category: string;
  count: number;
  fill: string;
}

export const mockContentByCategory: ContentByCategoryDataPoint[] = [
  { category: 'Aktualnosti', count: 45, fill: '#22c55e' },
  { category: 'Gospodarstvo', count: 23, fill: '#3b82f6' },
  { category: 'Sport', count: 18, fill: '#f59e0b' },
  { category: 'Kultura', count: 12, fill: '#8b5cf6' },
  { category: 'Ostalo', count: 8, fill: '#64748b' },
];

export interface RecentActivity {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
}

export const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    action: 'objavio',
    target: 'Obavijest o radovima na cesti',
    user: 'Admin',
    timestamp: 'Prije 2 sata',
  },
  {
    id: '2',
    action: 'dodao dokument',
    target: 'Zapisnik sjednice 15.01.2026',
    user: 'Admin',
    timestamp: 'Jučer',
  },
  {
    id: '3',
    action: 'primljena poruka',
    target: 'Upit o radnom vremenu',
    user: 'Posjetitelj',
    timestamp: 'Jučer',
  },
  {
    id: '4',
    action: 'ažurirao',
    target: 'Stranica kontakti',
    user: 'Admin',
    timestamp: 'Prije 2 dana',
  },
];

export interface TopPage {
  path: string;
  title: string;
  views: number;
}

export const mockTopPages: TopPage[] = [
  { path: '/vijesti/nova-cesta', title: 'Nova cesta u izgradnji', views: 234 },
  { path: '/kontakt', title: 'Kontakt', views: 156 },
  { path: '/dokumenti/proracun-2026', title: 'Proračun 2026', views: 89 },
  { path: '/vijesti/zimska-sluzba', title: 'Zimska služba aktivirana', views: 76 },
  { path: '/o-opcini', title: 'O općini', views: 54 },
];
