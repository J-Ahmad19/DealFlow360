import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';

export default function PortalVerify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [error, setError] = useState('');
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing magic link token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await apiFetch('/portal/auth/verify', {
          method: 'POST',
          body: JSON.stringify({ token })
        });
        
        loginCustomer(res.contact);
        navigate('/portal/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to verify magic link. It may have expired.');
      }
    };

    verifyToken();
  }, [token, loginCustomer, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-display p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
        {error ? (
          <div>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Authentication Failed</h1>
            <p className="text-slate-500 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/portal/login')}
              className="btn-tactile btn-primary px-6 py-2.5 rounded-xl font-bold"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Verifying Link</h1>
            <p className="text-slate-500">Please wait while we log you in...</p>
          </div>
        )}
      </div>
    </div>
  );
}
