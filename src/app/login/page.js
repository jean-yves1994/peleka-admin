'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Lock, Mail } from 'lucide-react';
import { api, setTokens, saveUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@peleka.local');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const r = await api.post('/api/auth/login', { email, password });
      if (r.data.user.role !== 'admin' && r.data.user.role !== 'dispatcher') {
        throw new Error('This dashboard is for admin/dispatcher accounts only.');
      }
      setTokens(r.data);
      saveUser(r.data.user);
      router.replace('/dashboard');
    } catch (e) { setErr(e.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-ink-950">
      {/* Left visual */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 grid place-items-center backdrop-blur">
            <Truck className="w-6 h-6" />
          </div>
          <div className="text-xl font-semibold tracking-tight">Peleka</div>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-semibold leading-tight mb-4">
            Manage your Kigali courier operations from one dashboard.
          </h1>
          <p className="text-white/80 text-lg">
            Dispatch riders across Nyarugenge, Gasabo and Kicukiro, track deliveries in real time,
            configure pricing, handle exceptions, and grow revenue.
          </p>
        </div>
        <div className="text-sm text-white/70">© {new Date().getFullYear()} Peleka Courier · Kigali</div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-6 text-brand-600 dark:text-brand-400">
            <Truck className="w-6 h-6" />
            <div className="text-lg font-semibold">Peleka</div>
          </div>
          <h2 className="text-2xl font-semibold text-ink-900 dark:text-ink-100 mb-1">Welcome back</h2>
          <p className="text-ink-500 dark:text-ink-400 mb-8">Sign in to the admin dashboard.</p>

          <div className="mb-4">
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                     className="input pl-9" placeholder="you@peleka.rw" />
            </div>
          </div>
          <div className="mb-6">
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                     className="input pl-9" placeholder="••••••••" />
            </div>
          </div>

          {err && <div className="mb-4 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-sm">{err}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="mt-6 text-xs text-ink-500 dark:text-ink-400 text-center">
            Dashboard for <b>admin</b> & <b>dispatcher</b> accounts only.
          </div>
        </form>
      </div>
    </div>
  );
}
