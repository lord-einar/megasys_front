import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import '../../styles/Calendar.css';
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

    const eventPropGetter = (event) => {
        let className = 'rbc-event';

        // Clases según estado y tipo
        if (event.extendedProps?.estado === 'realizada') className += ' event-realizada';
        else if (event.extendedProps?.estado === 'cancelada') className += ' event-cancelada';
        else if (event.extendedProps?.tipo === 'urgencia') className += ' event-urgencia';
        else className += ' event-programada';

        return {
            className,
            style: {
                backgroundColor: event.backgroundColor,
                borderColor: event.borderColor
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
                eventPropGetter={eventPropGetter}
                views={['month', 'agenda']}
            />
        </div>
    );
};

export default CalendarioMensual;
