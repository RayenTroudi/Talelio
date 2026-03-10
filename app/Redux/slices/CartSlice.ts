import {createSlice} from "@reduxjs/toolkit"
import Cookies from "js-cookie"

const initialState =  Cookies.get("cart")
?{...JSON.parse(Cookies.get("cart")) , loading:false}
:{
    loading:false,
    CartItems:[],
    showSidebar:false,
    qty: 1,
    shippingAddress:{}
};


const addDecimals = (num:number) => {
    return(Math.round(num * 100)/ 100).toFixed(2)
}

const CartSlice = createSlice({
    name:"Cart",
    initialState,
    reducers: {
        addToCart:(state:any, action:any) => {
            const item = action.payload
            const existItem = state.CartItems.find((x:any) => x.id === item.id && x.size === item.size)
            
            if(existItem) {
                state.CartItems = state.CartItems.map((x:any) => 
                    x.id === existItem.id && x.size === existItem.size ? item : x
                )
            } else {
                state.CartItems = [...state.CartItems, item]
            }
            
            // Calculate itemsPrice (subtotal)
            state.itemsPrice = addDecimals(state.CartItems.reduce((acc:any, item:any) => acc + (item.Price) * (item.qty), 0))
            
            // Calculate delivery fee based on gouvernorat
            // Free for Nabeul, 8 DT for all others
            const gouvernorat = state.shippingAddress?.gouvernorat || ''
            state.shippingPrice = gouvernorat === 'Nabeul' ? 0 : (gouvernorat ? 8 : 0)
            
            // Calculate total (no tax)
            state.totalPrice = addDecimals(
                Number(state.itemsPrice) + Number(state.shippingPrice)
            )
            
            // Set loading to false to show the cart items
            state.loading = false
            
            Cookies.set("cart", JSON.stringify(state))
            state.showSidebar = true
        },

        toggleCartSidebar:(state:any) => {
            state.showSidebar = !state.showSidebar
        },
 
        removeFromCart:(state:any, action:any) => {
            state.CartItems = state.CartItems.filter((x:any) => x.id !== action.payload)
            
            // Recalculate itemsPrice
            state.itemsPrice = addDecimals(state.CartItems.reduce((acc:any, item:any) => acc + (item.Price) * (item.qty), 0))

            // Recalculate delivery fee
            const gouvernorat = state.shippingAddress?.gouvernorat || ''
            state.shippingPrice = gouvernorat === 'Nabeul' ? 0 : (gouvernorat ? 8 : 0)
            
            // Recalculate total (no tax)
            state.totalPrice = addDecimals(
                Number(state.itemsPrice) + Number(state.shippingPrice)
            )
            
            // Keep loading false
            state.loading = false
            
            Cookies.set("cart", JSON.stringify(state))
        },

        saveShippingAddress:(state:any, action:any) => {
            state.shippingAddress = action.payload
            
            // Recalculate delivery fee when gouvernorat changes
            const gouvernorat = action.payload.gouvernorat || ''
            state.shippingPrice = gouvernorat === 'Nabeul' ? 0 : (gouvernorat ? 8 : 0)
            
            // Recalculate total with new shipping price
            if(state.itemsPrice) {
                state.totalPrice = addDecimals(
                    Number(state.itemsPrice) + Number(state.shippingPrice)
                )
            }
            
            Cookies.set("cart" , JSON.stringify(state))
        },
        hideloading:(state:any) => {
            state.loading = false
        },
        clearCart:(state:any) => {
            state.CartItems = []
            state.itemsPrice = 0
            state.shippingPrice = 0
            state.totalPrice = 0
            state.shippingAddress = {}
            Cookies.remove("cart")
        }
    }
})

export const {addToCart, toggleCartSidebar, removeFromCart, hideloading, saveShippingAddress, clearCart} = CartSlice.actions
export default CartSlice.reducer