const mongoose= require('mongoose'),
Product=require('../models/product');

const landingPage= (req,res)=>{
    res.render('index');
}
const productPage=(req,res)=>{
    const category=req.params.cat;

    Product.find({category:category})
    .then((results)=>{
        res.render('product_page', {results})
    })
    .catch((err)=>{
        res.redirect('/');
        console.log(err);
    })
}
const productDetails=(req,res)=>{
    const product_id=new mongoose.Types.ObjectId(req.params.pid);
    Product.findOne({_id:product_id})
    .then((result)=>{
        if(!req.session.cart){
            req.session.cart=[]
        }
        res.render('product_details', {result,cart:req.session.cart})
    })
    .catch((err)=>{
        res.send("Could not get result: "+err);
        console.log(err);
    })

}
const searchProduct=(req,res)=>{
    const searchParam=req.body.searchParam;

    Product.find({$or: [{brand:searchParam}, {category:searchParam}]})
    .then((results)=>{
        res.render('search_result', {results, searchParam})
    })
    .catch((err)=>{
        res.redirect('/')
    })
}
const addToCart = (req, res) => {
    const { product_id, productName, price } = req.body;

    // Initialize the cart if it doesn't exist
    if (!req.session.cart) {
        req.session.cart = [];
    }

    let found = false;

    for (let i = 0; i < req.session.cart.length; i++) {
        if (req.session.cart[i].product_id === product_id) {
            req.session.cart[i].quantity += 1;
            found = true;
            break;
        }
    }

    if (!found) {
        const cart_data = {
            product_id: product_id,
            productName: productName,
            price: parseFloat(price),
            quantity: 1
        };
        req.session.cart.push(cart_data);
    }

    res.redirect('/details/' + product_id);
}



const removeItem = (req, res) => {
    const product_id = req.query.id;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    for (let i = 0; i < req.session.cart.length; i++) {
        if (req.session.cart[i].product_id === product_id) {
            req.session.cart.splice(i, 1);
            break;
        }
    }
res.redirect('/details/' + product_id) 
}


module.exports=({landingPage,productPage,productDetails,searchProduct,addToCart,removeItem})