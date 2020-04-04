var mongoose = require('mongoose');

var productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        required: true
    },
    quantity: Number,
    status: {
        type: String,
        default: "Active" // 1: Active, 0: InActive
    },
    images: [
        {
            name: String,
            url: String
        }
    ],
    price: Number,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});


productSchema.pre('save', function(next) {
    const product = this;
    if (!product.isModified || !product.isNew) { // don't rehash if it's an old product
        product.updated_at = new Date();
        next();
    } else {
        next();
    }
})

let Fruits = function () {
    const _types = [
        "Apple",
        "Banana",
        "Pear",
        "Orange"
    ];

    const _status = [
        "Active",
        "InActive"
    ]

    return {
        types: _types,
        status: _status
    }
}


// Export Product model
module.exports = {
    Product: mongoose.model('product', productSchema),
    Fruits: Fruits
};