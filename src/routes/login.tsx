import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Users, Stethoscope, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { LAULogo } from '@/components/brand/LAULogo';
import { Footer } from '@/components/layout/Footer';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user && profile) {
      navigate({ to: profile.role === 'doctor' ? '/doctor' : '/patient' });
    }
  }, [authLoading, user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSignupSuccess(false);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: err } = await signUp(email, password, fullName, selectedRole);
        if (err) {
          setError(err.message);
          return;
        }

        if (!data.session) {
          setSignupSuccess(true);
        }

        return;
      }

      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err.message);
        return;
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-lau-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lau-bg flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-lau-border h-[72px]">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-heading font-extrabold text-2xl text-primary">LAU</span>
            <div className="w-px h-6 bg-lau-border" />
            <span className="font-heading font-bold text-lg text-lau-anthracite">ReAdmit Guard</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <LAULogo size="lg" layout="stacked" variant="green" className="mx-auto mb-6" />
            <h1 className="font-heading text-2xl font-bold text-lau-anthracite">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-1">
              {mode === 'login' ? 'Sign in to continue' : 'Select your role and sign up'}
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => setSelectedRole('patient')}
              className={`rounded-2xl border-2 p-4 text-center transition-all ${selectedRole === 'patient' ? 'border-primary bg-lau-green-tint' : 'border-lau-border bg-card hover:border-primary/50'}`}>
              <Users className={`h-6 w-6 mx-auto mb-1 ${selectedRole === 'patient' ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.75} />
              <span className={`text-sm font-heading font-semibold ${selectedRole === 'patient' ? 'text-primary' : 'text-lau-anthracite'}`}>Patient</span>
            </button>
            <button type="button" onClick={() => setSelectedRole('doctor')}
              className={`rounded-2xl border-2 p-4 text-center transition-all ${selectedRole === 'doctor' ? 'border-primary bg-lau-green-tint' : 'border-lau-border bg-card hover:border-primary/50'}`}>
              <Stethoscope className={`h-6 w-6 mx-auto mb-1 ${selectedRole === 'doctor' ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.75} />
              <span className={`text-sm font-heading font-semibold ${selectedRole === 'doctor' ? 'text-primary' : 'text-lau-anthracite'}`}>Doctor</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-sm font-body text-lau-anthracite font-semibold mb-1.5 block">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                  placeholder="Sarah Chen"
                  className="w-full px-4 py-3 rounded-xl border border-lau-border bg-white text-sm font-body text-lau-anthracite focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              </div>
            )}
            <div>
              <label className="text-sm font-body text-lau-anthracite font-semibold mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-lau-anthracite/50" strokeWidth={1.75} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder={selectedRole === 'patient' ? 'sarah.chen@demo.lau' : 'dr.haddad@lau.edu.lb'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-lau-border bg-white text-sm font-body text-lau-anthracite focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              </div>
            </div>
            <div>
              <label className="text-sm font-body text-lau-anthracite font-semibold mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-lau-anthracite/50" strokeWidth={1.75} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-lau-border bg-white text-sm font-body text-lau-anthracite focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              </div>
            </div>

            {signupSuccess && <p className="text-sm text-primary font-body">Account created! Check your email to confirm, then sign in.</p>}
            {error && <p className="text-sm text-risk-high font-body">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-heading font-semibold hover:bg-lau-green-dark hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <p className="text-xs text-center text-muted-foreground font-body">
              {mode === 'login' ? (
                <>Don't have an account? <button type="button" onClick={() => setMode('signup')} className="text-primary hover:underline font-semibold">Sign Up</button></>
              ) : (
                <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-primary hover:underline font-semibold">Sign In</button></>
              )}
            </p>
          </form>

          <p className="text-xs text-center text-muted-foreground font-body mt-4">
            Demo: sarah.chen@demo.lau / dr.haddad@lau.edu.lb (password: demo-password)
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
