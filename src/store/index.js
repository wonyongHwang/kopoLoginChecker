import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

// import example from './module-example'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */
import {auth} from "src/boot/firebase"

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      // example
    },
    state: {
      editable:true,
      fireUser:null,
      fireError:null
    },
    actions: {
      signOutAction({commit}) {
        auth.signOut()
          .then(() => {
            commit("setFireUser", null);
          })
          .catch(error => {
            commit("setFireError", error.message);
          });
      },
      authAction({ commit }) {
        auth.onAuthStateChanged(user => {
          if (user) {
            commit("setFireUser", user);
          } else {
            commit("setFireUser", null);
          }
        });
      },
    },
    getters: {
      getFireUser(state) {
        return state.fireUser;
      },
      isUserAuth(state) {
        return !!state.fireUser;
      },
      getFireError(state) {
        return state.fireError;
      }
    },
    mutations: {
      setEdit(state, edit){
        state.editable = edit
      },
      setFireUser(state, firebaseUser){
        state.fireUser = firebaseUser
      },
      setFireError(state, payload) {
        state.fireError = payload
      }
    },
    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  return Store
})
