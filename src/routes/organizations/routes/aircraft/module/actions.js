export const FETCH_FLIGHTS = 'aircraft/FETCH_FLIGHTS'
export const SET_FLIGHTS_PAGE = 'aircraft/SET_FLIGHTS_PAGE'
export const OPEN_CREATE_FLIGHT_DIALOG = 'aircraft/OPEN_CREATE_FLIGHT_DIALOG'
export const CLOSE_CREATE_FLIGHT_DIALOG = 'aircraft/CLOSE_CREATE_FLIGHT_DIALOG'
export const UPDATE_CREATE_FLIGHT_DIALOG_DATA =
  'aircraft/UPDATE_CREATE_FLIGHT_DIALOG_DATA'
export const CREATE_FLIGHT = 'aircraft/CREATE_FLIGHT'
export const SET_FLIGHT_VALIDATION_ERRORS =
  'aircraft/SET_FLIGHT_VALIDATION_ERRORS'
export const CREATE_FLIGHT_SUCCESS = 'aircraft/CREATE_FLIGHT_SUCCESS'
export const CREATE_FLIGHT_FAILURE = 'aircraft/CREATE_FLIGHT_FAILURE'
export const INIT_CREATE_FLIGHT_DIALOG = 'aircraft/INIT_CREATE_FLIGHT_DIALOG'
export const OPEN_DELETE_FLIGHT_DIALOG = 'aircraft/OPEN_DELETE_FLIGHT_DIALOG'
export const CLOSE_DELETE_FLIGHT_DIALOG = 'aircraft/CLOSE_DELETE_FLIGHT_DIALOG'
export const DELETE_FLIGHT = 'aircraft/DELETE_FLIGHT'

export const fetchFlights = (
  organizationId,
  aircraftId,
  page,
  rowsPerPage
) => ({
  type: FETCH_FLIGHTS,
  payload: {
    organizationId,
    aircraftId,
    page,
    rowsPerPage
  }
})

export const setFlightsPage = page => ({
  type: SET_FLIGHTS_PAGE,
  payload: {
    page
  }
})

export const openCreateFlightDialog = () => ({
  type: OPEN_CREATE_FLIGHT_DIALOG
})

export const closeCreateFlightDialog = () => ({
  type: CLOSE_CREATE_FLIGHT_DIALOG
})

export const updateCreateFlightDialogData = data => ({
  type: UPDATE_CREATE_FLIGHT_DIALOG_DATA,
  payload: {
    data
  }
})

export const createFlight = (organizationId, aircraftId, data) => ({
  type: CREATE_FLIGHT,
  payload: {
    organizationId,
    aircraftId,
    data
  }
})

export const setFlightValidationErrors = validationErrors => ({
  type: SET_FLIGHT_VALIDATION_ERRORS,
  payload: {
    validationErrors
  }
})

export const createFlightSuccess = () => ({
  type: CREATE_FLIGHT_SUCCESS
})

export const createFlightFailure = () => ({
  type: CREATE_FLIGHT_FAILURE
})

export const initCreateFlightDialog = () => ({
  type: INIT_CREATE_FLIGHT_DIALOG
})

export const openDeleteFlightDialog = flight => ({
  type: OPEN_DELETE_FLIGHT_DIALOG,
  payload: {
    flight
  }
})

export const closeDeleteFlightDialog = () => ({
  type: CLOSE_DELETE_FLIGHT_DIALOG
})

export const deleteFlight = (organizationId, aircraftId, flightId) => ({
  type: DELETE_FLIGHT,
  payload: {
    organizationId,
    aircraftId,
    flightId
  }
})
