// TypeScript interfaces for Umami API responses

export interface TimeSeriesPoint {
  x: string;
  y: number;
}

export interface UmamiStatsResponse {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  comparison: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
  };
}

export interface UmamiPageviewsResponse {
  pageviews: TimeSeriesPoint[];
  sessions: TimeSeriesPoint[];
}

export interface UmamiMetric {
  x: string;
  y: number;
}

export interface UmamiSession {
  id: string;
  browser: string;
  os: string;
  device: string;
  country: string;
  city: string | null;
  firstAt: string;
  lastAt: string;
  visits: number;
  views: number;
}

export interface UmamiSessionsResponse {
  data: UmamiSession[];
  count: number;
  page: number;
  pageSize: number;
}

export interface UmamiActiveResponse {
  visitors: number;
}

export interface AnalyticsData {
  period: string;
  stats: {
    visitors: number;
    pageviews: number;
    visits: number;
    bounceRate: number;
    avgSessionTime: number;
    activeVisitors: number;
  };
  comparison: {
    visitors: number;
    pageviews: number;
    visits: number;
    bounceRate: number;
  };
  timeSeries: {
    pageviews: TimeSeriesPoint[];
    sessions: TimeSeriesPoint[];
  };
  topPages: UmamiMetric[];
  referrers: UmamiMetric[];
  browsers: UmamiMetric[];
  operatingSystems: UmamiMetric[];
  devices: UmamiMetric[];
  countries: UmamiMetric[];
  recentSessions: UmamiSession[];
}

export interface SparklineData {
  daily: { date: string; visitors: number }[];
  totalVisitors: number;
  visitorsToday: number;
  pageviewsToday: number;
}
