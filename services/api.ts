import { supabase } from './supabaseClient';
import type { Event, Ticket, User } from '../types';
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

// --- Event Functions ---

export const fetchEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return data as Event[];
};

export const fetchEventById = async (id: string): Promise<Event | null> => {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) {
    console.error(`Error fetching event ${id}:`, error);
    return null;
  }
  return data as Event;
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'ticketsSold' | 'createdAt'>): Promise<Event | null> => {
    const { data, error } = await supabase.from('events').insert(eventData).select().single();
    if (error) {
        console.error('Error creating event:', error);
        return null;
    }
    return data as Event;
};

// --- Ticket Functions ---

export const purchaseTicket = async (eventId: string, ownerEmail: string, userId: string | null): Promise<Ticket | null> => {
    const { data, error } = await supabase.rpc('purchase_ticket', {
        p_event_id: eventId,
        p_user_id: userId,
        p_owner_email: ownerEmail
    });

    if (error) {
        console.error('Error purchasing ticket:', error);
        alert(`Purchase failed: ${error.message}`); // Show specific error to user
        return null;
    }
    // RPC returns the ticket record directly, but it's nested inside a 'data' array from the client
    // The actual function returns a single record, so we assume it's the first element.
    return Array.isArray(data) ? data[0] as Ticket : data as Ticket;
};


export const fetchTicketById = async (id: string): Promise<{ ticket: Ticket; event: Event } | null> => {
    const { data, error } = await supabase
        .from('tickets')
        .select('*, events(*)')
        .eq('id', id)
        .single();
    
    if (error || !data || !data.events) {
        console.error(`Error fetching ticket ${id}:`, error);
        return null;
    }
    
    const { events, ...ticket } = data;
    return { ticket: ticket as Ticket, event: events as Event };
};

export const fetchTicketsForUser = async (userId: string): Promise<{ticket: Ticket, event: Event}[]> => {
    const { data, error } = await supabase
        .from('tickets')
        .select('*, events(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error(`Error fetching tickets for user ${userId}:`, error);
        return [];
    }

    return data.map(item => {
        const { events, ...ticket } = item;
        return { ticket: ticket as Ticket, event: events as Event };
    }).filter(item => item.event); // Ensure event data is present
};


// --- Auth & Profile Functions ---

export const getAppUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, is_admin')
        .eq('id', supabaseUser.id)
        .single();
    
    if (error || !profile) {
        console.error('Error fetching user profile:', error?.message);
        return null;
    }

    return {
        id: profile.id,
        email: supabaseUser.email!,
        fullName: profile.full_name,
        isAdmin: profile.is_admin
    };
}

export const updateUserProfile = async (userId: string, updates: { full_name: string }): Promise<{ user: User | null; error: Error | null }> => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        return { user: null, error: new Error(error.message) };
    }
    
    // We need to get the full user object again to return it
    const currentUser = await getCurrentUser();
    return { user: currentUser, error: null };
};


export const onAuthStateChange = (callback: (user: User | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            try {
                const appUser = await getAppUser(session.user);
                if (appUser) {
                    callback(appUser);
                } else {
                    console.warn('User profile not found after sign in');
                    callback({
                        id: session.user.id,
                        email: session.user.email!,
                        fullName: null,
                        isAdmin: false
                    });
                }
            } catch (error) {
                console.error('Error getting user profile:', error);
                callback(null);
            }
        } else {
            callback(null);
        }
    });

    return () => subscription.unsubscribe();
};


export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        return getAppUser(session.user);
    }
    return null;
}

export const signInWithPassword = async (email: string, password: string):Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
};

export const signUp = async (email: string, password: string, fullName: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName, // This data is used by the `handle_new_user` trigger in SQL
            },
        },
    });
    return { error };
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};