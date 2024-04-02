import { proxy, subscribe } from 'valtio'

type CustomizationItems = {
  name: string
  price: number
  quantity: number
  id: number
}

type CartItems = {
  name: string
  price: number
  quantity: number
  productCartId: string
  id?: string
  customizationItems: CustomizationItems[]
  observation: string
}

const persistedCart =
  typeof localStorage !== 'undefined' && localStorage.getItem('cart')
const initialState = persistedCart
  ? JSON.parse(persistedCart)
  : { cart: [], totalPrice: 0 }

export const cartStore = proxy<{ cart: CartItems[] }>(initialState)

subscribe(cartStore, () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cartStore))
  }
})
