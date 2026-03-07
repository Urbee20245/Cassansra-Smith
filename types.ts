import React from 'react';

export interface ServiceItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export enum PageRoute {
  HOME = '/',
  ABOUT = '/about',
  SERVICES = '/services',
  CONTACT = '/contact',
}

// --- Admin / Feature Types ---

export interface Event {
  id: string;
  heading: string;
  title: string;
  description: string;
  imageUrl: string;
  eventDate: string; // ISO date string e.g. "2025-08-15T18:00"
  location?: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message?: string;
  registeredAt: string;
  // Form lead fields (populated for contact form submissions)
  source?: string;        // 'event-registration' | 'secure-strategy-session' | 'future-consultation'
  topic?: string;         // insurance topic / interest
  timeline?: string;      // urgency selection
  priorityScore?: number; // 1–10 intent score
  futureDate?: string;    // preferred follow-up date for non-urgent leads
}

export interface AdminLink {
  id: string;
  label: string;
  url: string;
  description?: string;
  createdAt: string;
}

export interface AdminSettings {
  eventsEnabled: boolean;
  linksEnabled: boolean;
}

// localStorage keys (centralised to avoid typos)
export const LS_KEYS = {
  AUTH: 'cs_admin_auth',
  CREDENTIALS: 'cs_admin_credentials',
  SETTINGS: 'cs_admin_settings',
  EVENTS: 'cs_admin_events',
  LINKS: 'cs_admin_links',
  REGISTRATIONS: 'cs_admin_registrations',
} as const;
