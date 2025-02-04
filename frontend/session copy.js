import { csrfFetch } from './csrf';

// Action Types
const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

// Action Creators
const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER
});

// Thunk Action Creators
export const login = (credentials) => async dispatch => {
  const { credential, password } = credentials;
  const response = await csrfFetch('/api/session', {
    method: 'POST',
    body: JSON.stringify({ credential, password })
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data.user));
    return data;
  }
  
  throw response;
};

export const restoreUser = () => async dispatch => {
  const response = await csrfFetch('/api/session');
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const signup = (user) => async dispatch => {
  const response = await csrfFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(user)
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data.user));
    return data;
  }
  
  throw response;
};

export const logout = () => async dispatch => {
  const response = await csrfFetch('/api/session', {
    method: 'DELETE'
  });
  dispatch(removeUser());
  return response;
};

// Reducer
const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
};

export default sessionReducer;