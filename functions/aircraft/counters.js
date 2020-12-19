const moment = require('moment-timezone')

const getCounters = data => {
  validate(data)

  const c = data.counters

  const flightTimeCounter = c.flightTimeCounter
  const engineTimeCounter = c.engineTimeCounter

  const flights = interval(c.flights.start, c.flights.start + 1)
  const landings = interval(c.landings.start, c.landings.start + data.landings)
  const flightHours = interval(
    c.flightHours.start,
    flightTimeCounter
      ? c.flightHours.start + (flightTimeCounter.end - flightTimeCounter.start)
      : addTimeDiff(c.flightHours.start, data.takeOffTime, data.landingTime)
  )
  const engineHours = engineTimeCounter
    ? interval(
        c.engineHours.start,
        c.engineHours.start + (engineTimeCounter.end - engineTimeCounter.start)
      )
    : null

  const counters = {
    flights,
    landings,
    flightHours
  }

  if (engineHours) counters.engineHours = engineHours
  if (flightTimeCounter) counters.flightTimeCounter = flightTimeCounter
  if (engineTimeCounter) counters.engineTimeCounter = engineTimeCounter

  return counters
}

const addTimeDiff = (value, diffStart, diffEnd) => {
  const diff = getTimeDiffInHundredthsOfHour(diffStart, diffEnd)
  return value + diff
}

const validate = data => {
  const counters = data.counters
  if (!counters) {
    throw 'Counters property missing'
  }

  if (!counters.flights || typeof counters.flights.start !== 'number') {
    throw 'Property `counters.flights.start` missing or not a number'
  }
  if (!counters.landings || typeof counters.landings.start !== 'number') {
    throw 'Property `counters.landings.start` missing or not a number'
  }
  if (!counters.flightHours || typeof counters.flightHours.start !== 'number') {
    throw 'Property `counters.flightHours.start` missing or not a number'
  }

  if (typeof data.landings !== 'number') {
    throw 'Property `landings` missing or not a number'
  }
  if (typeof data.blockOffTime !== 'string') {
    throw 'Property `blockOffTime` missing or not a string'
  }
  if (typeof data.blockOnTime !== 'string') {
    throw 'Property `blockOnTime` missing or not a string'
  }
  if (typeof data.takeOffTime !== 'string') {
    throw 'Property `takeOffTime` missing or not a string'
  }
  if (typeof data.landingTime !== 'string') {
    throw 'Property `landingTime` missing or not a string'
  }
}

function interval(start, end) {
  return {
    start,
    end
  }
}

/**
 * Calculates the difference between two dates and returns hundredths of an hour.
 *
 * e.g. getTimeDiffInHundredthsOfHour('2018-11-20 10:00', '2018-11-20 11:00')
 *      -> returns 100
 *
 * @param start Date time string in a format MomentJS understands
 *              (e.g. YYYY-MM-DD HH:mm)
 * @param end Date time string in a format MomentJS understands
 *            (e.g. YYYY-MM-DD HH:mm)
 * @returns {Number} new difference between to timestamps in hundredths of an hour
 */
const getTimeDiffInHundredthsOfHour = (start, end) => {
  const startMoment = moment(start)
  const endMoment = moment(end)
  const diff = endMoment.diff(startMoment)

  const hundredthsOfAnHour = millis2Hours(diff) * 100
  return Math.round(hundredthsOfAnHour)
}

const millis2Hours = millis => millis / (1000 * 60 * 60)

module.exports = getCounters
module.exports.getTimeDiffInHundredthsOfHour = getTimeDiffInHundredthsOfHour