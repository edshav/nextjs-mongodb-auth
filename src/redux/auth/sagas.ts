import { takeLatest, call, put, all } from 'redux-saga/effects';
import axios, { AxiosResponse } from 'axios';
import { SagaIterator } from 'redux-saga';
import { logout } from 'utils/auth';
import { ErrorResponse } from 'shared/interfaces';
import Router from 'next/router';
import { AuthActionTypes, SignUpStart, SignInStart } from './action-types';
import { Viewer } from './interfaces';
import {
  signUpSuccess,
  authFailure,
  getViewerSuccess,
  signInSuccess,
  signOutSuccess,
} from './actions';

function* signUp({ signUpInput }: SignUpStart) {
  try {
    const response: AxiosResponse<Viewer> = yield call(axios.post, '/api/auth/signup', signUpInput);
    const { status, data } = response;
    if (status === 201) {
      yield put(signUpSuccess(data));
    }
  } catch (error) {
    yield put(authFailure((error.response as AxiosResponse<ErrorResponse>).data));
  }
}

function* getViewer() {
  try {
    const { status, data }: AxiosResponse<{ viewer: Viewer }> = yield call(
      axios.get,
      '/api/auth/viewer',
    );
    if (status === 200) {
      if (!data.viewer) {
        Router.replace('/auth/signin');
      }
      yield put(getViewerSuccess(data));
    }
  } catch (error) {
    yield put(authFailure((error.response as AxiosResponse<ErrorResponse>).data));
  }
}

function* signIn({ signInInput }: SignInStart) {
  try {
    const { status, data }: AxiosResponse<Viewer> = yield call(
      axios.post,
      '/api/auth/signin',
      signInInput,
    );
    if (status === 200) {
      yield put(signInSuccess(data));
    }
  } catch (error) {
    yield put(authFailure((error.response as AxiosResponse<ErrorResponse>).data));
  }
}

function* signOut() {
  try {
    const { status, data }: AxiosResponse<boolean> = yield call(
      axios.post,
      '/api/auth/signout',
      null,
    );
    if (status === 200) {
      yield put(signOutSuccess(data));
      yield call(logout);
    }
  } catch (error) {
    yield put(authFailure((error.response as AxiosResponse<ErrorResponse>).data));
  }
}

function* onSignUpStart() {
  yield takeLatest(AuthActionTypes.signUpStart, signUp);
}
function* onGetViewerStart() {
  yield takeLatest(AuthActionTypes.getViewerStart, getViewer);
}
function* onSignInStart() {
  yield takeLatest(AuthActionTypes.signInStart, signIn);
}
function* onSignOutStart() {
  yield takeLatest(AuthActionTypes.signOutStart, signOut);
}

export function* authSagas(): SagaIterator<void> {
  yield all([
    call(onSignUpStart),
    call(onGetViewerStart),
    call(onSignInStart),
    call(onSignOutStart),
  ]);
}
