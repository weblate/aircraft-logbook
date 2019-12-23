import _get from 'lodash.get'
import { call } from 'redux-saga/effects'
import moment from 'moment'
import getLastFlight from './getLastFlight'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/

/**
 * error message keys are automatically prefixed with
 * "flight.create.dialog.validation.{fieldName}." and transformed to lower case.
 *
 * e.g.: if { date: 'invalid' } is returned, the used message key will be
 * 'flight.create.dialog.validation.date.invalid'.
 *
 * @param data
 * @param organizationId
 * @param aircraftId
 * @param aircraftSettings
 * @return a map containing the error message for the mapped fields
 */
export default function* validateFlight(
  data,
  organizationId,
  aircraftId,
  aircraftSettings
) {
  let errors = yield call(
    validateSync,
    data,
    organizationId,
    aircraftId,
    aircraftSettings
  )

  if (Object.keys(errors).length === 0) {
    errors = yield call(
      validateAsync,
      data,
      organizationId,
      aircraftId,
      aircraftSettings
    )
  }

  return errors
}

export function validateSync(
  data,
  organizationId,
  aircraftId,
  aircraftSettings
) {
  const errors = {}

  if (!data.date || !DATE_PATTERN.test(data.date)) {
    errors['date'] = 'invalid'
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
  if (!errors['blockOffTime'] && !errors['takeOffTime']) {
    if (data.takeOffTime < data.blockOffTime) {
      errors['takeOffTime'] = 'not_before_block_off_time'
    }
  }
  if (!errors['takeOffTime'] && !errors['landingTime']) {
    if (data.landingTime < data.takeOffTime) {
      errors['landingTime'] = 'not_before_take_off_time'
    }
  }
  if (!errors['landingTime'] && !errors['blockOnTime']) {
    if (data.blockOnTime < data.landingTime) {
      errors['blockOnTime'] = 'not_before_landing_time'
    }
  }
  if (typeof data.landings !== 'number' || data.landings < 1) {
    errors['landings'] = 'required'
  }
  if (typeof data.personsOnBoard !== 'number' || data.personsOnBoard < 1) {
    errors['personsOnBoard'] = 'required'
  }
  if (data.fuelUplift) {
    if (typeof data.fuelUplift !== 'number' || data.fuelUplift < 0) {
      errors['fuelUplift'] = 'invalid'
    }
    if (!data.fuelType) {
      errors['fuelType'] = 'required'
    }
  }
  if (
    data.oilUplift &&
    (typeof data.oilUplift !== 'number' || data.oilUplift < 0)
  ) {
    errors['oilUplift'] = 'invalid'
  }

  const flightTimeStart = _get(data, 'counters.flightTimeCounter.start')
  const flightTimeEnd = _get(data, 'counters.flightTimeCounter.end')

  if (typeof flightTimeStart === 'undefined') {
    errors['counters.flightTimeCounter.start'] = 'required'
  }
  if (typeof flightTimeEnd === 'undefined') {
    errors['counters.flightTimeCounter.end'] = 'required'
  }
  if (flightTimeStart && flightTimeEnd) {
    if (flightTimeEnd < flightTimeStart) {
      errors['counters.flightTimeCounter.end'] = 'not_before_start_counter'
    }
  }

  if (aircraftSettings.engineHoursCounterEnabled === true) {
    const engineTimeStart = _get(data, 'counters.engineTimeCounter.start')
    const engineTimeEnd = _get(data, 'counters.engineTimeCounter.end')

    if (typeof engineTimeStart === 'undefined') {
      errors['counters.engineTimeCounter.start'] = 'required'
    }
    if (typeof engineTimeEnd === 'undefined') {
      errors['counters.engineTimeCounter.end'] = 'required'
    }
    if (engineTimeStart && engineTimeEnd) {
      if (engineTimeEnd < engineTimeStart) {
        errors['counters.engineTimeCounter.end'] = 'not_before_start_counter'
      }
    }
  }

  return errors
}

export function* validateAsync(data, organizationId, aircraftId) {
  const errors = {}

  const lastFlight = yield call(getLastFlight, organizationId, aircraftId)
  if (
    lastFlight &&
    moment(data.blockOffTime).isBefore(lastFlight.blockOnTime.toDate())
  ) {
    errors['blockOffTime'] = 'not_before_block_on_time_last_flight'
  }

  return errors
}
