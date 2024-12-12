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
    const { productName, totalStock, pricePerUnit,storeId } = req.body;

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
      { productId ,storeId},
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
    const employee = req.user;  // Get the employee's company name
    const products = await Products.aggregate([
      {
        $match: {
          companyName: employee.companyName, // Filter by company name
        },
      },
      {
        $group: {
          _id: "$productId", // Group by productId to ensure uniqueness
          productName: { $first: "$productName" }, // Keep the first productName
          totalStock: { $first: "$totalStock" }, // Keep the first totalStock
          pricePerUnit: { $first: "$pricePerUnit" }, // Keep the first pricePerUnit
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id from the result
          productId: "$_id", // Rename _id to productId
          productName: 1,
          totalStock: 1,
          pricePerUnit: 1,
        },
      },
    ]);

    // Fetch all unique stores
    const stores = await Products.aggregate([
      {
        $match: {
          companyName: employee.companyName, // Filter by company name
        },
      },
      {
        $group: {
          _id: "$storeId", // Group by storeId to ensure uniqueness
          location: { $first: "$location" }, // Keep the first location for each storeId
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id from the result
          storeId: "$_id", // Rename _id to storeId
          location: 1,
        },
      },
    ]);

    // Send the response with both the products and stores
    res.status(200).send({
      success: true,
      message: "Products and stores fetched successfully",
      products,
      stores,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching products and stores",
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
      const { productId, productName, totalStock, pricePerUnit, storeId,location,storeStock
      } = product;

      // Validation
      if (!productId || !productName || !totalStock || !pricePerUnit || !storeId || !storeStock || !location) {
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
        storeId,
        location,
        storeStock
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


export const fetchStoreStock = async(req,res)=>{
  try{
    const employee = req.user;
    const {location} = req.body;
    const products = await Products.find({
      companyName:employee.companyName,
      location:location
    }).select("productId productName storeStock location storeId pricePerUnit");

    return res.status(200).json({
      status:"Success",
      message:"Fetch Successful",
      products
    })
  }
  catch(error){
    console.log(error)
    return res.status(500).json({status:"Internal Server Error",message:"Something went wrong"});
  }
}