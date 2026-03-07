import { createClient } from '@supabase/supabase-js';
import type { Event, AdminLink, AdminSettings, EventRegistration } from '../types';

const SUPABASE_URL = 'https://nvgumhlewbqynrhlkqhx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Z3VtaGxld2JxeW5yaGxrcWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTQzNTcsImV4cCI6MjA4MzM5MDM1N30.OQb2wiXmof5xneC_HTorjnguBmfA19yghSluozTvmKU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Field-name mappers ───────────────────────────────────────────────────────

function rowToEvent(r: Record<string, unknown>): Event {
  return {
    id:          r.id          as string,
    heading:     r.heading     as string,
    title:       r.title       as string,
    description: r.description as string,
    imageUrl:    (r.image_url  as string) ?? '',
    eventDate:   r.event_date  as string,
    location:    (r.location   as string) ?? '',
    createdAt:   r.created_at  as string,
  };
}

function eventToRow(ev: Event) {
  return {
    id:          ev.id,
    heading:     ev.heading,
    title:       ev.title,
    description: ev.description,
    image_url:   ev.imageUrl,
    event_date:  ev.eventDate,
    location:    ev.location ?? '',
    created_at:  ev.createdAt,
  };
}

function rowToLink(r: Record<string, unknown>): AdminLink {
  return {
    id:          r.id          as string,
    label:       r.label       as string,
    url:         r.url         as string,
    description: (r.description as string) ?? '',
    createdAt:   r.created_at  as string,
  };
}

function linkToRow(l: AdminLink) {
  return {
    id:          l.id,
    label:       l.label,
    url:         l.url,
    description: l.description ?? '',
    created_at:  l.createdAt,
  };
}

function rowToRegistration(r: Record<string, unknown>): EventRegistration {
  return {
    id:            r.id            as string,
    eventId:       (r.event_id     as string) ?? '',
    eventTitle:    (r.event_title  as string) ?? '',
    firstName:     r.first_name    as string,
    lastName:      r.last_name     as string,
    email:         (r.email        as string) ?? '',
    phone:         (r.phone        as string) ?? '',
    message:       (r.message      as string) ?? '',
    registeredAt:  (r.registered_at as string) ?? (r.created_at as string) ?? '',
    source:        (r.source        as string) ?? undefined,
    topic:         (r.topic         as string) ?? undefined,
    timeline:      (r.timeline      as string) ?? undefined,
    priorityScore: r.priority_score != null ? Number(r.priority_score) : undefined,
    futureDate:    (r.future_date   as string) ?? undefined,
  };
}

function registrationToRow(reg: EventRegistration) {
  return {
    id:            reg.id,
    event_id:      reg.eventId,
    event_title:   reg.eventTitle,
    first_name:    reg.firstName,
    last_name:     reg.lastName,
    email:         reg.email,
    phone:         reg.phone,
    message:       reg.message ?? '',
    registered_at: reg.registeredAt,
  };
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('cs_events')
    .select('*')
    .order('event_date', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToEvent);
}

export async function createEvent(ev: Event): Promise<void> {
  const { error } = await supabase.from('cs_events').insert(eventToRow(ev));
  if (error) throw new Error(error.message);
}

export async function updateEvent(ev: Event): Promise<void> {
  const { error } = await supabase.from('cs_events').update(eventToRow(ev)).eq('id', ev.id);
  if (error) throw new Error(error.message);
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('cs_events').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Links ───────────────────────────────────────────────────────────────────

export async function fetchLinks(): Promise<AdminLink[]> {
  const { data, error } = await supabase
    .from('cs_links')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToLink);
}

export async function createLink(l: AdminLink): Promise<void> {
  const { error } = await supabase.from('cs_links').insert(linkToRow(l));
  if (error) throw new Error(error.message);
}

export async function updateLink(l: AdminLink): Promise<void> {
  const { error } = await supabase.from('cs_links').update(linkToRow(l)).eq('id', l.id);
  if (error) throw new Error(error.message);
}

export async function deleteLink(id: string): Promise<void> {
  const { error } = await supabase.from('cs_links').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Registrations ───────────────────────────────────────────────────────────

export async function fetchRegistrations(): Promise<EventRegistration[]> {
  const { data, error } = await supabase
    .from('cs_registrations')
    .select('*')
    .order('registered_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToRegistration);
}

export async function createRegistration(reg: EventRegistration): Promise<void> {
  const { error } = await supabase.from('cs_registrations').insert(registrationToRow(reg));
  if (error) throw new Error(error.message);
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<AdminSettings> {
  const { data, error } = await supabase.from('cs_admin_settings').select('*');
  if (error) throw new Error(error.message);
  const settings: AdminSettings = { eventsEnabled: false, linksEnabled: false };
  for (const row of data ?? []) {
    if (row.setting_key === 'eventsEnabled') settings.eventsEnabled = row.setting_value === '1';
    if (row.setting_key === 'linksEnabled')  settings.linksEnabled  = row.setting_value === '1';
  }
  return settings;
}

export async function saveSettings(s: AdminSettings): Promise<void> {
  const upserts = [
    { setting_key: 'eventsEnabled', setting_value: s.eventsEnabled ? '1' : '0' },
    { setting_key: 'linksEnabled',  setting_value: s.linksEnabled  ? '1' : '0' },
  ];
  const { error } = await supabase.from('cs_admin_settings').upsert(upserts, { onConflict: 'setting_key' });
  if (error) throw new Error(error.message);
}

// ─── Lead submission (Edge Function) ─────────────────────────────────────────

export const SUBMIT_LEAD_URL = `${SUPABASE_URL}/functions/v1/cassandra-submit-lead`;
