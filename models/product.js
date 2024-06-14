const mongoose = require ('mongoose');
const productSchema= new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    image:{
        data:Buffer,
        contentType:String
    },
    dateAdded:{
        type: Date,
        default:Date.now()
    }

})
module.exports= new mongoose.model('product',productSchema);