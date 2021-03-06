import { createActions, handleActions } from 'redux-actions';
import axios from 'axios';

const defaultState = {
  subdomain: '', // The VICE subdomain we're working with.
  job: '',       // The job UUID from the database.
  ready: false,

  // entities contains the objects retrieved from the server stored in a map
  // for easy reference in other objects.
  entities : {

    // updates contains the job status updates returned by the server. An
    // individual status update looks like the following:
    // {
    //   status: '',  one of Running, Completed, Failed, Submitted, Canceled
    //   message: '', the actual message from the job
    //   sentOn: ''   the date the message was sent, as milliseconds since the epoch
    // }
    updates: {},
  }
}

// Synchronous actions.
export const { addUpdate, setSubdomain, getJob, setJob, setReady } = createActions({
  ADD_UPDATE:      (update = {})    => update,
  SET_SUBDOMAIN:   (subdomain = '') => subdomain,
  GET_JOB:         (subdomain = '') => subdomain,
  SET_JOB:         (job = '')       => job,
  SET_READY:       (ready = false)  => ready
});


// Async actions that dispatch actions defined above, so it needs to be set up
// separately.
export let fetchUpdates = () => {
  return dispatch => {
    let searchParams = new URLSearchParams(window.location.search);
    return axios.get(`/api/jobs/status-updates?url=${searchParams.get('url')}`).then(
      response => response.data.job_status_updates.forEach(i => dispatch(addUpdate(i)))
    ).catch(function(error) {
      console.log('error from server: ', error.message);
    });
  };
}

export const checkURLReady = () => {
  return dispatch => {
    let searchParams = new URLSearchParams(window.location.search);
    return axios.get(`/api/url-ready?url=${searchParams.get('url')}`).then(
      response => dispatch(setReady(response.data.ready))
    ).catch(function(error) {
      console.log('error from server: ', error.message);
    });
  };
}

export const reducer = handleActions(
  {
    ADD_UPDATE: (state, action) => {
      return Object.assign({}, state, {
        entities: Object.assign({}, state.entities, {
          updates: Object.assign({}, state.entities.updates, {
            [Object.keys(state.entities.updates).length]: action.payload
          })
        })
      });
    },
    SET_SUBDOMAIN: (state, action) => {
      return Object.assign({}, state, {
        subdomain: action.payload
      });
    },
    SET_JOB: (state, action) => {
      return Object.assign({}, state, {
        job: action.payload
      });
    },
    SET_READY: (state, action) => {
      return Object.assign({}, state, {
        ready: action.payload
      });
    }
  },
  defaultState
)
