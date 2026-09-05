import AuthCard from '../components/auth/AuthCard';

export default function Login() {
  return (
    <div className="hero-gradient relative min-h-screen overflow-hidden p-4 sm:p-6 md:p-8">
      <div className="pointer-events-none absolute left-10 top-12 h-48 w-48 rounded-full bg-brand-100/80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-12 h-56 w-56 rounded-full bg-secondary-100/80 blur-3xl" />

      <div className="relative z-10 flex min-h-[calc(100vh-2rem)] items-center justify-center">
        <div className="w-full max-w-xl py-6">
          <AuthCard initialMode="login" />
        </div>
      </div>
    </div>
  );
}
