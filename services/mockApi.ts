import type { Event, Ticket, User } from '../types';

// Mock database tables
const mockEvents: Event[] = [
  { id: 'event-1', title: 'Cosmic Funk Fest', description: 'An interstellar journey through funk, soul, and disco. Featuring live bands and DJs from across the galaxy.', date: '2024-09-15T20:00:00Z', location: 'Orion Nebula Amphitheater', imageUrl: 'https://picsum.photos/seed/cosmic/1600/900', category: 'Music', price: 75.00 },
  { id: 'event-2', title: 'React Universe Conf 2024', description: 'The biggest React conference in the universe. Learn about the latest features, server components, and hooks from the creators.', date: '2024-10-22T09:00:00Z', location: 'Virtual, accessible via Holo-Deck', imageUrl: 'https://picsum.photos/seed/react/1600/900', category: 'Tech', price: 299.00 },
  { id: 'event-3', title: 'Midnight Art Gala', description: 'An exclusive night showcasing avant-garde digital art and sculptures. Dress code: futuristic formal.', date: '2024-11-05T19:00:00Z', location: 'The Void Gallery', imageUrl: 'https://picsum.photos/seed/artgala/1600/900', category: 'Art', price: 150.00 },
  { id: 'event-4', title: 'Gourmet Galaxy Food Tour', description: 'Taste the finest cuisines from a dozen different star systems. A culinary experience you will never forget.', date: '2024-09-28T18:00:00Z', location: 'Titan City Food Market', imageUrl: 'https://picsum.photos/seed/food/1600/900', category: 'Food', price: 200.00 },
  { id: 'event-5', title: 'Cyber-Punk Marathon', description: 'Run through the neon-lit streets of Neo-Kyoto in this thrilling 42km marathon. Cybernetic enhancements are encouraged.', date: '2024-12-01T07:00:00Z', location: 'Neo-Kyoto, Sector 7', imageUrl: 'https://picsum.photos/seed/marathon/1600/900', category: 'Sports', price: 50.00 },
  { id: 'event-6', title: 'Deep Space Jazz Night', description: 'Relax and unwind to the smooth sounds of live jazz under a simulated starfield. Classic cocktails served.', date: '2024-10-10T21:00:00Z', location: 'The Blue Comet Lounge', imageUrl: 'https://picsum.photos/seed/jazz/1600/900', category: 'Music', price: 60.00 },
];

const mockUsers: User[] = [
  { id: 'user-1', email: 'admin@topcitytickets.io', app_metadata: { is_admin: true } },
  { id: 'user-2', email: 'user@topcitytickets.io', app_metadata: { is_admin: false } },
];

const mockTickets: Ticket[] = [
  { id: 'ticket-1', eventId: 'event-1', userId: 'user-2', ownerEmail: 'user@topcitytickets.io', purchaseDate: new Date().toISOString() },
];

// Simulate network delay
const delay = <T,>(data: T, ms = 500): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), ms));

// --- API Functions ---

export const fetchEvents = async (): Promise<Event[]> => {
  console.log('API: Fetching all events...');
  return delay([...mockEvents]);
};

export const fetchEventById = async (id: string): Promise<Event | undefined> => {
  console.log(`API: Fetching event with id: ${id}`);
  const event = mockEvents.find(e => e.id === id);
  return delay(event);
};

export const createEvent = async(eventData: Omit<Event, 'id'>): Promise<Event> => {
    console.log('API: Creating new event...');
    const newEvent: Event = {
        ...eventData,
        id: `event-${Date.now()}`
    };
    mockEvents.unshift(newEvent);
    return delay(newEvent);
}

export const purchaseTicket = async (eventId: string, ownerEmail: string, userId: string | null): Promise<Ticket> => {
  console.log(`API: Purchasing ticket for event ${eventId} for user ${ownerEmail}`);
  const newTicket: Ticket = {
    id: `ticket-${crypto.randomUUID()}`,
    eventId,
    userId,
    ownerEmail,
    purchaseDate: new Date().toISOString(),
  };
  // In a real app, this would be saved to the database.
  // Here we'll just return it. The context will manage the user's tickets.
  return delay(newTicket);
};

// --- Auth Functions (mimicking Supabase) ---

export const signInWithPassword = async (email: string): Promise<{ user: User | null; error: string | null }> => {
  console.log(`API: Attempting to sign in with email: ${email}`);
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    return delay({ user, error: null });
  }
  return delay({ user: null, error: 'Invalid credentials' });
};

export const signUp = async (email: string): Promise<{ user: User | null; error: string | null }> => {
  console.log(`API: Attempting to sign up with email: ${email}`);
  if (mockUsers.some(u => u.email === email)) {
    return delay({ user: null, error: 'User already exists' });
  }
  const newUser: User = {
    id: `user-${crypto.randomUUID()}`,
    email,
    app_metadata: { is_admin: false },
  };
  mockUsers.push(newUser);
  return delay({ user: newUser, error: null });
};

export const signOut = async (): Promise<{ error: null }> => {
  console.log('API: Signing out.');
  return delay({ error: null });
};

export const fetchTicketsForUser = async (userId: string): Promise<Ticket[]> => {
    console.log(`API: Fetching tickets for user ${userId}`);
    const tickets = mockTickets.filter(t => t.userId === userId);
    return delay(tickets);
}