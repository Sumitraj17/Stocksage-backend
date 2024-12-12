import mongoose from "mongoose";

const storeForecastSchema = new mongoose.Schema({
    companyName:{
        type:String
    },
    storeId:{
        type:Number,
    },
    productId:{
        type:Number,
    },
    product_name:{
        type:String
    },
    month:{
        type:String,
    },
    location:{
        type:String,
    },
    predicted_unit:{
        type:Number
    }

},{timestamps:true})

export const Forecast = mongoose.model("Forecast",storeForecastSchema)


// "store": 1,
//             "item": 1,
//             "product_name": "Laptop",
//             "month": "December",
//             "location": "Koramangala",
//             "total_unitSold": 1040.8468408937485