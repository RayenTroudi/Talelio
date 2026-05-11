import {createSlice} from "@reduxjs/toolkit"
import Cookies from "js-cookie"

const initialState =  Cookies.get("cart")
?{...JSON.parse(Cookies.get("cart")) , loading:false}
:{
    loading:false,
    CartItems:[],
    showSidebar:false,
    qty: 1,
    shippingAddress:{},
    appliedPromoCode: null as string | null,
    promoCodeId: null as string | null,
};


const addDecimals = (num:number) => {
    return(Math.round(num * 100)/ 100).toFixed(2)
}

/** Recalculates itemsPrice, shippingPrice and totalPrice in-place. */
const recalcPrices = (state: any) => {
    state.itemsPrice = addDecimals(
        state.CartItems.reduce((acc:any, item:any) => acc + item.Price * item.qty, 0)
    )
    state.shippingPrice = 0
    state.totalPrice = addDecimals(
        Number(state.itemsPrice) + Number(state.shippingPrice)
    )
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
            
            recalcPrices(state)
            state.loading = false
            Cookies.set("cart", JSON.stringify(state))
            state.showSidebar = true
        },

        buyNowItem:(state:any, action:any) => {
            const item = action.payload
            const existItem = state.CartItems.find((x:any) => x.id === item.id && x.size === item.size)
            
            if(existItem) {
                state.CartItems = state.CartItems.map((x:any) => 
                    x.id === existItem.id && x.size === existItem.size ? item : x
                )
            } else {
                state.CartItems = [...state.CartItems, item]
            }
            
            recalcPrices(state)
            state.loading = false
            Cookies.set("cart", JSON.stringify(state))
            state.showSidebar = false
        },

        toggleCartSidebar:(state:any) => {
            state.showSidebar = !state.showSidebar
        },
 
        removeFromCart:(state:any, action:any) => {
            state.CartItems = state.CartItems.filter((x:any) => x.id !== action.payload)
            recalcPrices(state)
            state.loading = false
            Cookies.set("cart", JSON.stringify(state))
        },

        saveShippingAddress:(state:any, action:any) => {
            state.shippingAddress = action.payload
            
            // Shipping is always free
            state.shippingPrice = 0
            
            // Recalculate total with new shipping price
            if(state.itemsPrice) {
                state.totalPrice = addDecimals(
                    Number(state.itemsPrice) + Number(state.shippingPrice)
                )
            }
            
            Cookies.set("cart" , JSON.stringify(state))
        },

        setPromoCode:(state:any, action:any) => {
            // Record which referral code was applied — no discount for buyer
            const { code, promoCodeId } = action.payload
            state.appliedPromoCode = code
            state.promoCodeId = promoCodeId
            Cookies.set("cart", JSON.stringify(state))
        },

        clearPromoCode:(state:any) => {
            state.appliedPromoCode = null
            state.promoCodeId = null
            Cookies.set("cart", JSON.stringify(state))
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
            state.appliedPromoCode = null
            state.promoCodeId = null
            Cookies.remove("cart")
        }
    }
})

export const {addToCart, buyNowItem, toggleCartSidebar, removeFromCart, hideloading, saveShippingAddress, clearCart, setPromoCode, clearPromoCode} = CartSlice.actions
export default CartSlice.reducer