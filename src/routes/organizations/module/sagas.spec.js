import { all, takeEvery, fork, call, put, select } from 'redux-saga/effects'
import { getFirebase, getFirestore } from '../../../util/firebase'
import * as actions from './actions'
import * as sagas from './sagas'

describe('modules', () => {
  describe('organizations', () => {
    describe('sagas', () => {
      describe('getCurrentUser', () => {
        it('should return the current user', () => {
          const generator = sagas.getCurrentUser()

          expect(generator.next().value).toEqual(call(getFirestore))

          const firestore = {
            get: () => {}
          }
          expect(generator.next(firestore).value).toEqual(
            select(sagas.uidSelector)
          )

          const uid = 'test-user-uid'

          expect(generator.next(uid).value).toEqual(
            call(firestore.get, {
              collection: 'users',
              doc: uid
            })
          )

          const user = {}

          const next = generator.next(user)

          expect(next.done).toEqual(true)
          expect(next.value).toEqual(user)
        })

        it('should throw an error if the current user could not be found', () => {
          const generator = sagas.getCurrentUser()

          expect(generator.next().value).toEqual(call(getFirestore))

          const firestore = {
            get: () => {}
          }
          expect(generator.next(firestore).value).toEqual(
            select(sagas.uidSelector)
          )

          const uid = 'test-user-uid'

          expect(generator.next(uid).value).toEqual(
            call(firestore.get, {
              collection: 'users',
              doc: uid
            })
          )

          const user = null

          expect(() => {
            generator.next(user)
          }).toThrow('User for id test-user-uid not found')
        })
      })

      describe('createOrganization', () => {
        it('should create an organization', () => {
          const createOrganization = actions.createOrganization({
            name: 'my_org'
          })

          const generator = sagas.createOrganization(createOrganization)

          expect(generator.next().value).toEqual(call(getFirestore))

          const firestore = {
            set: () => {}
          }

          expect(generator.next(firestore).value).toEqual(
            call(sagas.getCurrentUser)
          )

          const currentUser = {
            ref: {}
          }
          expect(generator.next(currentUser).value).toEqual(
            call(
              firestore.set,
              { collection: 'organizations', doc: 'my_org' },
              { owner: currentUser.ref }
            )
          )

          expect(generator.next().value).toEqual(
            put(actions.createOrganizationSuccess())
          )

          expect(generator.next().done).toEqual(true)
        })

        it('should put CREATE_ORGANIZATION_FAILURE if it fails', () => {
          const createOrganization = actions.createOrganization({
            name: 'my_org'
          })

          const generator = sagas.createOrganization(createOrganization)

          expect(generator.next().value).toEqual(call(getFirestore))

          const firestore = {
            set: () => {}
          }

          expect(generator.next(firestore).value).toEqual(
            call(sagas.getCurrentUser)
          )

          const currentUser = {
            ref: {}
          }
          expect(generator.next(currentUser).value).toEqual(
            call(
              firestore.set,
              { collection: 'organizations', doc: 'my_org' },
              { owner: currentUser.ref }
            )
          )

          // eslint-disable-next-line no-console
          console.error = jest.fn()

          const error = new Error('Failed to add the document')
          expect(generator.throw(error).value).toEqual(
            put(actions.createOrganizationFailure())
          )

          // eslint-disable-next-line no-console
          expect(console.error).toBeCalledWith(
            'Failed to create organization my_org',
            error
          )

          expect(generator.next().done).toEqual(true)
        })
      })

      describe('selectOrganization', () => {
        it('should select an organization', () => {
          const selectOrganizationAction = actions.selectOrganization('my_org')

          const generator = sagas.selectOrganization(selectOrganizationAction)

          expect(generator.next().value).toEqual(call(getFirebase))

          const firebase = {
            updateProfile: () => {}
          }
          expect(generator.next(firebase).value).toEqual(
            call(firebase.updateProfile, { selectedOrganization: 'my_org' })
          )

          expect(generator.next().done).toEqual(true)
        })
      })

      describe('deleteOrganization', () => {
        it('should delete an organization', () => {
          const action = actions.deleteOrganization('my_org')

          const generator = sagas.deleteOrganization(action)

          expect(generator.next().value).toEqual(call(getFirestore))

          const firestore = {
            delete: () => {}
          }
          expect(generator.next(firestore).value).toEqual(
            call(
              firestore.delete,
              { collection: 'organizations', doc: 'my_org' },
              {}
            )
          )

          expect(generator.next().value).toEqual(
            put(actions.deleteOrganizationSuccess())
          )

          expect(generator.next().done).toEqual(true)
        })

        it('should put DELETE_ORGANIZATION_FAILURE if it fails', () => {
          const action = actions.deleteOrganization('my_org')

          const generator = sagas.deleteOrganization(action)

          expect(generator.next().value).toEqual(call(getFirestore))

          const firestore = {
            delete: () => {}
          }
          expect(generator.next(firestore).value).toEqual(
            call(
              firestore.delete,
              { collection: 'organizations', doc: 'my_org' },
              {}
            )
          )

          // eslint-disable-next-line no-console
          console.error = jest.fn()

          const error = new Error('Failed to delete the document')
          expect(generator.throw(error).value).toEqual(
            put(actions.deleteOrganizationFailure())
          )

          // eslint-disable-next-line no-console
          expect(console.error).toBeCalledWith(
            'Failed to delete organization my_org',
            error
          )

          expect(generator.next().done).toEqual(true)
        })
      })

      describe('default', () => {
        it('should fork all sagas', () => {
          const generator = sagas.default()

          expect(generator.next().value).toEqual(
            all([
              fork(
                takeEvery,
                actions.CREATE_ORGANIZATION,
                sagas.createOrganization
              ),
              fork(
                takeEvery,
                actions.SELECT_ORGANIZATION,
                sagas.selectOrganization
              ),
              fork(
                takeEvery,
                actions.DELETE_ORGANIZATION,
                sagas.deleteOrganization
              )
            ])
          )
        })
      })
    })
  })
})