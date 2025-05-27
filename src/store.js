import { applyMiddleware, combineReducers, legacy_createStore as createStore } from 'redux'
import { cartReducer } from './redux-store/CartStore/ducs'
import { thunk } from 'redux-thunk'
// import { composeWithDevTools } from 'redux-devtools-extension'

const initialState = {
  sidebarShow: true,
  theme: 'light',
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}
const rootReducer = combineReducers({
  cart: cartReducer,
  changeState: changeState,
})
const store = createStore(rootReducer, applyMiddleware(thunk))
export default store
