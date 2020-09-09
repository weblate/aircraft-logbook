import { compose } from 'redux'
import { connect } from 'react-redux'
import FlightList from '../../../components/FlightList'
import {
  getAircraftFlights,
  getAircraftFlightsCount
} from '../../../../../../../util/getFromState'
import {
  initFlightsList,
  changeFlightsPage,
  fetchFlights,
  openCreateFlightDialog,
  initCreateFlightDialog,
  openEditFlightDialog,
  openDeleteFlightDialog,
  closeDeleteFlightDialog,
  deleteFlight
} from '../../../module'

const mapStateToProps = (state, ownProps) => {
  const { organization, aircraft } = ownProps

  const flights = getAircraftFlights(
    state,
    aircraft.id,
    state.aircraft.flights.page
  )

  const pagination = aircraft
    ? {
        rowsCount: getAircraftFlightsCount(state, aircraft.id),
        page: state.aircraft.flights.page,
        rowsPerPage: state.aircraft.flights.rowsPerPage
      }
    : undefined

  return {
    organization,
    aircraft,
    flights,
    pagination,
    createFlightDialogOpen: state.aircraft.createFlightDialog.open,
    flightDeleteDialog: state.aircraft.deleteFlightDialog
  }
}

const mapActionCreators = {
  initFlightsList,
  fetchFlights,
  changeFlightsPage,
  openCreateFlightDialog,
  initCreateFlightDialog,
  openEditFlightDialog,
  openDeleteFlightDialog,
  closeDeleteFlightDialog,
  deleteFlight
}

export default compose(connect(mapStateToProps, mapActionCreators))(FlightList)
