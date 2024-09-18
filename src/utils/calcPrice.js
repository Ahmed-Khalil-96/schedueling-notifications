export const calcPrice = (cart) => {
    let totalPrice = 0;
    let totalPriceAfterDiscount = 0;

    for (const item of cart.products) {
        // Calculate total price before discount
        totalPrice += (item.price * item.quantity);
        // Calculate total price after discount
        totalPriceAfterDiscount += (item.sale_Price * item.quantity);
    }

    return { totalPrice, totalPriceAfterDiscount };
};