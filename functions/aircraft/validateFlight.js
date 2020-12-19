const _get = require('lodash.get')
const moment = require('moment-timezone')

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/

const isNullOrUndefined = value => value === null || value === undefined

const isBefore = (dateTime, timezone, comparisonDateTime, comparisonTimezone) =>
  moment
    .tz(dateTime, timezone)
    .isBefore(moment.tz(comparisonDateTime, comparisonTimezone))

const getLastFlight = async (organizationId, aircraftId, db) => {
  const lastFlight = await db
    .collection('organizations')
    .doc(organizationId)
    .collection('aircrafts')
    .doc(aircraftId)
    .collection('flights')
    .where('deleted', '==', false)
    .orderBy('blockOffTime', 'desc')
    .limit(1)
    .get()
  return !lastFlight.empty ? lastFlight.docs[0].data() : null
}

const validateSync = (data, aircraftSettings) => {
  const errors = {}

  if (!data.date || !DATE_PATTERN.test(data.date)) {
    errors['date'] = 'invalid'
  } else if (
    aircraftSettings.lockDate &&
    isBefore(
      data.date,
      undefined,
      aircraftSettings.lockDate.toDate(),
      undefined
    )
  ) {
    errors['date'] = 'not_before_lock_date'
  }
  if (!data.pilot) {
    errors['pilot'] = 'required'
  }
  if (!data.nature) {
    errors['nature'] = 'required'
  }
  if (!data.departureAerodrome) {
    errors['departureAerodrome'] = 'required'
  }
  if (!data.destinationAerodrome) {
    errors['destinationAerodrome'] = 'required'
  }
  if (!data.blockOffTime || !DATE_TIME_PATTERN.test(data.blockOffTime)) {
    errors['blockOffTime'] = 'invalid'
  }
  if (!data.takeOffTime || !DATE_TIME_PATTERN.test(data.takeOffTime)) {
    errors['takeOffTime'] = 'invalid'
  }
  if (!data.landingTime || !DATE_TIME_PATTERN.test(data.landingTime)) {
    errors['landingTime'] = 'invalid'
  }
  if (!data.blockOnTime || !DATE_TIME_PATTERN.test(data.blockOnTime)) {
    errors['blockOnTime'] = 'invalid'
  }
  if (
    !errors['blockOffTime'] &&
    !errors['takeOffTime'] &&
    data.departureAerodrome
  ) {
    if (
      isBefore(
        data.takeOffTime,
        data.departureAerodrome.timezone,
        data.blockOffTime,
        data.departureAerodrome.timezone
      )
    ) {
      errors['takeOffTime'] = 'not_before_block_off_time'
    }
  }
  if (
    !errors['takeOffTime'] &&
    !errors['landingTime'] &&
    data.departureAerodrome &&
    data.destinationAerodrome
  ) {
    if (
      isBefore(
        data.landingTime,
        data.destinationAerodrome.timezone,
        data.takeOffTime,
        data.departureAerodrome.timezone
      )
    ) {
      errors['landingTime'] = 'not_before_take_off_time'
    }
  }
  if (
    !errors['landingTime'] &&
    !errors['blockOnTime'] &&
    data.destinationAerodrome
  ) {
    if (
      isBefore(
        data.blockOnTime,
        data.destinationAerodrome.timezone,
        data.landingTime,
        data.destinationAerodrome.timezone
      )
    ) {
      errors['blockOnTime'] = 'not_before_landing_time'
    }
  }
  if (typeof data.landings !== 'number' || data.landings < 1) {
    errors['landings'] = 'required'
  }
  if (typeof data.personsOnBoard !== 'number' || data.personsOnBoard < 1) {
    errors['personsOnBoard'] = 'required'
  }
  if (typeof data.fuelUplift !== 'number' || data.fuelUplift < 0) {
    errors['fuelUplift'] = 'required'
  } else if (data.fuelUplift > 0 && !data.fuelType) {
    errors['fuelType'] = 'required'
  }
  if (
    data.oilUplift &&
    (typeof data.oilUplift !== 'number' || data.oilUplift < 0)
  ) {
    errors['oilUplift'] = 'invalid'
  }

  const flightTimeStart = _get(data, 'counters.flightTimeCounter.start')
  const flightTimeEnd = _get(data, 'counters.flightTimeCounter.end')

  if (typeof flightTimeStart !== 'number') {
    errors['counters.flightTimeCounter.start'] = 'required'
  }
  if (typeof flightTimeEnd !== 'number') {
    errors['counters.flightTimeCounter.end'] = 'required'
  }
  if (
    !isNullOrUndefined(flightTimeStart) &&
    !isNullOrUndefined(flightTimeEnd)
  ) {
    if (flightTimeEnd < flightTimeStart) {
      errors['counters.flightTimeCounter.end'] = 'not_before_start_counter'
    }
  }

  if (aircraftSettings.engineHoursCounterEnabled === true) {
    const engineTimeStart = _get(data, 'counters.engineTimeCounter.start')
    const engineTimeEnd = _get(data, 'counters.engineTimeCounter.end')

    if (typeof engineTimeStart !== 'number') {
      errors['counters.engineTimeCounter.start'] = 'required'
    }
    if (typeof engineTimeEnd !== 'number') {
      errors['counters.engineTimeCounter.end'] = 'required'
    }
    if (
      !isNullOrUndefined(engineTimeStart) &&
      !isNullOrUndefined(engineTimeEnd)
    ) {
      if (engineTimeEnd < engineTimeStart) {
        errors['counters.engineTimeCounter.end'] = 'not_before_start_counter'
      }
    }
  }

  if (data.preflightCheck !== true) {
    errors['preflightCheck'] = 'required'
  }

  if (!data.troublesObservations) {
    errors['troublesObservations'] = 'required'
  }
  if (data.troublesObservations === 'troubles') {
    if (aircraftSettings.techlogEnabled === true && !data.techlogEntryStatus) {
      errors['techlogEntryStatus'] = 'required'
    }
    if (!data.techlogEntryDescription || !data.techlogEntryDescription.trim()) {
      errors['techlogEntryDescription'] = 'required'
    }
  }

  return errors
}

const validateAsync = async (data, organizationId, aircraftId, db) => {
  const errors = {}

  // date and time and so on currently not editable when updating flights
  // -> no need to validate in this case
  if (!data.id) {
    const lastFlight = await getLastFlight(organizationId, aircraftId, db)
    const isBeforeLastFlight =
      lastFlight &&
      isBefore(
        data.blockOffTime,
        data.departureAerodrome.timezone,
        lastFlight.blockOnTime.toDate(),
        lastFlight.destinationAerodrome.timezone
      )
    if (lastFlight) {
      console.log('block off time', data.blockOffTime)
      console.log('last block on', lastFlight.blockOnTime.toDate())
      console.log('is before', isBeforeLastFlight)
    }
    if (isBeforeLastFlight) {
      errors['blockOffTime'] = 'not_before_block_on_time_last_flight'
    }
  }

  return errors
}

module.exports.validateSync = validateSync
module.exports.validateAsync = validateAsync