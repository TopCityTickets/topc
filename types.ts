export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          date: string;
          location: string;
          image_url: string;
          category: string;
          price: number;
          organizer: string;
          tags: string[];
          capacity: number | null;
          tickets_sold: number;
        };
        Insert: {
          title: string;
          description: string;
          date: string;
          location: string;
          image_url: string;
          category: string;
          price: number;
          organizer: string;
          tags: string[];
          capacity?: number | null;
        };
        Update: {
          title?: string;
          description?: string;
          date?: string;
          location?: string;
          image_url?: string;
          category?: string;
          price?: number;
          organizer?: string;
          tags?: string[];
          capacity?: number | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          is_admin?: boolean;
        };
        Update: {
          full_name?: string | null;
          is_admin?: boolean;
        };
      };
      tickets: {
        Row: {
          id: string;
          event_id: string;
          user_id: string | null;
          owner_email: string;
          created_at: string;
        };
        Insert: {
          event_id: string;
          user_id?: string | null;
          owner_email: string;
        };
        Update: {
          event_id?: string;
          user_id?: string | null;
          owner_email?: string;
        };
      };
    };
    Functions: {
      purchase_ticket: {
        Args: {
          p_event_id: string;
          p_user_id: string | null;
          p_owner_email: string;
        };
        Returns: {
          id: string;
          event_id: string;
          user_id: string | null;
          owner_email: string;
          created_at: string;
        };
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
  };
};

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
