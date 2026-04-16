import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Shield, Users, Stethoscope, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const setRole = useStore((s) => s.setRole);
  const role = useStore((s) => s.role);
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor'>(role === 'patient' ? 'patient' : 'doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);
    navigate({ to: selectedRole === 'patient' ? '/patient' : '/doctor' });
  };

  return (
    <div className="min-h-screen bg-lau-bg flex flex-col">
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <Shield className="h-7 w-7" />
            <span className="font-heading text-lg font-bold">ReAdmit Guard</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Select your role and sign in</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('patient')}
              className={`rounded-xl border-2 p-4 text-center transition-all ${selectedRole === 'patient' ? 'border-primary bg-primary/5' : 'border-lau-border bg-card hover:border-primary/50'}`}
            >
              <Users className={`h-6 w-6 mx-auto mb-1 ${selectedRole === 'patient' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-heading font-semibold ${selectedRole === 'patient' ? 'text-primary' : 'text-foreground'}`}>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('doctor')}
              className={`rounded-xl border-2 p-4 text-center transition-all ${selectedRole === 'doctor' ? 'border-primary bg-primary/5' : 'border-lau-border bg-card hover:border-primary/50'}`}
            >
              <Stethoscope className={`h-6 w-6 mx-auto mb-1 ${selectedRole === 'doctor' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-heading font-semibold ${selectedRole === 'doctor' ? 'text-primary' : 'text-foreground'}`}>Doctor</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-lau-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-body text-foreground font-semibold mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'patient' ? 'sarah.chen@email.com' : 'dr.haddad@lau.edu.lb'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-body text-foreground font-semibold mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Any password works (demo)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-heading font-semibold hover:bg-lau-green-dark transition-colors"
            >
              Sign In as {selectedRole === 'patient' ? 'Patient' : 'Doctor'}
            </button>
            <p className="text-xs text-center text-muted-foreground font-body">
              Demo mode — any credentials will work
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
