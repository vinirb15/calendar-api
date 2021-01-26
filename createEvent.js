const { google } = require('googleapis');
const Dates = require('../../comum/app_components/dates');
class GoogleNegocio {

    static async verifyToken(auth) {
        const calendar = google.calendar({ version: 'v3', auth })
        try {
            await calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                timeMax: (new Date()).toISOString(),
                maxResults: 1,
                singleEvents: true,
                orderBy: 'startTime',
            })
            return true
        } catch (error) {
            return false
        }

    }

    static async listEventosGoogle(auth, timeMin, timeMax) {
        const calendar = google.calendar({ version: 'v3', auth });
        let listaEventos = []

        let events = undefined
        try {
            let retorno = await calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                maxResults: 300,
                singleEvents: true,
                orderBy: 'startTime',
            })
            events = retorno.data.items
        } catch (error) {

        }

        if (events && events.length > 0) {
            for (const event of events) {
                listaEventos.push({ summary: event.summary, inicio: event.start, fim: event.end })
            }

        }
        return listaEventos

    }

    static async insertEventoGoogle(auth, startDateTime, endDateTime, summary, deion, createMeet, requestId, conferenceData) {
        const calendar = google.calendar({ version: 'v3', auth })
        let event = undefined
        try {

            let requestBody = {
                deion: deion,
                start: { dateTime: startDateTime.toISOString() },
                end: { dateTime: endDateTime.toISOString() },
                summary: summary,
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 30 },
                        { method: 'email', minutes: 24 * 60 }
                    ]
                }
            }
            if (createMeet && requestId) {
                requestBody.conferenceData = {
                    createRequest: {
                        requestId: requestId,
                        conferenceSolutionKey: {
                            type: "hangoutsMeet"
                        }
                    }
                }
            } else if (conferenceData) {
                requestBody.conferenceData = conferenceData
                /*{
                    conferenceId: conferenceData.conferenceId,
                    conferenceSolution: conferenceData.conferenceSolution,
                    entryPoints: conferenceData.entryPoints,
                    signature: conferenceData.signature
                }*/
            }
            event = await calendar.events.insert({
                calendarId: 'primary',
                conferenceDataVersion: 1,
                requestBody: requestBody
            })
        } catch (error) {

        }
        return event
    }

    static async deleteEventoGoogle(auth, eventId) {
        const calendar = google.calendar({ version: 'v3', auth })
        let event = undefined
        try {
            event = await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId
            })
        } catch (error) {

        }
        return event
    }

    static async patchEventoGoogle(auth, startDateTime, endDateTime, eventId) {
        const calendar = google.calendar({ version: 'v3', auth })
        let event = undefined
        try {

            let requestBody = {
                start: { dateTime: startDateTime.toISOString() },
                end: { dateTime: endDateTime.toISOString() },
            }
            event = await calendar.events.patch({
                calendarId: 'primary',
                conferenceDataVersion: 1,
                eventId: eventId,
                requestBody: requestBody
            })
        } catch (error) {

        }
        return event
    }

    static async verificaDisponibilidadeGoogle(auth, timeMin, timeMax) {
        const calendar = google.calendar({ version: 'v3', auth });
        let listaEventos = []

        let events = undefined
        try {
            let retorno = await calendar.freebusy.query({
                resource: {
                    items: [{ id: 'primary' }],
                    timeMin: timeMin.toISOString(),
                    timeMax: timeMax.toISOString(),
                }
            })
            events = retorno.data
        } catch (error) {

        }

        /*if (events && events.length > 0) {
            for (const event of events) {
                listaEventos.push({ summary: event.summary, inicio: event.start, fim: event.end })
            }

        }*/
        return listaEventos

    }
}

module.exports = GoogleNegocio