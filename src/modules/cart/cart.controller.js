import cartModel from "../../../dataBase/Models/cart/cart.model.js"
import productModel from "../../../dataBase/Models/products/product.model.js"
import { calcPrice} from "../../utils/calcPrice.js"
import { AppError } from "../../utils/errorClass.js"
import { asyncHandler } from "../../utils/errorHandling.js"



// =============================add to cart==============================================================
export const addToCart = asyncHandler(async (req, res, next) => {
    const { product, quantity } = req.body; // Extract product ID and quantity from the request body

    // Check if the product exists
    const productExist = await productModel.findById(product);
    if (!productExist) {
        return next(new AppError('Product not found', 404));
    }

    // Ensure requested quantity does not exceed available stock
    if (quantity > productExist.quantity) {
        return next(new AppError('Cart quantity exceeds stock', 400));
    }

    // Find the user's cart
    let cart = await cartModel.findOne({ user: req.user.id });

    if (!cart) {
        // Create a new cart if one does not exist
        const newCart = await cartModel.create({
            user: req.user.id,
            products: [{
                name: productExist.name,
                productId: product,
                quantity,
                price: productExist.price,
                discount: productExist.discount,
                sale_Price: productExist.sale_Price
            }],
            totalPrice: quantity * productExist.price,
            totalPriceAfterDiscount: quantity * productExist.sale_Price
        });

        return res.status(201).json(newCart);
    } else {
        // Update existing cart
        let productFound = false;

        for (const item of cart.products) {
            if (item.productId.toString() === product) { // Ensure proper comparison with ObjectId
                item.quantity += quantity;
                productFound = true;

                // Check if updated quantity exceeds stock
                if (item.quantity > productExist.quantity) {
                    item.quantity -= quantity; // Revert the quantity
                    return next(new AppError('Cart quantity exceeds stock', 400));
                }
                break;
            }
        }

        // Add the product if it is not already in the cart
        if (!productFound) {
            cart.products.push({
                name: productExist.name,
                productId: product,
                quantity,
                price: productExist.price,
                sale_Price: productExist.sale_Price
            });
        }
    }

    // Recalculate total prices
    const { totalPrice, totalPriceAfterDiscount } = calcPrice(cart);
    cart.totalPrice = totalPrice;
    cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

    // Save the updated cart
    await cart.save();

    // Respond with the updated cart
    return res.status(200).json(cart);
});
// =====================================update product quantity===============================================


export const updateQuantity = asyncHandler(async (req, res, next) => {
    const { id } = req.params; // Product ID
    const { quantity } = req.body; // New quantity

    // Check if the product exists
    const productExist = await productModel.findById(id);
    if (!productExist) {
        return next(new AppError('Product not found', 404));
    }

    // Ensure the requested quantity does not exceed available stock
    if (quantity > productExist.quantity) {
        return next(new AppError('Cart quantity exceeds stock', 400));
    }

    // Find the user's cart
    const cart = await cartModel.findOne({ user: req.user.id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    // Update the quantity of the specified product in the cart
    let productFound = false;
    for (const product of cart.products) {
        if (product.productId.toString() === id) {
            product.quantity = quantity;
            productFound = true;
            break;
        }
    }

    if (!productFound) {
        return next(new AppError('Product not found in the cart', 404));
    }

    // Recalculate total prices
    const { totalPrice, totalPriceAfterDiscount } = calcPrice(cart);
    cart.totalPrice = totalPrice;
    cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

    // Save the updated cart
    await cart.save();

    // Respond with the updated cart
    return res.status(200).json(cart);
});

// ==============================================removeCartItem=================================================

export const removeItem = asyncHandler(async (req, res, next) => {
    const { id } = req.params; // Extract product ID from request parameters

    // Remove the specified product from the user's cart
    const cart = await cartModel.findOneAndUpdate(
        { user: req.user.id },
        { $pull: { products: { productId: id } } },
        { new: true }
    );

    // Handle case where cart is not found
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    // Recalculate total price and total price after discount
    const { totalPrice, totalPriceAfterDiscount } = calcPrice(cart);
    cart.totalPrice = totalPrice;
    cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

    // Save the updated cart
    await cart.save();

    // Respond with the updated cart
    return res.status(200).json(cart);
});

// ====================================get logged user cart==================================

export const getUserCart = asyncHandler(async (req, res, next) => {
    // Fetch the user's cart
    const cart = await cartModel.findOne({ user: req.user.id });

    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    // Initialize total price calculations
    cart.totalPrice = 0;
    cart.totalPriceAfterDiscount = 0;

    // Update cart with latest product details
    for (const item of cart.products) {
        // Retrieve the latest product details
        const product = await productModel.findById(item.productId).select('name price sale_Price discount');

        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        // Update product details in the cart
        item.name = product.name;
        item.price = product.price;
        item.sale_Price = product.sale_Price;
        item.discount = product.discount;

        // Calculate total price and total price after discount
        cart.totalPrice += item.price * item.quantity;
        cart.totalPriceAfterDiscount += item.sale_Price * item.quantity;
    }

    // Save the updated cart
    await cart.save();

    // Respond with the updated cart
    return res.status(200).json({
        cart,
    });
});

//================== ===================clear cart =============================================
export const clearCart = asyncHandler(async(req,res,next)=>{
    const cart = await cartModel.findOneAndDelete({user:req.user.id},{new:true})
    if(!cart){
        return next(new AppError('Cart not found',404))
        }
        return res.status(200).json({message:'cart cleared successfully'})
})

