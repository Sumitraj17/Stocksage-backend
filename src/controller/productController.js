import { Products } from "../models/product.models.js";

export const createProductController = async (req, res) => {
  try {
    const { productId, productName, totalStock, pricePerUnit } = req.body;
    switch (true) {
      case !productId:
        return res.status(500).send({ error: "Product ID is required" });
      case !productName:
        return res.status(500).send({ error: "Product Name is required" });
      case !totalStock:
        return res.status(500).send({ error: "Total Stock is required" });
      case !pricePerUnit:
        return res.status(500).send({ error: "Price is required" });
    }
    const products = new Products(req.body);
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating product",
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { productId } = req.params;
    const { productName, totalStock, pricePerUnit } = req.body;

    switch (true) {
      case !productId:
        return res.status(500).send({ error: "Product ID is required" });
      case !productName:
        return res.status(500).send({ error: "Product Name is required" });
      case !totalStock:
        return res.status(500).send({ error: "Total Stock is required" });
      case !pricePerUnit:
        return res.status(500).send({ error: "Price per Unit is required" });
    }

    const updatedProduct = await Products.findOneAndUpdate(
      { productId },
      { productName, totalStock, pricePerUnit },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send({ error: "Product not found" });
    }

    res.status(200).send({
      success: true,
      message: "Product Updated Successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating product",
    });
  }
};

export const getProductController = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Products.findOne({ productId });

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    res.status(200).send({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching product",
    });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const products = await Products.find();

    if (!products || products.length === 0) {
      return res.status(404).send({ message: "No products found" });
    }

    res.status(200).send({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching products",
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { productId } = req.params;

    const deletedProduct = await Products.findOneAndDelete({ productId });

    if (!deletedProduct) {
      return res.status(404).send({ error: "Product not found" });
    }

    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting product",
    });
  }
};
