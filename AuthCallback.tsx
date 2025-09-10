import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // The Supabase client handles the session from the URL hash automatically.
        // Once the user is signed in, we can redirect them.
        navigate('/');
      }
    });

    // It's good practice to unsubscribe from the listener when the component unmounts.
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h1>Authenticating...</h1>
      <p>Please wait, you will be redirected shortly.</p>
    </div>
  );
};

export default AuthCallback;
