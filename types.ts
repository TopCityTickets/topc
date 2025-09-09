export interface User {
  id: string;
  email: string;
  fullName: string;
  // This structure mimics Supabase's user metadata
  app_metadata: {
    is_admin?: boolean;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  category: string;
  price: number;
  organizer: string;
  tags: string[];
  capacity?: number;
  ticketsSold: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string | null; // Can be null for guest purchases
  ownerEmail: string;
  purchaseDate: string;
}
