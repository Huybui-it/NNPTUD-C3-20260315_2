var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventory');

// get all
router.get('/', async function (req, res, next) {
    try {
        let result = await inventoryModel.find().populate('product');
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// get inventory by ID
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findById(id).populate('product');
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "Inventory NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Add_stock
router.post('/add_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null || quantity <= 0) {
            return res.status(400).send({ message: "Invalid product ID or quantity" });
        }
        
        // Find inventory by product ID and increment stock
        let updatedInventory = await inventoryModel.findOneAndUpdate(
            { product: product },
            { $inc: { stock: quantity } },
            { new: true }
        );
        
        if (updatedInventory) {
            res.send(updatedInventory);
        } else {
            res.status(404).send({ message: "Inventory for this product NOT FOUND" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Remove_stock
router.post('/remove_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null || quantity <= 0) {
            return res.status(400).send({ message: "Invalid product ID or quantity" });
        }
        
        // Find inventory to check current stock
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory for this product NOT FOUND" });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Not enough stock to remove" });
        }
        
        // Decrement stock
        inventory.stock -= quantity;
        await inventory.save();
        
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// reservation
router.post('/reservation', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null || quantity <= 0) {
            return res.status(400).send({ message: "Invalid product ID or quantity" });
        }
        
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory for this product NOT FOUND" });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Not enough stock for reservation" });
        }
        
        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();
        
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// sold
router.post('/sold', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null || quantity <= 0) {
            return res.status(400).send({ message: "Invalid product ID or quantity" });
        }
        
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory for this product NOT FOUND" });
        }
        if (inventory.reserved < quantity) {
            return res.status(400).send({ message: "Not enough reserved items to mark as sold" });
        }
        
        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();
        
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
