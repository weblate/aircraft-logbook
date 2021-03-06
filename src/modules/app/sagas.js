import { takeEvery, all, call, select, put } from 'redux-saga/effects'
import { constants as reduxFirebaseConstants } from 'react-redux-firebase'
import { constants as reduxFirestoreConstants } from 'redux-firestore'
import { getFirebase, getFirestore } from '../../util/firebase'
import { getDoc } from '../../util/firestoreUtils'
import * as actions from './actions'

export const uidSelector = state => state.firebase.auth.uid
export const currentUserUid = state => state.firestore.data.currentUser.id

export function* onLogin() {
  const firebase = yield call(getFirebase)
  const firestore = yield call(getFirestore)

  // Calling `updateProfile` is sort of a workaround because it seems
  // like react-redux-firebase doesn't always create the user profile
  // in the Firestore database when a new user is created.
  // If we update the profile here, it's always created correctly.
  yield call(firebase.updateProfile, { lastLogin: new Date() })

  const uid = yield select(uidSelector)
  if (!uid) {
    throw 'UID not available'
  }
  yield call(firestore.setListener, {
    collection: 'users',
    doc: uid,
    storeAs: 'currentUser'
  })

  yield put(actions.fetchOrganizations())
}

export function* unwatchCurrentUser() {
  const firestore = yield call(getFirestore)
  const uid = yield select(currentUserUid)
  yield call(firestore.unsetListener, {
    collection: 'users',
    doc: uid
  })
}

export function* getWithRoles(organizationDoc, userRef) {
  const allRoles = []

  const orgData = organizationDoc.data()

  if (orgData.owner.id === userRef.id) {
    allRoles.push('manager')
  }

  const firestore = yield call(getFirestore)
  const members = yield call(firestore.get, {
    collection: 'organizations',
    doc: organizationDoc.id,
    subcollections: [{ collection: 'members' }],
    where: ['user', '==', userRef],
    storeAs: 'org-user-member'
  })

  // maybe the current user is linked to multiple members
  // -> get roles from all returned results
  members.docs.forEach(member => {
    const memberRoles = member.get('roles')
    if (memberRoles && memberRoles.length > 0) {
      allRoles.push.apply(allRoles, memberRoles)
    }
  })

  orgData.roles = allRoles

  return orgData
}

export function* fetchOrganizations() {
  // set to loading state
  yield put(actions.setMyOrganizations(undefined))

  let organizations = []

  const uid = yield select(uidSelector)
  if (!uid) {
    throw 'UID not available'
  }
  const userDoc = yield call(getDoc, ['users', uid])
  const organizationRefs = userDoc.get('organizations')
  if (organizationRefs && organizationRefs.length > 0) {
    const organizationDocs = yield all(
      organizationRefs.map(ref => call(ref.get.bind(ref)))
    )
    organizations = yield all(
      organizationDocs
        .filter(doc => doc.exists === true)
        .map(doc => call(getWithRoles, doc, userDoc.ref))
    )
  }

  yield put(actions.setMyOrganizations(organizations))
}

export const collectReferences = (data, referenceItems) => {
  const references = []

  if (data) {
    Object.keys(data).forEach(key => {
      const record = data[key]

      Object.keys(record)
        .filter(item => referenceItems.includes(item))
        .forEach(item => {
          const ref = record[item]
          if (ref) {
            references.push({ id: { key, item }, ref })
          }
        })
    })
  }

  return references
}

export function* resolveReference(id, ref) {
  let data = ref

  if (ref && typeof ref.get === 'function') {
    const doc = yield call(ref.get.bind(ref))
    data = doc.data()
  }

  return {
    id,
    data
  }
}

export const populate = (resolvedDocs, data, orderedData) => {
  resolvedDocs.forEach(doc => {
    const { key, item } = doc.id

    data[key][item] = doc.data
    orderedData.find(rec => rec.id === key)[item] = doc.data
  })
}

export function* populateAndPutAgain(action) {
  const references = collectReferences(
    action.payload.data,
    action.meta.populate
  )

  if (references.length > 0) {
    const resolvingFunctions = references.map(obj =>
      call(resolveReference, obj.id, obj.ref)
    )
    const result = yield all(resolvingFunctions)

    populate(result, action.payload.data, action.payload.ordered)

    // delete populate property to avoid repeated population
    delete action.meta.populate

    yield put(action)
  }
}

export function* onGetSuccess(action) {
  if (action.meta.populate) {
    yield call(populateAndPutAgain, action)
  }
}

export function* logout() {
  const firebase = yield call(getFirebase)
  yield call(firebase.logout)
  yield put(actions.setMyOrganizations(undefined))
}

export function* watchAerodromes() {
  const firestore = yield call(getFirestore)
  yield call(firestore.setListener, {
    collection: 'aerodromes',
    orderBy: 'name',
    storeAs: 'allAerodromes'
  })
}

export default function* sagas() {
  yield all([
    takeEvery(reduxFirebaseConstants.actionTypes.LOGIN, onLogin),
    takeEvery(reduxFirebaseConstants.actionTypes.LOGOUT, unwatchCurrentUser),
    takeEvery(reduxFirestoreConstants.actionTypes.GET_SUCCESS, onGetSuccess),
    takeEvery(actions.LOGOUT, logout),
    takeEvery(actions.WATCH_AERODROMES, watchAerodromes),
    takeEvery(actions.FETCH_ORGANIZATIONS, fetchOrganizations)
  ])
}
