// The user object we'll use throughout the app context
// It combines Supabase auth info with our custom 'profiles' table data
export interface User {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

export interface Event {
  id: string;
  createdAt: string;
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
  createdAt: string;
}
