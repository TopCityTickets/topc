
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import type { Event, Ticket, User } from './types';
import * as api from './services/mockApi';

// ICONS (to avoid extra dependencies and files)
const CalendarIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const MapPinIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const TicketIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 9a3 3 0 0 1 0 6v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a3 3 0 0 1 0-6V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
);
const XIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const LogInIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
);
const UserIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

// --- APP CONTEXT ---
interface AppContextType {
  user: User | null;
  tickets: Ticket[];
  loading: boolean;
  login: (email: string) => Promise<void>;
  signup: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  addTicket: (ticket: Ticket) => void;
  showAuthModal: () => void;
}
const AppContext = createContext<AppContextType | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      api.fetchTicketsForUser(user.id).then(userTickets => {
        setTickets(userTickets);
        setLoading(false);
      });
    } else {
      setTickets([]);
    }
  }, [user]);

  const login = async (email: string) => {
    setLoading(true);
    const { user: loggedInUser, error } = await api.signInWithPassword(email);
    if (loggedInUser) {
      setUser(loggedInUser);
      setAuthModalOpen(false);
    } else {
      alert(error); // In a real app, use a toast notification
    }
    setLoading(false);
  };
  
  const signup = async (email: string) => {
    setLoading(true);
    const { user: signedUpUser, error } = await api.signUp(email);
    if (signedUpUser) {
      setUser(signedUpUser);
      setAuthModalOpen(false);
    } else {
      alert(error);
    }
    setLoading(false);
  };

  const logout = async () => {
    await api.signOut();
    setUser(null);
  };

  const addTicket = (ticket: Ticket) => {
    setTickets(prev => [...prev, ticket]);
  };
  
  const showAuthModal = () => setAuthModalOpen(true);

  const value = { user, tickets, loading, login, signup, logout, addTicket, showAuthModal };

  return (
    <AppContext.Provider value={value}>
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </AppContext.Provider>
  );
};
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

// --- HELPER & UI COMPONENTS ---

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { login, signup, loading } = useAppContext();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Password is not used in mock, but essential for real UI

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginView) {
      login(email);
    } else {
      signup(email);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-dark rounded-lg shadow-xl p-8 w-full max-w-md relative animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-light hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-4 text-white">{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-gray-light mb-6">{isLoginView ? 'Sign in to manage your tickets.' : 'Get started with TopCityTickets.'}</p>
        
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email (e.g., user@topcitytickets.io)" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-dark border border-gray-medium rounded-md p-3 mb-4 text-white focus:ring-2 focus:ring-primary focus:border-primary" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-dark border border-gray-medium rounded-md p-3 mb-6 text-white focus:ring-2 focus:ring-primary focus:border-primary" required />
          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors disabled:bg-gray-medium">
            {loading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-light">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLoginView(!isLoginView)} className="text-primary font-semibold ml-2 hover:underline">
            {isLoginView ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};


const TicketPurchaseModal: React.FC<{ isOpen: boolean; onClose: () => void; event: Event | null }> = ({ isOpen, onClose, event }) => {
    const { user, addTicket, showAuthModal } = useAppContext();
    const [email, setEmail] = useState(user?.email || '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [purchasedTicket, setPurchasedTicket] = useState<Ticket | null>(null);

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handlePurchase = async () => {
        if (!event || !email) return;
        setIsProcessing(true);
        const newTicket = await api.purchaseTicket(event.id, email, user?.id || null);
        if (user) {
            addTicket(newTicket);
        }
        setPurchasedTicket(newTicket);
        setIsProcessing(false);
    };

    const handleClose = () => {
        setPurchasedTicket(null);
        setIsProcessing(false);
        onClose();
    }
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-dark bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-dark rounded-lg shadow-xl p-8 w-full max-w-lg relative animate-slide-up">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-light hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>
                
                {purchasedTicket ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h2>
                        <p className="text-gray-light mb-6">Your ticket for {event?.title} has been confirmed.</p>
                        <div className="bg-white p-4 rounded-lg inline-block">
                           <QRCodeCanvas value={purchasedTicket.id} size={160} />
                        </div>
                        <p className="text-xs text-gray-medium mt-2">{purchasedTicket.id}</p>
                        <p className="mt-4 text-gray-light">A confirmation has been sent to <strong>{purchasedTicket.ownerEmail}</strong>.</p>
                        <button onClick={handleClose} className="mt-6 w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors">
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Ticket</h2>
                        <p className="text-gray-light mb-6">You're purchasing a ticket for <strong>{event?.title}</strong> for ${event?.price.toFixed(2)}.</p>
                        
                        {!user && (
                            <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-md mb-6 text-sm">
                                <p>You're purchasing as a guest. <button onClick={() => { onClose(); showAuthModal(); }} className="font-bold underline">Log in</button> to save your tickets to your account.</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-light mb-2">Email for Ticket Delivery</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                required
                                disabled={!!user}
                            />
                        </div>
                        <button onClick={handlePurchase} disabled={isProcessing} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors disabled:bg-gray-medium">
                            {isProcessing ? 'Processing...' : `Confirm Purchase ($${event?.price.toFixed(2)})`}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// --- PAGE COMPONENTS & LAYOUT ---

const Header: React.FC = () => {
    const { user, logout, showAuthModal } = useAppContext();
    const navigate = useNavigate();

    const handleMyTicketsClick = () => {
        if (user) {
            navigate('/my-tickets');
        } else {
            showAuthModal();
        }
    };

    return (
        <header className="bg-dark/80 backdrop-blur-sm sticky top-0 z-40">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
                    <TicketIcon className="w-8 h-8 text-primary" />
                    TopCityTickets
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-gray-light hover:text-white transition-colors font-medium">Events</Link>
                    <button onClick={handleMyTicketsClick} className="text-gray-light hover:text-white transition-colors font-medium bg-transparent border-none p-0 cursor-pointer">My Tickets</button>
                    {user ? (
                        <>
                            {user.app_metadata.is_admin ? (
                                <Link to="/admin" className="text-gray-light hover:text-white transition-colors font-medium">Admin Dashboard</Link>
                            ) : (
                                <Link to="/dashboard" className="text-gray-light hover:text-white transition-colors font-medium">Dashboard</Link>
                            )}
                            <button onClick={logout} className="bg-secondary text-white font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity">Logout</button>
                        </>
                    ) : (
                        <button onClick={showAuthModal} className="flex items-center gap-2 bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-md transition-colors">
                            <LogInIcon className="w-5 h-5" />
                            <span>Sign In / Sign Up</span>
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <Link to={`/event/${event.id}`} className="bg-gray-dark rounded-lg overflow-hidden group transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
        <div className="relative">
            <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
                <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded">{event.category}</span>
            </div>
        </div>
        <div className="p-4">
            <h3 className="text-lg font-bold text-white mb-2 truncate">{event.title}</h3>
            <div className="flex items-center text-gray-light text-sm mb-2">
                <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
             <div className="flex items-center text-gray-light text-sm">
                <MapPinIcon className="w-4 h-4 mr-2 text-primary" />
                <span className="truncate">{event.location}</span>
            </div>
        </div>
    </Link>
);

const EventsPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        api.fetchEvents().then(data => {
            setEvents(data);
            setLoading(false);
        });
    }, []);

    const categories = useMemo(() => ['All', ...new Set(events.map(e => e.category))], [events]);

    const filteredEvents = useMemo(() => {
        return events.filter(event => 
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (categoryFilter === 'All' || event.category === categoryFilter)
        );
    }, [events, searchTerm, categoryFilter]);
    
    if (loading) return <div className="h-[80vh]"><Spinner /></div>;

    return (
        <div className="container mx-auto px-6 py-8 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">Find Your Next <span className="text-primary">Experience</span></h1>
                <p className="text-lg text-gray-light mt-4 max-w-2xl mx-auto">Discover concerts, conferences, and culinary events happening across the galaxy.</p>
            </div>

            <div className="bg-gray-dark p-4 rounded-lg mb-8 flex flex-col md:flex-row gap-4 items-center sticky top-[72px] z-30 backdrop-blur-sm bg-opacity-80">
                <input
                    type="text"
                    placeholder="Search for events..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:flex-1 bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full md:w-auto bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary"
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
        </div>
    );
};

const EventDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            api.fetchEventById(id).then(data => {
                setEvent(data || null);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="h-[80vh]"><Spinner /></div>;
    if (!event) return <NotFoundPage />;

    return (
        <>
            <div className="container mx-auto px-6 py-8 animate-fade-in">
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
                    <div className="absolute bottom-8 left-8">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">{event.title}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-4">About this event</h2>
                        <p className="text-gray-light leading-relaxed">{event.description}</p>
                    </div>
                    <div>
                        <div className="bg-gray-dark rounded-lg p-6 sticky top-24">
                            <div className="flex items-start gap-4 mb-4">
                                <CalendarIcon className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-white">Date and Time</h3>
                                    <p className="text-gray-light">{new Date(event.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4 mb-6">
                                <MapPinIcon className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-white">Location</h3>
                                    <p className="text-gray-light">{event.location}</p>
                                </div>
                            </div>
                            <button onClick={() => setPurchaseModalOpen(true)} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors text-lg">
                                Buy Ticket - ${event.price.toFixed(2)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <TicketPurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} event={event} />
        </>
    );
};


const TicketCard: React.FC<{ ticket: Ticket; event: Event }> = ({ ticket, event }) => (
    <div className="bg-gray-dark rounded-lg overflow-hidden flex flex-col md:flex-row">
        <img src={event.imageUrl} alt={event.title} className="w-full md:w-1/3 h-48 md:h-auto object-cover" />
        <div className="p-6 flex flex-col justify-between flex-1">
            <div>
                <span className="text-sm text-primary font-bold">{event.category}</span>
                <h3 className="text-2xl font-bold text-white mt-1">{event.title}</h3>
                <div className="flex items-center text-gray-light text-sm mt-2">
                    <CalendarIcon className="w-4 h-4 mr-2"/>
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center text-gray-light text-sm mt-1">
                    <MapPinIcon className="w-4 h-4 mr-2"/>
                    <span className="truncate">{event.location}</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-medium text-xs text-gray-light">
                Purchased on: {new Date(ticket.purchaseDate).toLocaleDateString()}
            </div>
        </div>
        <div className="bg-dark p-6 flex flex-col items-center justify-center">
             <div className="bg-white p-2 rounded-md">
                <QRCodeCanvas value={ticket.id} size={128} />
             </div>
             <p className="text-xs text-gray-medium mt-2 break-all w-36 text-center">{ticket.id}</p>
        </div>
    </div>
);


const MyTicketsPage: React.FC = () => {
    const { user, tickets, loading: userLoading } = useAppContext();
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user && !userLoading) {
            navigate('/');
        }
    }, [user, userLoading, navigate]);

    useEffect(() => {
        setLoading(true);
        api.fetchEvents().then(allEvents => {
            setEvents(allEvents);
            setLoading(false);
        });
    }, []);

    const ticketsWithEvents = useMemo(() => {
        return tickets.map(ticket => ({
            ticket,
            event: events.find(e => e.id === ticket.eventId)
        })).filter(item => item.event);
    }, [tickets, events]);


    if (loading || userLoading) return <div className="h-[80vh]"><Spinner/></div>;
    
    return (
        <div className="container mx-auto px-6 py-8 animate-fade-in">
             <h1 className="text-4xl font-extrabold text-white mb-8">My Tickets</h1>
             {ticketsWithEvents.length > 0 ? (
                <div className="space-y-6">
                    {ticketsWithEvents.map(({ ticket, event }) => event && <TicketCard key={ticket.id} ticket={ticket} event={event} />)}
                </div>
             ) : (
                <div className="text-center py-16 bg-gray-dark rounded-lg">
                    <TicketIcon className="w-16 h-16 text-gray-medium mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white">No tickets yet.</h2>
                    <p className="text-gray-light mt-2">Your purchased tickets will appear here.</p>
                    <Link to="/" className="mt-6 inline-block bg-primary hover:bg-primary-focus text-white font-bold py-3 px-6 rounded-md transition-colors">
                        Explore Events
                    </Link>
                </div>
             )}
        </div>
    );
};

const UserDashboardPage: React.FC = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
        } else if (user.app_metadata.is_admin) {
            navigate('/admin');
        }
    }, [user, navigate]);

    if (!user) {
        return <div className="h-[80vh]"><Spinner/></div>;
    }

    return (
        <div className="container mx-auto px-6 py-8 animate-fade-in">
            <h1 className="text-4xl font-extrabold text-white mb-8">My Dashboard</h1>
            <div className="bg-gray-dark p-8 rounded-lg max-w-2xl mx-auto">
                <div className="flex items-center mb-6">
                     <UserIcon className="w-16 h-16 text-primary mr-6"/>
                     <div>
                          <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                          <p className="text-gray-light">Manage your account details.</p>
                     </div>
                </div>
                <form>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Email</label>
                            <input type="email" value={user.email} disabled className="w-full bg-dark border border-gray-medium rounded-md p-3 text-gray-light cursor-not-allowed"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">New Password</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                            <p className="text-xs text-gray-medium mt-1">Leave blank to keep current password.</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button type="submit" className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors disabled:bg-gray-medium">
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminDashboardPage: React.FC = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('Music');
    const [price, setPrice] = useState('0');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user || !user.app_metadata.is_admin) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const newEventData = {
            title, description, date, location, category, 
            price: parseFloat(price),
            imageUrl: `https://picsum.photos/seed/${title.replace(/\s+/g, '-')}/1600/900`,
        };
        await api.createEvent(newEventData);
        setIsSubmitting(false);
        alert('Event created successfully!');
        navigate('/');
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-4xl font-extrabold text-white mb-8">Admin Dashboard</h1>
            <div className="bg-gray-dark p-8 rounded-lg max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6 -mt-2">Create New Event</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-light mb-2">Event Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-light mb-2">Description</label>
                        {/* FIX: Corrected typo from `e.taget.value` to `e.target.value` */}
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Date and Time</label>
                            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Location</label>
                            <input type="text" value={location} onChange={e => setLocation(e.target.value)} required className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Category</label>
                            <input type="text" value={category} onChange={e => setCategory(e.target.value)} required className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Price</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors disabled:bg-gray-medium">
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const NotFoundPage: React.FC = () => (
    <div className="text-center py-20">
        <h1 className="text-6xl font-extrabold text-primary">404</h1>
        <p className="text-2xl text-white mt-4">Page Not Found</p>
        <p className="text-gray-light mt-2">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-8 inline-block bg-primary hover:bg-primary-focus text-white font-bold py-3 px-6 rounded-md transition-colors">
            Go Home
        </Link>
    </div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen bg-dark text-light flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<EventsPage />} />
              <Route path="/event/:id" element={<EventDetailPage />} />
              <Route path="/my-tickets" element={<MyTicketsPage />} />
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AppProvider>
  );
}