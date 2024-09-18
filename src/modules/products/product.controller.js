import productModel from "../../../dataBase/Models/products/product.model.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import { AppError } from "../../utils/errorClass.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { nanoid } from "nanoid";
import { apiFeatures } from "../../utils/apiFeatures.js";


// ==================================addProduct======================================
export const addProduct = asyncHandler(async (req, res, next) => {
    // Destruct the product details from request body
    const { name, price, discount = 0, quantity } = req.body;

    // Calculate sale price based on discount
    const sale_Price = price - (price * (discount / 100));

    // Ensure that product images are provided
    if (!req.files) {
        return next(new AppError('Please add product image and cover images', 404));
    }

    // Generate a custom ID for organizing images
    const customId = nanoid(5);

    // Upload the main product image to Cloudinary
    const { secure_url: mainImageUrl, public_id: mainImagePublicId } = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: `Assessment/products/${customId}/mainImage`,
    });

    // Upload cover images to Cloudinary and store their URLs and public IDs
    const coverImagesList = [];
    for (const file of req.files.coverImages) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
            folder: `Assessment/products/${customId}/coverImages`,
        });
        coverImagesList.push({ secure_url, public_id });
    }

    // Define the file path for future reference
    req.filePath = `Assessment/products/${customId}`;

    // Generate a URL-friendly slug from the product name
    const slug = slugify(name, { lower: true });

    // Create a new product in the database
    const product = await productModel.create({
        name,
        price,
        quantity,
        image: { secure_url: mainImageUrl, public_id: mainImagePublicId },
        coverImages: coverImagesList,
        customId,
        sale_Price,
        discount,
        slug,
        addedBy: req.user.id,
    });

    // Attach product model and ID to the request object for potential future use
    req.data = {
        model: productModel,
        id: product._id,
    };

    // Respond with success message and the newly created product
    return res.status(201).json({
        message: 'Product added successfully',
        product,
    });
});


// ========================================get all products =========================================
export const getProducts = asyncHandler(async(req,res,next)=>{

    const apiFeature = new apiFeatures(productModel.find(),req.query).search().select().pagination().filter().sort()
    
    const products = await apiFeature.mongooseQuery
    return res.status(200).json({products})
    })



    // ===================================update product====================================
    export const updateProduct = asyncHandler(async (req, res, next) => {
        const { name, price, discount, quantity } = req.body;
        const { id } = req.params;
    
        // Find the product by ID and ensure it belongs to the current user
        const product = await productModel.findOne({ _id: id, addedBy: req.user.id });
        if (!product) {
            return next(new AppError('Product not found', 404));
        }
    
        // Update product name and slug if the name is provided
        if (name) {
            const lowerName = name.toLowerCase();
            if (product.name === lowerName) {
                return next(new AppError('Product name matches the old name', 409));
            }
            if (await productModel.findOne({ name: lowerName })) {
                return next(new AppError('Product name already exists', 409));
            }
            product.name = lowerName;
            product.slug = slugify(lowerName, { lower: true });
        }
    
        // Update product quantity if provided
        if (quantity) {
            product.quantity = quantity;
        }
    
        // Update product price and discount, and calculate sale price
        if (price && discount) {
            product.price = price;
            product.discount = discount;
            product.sale_Price = price - (price * (discount / 100));
        } else if (price) {
            product.price = price;
            product.sale_Price = price - (price * (product.discount / 100));
        } else if (discount) {
            product.discount = discount;
            product.sale_Price = product.price - (product.price * (discount / 100));
        }
    
        // Handling the image uploads if new images are provided
        if (req.files) {
            // Update the   main image if a new one is provided
            if (req.files.image && req.files.image.length > 0) {
                await cloudinary.uploader.destroy(product.image.public_id);
                const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path, {
                    folder: `Assessment/products/${product.customId}/mainImage`,
                });
                product.image = { secure_url, public_id };
            }
    
            // Update the  cover images if new ones are provided
            if (req.files.coverImages && req.files.coverImages.length > 0) {
                const coverImagesList = [];
                await cloudinary.api.delete_resources_by_prefix(`Assessment/products/${product.customId}/coverImages`);
                for (const file of req.files.coverImages) {
                    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                        folder: `Assessment/products/${product.customId}/coverImages`,
                    });
                    coverImagesList.push({ secure_url, public_id });
                }
                product.coverImages = coverImagesList;
            }
        }
    
        // Save the updated product
        await product.save();
    
        // Respond with success message and updated product
        return res.status(200).json({
            message: 'Product updated successfully',
            product,
        });
    });
    
    // ==============================delete product=====================================
export const deleteProduct = asyncHandler(async (req, res,next) => {
    const {id} = req.params    
    const product = await productModel.findOne({_id:id,addedBy:req.user.id})
    if(!product){
        return next(new AppError("Product not found", 404))
        }

        // deleting all images from the cloud
    await cloudinary.api.delete_resources_by_prefix(`Assessment/products/${product.customId}`)
    await cloudinary.api.delete_folder(`Assessment/products/${product.customId}`)
    
    await productModel.deleteOne({_id:id})
    return res.status(201).json({message:"Product is deleted successfully" })
})
