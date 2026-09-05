import AuthCard from '../components/auth/AuthCard';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-display p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Decorative ambient background blur lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl py-6">
        <AuthCard initialMode="login" />
      </div>
    </div>
  );
}
