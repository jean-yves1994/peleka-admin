'use client';
import { useEffect, useState } from 'react';
import { User, Lock, Save, Sun, Moon, Palette } from 'lucide-react';
import TopBar from '@/components/TopBar';
import { api, saveUser } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';

export default function ProfilePage() {
  const [tab, setTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', avatar_url: '' });
  const [saving, setSaving] = useState(false); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [pwSaving, setPwSaving] = useState(false); const [pwMsg, setPwMsg] = useState(''); const [pwErr, setPwErr] = useState('');
  const { theme, setTheme } = useTheme();

  const load = async () => {
    const r = await api.get('/api/me');
    setUser(r.data.user);
    setForm({ full_name: r.data.user.full_name || '', phone: r.data.user.phone || '', avatar_url: r.data.user.avatar_url || '' });
  };
  useEffect(() => { load(); }, []);

  const saveProfile = async (e) => {
    e.preventDefault(); setMsg(''); setErr(''); setSaving(true);
    try {
      const body = { full_name: form.full_name };
      if (form.phone) body.phone = form.phone;
      if (form.avatar_url) body.avatar_url = form.avatar_url;
      const r = await api.patch('/api/me', body);
      setUser(r.data.user); saveUser(r.data.user);
      setMsg('Profile updated successfully.');
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };
  const changePw = async (e) => {
    e.preventDefault(); setPwMsg(''); setPwErr(''); setPwSaving(true);
    try {
      await api.post('/api/me/password', pwForm);
      setPwForm({ current_password: '', new_password: '' });
      setPwMsg('Password updated. Other devices have been signed out.');
    } catch (e) { setPwErr(e.message); }
    finally { setPwSaving(false); }
  };
  const initials = (user?.full_name || 'A').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <TopBar title="Profile & settings" subtitle="Update your account, appearance and password." />
      <div className="px-8 py-6 max-w-3xl space-y-4">
        <div className="flex gap-2 border-b border-ink-100 dark:border-ink-800">
          {[
            { key: 'profile',  label: 'Profile',    icon: User },
            { key: 'appearance', label: 'Appearance', icon: Palette },
            { key: 'password', label: 'Password',   icon: Lock },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-ink-500 dark:text-ink-400'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="card p-6 space-y-5">
            <div className="flex items-center gap-4">
              {form.avatar_url
                ? <img src={form.avatar_url} alt="avatar" className="w-20 h-20 rounded-2xl object-cover" />
                : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 text-white text-xl font-semibold grid place-items-center">{initials}</div>}
              <div>
                <div className="font-semibold">{user?.full_name}</div>
                <div className="text-sm text-ink-500 dark:text-ink-400">{user?.email}</div>
                <div className="text-xs text-ink-400 mt-1 capitalize">{user?.role}</div>
              </div>
            </div>
            {msg && <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-lg">{msg}</div>}
            {err && <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm rounded-lg">{err}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="label">Full name</label>
                <input required className="input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
              <div><label className="label">Email</label>
                <input className="input" value={user?.email || ''} disabled /></div>
              <div><label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+2507..." /></div>
              <div className="col-span-2"><label className="label">Avatar URL</label>
                <input type="url" className="input" value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} placeholder="https://..." /></div>
            </div>
            <div className="flex justify-end">
              <button disabled={saving} className="btn btn-primary"><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        )}

        {tab === 'appearance' && (
          <div className="card p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Theme</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400">Choose how the dashboard looks. Your choice is saved on this device.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button type="button" onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border-2 text-left transition ${theme === 'light' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-ink-200 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-800'}`}>
                <div className="flex items-center gap-2 font-medium"><Sun className="w-4 h-4 text-amber-500" /> Light</div>
                <div className="mt-3 h-16 rounded-lg bg-white border border-ink-200 flex">
                  <div className="w-1/3 bg-ink-50 border-r border-ink-200"></div>
                  <div className="flex-1 p-2"><div className="w-1/2 h-2 bg-brand-500 rounded" /><div className="mt-1 w-3/4 h-1.5 bg-ink-200 rounded" /></div>
                </div>
              </button>
              <button type="button" onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border-2 text-left transition ${theme === 'dark' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-ink-200 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-800'}`}>
                <div className="flex items-center gap-2 font-medium"><Moon className="w-4 h-4 text-brand-500" /> Dark</div>
                <div className="mt-3 h-16 rounded-lg bg-ink-900 border border-ink-800 flex">
                  <div className="w-1/3 bg-ink-950 border-r border-ink-800"></div>
                  <div className="flex-1 p-2"><div className="w-1/2 h-2 bg-brand-400 rounded" /><div className="mt-1 w-3/4 h-1.5 bg-ink-700 rounded" /></div>
                </div>
              </button>
            </div>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Tip: you can also toggle the theme any time using the sun/moon button in the top bar.
            </p>
          </div>
        )}

        {tab === 'password' && (
          <form onSubmit={changePw} className="card p-6 space-y-5">
            {pwMsg && <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-lg">{pwMsg}</div>}
            {pwErr && <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm rounded-lg">{pwErr}</div>}
            <div><label className="label">Current password *</label>
              <input required type="password" className="input" value={pwForm.current_password} onChange={e => setPwForm({...pwForm, current_password: e.target.value})} /></div>
            <div><label className="label">New password *</label>
              <input required type="password" className="input" value={pwForm.new_password} onChange={e => setPwForm({...pwForm, new_password: e.target.value})} />
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">Minimum 8 characters, must include a letter and a number.</p></div>
            <div className="flex justify-end">
              <button disabled={pwSaving} className="btn btn-primary"><Save className="w-4 h-4" /> {pwSaving ? 'Saving…' : 'Change password'}</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
