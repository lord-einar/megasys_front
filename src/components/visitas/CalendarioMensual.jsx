import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay visitas en este rango',
};

const CalendarioMensual = ({ eventos, onSelectEvent, onSelectSlot, date, onNavigate, view, onView }) => {

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3174ad';

        // Colores según estado
        if (event.extendedProps?.estado === 'realizada') backgroundColor = '#28a745';
        if (event.extendedProps?.estado === 'cancelada') backgroundColor = '#6c757d';
        if (event.extendedProps?.tipo === 'urgencia') backgroundColor = '#dc3545';

        // Opcional: Colores por técnico (hash simple)
        // const hash = event.extendedProps.tecnicoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        // const hue = hash % 360;
        // backgroundColor = `hsl(${hue}, 70%, 50%)`;

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '0.875rem',
                padding: '2px 5px'
            }
        };
    };

    return (
        <div className="h-[700px] bg-white p-6 rounded-lg shadow">
            <Calendar
                localizer={localizer}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                messages={messages}
                culture='es'
                date={date}
                onNavigate={onNavigate}
                view={view}
                onView={onView}
                onSelectEvent={onSelectEvent}
                onSelectSlot={onSelectSlot}
                selectable
                eventPropGetter={eventStyleGetter}
                views={['month', 'agenda']}
            />
        </div>
    );
};

export default CalendarioMensual;
