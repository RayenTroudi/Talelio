import { configureStore } from "@reduxjs/toolkit";
import CartSliceReducer from "./slices/CartSlice"

export const store = configureStore({
    reducer:{
        Cart:CartSliceReducer,

    },
    devTools:process.env.NODE_ENV !== "production"

})