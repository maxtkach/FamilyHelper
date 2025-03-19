import { useState, useCallback } from 'react';
import { Event } from '../types';
import { generateId } from '../utils';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const addEvent = useCallback((event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...event,
      id: generateId(),
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  }, []);

  const updateEvent = useCallback((eventId: string, updates: Partial<Event>) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      )
    );
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
  }, []);

  const getEventById = useCallback(
    (eventId: string) => events.find((event) => event.id === eventId),
    [events]
  );

  const getEventsByDate = useCallback(
    (date: Date) =>
      events.filter(
        (event) =>
          new Date(event.startDate).toDateString() === date.toDateString()
      ),
    [events]
  );

  const getEventsByParticipant = useCallback(
    (userId: string) =>
      events.filter((event) => event.participants.includes(userId)),
    [events]
  );

  const getUpcomingEvents = useCallback(() => {
    const now = new Date();
    return events.filter((event) => new Date(event.startDate) > now);
  }, [events]);

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsByDate,
    getEventsByParticipant,
    getUpcomingEvents,
  };
}; 