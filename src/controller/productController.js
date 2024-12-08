import { Products } from "../models/product.models.js";
import fs from "fs";
import Papa from "papaparse";

export const createProductController = async (req, res) => {
  try {
    const { productId, productName, totalStock, pricePerUnit } = req.body;
    const admin = req.user;
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
    const products = new Products({
      companyName: admin.companyName,
      productId,
      productName,
      totalStock,
      pricePerUnit,
    });
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
    const employee = req.user
    const products = await Products.find({companyName:employee.companyName});
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

export const uploadCSVController = async (req, res) => {
  try {
    console.log("Entered")
    const file = req.file; // The uploaded file
    const admin = req.user; // Logged-in user, for companyName association

    if (!file) {
      return res.status(400).send({
        success: false,
        message: "No file uploaded",
      });
    }

    // Read the uploaded CSV file
    const csvData = fs.readFileSync(file.path, "utf-8");

    // Parse the CSV data
    const parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    const products = parsedData.data;
    console.log(products)
    // Validate each product
    const invalidRows = [];
    const validProducts = [];

    for (const [index, product] of products.entries()) {
      const { productId, productName, totalStock, pricePerUnit } = product;

      // Validation
      if (!productId || !productName || !totalStock || !pricePerUnit) {
        invalidRows.push({ row: index + 2, error: "Missing required fields" });
        continue;
      }

      // Push valid product with admin's companyName
      validProducts.push({
        companyName: admin.companyName,
        productId,
        productName,
        totalStock: parseInt(totalStock),
        pricePerUnit: parseFloat(pricePerUnit),
      });
    }

    // Save valid products to the database
    const savedProducts = await Products.insertMany(validProducts, { ordered: false });

    // Delete the temporary file
    fs.unlinkSync(file.path);

    res.status(201).send({
      success: true,
      message: "CSV processed successfully",
      savedProducts,
      invalidRows,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate productId errors
      return res.status(400).send({
        success: false,
        message: "Duplicate product IDs found in the CSV file",
        error,
      });
    }
    console.error("Error processing CSV file:", error);
    res.status(500).send({
      success: false,
      message: "Error processing CSV file",
      error,
    });
  }
  finally{
    console.log("Exited")
  }
};