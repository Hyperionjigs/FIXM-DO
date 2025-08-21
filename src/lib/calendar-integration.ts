import { Appointment, AppointmentStatus } from '@/types';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  organizer?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  externalId?: string;
  calendarProvider: 'google' | 'outlook' | 'apple' | 'fixmo';
}

export interface CalendarProvider {
  name: string;
  id: string;
  isConnected: boolean;
  email?: string;
  lastSync?: Date;
  syncEnabled: boolean;
}

export interface CalendarSyncOptions {
  syncDirection: 'bidirectional' | 'import' | 'export';
  syncPastDays: number;
  syncFutureDays: number;
  includeCancelled: boolean;
  autoSync: boolean;
}

export class CalendarIntegrationService {
  private static instance: CalendarIntegrationService;
  private providers: Map<string, CalendarProvider> = new Map();
  private syncOptions: CalendarSyncOptions = {
    syncDirection: 'bidirectional',
    syncPastDays: 7,
    syncFutureDays: 90,
    includeCancelled: false,
    autoSync: true
  };

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): CalendarIntegrationService {
    if (!CalendarIntegrationService.instance) {
      CalendarIntegrationService.instance = new CalendarIntegrationService();
    }
    return CalendarIntegrationService.instance;
  }

  private initializeProviders() {
    // Initialize with default providers
    this.providers.set('google', {
      name: 'Google Calendar',
      id: 'google',
      isConnected: false,
      syncEnabled: true
    });

    this.providers.set('outlook', {
      name: 'Outlook Calendar',
      id: 'outlook',
      isConnected: false,
      syncEnabled: true
    });

    this.providers.set('apple', {
      name: 'Apple Calendar',
      id: 'apple',
      isConnected: false,
      syncEnabled: true
    });
  }

  // Google Calendar Integration
  async connectGoogleCalendar(): Promise<boolean> {
    try {
      // Check if Google Calendar API is available
      if (typeof gapi === 'undefined') {
        throw new Error('Google Calendar API not loaded');
      }

      // Initialize Google API
      await gapi.load('client:auth2', async () => {
        await gapi.client.init({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar'
        });

        // Check if user is signed in
        if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
          await gapi.auth2.getAuthInstance().signIn();
        }
      });

      const provider = this.providers.get('google');
      if (provider) {
        provider.isConnected = true;
        provider.email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
        provider.lastSync = new Date();
      }

      return true;
    } catch (error) {
      console.error('Failed to connect to Google Calendar:', error);
      return false;
    }
  }

  async syncGoogleCalendar(appointments: Appointment[]): Promise<CalendarEvent[]> {
    try {
      if (!gapi.client.calendar) {
        throw new Error('Google Calendar API not initialized');
      }

      const events: CalendarEvent[] = [];

      // Get events from Google Calendar
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date(Date.now() - this.syncOptions.syncPastDays * 24 * 60 * 60 * 1000).toISOString(),
        timeMax: new Date(Date.now() + this.syncOptions.syncFutureDays * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      // Convert Google events to CalendarEvent format
      for (const event of response.result.items || []) {
        events.push({
          id: event.id || '',
          title: event.summary || '',
          description: event.description || '',
          startTime: new Date(event.start?.dateTime || event.start?.date || ''),
          endTime: new Date(event.end?.dateTime || event.end?.date || ''),
          location: event.location || '',
          attendees: event.attendees?.map(a => a.email || '') || [],
          organizer: event.organizer?.email || '',
          status: event.status as 'confirmed' | 'tentative' | 'cancelled',
          externalId: event.id || undefined,
          calendarProvider: 'google'
        });
      }

      // Update provider sync time
      const provider = this.providers.get('google');
      if (provider) {
        provider.lastSync = new Date();
      }

      return events;
    } catch (error) {
      console.error('Failed to sync Google Calendar:', error);
      throw error;
    }
  }

  async createGoogleCalendarEvent(appointment: Appointment): Promise<string> {
    try {
      if (!gapi.client.calendar) {
        throw new Error('Google Calendar API not initialized');
      }

      const event = {
        summary: appointment.title,
        description: appointment.description || '',
        location: appointment.location,
        start: {
          dateTime: appointment.startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: appointment.endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: [
          { email: appointment.clientEmail || '' },
          { email: appointment.taskerEmail || '' }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      };

      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return response.result.id || '';
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      throw error;
    }
  }

  // Outlook Calendar Integration
  async connectOutlookCalendar(): Promise<boolean> {
    try {
      // Check if Microsoft Graph API is available
      if (typeof microsoft !== 'undefined') {
        // Initialize Microsoft Graph API
        await microsoft.accounts.initialize({
          clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
          redirectUri: window.location.origin
        });

        // Request calendar permissions
        const scopes = ['Calendars.ReadWrite'];
        await microsoft.accounts.login({ scopes });

        const provider = this.providers.get('outlook');
        if (provider) {
          provider.isConnected = true;
          provider.lastSync = new Date();
        }

        return true;
      } else {
        throw new Error('Microsoft Graph API not loaded');
      }
    } catch (error) {
      console.error('Failed to connect to Outlook Calendar:', error);
      return false;
    }
  }

  async syncOutlookCalendar(appointments: Appointment[]): Promise<CalendarEvent[]> {
    try {
      // Implementation for Outlook Calendar sync
      // This would use Microsoft Graph API to fetch calendar events
      console.log('Outlook Calendar sync not yet implemented');
      return [];
    } catch (error) {
      console.error('Failed to sync Outlook Calendar:', error);
      throw error;
    }
  }

  // Universal Calendar Operations
  async syncAllCalendars(appointments: Appointment[]): Promise<CalendarEvent[]> {
    const allEvents: CalendarEvent[] = [];

    // Sync each connected provider
    for (const [providerId, provider] of this.providers) {
      if (provider.isConnected && provider.syncEnabled) {
        try {
          let events: CalendarEvent[] = [];

          switch (providerId) {
            case 'google':
              events = await this.syncGoogleCalendar(appointments);
              break;
            case 'outlook':
              events = await this.syncOutlookCalendar(appointments);
              break;
            default:
              console.warn(`Unknown provider: ${providerId}`);
              continue;
          }

          allEvents.push(...events);
        } catch (error) {
          console.error(`Failed to sync ${provider.name}:`, error);
        }
      }
    }

    return allEvents;
  }

  async createCalendarEvent(appointment: Appointment, providerId: string): Promise<string> {
    switch (providerId) {
      case 'google':
        return await this.createGoogleCalendarEvent(appointment);
      case 'outlook':
        // Implement Outlook event creation
        throw new Error('Outlook event creation not yet implemented');
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }

  async updateCalendarEvent(eventId: string, appointment: Appointment, providerId: string): Promise<void> {
    switch (providerId) {
      case 'google':
        await this.updateGoogleCalendarEvent(eventId, appointment);
        break;
      case 'outlook':
        // Implement Outlook event update
        throw new Error('Outlook event update not yet implemented');
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }

  async deleteCalendarEvent(eventId: string, providerId: string): Promise<void> {
    switch (providerId) {
      case 'google':
        await this.deleteGoogleCalendarEvent(eventId);
        break;
      case 'outlook':
        // Implement Outlook event deletion
        throw new Error('Outlook event deletion not yet implemented');
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }

  private async updateGoogleCalendarEvent(eventId: string, appointment: Appointment): Promise<void> {
    try {
      if (!gapi.client.calendar) {
        throw new Error('Google Calendar API not initialized');
      }

      const event = {
        summary: appointment.title,
        description: appointment.description || '',
        location: appointment.location,
        start: {
          dateTime: appointment.startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: appointment.endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      await gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event
      });
    } catch (error) {
      console.error('Failed to update Google Calendar event:', error);
      throw error;
    }
  }

  private async deleteGoogleCalendarEvent(eventId: string): Promise<void> {
    try {
      if (!gapi.client.calendar) {
        throw new Error('Google Calendar API not initialized');
      }

      await gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });
    } catch (error) {
      console.error('Failed to delete Google Calendar event:', error);
      throw error;
    }
  }

  // Provider Management
  getProviders(): CalendarProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(providerId: string): CalendarProvider | undefined {
    return this.providers.get(providerId);
  }

  updateProvider(providerId: string, updates: Partial<CalendarProvider>): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      Object.assign(provider, updates);
    }
  }

  // Sync Options Management
  getSyncOptions(): CalendarSyncOptions {
    return { ...this.syncOptions };
  }

  updateSyncOptions(options: Partial<CalendarSyncOptions>): void {
    Object.assign(this.syncOptions, options);
  }

  // Utility Methods
  async checkConflicts(appointment: Appointment): Promise<CalendarEvent[]> {
    const allEvents = await this.syncAllCalendars([]);
    
    return allEvents.filter(event => {
      const appointmentStart = appointment.startTime.getTime();
      const appointmentEnd = appointment.endTime.getTime();
      const eventStart = event.startTime.getTime();
      const eventEnd = event.endTime.getTime();

      // Check for time overlap
      return (appointmentStart < eventEnd && appointmentEnd > eventStart);
    });
  }

  async getAvailableSlots(startDate: Date, endDate: Date, duration: number): Promise<Date[]> {
    const allEvents = await this.syncAllCalendars([]);
    const availableSlots: Date[] = [];
    
    // Generate time slots
    const slotDuration = duration * 60 * 1000; // Convert minutes to milliseconds
    const currentTime = new Date(startDate);
    
    while (currentTime < endDate) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration);
      
      // Check if slot conflicts with any existing events
      const hasConflict = allEvents.some(event => {
        const eventStart = event.startTime.getTime();
        const eventEnd = event.endTime.getTime();
        const slotStart = currentTime.getTime();
        const slotEndTime = slotEnd.getTime();
        
        return (slotStart < eventEnd && slotEndTime > eventStart);
      });
      
      if (!hasConflict) {
        availableSlots.push(new Date(currentTime));
      }
      
      currentTime.setTime(currentTime.getTime() + slotDuration);
    }
    
    return availableSlots;
  }
}

// Convenience functions
export const calendarService = CalendarIntegrationService.getInstance();

export const connectGoogleCalendar = () => calendarService.connectGoogleCalendar();
export const syncAllCalendars = (appointments: Appointment[]) => calendarService.syncAllCalendars(appointments);
export const createCalendarEvent = (appointment: Appointment, providerId: string) => calendarService.createCalendarEvent(appointment, providerId); 