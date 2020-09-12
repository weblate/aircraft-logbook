import reducer from './reducer'
import * as actions from './actions'

const INITIAL_STATE = {
  createAircraftDialog: {
    open: false,
    submitted: false,
    data: {
      registration: ''
    }
  }
}

describe('modules', () => {
  describe('organizations', () => {
    describe('routes', () => {
      describe('detail', () => {
        describe('reducer', () => {
          it('defines an initial state', () => {
            expect(reducer(undefined, {})).toEqual(INITIAL_STATE)
          })

          it('handles the OPEN_CREATE_AIRCRAFT_DIALOG action', () => {
            expect(
              reducer(
                {
                  createAircraftDialog: {
                    open: false,
                    data: {
                      registration: 'HBABC'
                    }
                  }
                },
                actions.openCreateAircraftDialog()
              )
            ).toEqual({
              createAircraftDialog: {
                open: true,
                data: {
                  registration: ''
                }
              }
            })
          })

          it('handles the CLOSE_CREATE_AIRCRAFT_DIALOG action', () => {
            expect(
              reducer(
                {
                  createAircraftDialog: {
                    open: true
                  }
                },
                actions.closeCreateAircraftDialog()
              )
            ).toEqual({
              createAircraftDialog: {
                open: false
              }
            })
          })

          it('handles the UPDATE_CREATE_AIRCRAFT_DIALOG_DATA action', () => {
            expect(
              reducer(
                {
                  createAircraftDialog: {
                    data: {
                      name: 'foo'
                    }
                  }
                },
                actions.updateCreateAircraftDialogData({ name: 'foobar' })
              )
            ).toEqual({
              createAircraftDialog: {
                data: {
                  name: 'foobar'
                }
              }
            })
          })

          it('handles the CREATE_AIRCRAFT_SUCCESS action', () => {
            expect(
              reducer(
                {
                  createAircraftDialog: {
                    open: true
                  }
                },
                actions.createAircraftSuccess()
              )
            ).toEqual({
              createAircraftDialog: {
                open: false
              }
            })
          })
        })
      })
    })
  })
})
