export interface Event {
  id: string;
  title: string;
  description: string | null;
  eventDate: Date;
  eventTime: Date | null;
  endDate: Date | null;
  location: string | null;
  posterImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
