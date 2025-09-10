
import AuthCallback from './AuthCallback';
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate, Outlet } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import type { Event, Ticket, User } from './types';
import * as api from './services/api';

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
const LinkIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
);
const MailIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
);
const SearchIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const AlertTriangleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);


// --- APP CONTEXT ---
interface AppContextType {
  user: User | null;
  tickets: { ticket: Ticket; event: Event }[];
  loading: boolean;
  sessionChecked: boolean;
  addTicket: (ticket: Ticket, event: Event) => void;
  showAuthModal: () => void;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, fullName: string) => Promise<string | null>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  updateUser: (updatedUser: User) => void;
}
const AppContext = createContext<AppContextType | null>(null);

type ToastMessage = { message: string; type: 'success' | 'error' };

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<{ ticket: Ticket; event: Event }[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setSessionChecked(true);
      }
    };

    initAuth();

    // Listen for auth state changes (login, logout)
    const unsubscribe = api.onAuthStateChange((updatedUser) => {
      setUser(updatedUser);
      setSessionChecked(true);
    });
    
    return () => unsubscribe();
  }, []);

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

  const login = async (email: string, password: string) => {
    const { error } = await api.signInWithPassword(email, password);
    if (error) return error.message;
    setAuthModalOpen(false);
    return null;
  };
  
  const signup = async (email: string, password: string, fullName: string) => {
    const { error } = await api.signUp(email, password, fullName);
    if (error) return error.message;
    // Don't close modal, AuthModal will show success message
    return null;
  };

  const logout = async () => {
    await api.signOut();
    setUser(null);
  };

  const addTicket = (ticket: Ticket, event: Event) => {
    setTickets(prev => [{ ticket, event }, ...prev]);
  };
  
  const showAuthModal = () => setAuthModalOpen(true);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = { user, tickets, loading, sessionChecked, login, signup, logout, addTicket, showAuthModal, showToast, updateUser };

  return (
    <AppContext.Provider value={value}>
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
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

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void; }> = ({ message, type, onDismiss }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-primary' : 'bg-secondary';
    const Icon = isSuccess ? CheckCircleIcon : AlertTriangleIcon;

    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className={`flex items-center gap-4 text-white p-4 rounded-lg shadow-2xl bg-gray-dark border border-gray-medium`}>
                <div className={`p-1 rounded-full ${bgColor}`}>
                    <Icon className="w-6 h-6 text-white"/>
                </div>
                <p className="font-semibold">{message}</p>
                <button onClick={onDismiss} className="text-gray-light hover:text-white">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { login, signup } = useAppContext();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLoginView && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    let apiError: string | null = null;
    if (isLoginView) {
      apiError = await login(email, password);
    } else {
      apiError = await signup(email, password, fullName);
      if (!apiError) {
        setSignupSuccess(true);
      }
    }
    
    if (apiError) {
      setError(apiError);
    }
    setLoading(false);
  };
  
  const resetState = useCallback(() => {
    setIsLoginView(true);
    setEmail('');
    setFullName('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setLoading(false);
    setSignupSuccess(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  }
  
  useEffect(() => {
    if (isOpen) {
        resetState();
    }
  }, [isOpen, resetState]);


  if (!isOpen) return null;
  
  if (signupSuccess) {
    return (
       <div className="fixed inset-0 bg-dark bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-gray-dark rounded-lg shadow-xl p-8 w-full max-w-md relative animate-slide-up text-center">
            <MailIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Confirm your email</h2>
            <p className="text-gray-light mt-4">We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox (and spam folder) to complete your registration.</p>
            <button onClick={handleClose} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors mt-8">
                Close
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-dark bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-dark rounded-lg shadow-xl p-8 w-full max-w-md relative animate-slide-up">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-light hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-4 text-white">{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-gray-light mb-6">{isLoginView ? 'Sign in to manage your tickets.' : 'Get started with TopCityTickets.'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
             <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary" required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary" required />
          {!isLoginView && (
             <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary" required />
          )}
          {error && <p className="text-secondary text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors disabled:bg-gray-medium !mt-6">
            {loading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-light">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="text-primary font-semibold ml-2 hover:underline">
            {isLoginView ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

const CopyToClipboardButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button 
            onClick={handleCopy} 
            className="flex items-center gap-2 text-sm bg-gray-medium/20 hover:bg-gray-medium/40 text-white font-semibold py-2 px-3 rounded-md transition-colors"
        >
            <LinkIcon className="w-4 h-4" />
            <span>{copied ? 'Copied!' : 'Copy Share Link'}</span>
        </button>
    );
};

const TicketPurchaseModal: React.FC<{ isOpen: boolean; onClose: () => void; event: Event | null }> = ({ isOpen, onClose, event }) => {
    const { user, addTicket, showAuthModal } = useAppContext();
    const [email, setEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [purchasedTicket, setPurchasedTicket] = useState<Ticket | null>(null);

    useEffect(() => {
        if (isOpen) {
            setEmail(user?.email || '');
        }
    }, [isOpen, user]);

    const handlePurchase = async () => {
        if (!event || !email) return;
        setIsProcessing(true);
        const newTicket = await api.purchaseTicket(event.id, email, user?.id || null);
        if (newTicket) {
            if (user) {
                // If the user is logged in, add the ticket to their local state.
                addTicket(newTicket, event);
            }
            setPurchasedTicket(newTicket);
        }
        setIsProcessing(false);
    };

    const handleClose = () => {
        setPurchasedTicket(null);
        setIsProcessing(false);
        setEmail(user?.email || '');
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
                           <QRCodeCanvas value={`${window.location.origin}${window.location.pathname}#/ticket/${purchasedTicket.id}`} size={160} />
                        </div>
                        <p className="text-xs text-gray-medium mt-2">{purchasedTicket.id}</p>
                        <p className="mt-4 text-gray-light">A confirmation has been sent to <strong>{purchasedTicket.ownerEmail}</strong>.</p>
                        <div className="mt-6 flex flex-col items-center gap-4">
                           <CopyToClipboardButton textToCopy={`${window.location.origin}${window.location.pathname}#/ticket/${purchasedTicket.id}`} />
                           <button onClick={handleClose} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors">
                                Close
                           </button>
                        </div>
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
                        <button onClick={handlePurchase} disabled={isProcessing || !email} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors disabled:bg-gray-medium disabled:cursor-not-allowed">
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
                            {user.isAdmin && (
                                <Link to="/admin" className="text-gray-light hover:text-white transition-colors font-medium">Admin</Link>
                            )}
                            <div className="flex items-center gap-4">
                               <Link to="/dashboard" className="flex items-center gap-2 text-gray-light hover:text-white transition-colors font-medium">
                                 <UserIcon className="w-5 h-5"/> {user.fullName.split(' ')[0]}
                               </Link>
                               <button onClick={logout} className="bg-secondary text-white font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity">Logout</button>
                            </div>
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
    <Link to={`/event/${event.id}`} className="bg-gray-dark rounded-lg overflow-hidden group transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 flex flex-col">
        <div className="relative">
            <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
                <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded">{event.category}</span>
            </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-white mb-2 truncate">{event.title}</h3>
            <p className="text-sm text-gray-light mb-3">by <span className="font-semibold">{event.organizer}</span></p>
            <div className="flex-grow">
                <div className="flex items-center text-gray-light text-sm mb-2">
                    <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center text-gray-light text-sm">
                    <MapPinIcon className="w-4 h-4 mr-2 text-primary" />
                    <span className="truncate">{event.location}</span>
                </div>
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
            (event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.organizer.toLowerCase().includes(searchTerm.toLowerCase())) &&
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

            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-dark rounded-lg">
                    <SearchIcon className="w-16 h-16 text-gray-medium mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white">No Events Found</h2>
                    <p className="text-gray-light mt-2">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
            )}
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
                setEvent(data);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="h-[80vh]"><Spinner /></div>;
    if (!event) return <NotFoundPage />;
    
    const ticketsRemaining = event.capacity ? event.capacity - event.ticketsSold : null;

    return (
        <>
            <div className="container mx-auto px-6 py-8 animate-fade-in">
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
                    <div className="absolute bottom-8 left-8">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">{event.title}</h1>
                        <p className="text-xl text-gray-light mt-1">by <span className="font-semibold">{event.organizer}</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
                        <p className="text-gray-light leading-relaxed whitespace-pre-wrap">{event.description}</p>
                        
                        <h3 className="text-xl font-bold text-white mt-8 mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {event.tags.map(tag => (
                                <span key={tag} className="bg-gray-dark text-primary border border-primary/50 text-sm font-medium px-3 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
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
                            {ticketsRemaining !== null && ticketsRemaining <= 0 ? (
                                <div className="w-full text-center bg-secondary text-white font-bold py-3 rounded-md text-lg">
                                    Sold Out
                                </div>
                            ) : (
                                <>
                                <button onClick={() => setPurchaseModalOpen(true)} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors text-lg">
                                    Buy Ticket - ${event.price.toFixed(2)}
                                </button>
                                {ticketsRemaining !== null && (
                                     <p className={`text-center mt-3 text-sm font-medium ${ticketsRemaining < 20 ? 'text-secondary animate-pulse' : 'text-gray-light'}`}>
                                         Only {ticketsRemaining} tickets left!
                                     </p>
                                )}
                                </>
                            )}
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
            <div className="mt-4 pt-4 border-t border-gray-medium flex justify-between items-center">
                 <div className="text-xs text-gray-light">
                    Purchased: {new Date(ticket.createdAt).toLocaleDateString()}<br/>
                    For: {ticket.ownerEmail}
                </div>
                <CopyToClipboardButton textToCopy={`${window.location.origin}${window.location.pathname}#/ticket/${ticket.id}`} />
            </div>
        </div>
        <div className="bg-dark p-6 flex flex-col items-center justify-center">
             <div className="bg-white p-2 rounded-md">
                <QRCodeCanvas value={`${window.location.origin}${window.location.pathname}#/ticket/${ticket.id}`} size={128} />
             </div>
             <p className="text-xs text-gray-medium mt-2 break-all w-36 text-center">{ticket.id}</p>
        </div>
    </div>
);


const MyTicketsPage: React.FC = () => {
    const { user, tickets, loading, sessionChecked } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (sessionChecked && !user) {
            navigate('/');
        }
    }, [user, sessionChecked, navigate]);

    if (loading || !sessionChecked) return <div className="h-[80vh]"><Spinner/></div>;
    
    return (
        <div className="container mx-auto px-6 py-8 animate-fade-in">
             <h1 className="text-4xl font-extrabold text-white mb-8">My Tickets</h1>
             {tickets.length > 0 ? (
                <div className="space-y-6">
                    {tickets.map(({ ticket, event }) => <TicketCard key={ticket.id} ticket={ticket} event={event} />)}
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
    const { user, sessionChecked, showToast, updateUser } = useAppContext();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (sessionChecked && !user) {
            navigate('/');
        } else if (user) {
             setFullName(user.fullName);
        }
    }, [user, sessionChecked, navigate]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || fullName === user.fullName) return;

        setIsSubmitting(true);
        const { user: updatedUser, error } = await api.updateUserProfile(user.id, { full_name: fullName });
        setIsSubmitting(false);

        if (error) {
            showToast(error.message, 'error');
        } else if (updatedUser) {
            updateUser(updatedUser);
            showToast('Profile updated successfully!');
        }
    };


    if (!user || !sessionChecked) {
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
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Full Name</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Email</label>
                            <input type="email" value={user.email} disabled className="w-full bg-dark border border-gray-medium rounded-md p-3 text-gray-light cursor-not-allowed"/>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button type="submit" disabled={isSubmitting || fullName === user.fullName} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors disabled:bg-gray-medium disabled:cursor-not-allowed">
                            {isSubmitting ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminDashboardPage: React.FC = () => {
    const { user, sessionChecked, showToast } = useAppContext();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [organizer, setOrganizer] = useState('');
    const [category, setCategory] = useState('Music');
    const [price, setPrice] = useState('');
    const [capacity, setCapacity] = useState('');
    const [tags, setTags] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (sessionChecked && (!user || !user.isAdmin)) {
            navigate('/');
        }
    }, [user, sessionChecked, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const newEventData = {
            title, description, date, location, category, organizer, 
            price: parseFloat(price),
            imageUrl: imageUrl || `https://picsum.photos/seed/${encodeURIComponent(title)}/1600/900`,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            capacity: capacity ? parseInt(capacity, 10) : undefined,
        };
        const createdEvent = await api.createEvent(newEventData as any);
        setIsSubmitting(false);
        if (createdEvent) {
            showToast('Event created successfully!');
            navigate(`/event/${createdEvent.id}`);
        } else {
            showToast('Failed to create event.', 'error');
        }
    };
    
    if (!user || !sessionChecked) return <div className="h-[80vh]"><Spinner/></div>;

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-4xl font-extrabold text-white mb-8">Admin Dashboard</h1>
            <div className="bg-gray-dark p-8 rounded-lg max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6 -mt-2">Create New Event</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Event Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Organizer</label>
                            <input type="text" value={organizer} onChange={e => setOrganizer(e.target.value)} required className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-light mb-2">Description</label>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-light mb-2">Image URL <span className="text-xs text-gray-medium">(optional)</span></label>
                        <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Category</label>
                            <input type="text" value={category} onChange={e => setCategory(e.target.value)} required placeholder="e.g., Music, Tech, Art" className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Tags <span className="text-xs text-gray-medium">(comma-separated)</span></label>
                            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., live-music, rock" className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Price ($)</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" placeholder="e.g., 75.00" className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-light mb-2">Capacity <span className="text-xs text-gray-medium">(optional)</span></label>
                            <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} min="0" step="1" placeholder="e.g., 500" className="w-full bg-dark border border-gray-medium rounded-md p-3 text-white focus:ring-2 focus:ring-primary"/>
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-md transition-colors disabled:bg-gray-medium !mt-8">
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const NotFoundPage: React.FC = () => (
    <div className="text-center py-20">
        <h1 className="text-6xl font-extrabold text-white">404</h1>
        <p className="text-2xl text-gray-light mt-4">Page Not Found</p>
        <Link to="/" className="mt-8 inline-block bg-primary hover:bg-primary-focus text-white font-bold py-3 px-6 rounded-md transition-colors">
            Go Home
        </Link>
    </div>
);

const ShareableTicketPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const [ticketData, setTicketData] = useState<{ ticket: Ticket; event: Event } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (ticketId) {
            api.fetchTicketById(ticketId).then(data => {
                setTicketData(data);
                setLoading(false);
            });
        }
    }, [ticketId]);

    if (loading) return <div className="bg-dark h-screen"><Spinner /></div>;
    if (!ticketData) return <NotFoundPage />;

    const { ticket, event } = ticketData;

    return (
        <div className="bg-dark min-h-screen flex items-center justify-center py-12 px-4">
            <div className="max-w-2xl w-full space-y-8 bg-gray-dark rounded-2xl shadow-2xl p-8 md:p-10 animate-fade-in">
                <div className="text-center">
                    <p className="text-primary font-bold">{event.category}</p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2">{event.title}</h1>
                    <p className="text-gray-light mt-2">Present this QR code at the event for entry.</p>
                </div>
                
                <div className="bg-dark p-6 rounded-lg flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <CalendarIcon className="w-6 h-6 text-primary flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-white">Date and Time</h3>
                                <p className="text-gray-light">{new Date(event.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <MapPinIcon className="w-6 h-6 text-primary flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-white">Location</h3>
                                <p className="text-gray-light">{event.location}</p>
                            </div>
                        </div>
                    </div>
                     <div className="flex flex-col items-center">
                         <div className="bg-white p-3 rounded-lg">
                            <QRCodeCanvas value={`${window.location.origin}${window.location.pathname}#/ticket/${ticket.id}`} size={160} />
                         </div>
                         <p className="text-xs text-gray-medium mt-2 break-all w-40 text-center">{ticket.id}</p>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-medium">
                    <p>Ticket issued to: <strong>{ticket.ownerEmail}</strong></p>
                    <p className="mt-2">Powered by TopCityTickets</p>
                </div>
            </div>
        </div>
    );
};

const AppLayout: React.FC = () => {
    const { sessionChecked } = useAppContext();
    if (!sessionChecked) {
        return <div className="bg-dark h-screen"><Spinner /></div>;
    }
    return (
        <>
            <Header />
            <main className="flex-grow">
                 <Outlet />
            </main>
        </>
    );
}


const App: React.FC = () => {
  return (
    <HashRouter>
      <AppProvider>
        <div className="min-h-screen text-white flex flex-col">
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<EventsPage />} />
              <Route path="/event/:id" element={<EventDetailPage />} />
              <Route path="/my-tickets" element={<MyTicketsPage />} />
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/ticket/:ticketId" element={<ShareableTicketPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </div>
      </AppProvider>
    </HashRouter>
  );
};

export default App;