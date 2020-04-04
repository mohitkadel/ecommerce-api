var mongoose = require('mongoose');

var couponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    discount: Number,
    exp_time: String,
    quantity: Number,
    status: {
        type: Number,
        default: 1 // 1: Active, 0: InActive
    },
    rules: [
        {
            product_type: String,
            product_quantity: Number
        }
    ],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});


couponSchema.pre('save', function(next) {
    const coupon = this;
    if (!coupon.isModified || !coupon.isNew) { // don't rehash if it's an old user
        next();
    } else {
        next();
    }
})

// Export Product model
module.exports = mongoose.model('coupon', couponSchema);