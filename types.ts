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
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'tickets_sold'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
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
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      tickets: {
        Row: {
          id: string;
          event_id: string;
          user_id: string | null;
          owner_email: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>;
      };
    };
    Functions: {
      purchase_ticket: {
        Args: {
          p_event_id: string;
          p_user_id: string | null;
          p_owner_email: string;
        };
        Returns: Database['public']['Tables']['tickets']['Row'];
      };
    };
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
