import { createReducer } from '../../../../../util/reducer'
import * as actions from './actions'

export const INITIAL_STATE = {
  createAircraftDialog: {
    open: false,
    submitted: false,
    data: {
      registration: ''
    }
  }
}

const openCreateAircraftDialog = state => ({
  ...state,
  createAircraftDialog: {
    ...state.createAircraftDialog,
    open: true,
    data: INITIAL_STATE.createAircraftDialog.data
  }
})

const updateCreateAircraftDialogData = (state, action) => ({
  ...state,
  createAircraftDialog: {
    ...state.createAircraftDialog,
    data: action.payload.data
  }
})

const closeCreateAircraftDialog = state => ({
  ...state,
  createAircraftDialog: {
    ...state.createAircraftDialog,
    open: false
  }
})

const setCreateAircraftDialogSubmitted = submitted => state => ({
  ...state,
  createAircraftDialog: {
    ...state.createAircraftDialog,
    submitted
  }
})

const ACTION_HANDLERS = {
  [actions.OPEN_CREATE_AIRCRAFT_DIALOG]: openCreateAircraftDialog,
  [actions.CLOSE_CREATE_AIRCRAFT_DIALOG]: closeCreateAircraftDialog,
  [actions.UPDATE_CREATE_AIRCRAFT_DIALOG_DATA]: updateCreateAircraftDialogData,
  [actions.CREATE_AIRCRAFT_SUCCESS]: closeCreateAircraftDialog,
  [actions.CREATE_AIRCRAFT_FAILURE]: setCreateAircraftDialogSubmitted(false),
  [actions.SET_CREATE_AIRCRAFT_DIALOG_SUBMITTED]: setCreateAircraftDialogSubmitted(
    true
  )
}

export default createReducer(INITIAL_STATE, ACTION_HANDLERS)
