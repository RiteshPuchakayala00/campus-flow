import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../index.css'; // For custom dark styles

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CalendarView = ({ bookings, venues }) => {
    // Convert bookings to calendar events
    const events = bookings
        .filter(b => b.status === 'approved') // Only show approved bookings
        .map(b => {
            const venueName = typeof b.venue === 'object' ? b.venue?.name :
                typeof b.venue_id === 'object' ? b.venue_id?.name : 'Unknown Venue';

            // Format: "2024-03-10" and "09:00" -> Date object
            const startDateStr = `${new Date(b.date).toISOString().split('T')[0]}T${b.start_time}:00`;
            const endDateStr = `${new Date(b.date).toISOString().split('T')[0]}T${b.end_time}:00`;

            return {
                id: b._id,
                title: `${venueName} - ${b.purpose}`,
                start: new Date(startDateStr),
                end: new Date(endDateStr),
                venue: venueName
            };
        });

    const eventStyleGetter = (event) => {
        return {
            className: 'rbc-custom-event', // managed by index.css now
        };
    };

    return (
        <div className="glass-card p-6 h-[600px] animate-fade-in-up custom-calendar">
            <h2 className="text-xl font-bold text-theme mb-4">📅 Venue Availability</h2>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                className="text-theme"
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                defaultView='week'
            />
        </div>
    );
};

export default CalendarView;
