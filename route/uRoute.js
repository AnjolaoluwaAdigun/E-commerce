const express= require('express');
const router=express.Router();

const {landingPage, searchProduct,productPage,productDetails, addToCart, removeItem}=require('../controller/uController');

router.get('/',landingPage);
router.get('/product/:cat', productPage);
router.get('/details/:pid', productDetails);
router.post('/search',searchProduct);
router.post('/add_cart',addToCart);
router.get('/remove_item', removeItem);

module.exports=router;