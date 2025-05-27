const initialState = {
  items: [],
}
const cartactionTypes = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  INCREASE_COUNT: 'INCREASE_COUNT',
  DECREASE_COUNT: 'DECREASE_COUNT',
  LOAD_CART: 'LOAD_CART',
  CLEAR_CART: 'CLEAR_CART',
}

export const addToCart = (product) => (dispatch, getState) => {
  dispatch({
    type: cartactionTypes.ADD_TO_CART,
    payload: product,
  })
  localStorage.setItem('cart', JSON.stringify(getState().cart.items))
}

export const removeFromCart = (productId) => (dispatch, getState) => {
  dispatch({
    type: cartactionTypes.REMOVE_FROM_CART,
    payload: productId,
  })
  localStorage.setItem('cart', JSON.stringify(getState().cart.items))
}

export const increaseCount = (productId) => (dispatch, getState) => {
  dispatch({
    type: cartactionTypes.INCREASE_COUNT,
    payload: productId,
  })
  localStorage.setItem('cart', JSON.stringify(getState().cart.items))
}

export const decreaseCount = (productId) => (dispatch, getState) => {
  dispatch({
    type: cartactionTypes.DECREASE_COUNT,
    payload: productId,
  })
  localStorage.setItem('cart', JSON.stringify(getState().cart.items))
}

export const loadCart = () => (dispatch) => {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || []
  dispatch({
    type: cartactionTypes.LOAD_CART,
    payload: cartItems,
  })
}

export const clearCart = () => (dispatch) => {
  dispatch({
    type: cartactionTypes.CLEAR_CART,
  })
  localStorage.removeItem('cart')
}

export const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case cartactionTypes.LOAD_CART:
      return {
        ...state,
        items: action.payload,
      }
    case cartactionTypes.ADD_TO_CART:
      const existingItem = state.items.find((item) => item._id === action.payload._id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item._id === action.payload._id ? { ...item, count: item.count + 1 } : item,
          ),
        }
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, count: 1 }],
        }
      }
    case cartactionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        items: state.items.filter((item) => item._id !== action.payload),
      }
    case cartactionTypes.INCREASE_COUNT:
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === action.payload ? { ...item, count: item.count + 1 } : item,
        ),
      }
    case cartactionTypes.DECREASE_COUNT:
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === action.payload && item.count > 1 ? { ...item, count: item.count - 1 } : item,
        ),
      }
    case cartactionTypes.CLEAR_CART:
      return {
        ...state,
        items: [],
      }
    default:
      return state
  }
}

// src/store/cart/selectors.js

// Selector to get all cart items
export const selectCartItems = (state) => state.cart.items

// Selector to get the total count of items in the cart
export const selectCartItemCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.count, 0)

// Selector to get the subtotal (sum of price * count) of items in the cart
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.count, 0)

// Selector to check if a specific product is already in the cart
export const selectIsProductInCart = (productId) => (state) =>
  state.cart.items.some((item) => item._id === productId)
