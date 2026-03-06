import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, LogOut, LayoutDashboard, CalendarDays, Link2, Users,
  Settings, Plus, Trash2, Pencil, ToggleLeft, ToggleRight, X, Check,
  AlertCircle, ChevronRight, Eye, EyeOff, ExternalLink, Clock, MapPin,
  Upload, Image as ImageIcon, Save, ArrowLeft, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Event, AdminLink, AdminSettings, EventRegistration } from '../../types';
import {
  fetchEvents as sbFetchEvents,
  fetchLinks as sbFetchLinks,
  fetchRegistrations as sbFetchRegistrations,
  fetchSettings as sbFetchSettings,
  createEvent as sbCreateEvent,
  updateEvent as sbUpdateEvent,
  deleteEvent as sbDeleteEvent,
  createLink as sbCreateLink,
  updateLink as sbUpdateLink,
  deleteLink as sbDeleteLink,
  saveSettings as sbSaveSettings,
} from '../../lib/supabase';

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const DEFAULT_SETTINGS: AdminSettings = { eventsEnabled: false, linksEnabled: false };

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

type Section = 'dashboard' | 'events' | 'links' | 'leads' | 'settings';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}> = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      active
        ? 'bg-secondary-500 text-slate-900 shadow-md'
        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
    }`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
    )}
  </button>
);

// ─── Toggle Switch ────────────────────────────────────────────────────────────

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }> = ({
  checked, onChange, label, disabled,
}) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all ${
      disabled ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50' :
      checked
        ? 'border-green-500 bg-green-50 text-green-800'
        : 'border-slate-200 bg-slate-50 text-slate-500'
    }`}
  >
    {checked
      ? <ToggleRight size={24} className="text-green-600" />
      : <ToggleLeft size={24} className="text-slate-400" />}
    <span className="font-semibold text-sm">{label}</span>
    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${checked ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
      {checked ? 'ON' : 'OFF'}
    </span>
  </button>
);

// ─── Confirm dialog ───────────────────────────────────────────────────────────

const ConfirmDialog: React.FC<{
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
          <AlertCircle size={20} className="text-red-600" />
        </div>
        <p className="text-slate-800 font-semibold text-base">{message}</p>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition text-sm">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition text-sm">
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Event Form Modal ─────────────────────────────────────────────────────────

const EventFormModal: React.FC<{
  initial?: Event;
  onSave: (ev: Event) => void;
  onClose: () => void;
}> = ({ initial, onSave, onClose }) => {
  const [heading, setHeading]         = useState(initial?.heading ?? '');
  const [title, setTitle]             = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [imageUrl, setImageUrl]       = useState(initial?.imageUrl ?? '');
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl ?? '');
  const [eventDate, setEventDate]     = useState(initial?.eventDate ?? '');
  const [location, setLocation]       = useState(initial?.location ?? '');
  const [errors, setErrors]           = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors(['Image file must be under 2 MB. Use a URL for larger images.']);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImageUrl(dataUrl);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (val: string) => {
    setImageUrl(val);
    setImagePreview(val);
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!heading.trim()) errs.push('Heading is required.');
    if (!title.trim()) errs.push('Title is required.');
    if (!description.trim()) errs.push('Description is required.');
    if (!eventDate) errs.push('Event date & time is required.');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: initial?.id ?? uid(),
      heading: heading.trim(),
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      eventDate,
      location: location.trim(),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in my-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{initial ? 'Edit Event' : 'Add New Event'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X size={22} /></button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Event Image</label>
            <div className="flex gap-3 items-start flex-wrap">
              {imagePreview && (
                <img src={imagePreview} alt="Preview"
                  className="w-32 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                  onError={() => setImagePreview('')} />
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-xl text-sm text-slate-600 hover:border-primary-400 hover:text-primary-600 transition">
                    <Upload size={14} /> Upload file
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  <span className="text-slate-400 text-sm self-center">or</span>
                  <input type="url"
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="Paste image URL"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
                </div>
                <p className="text-xs text-slate-400">Max 2 MB for file uploads. Supports JPG, PNG, WebP.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Heading <span className="text-red-500">*</span></label>
            <input type="text" value={heading} onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Upcoming Seminar"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. IUL Retirement Planning Workshop"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description <span className="text-red-500">*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              placeholder="Tell visitors what to expect at this event…"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition resize-none" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Event Date & Time <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location (optional)</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Atlanta, GA or Virtual"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1">
              {errors.map((e) => (
                <p key={e} className="text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" /> {e}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition text-sm">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2">
            <Save size={15} /> {initial ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Link Form Modal ──────────────────────────────────────────────────────────

const LinkFormModal: React.FC<{
  initial?: AdminLink;
  onSave: (link: AdminLink) => void;
  onClose: () => void;
}> = ({ initial, onSave, onClose }) => {
  const [label, setLabel]           = useState(initial?.label ?? '');
  const [url, setUrl]               = useState(initial?.url ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [errors, setErrors]         = useState<string[]>([]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!label.trim()) errs.push('Label is required.');
    if (!url.trim()) errs.push('URL is required.');
    else if (!/^https?:\/\//i.test(url.trim())) errs.push('URL must start with http:// or https://');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: initial?.id ?? uid(),
      label: label.trim(),
      url: url.trim(),
      description: description.trim(),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{initial ? 'Edit Link' : 'Add New Link'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X size={22} /></button>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Link Label <span className="text-red-500">*</span></label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Medicare.gov"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">URL <span className="text-red-500">*</span></label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Short Description (optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of the linked resource"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1">
              {errors.map((e) => (
                <p key={e} className="text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" /> {e}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition text-sm">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2">
            <Save size={15} /> {initial ? 'Save Changes' : 'Add Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard Section ────────────────────────────────────────────────────────

type DbStatus = { connected: boolean; all_ready: boolean; error?: string } | null;

const DbStatusBanner: React.FC<{ dbStatus: DbStatus; onRecheck: () => void }> = ({ dbStatus, onRecheck }) => {
  if (dbStatus === null) {
    return (
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-500">
        <RefreshCw size={16} className="animate-spin shrink-0" />
        Checking database connection…
      </div>
    );
  }
  if (!dbStatus.connected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm">
        <div className="flex items-center gap-2 font-bold text-red-700 mb-1">
          <AlertCircle size={16} className="shrink-0" /> Database Not Connected
        </div>
        <p className="text-red-600 mb-2">
          PHP cannot reach the MySQL database. Events will not save or load across browsers until this is fixed.
        </p>
        {dbStatus.error && (
          <p className="font-mono text-xs bg-red-100 text-red-700 rounded px-3 py-2 mb-3 break-all">{dbStatus.error}</p>
        )}
        <p className="text-red-600 text-xs mb-3">
          <strong>Check:</strong> Hostinger → Databases → make sure the database, username, and password in <code>api/config.php</code> exactly match what Hostinger shows.
        </p>
        <button onClick={onRecheck} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition">
          <RefreshCw size={12} /> Recheck Connection
        </button>
      </div>
    );
  }
  if (!dbStatus.all_ready) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm">
        <div className="flex items-center gap-2 font-bold text-amber-700 mb-1">
          <AlertCircle size={16} className="shrink-0" /> Database Connected — Setting Up Tables
        </div>
        <p className="text-amber-700 mb-3">
          Connected to MySQL successfully. The required tables are being created automatically on the next API call — refresh the page in a moment.
        </p>
        <button onClick={onRecheck} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition">
          <RefreshCw size={12} /> Recheck
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-sm text-green-800 font-semibold">
      <Check size={16} className="text-green-600 shrink-0" />
      Database connected — all tables ready. Events persist across all browsers.
    </div>
  );
};

const DashboardSection: React.FC<{
  settings: AdminSettings;
  savingSettings: boolean;
  onSettingsChange: (s: AdminSettings) => void;
  events: Event[];
  links: AdminLink[];
  registrations: EventRegistration[];
  dbStatus: DbStatus;
  onDbRecheck: () => void;
}> = ({ settings, savingSettings, onSettingsChange, events, links, registrations, dbStatus, onDbRecheck }) => {
  const stats = [
    { label: 'Total Events',  value: events.length,        icon: <CalendarDays size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Links',  value: links.length,         icon: <Link2 size={20} />,        color: 'bg-secondary-50 text-secondary-600' },
    { label: 'Event Leads',   value: registrations.length, icon: <Users size={20} />,        color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h2>
        <p className="text-slate-500 text-sm">Overview and feature toggles for your website.</p>
      </div>

      <DbStatusBanner dbStatus={dbStatus} onRecheck={onDbRecheck} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-3xl font-black text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900">Feature Toggles</h3>
          {savingSettings && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <RefreshCw size={12} className="animate-spin" /> Saving…
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm mb-5">Enable or disable sections visible on your homepage.</p>
        <div className="space-y-3">
          <Toggle
            checked={settings.eventsEnabled}
            onChange={(v) => onSettingsChange({ ...settings, eventsEnabled: v })}
            label="Events Section — display upcoming events on the homepage"
            disabled={savingSettings}
          />
          <Toggle
            checked={settings.linksEnabled}
            onChange={(v) => onSettingsChange({ ...settings, linksEnabled: v })}
            label="Links Section — display curated resource links above the footer"
            disabled={savingSettings}
          />
        </div>
      </div>

    </div>
  );
};

// ─── Events Manager ───────────────────────────────────────────────────────────

const EventsManagerSection: React.FC<{
  events: Event[];
  loading: boolean;
  onRefresh: () => void;
  onAdd: (ev: Event) => Promise<void>;
  onEdit: (ev: Event) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}> = ({ events, loading, onRefresh, onAdd, onEdit, onDelete }) => {
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<Event | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  const handleSave = async (ev: Event) => {
    setSaving(true);
    try {
      if (editing) { await onEdit(ev); } else { await onAdd(ev); }
      setShowForm(false);
      setEditing(undefined);
    } catch (err: any) {
      alert('Error saving event: ' + err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await onDelete(id); } catch (err: any) { alert('Error: ' + err.message); }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Events</h2>
          <p className="text-slate-500 text-sm">Create and manage upcoming events shown on the homepage.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition" title="Refresh">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm">
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <RefreshCw size={28} className="mx-auto animate-spin mb-3" />
          <p className="text-sm">Loading events…</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <CalendarDays size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No events yet.</p>
          <p className="text-slate-400 text-sm mt-1">Click "Add Event" to create your first event.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-4 items-start">
              {ev.imageUrl ? (
                <img src={ev.imageUrl} alt={ev.title}
                  className="w-20 h-16 object-cover rounded-xl shrink-0 border border-slate-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-20 h-16 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center">
                  <ImageIcon size={24} className="text-slate-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-secondary-600 mb-0.5">{ev.heading}</p>
                <h3 className="font-bold text-slate-900 text-base leading-tight">{ev.title}</h3>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{ev.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(ev.eventDate)}</span>
                  {ev.location && <span className="flex items-center gap-1"><MapPin size={12} /> {ev.location}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditing(ev); setShowForm(true); }}
                  className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setDeleteTarget(ev.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <EventFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message="Are you sure you want to delete this event? This cannot be undone."
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

// ─── Links Manager ────────────────────────────────────────────────────────────

const LinksManagerSection: React.FC<{
  links: AdminLink[];
  loading: boolean;
  onRefresh: () => void;
  onAdd: (link: AdminLink) => Promise<void>;
  onEdit: (link: AdminLink) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}> = ({ links, loading, onRefresh, onAdd, onEdit, onDelete }) => {
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<AdminLink | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleSave = async (link: AdminLink) => {
    try {
      if (editing) { await onEdit(link); } else { await onAdd(link); }
      setShowForm(false);
      setEditing(undefined);
    } catch (err: any) { alert('Error saving link: ' + err.message); }
  };

  const handleDelete = async (id: string) => {
    try { await onDelete(id); } catch (err: any) { alert('Error: ' + err.message); }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Links</h2>
          <p className="text-slate-500 text-sm">Add resource links that appear above the footer on the homepage.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition" title="Refresh">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm">
            <Plus size={16} /> Add Link
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <RefreshCw size={28} className="mx-auto animate-spin mb-3" />
          <p className="text-sm">Loading links…</p>
        </div>
      ) : links.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Link2 size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No links yet.</p>
          <p className="text-slate-400 text-sm mt-1">Click "Add Link" to add your first resource link.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {links.map((link) => (
            <div key={link.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                <ExternalLink size={18} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{link.label}</p>
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  className="text-primary-600 text-xs hover:underline truncate block">{link.url}</a>
                {link.description && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{link.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditing(link); setShowForm(true); }}
                  className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteTarget(link.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <LinkFormModal initial={editing} onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(undefined); }} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message="Are you sure you want to delete this link?"
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

// ─── Leads Section ────────────────────────────────────────────────────────────

const LeadsSection: React.FC<{
  registrations: EventRegistration[];
  loading: boolean;
  onRefresh: () => void;
}> = ({ registrations, loading, onRefresh }) => {
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Event Leads</h2>
          <p className="text-slate-500 text-sm">Visitor registrations submitted through event signup forms.</p>
        </div>
        <button onClick={onRefresh} className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition" title="Refresh">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <RefreshCw size={28} className="mx-auto animate-spin mb-3" />
          <p className="text-sm">Loading registrations…</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Users size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No registrations yet.</p>
          <p className="text-slate-400 text-sm mt-1">Event registrations will appear here once visitors sign up.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Name', 'Email', 'Phone', 'Event', 'Registered'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-medium text-slate-900">{reg.firstName} {reg.lastName}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {reg.email
                        ? <a href={`mailto:${reg.email}`} className="hover:text-primary-600 transition">{reg.email}</a>
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{reg.phone || '—'}</td>
                    <td className="px-5 py-4 text-slate-600 max-w-[180px] truncate">{reg.eventTitle}</td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">{formatDate(reg.registeredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Settings Section ─────────────────────────────────────────────────────────

const SettingsSection: React.FC = () => {
  const { changePassword } = useAuth();
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [show, setShow]             = useState(false);
  const [msg, setMsg]               = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (newPw.length < 8) { setMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return; }
    if (newPw !== confirmPw) { setMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
    const ok = changePassword(currentPw, newPw);
    if (ok) {
      setMsg({ type: 'success', text: 'Password changed for this session. Update the code for permanent changes.' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } else {
      setMsg({ type: 'error', text: 'Current password is incorrect.' });
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Settings</h2>
        <p className="text-slate-500 text-sm">Manage your admin account credentials.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(['Current Password', 'New Password', 'Confirm New Password'] as const).map((lbl, i) => {
            const val = [currentPw, newPw, confirmPw][i];
            const setter = [setCurrentPw, setNewPw, setConfirmPw][i];
            return (
              <div key={lbl}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{lbl}</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={val}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                    required />
                  {i === 0 && (
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition" tabIndex={-1}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {msg && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
              {msg.text}
            </div>
          )}

          <button type="submit" className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main AdminDashboard ──────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection]         = useState<Section>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data from API
  const [settings,      setSettings]      = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [events,        setEvents]        = useState<Event[]>([]);
  const [links,         setLinks]         = useState<AdminLink[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  // Loading flags
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingEvents,   setLoadingEvents]   = useState(true);
  const [loadingLinks,    setLoadingLinks]     = useState(true);
  const [loadingLeads,    setLoadingLeads]     = useState(true);
  const [savingSettings,  setSavingSettings]   = useState(false);

  // DB status
  const [dbStatus, setDbStatus] = useState<DbStatus>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/admin/login', { replace: true }); return; }
    fetchAll();
    checkDbStatus();
  }, [isAuthenticated]);

  const checkDbStatus = async () => {
    // Supabase is always connected — verify by fetching settings
    try {
      await sbFetchSettings();
      setDbStatus({ connected: true, all_ready: true });
    } catch (e: any) {
      setDbStatus({ connected: false, all_ready: false, error: e.message });
    }
  };

  const fetchAll = () => {
    fetchSettings();
    fetchEvents();
    fetchLinks();
    fetchLeads();
  };

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try { setSettings(await sbFetchSettings()); } catch { /* keep defaults */ }
    finally { setLoadingSettings(false); }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try { setEvents(await sbFetchEvents()); } catch { setEvents([]); }
    finally { setLoadingEvents(false); }
  };

  const fetchLinks = async () => {
    setLoadingLinks(true);
    try { setLinks(await sbFetchLinks()); } catch { setLinks([]); }
    finally { setLoadingLinks(false); }
  };

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try { setRegistrations(await sbFetchRegistrations()); } catch { setRegistrations([]); }
    finally { setLoadingLeads(false); }
  };

  // Settings toggle
  const handleSettingsChange = async (s: AdminSettings) => {
    setSettings(s);
    setSavingSettings(true);
    try { await sbSaveSettings(s); }
    catch (err: any) { alert('Failed to save settings: ' + err.message); }
    finally { setSavingSettings(false); }
  };

  // Events CRUD
  const addEvent = async (ev: Event) => {
    await sbCreateEvent(ev);
    await fetchEvents();
  };
  const editEvent = async (ev: Event) => {
    await sbUpdateEvent(ev);
    await fetchEvents();
  };
  const deleteEvent = async (id: string) => {
    await sbDeleteEvent(id);
    await fetchEvents();
  };

  // Links CRUD
  const addLink = async (link: AdminLink) => {
    await sbCreateLink(link);
    await fetchLinks();
  };
  const editLink = async (link: AdminLink) => {
    await sbUpdateLink(link);
    await fetchLinks();
  };
  const deleteLink = async (id: string) => {
    await sbDeleteLink(id);
    await fetchLinks();
  };

  if (!isAuthenticated) return null;

  const navItems: { id: Section; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
    { id: 'events',    label: 'Events',     icon: <CalendarDays size={18} />,  badge: events.length },
    { id: 'links',     label: 'Links',      icon: <Link2 size={18} />,         badge: links.length },
    { id: 'leads',     label: 'Leads',      icon: <Users size={18} />,         badge: registrations.length },
    { id: 'settings',  label: 'Settings',   icon: <Settings size={18} /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="px-4 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="bg-secondary-500 p-2 rounded-lg shrink-0">
            <ShieldCheck className="h-5 w-5 text-slate-900" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">Cassandra Smith</p>
            <p className="text-slate-400 text-xs mt-0.5">Back Office</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.id} icon={item.icon} label={item.label}
            active={section === item.id}
            onClick={() => { setSection(item.id); setMobileMenuOpen(false); }}
            badge={item.badge} />
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-700/50">
        <button onClick={() => navigate('/', { replace: true })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition text-sm font-semibold mb-1">
          <ArrowLeft size={16} /> View Website
        </button>
        <button onClick={() => { logout(); navigate('/admin/login', { replace: true }); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition text-sm font-semibold">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 shrink-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-slate-900 h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-900 transition">
              <LayoutDashboard size={22} />
            </button>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="text-slate-400">Admin</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-slate-900 capitalize">{section}</span>
            </div>
          </div>
          <span className="hidden sm:flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-semibold">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            Logged in
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {section === 'dashboard' && (
            <DashboardSection
              settings={settings}
              savingSettings={savingSettings}
              onSettingsChange={handleSettingsChange}
              events={events}
              links={links}
              registrations={registrations}
              dbStatus={dbStatus}
              onDbRecheck={checkDbStatus}
            />
          )}
          {section === 'events' && (
            <EventsManagerSection
              events={events}
              loading={loadingEvents}
              onRefresh={fetchEvents}
              onAdd={addEvent}
              onEdit={editEvent}
              onDelete={deleteEvent}
            />
          )}
          {section === 'links' && (
            <LinksManagerSection
              links={links}
              loading={loadingLinks}
              onRefresh={fetchLinks}
              onAdd={addLink}
              onEdit={editLink}
              onDelete={deleteLink}
            />
          )}
          {section === 'leads' && (
            <LeadsSection
              registrations={registrations}
              loading={loadingLeads}
              onRefresh={fetchLeads}
            />
          )}
          {section === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
