import { takeEvery, all, call, put, select } from 'redux-saga/effects'
import { getFirebase, getFirestore } from '../../../util/firebase'
import * as actions from './actions'
import { fetchOrganizations } from '../../../modules/app'
import { error } from '../../../util/log'
import {
  getDoc,
  addArrayItem,
  removeArrayItem
} from '../../../util/firestoreUtils'

export const uidSelector = state => state.firebase.auth.uid

export function* getCurrentUser() {
  const firestore = yield call(getFirestore)
  const uid = yield select(uidSelector)
  if (uid) {
    const user = yield call(firestore.get, {
      collection: 'users',
      doc: uid
    })
    if (!user) {
      throw new Error(`User for id ${uid} not found`)
    }
    return user
  }
  return null
}

export function* createOrganization({ payload: { data } }) {
  try {
    yield put(actions.setCreateOrganizationDialogSubmitted())
    const firestore = yield call(getFirestore)
    const user = yield call(getCurrentUser)
    yield call(
      firestore.set,
      {
        collection: 'organizations',
        doc: data.name
      },
      {
        id: data.name,
        owner: user.ref
      }
    )
    const newOrg = yield call(getDoc, ['organizations', data.name])
    yield call(addArrayItem, ['users', user.id], 'organizations', newOrg.ref)
    yield put(fetchOrganizations())
    yield put(actions.createOrganizationSuccess())
  } catch (e) {
    error(`Failed to create organization ${data.name}`, e)
    yield put(actions.createOrganizationFailure())
  }
}

export function* selectOrganization({ payload: { id } }) {
  const firebase = yield call(getFirebase)
  yield call(firebase.updateProfile, { selectedOrganization: id })
}

export function* deleteOrganization({ payload: { id } }) {
  try {
    const firestore = yield call(getFirestore)
    const org = yield call(getDoc, ['organizations', id])
    const user = yield call(getCurrentUser)

    yield call(firestore.delete, { collection: 'organizations', doc: id }, {})
    yield call(removeArrayItem, ['users', user.id], 'organizations', org.ref)

    yield put(fetchOrganizations())
    yield put(actions.deleteOrganizationSuccess())
  } catch (e) {
    error(`Failed to delete organization ${id}`, e)
    yield put(actions.deleteOrganizationFailure())
  }
}

export function* fetchAircrafts({ payload: { organizationId } }) {
  const firestore = yield call(getFirestore)
  yield call(
    firestore.get,
    {
      collection: 'organizations',
      doc: organizationId,
      subcollections: [{ collection: 'aircrafts' }],
      orderBy: 'registration',
      storeAs: 'organizationAircrafts'
    },
    {}
  )
}

export function* fetchMembers({ payload: { organizationId } }) {
  const firestore = yield call(getFirestore)
  yield call(
    firestore.get,
    {
      collection: 'organizations',
      doc: organizationId,
      subcollections: [{ collection: 'members' }],
      where: ['deleted', '==', false],
      orderBy: [['lastname'], ['firstname']],
      storeAs: 'organizationMembers'
    },
    {}
  )
}

export function* fetchAerodromes({ payload: { organizationId } }) {
  const firestore = yield call(getFirestore)
  yield call(
    firestore.get,
    {
      collection: 'organizations',
      doc: organizationId,
      subcollections: [{ collection: 'aerodromes' }],
      where: ['deleted', '==', false],
      orderBy: [['name'], ['identification']],
      storeAs: 'organizationAerodromes'
    },
    {}
  )
}

export default function* sagas() {
  yield all([
    takeEvery(actions.CREATE_ORGANIZATION, createOrganization),
    takeEvery(actions.SELECT_ORGANIZATION, selectOrganization),
    takeEvery(actions.DELETE_ORGANIZATION, deleteOrganization),
    takeEvery(actions.FETCH_AIRCRAFTS, fetchAircrafts),
    takeEvery(actions.FETCH_MEMBERS, fetchMembers),
    takeEvery(actions.FETCH_AERODROMES, fetchAerodromes)
  ])
}
