import { Sales } from "../models/sales.models.js";
import { Products } from "../models/product.models.js";

export const highlights = async (req, res) => {
  try {
    const employee = req.user;
    const company = employee.companyName;

    const sales = await Sales.find({ companyName: company });
    const product = await Products.find({ companyName: company });
    const products = new Set();
    const customer = new Set();
    let totalItems = 0;

    sales.forEach((item) => {
      customer.add(item.customerId);
      totalItems += item.unitsSold;
    });
    product.forEach((item) => {
      products.add(item.productId);
    });

    return res.status(200).json({
      status: "Success",
      message: "Successful fetch",
      data: {
        totalProduct: products.size,
        totalCustomer: customer.size,
        totalItems,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Internal Server Error",
      message: "Something went wrong",
    });
  }
};

export const productDetails = async (req, res) => {
  try {
    const employee = req.user;
    const products = await Products.find({ companyName: employee.companyName });
    const sales = await Sales.find({ companyName: employee.companyName });

    const result = [];

    products.forEach((item) => {
      const id = item.productId;
      const sale = sales.filter((element) => {
        return element.productId === id;
      });
      let unit = 0,
        profit = 0;
      sale.forEach((i) => {
        unit += i.unitsSold;
        profit += i.sales;
      });

      result.push({
        "Unit Sold": unit,
        "Total Sales":profit,
        "Total Stock": item.totalStock,
        "Product ID":id,
        "Product Name":item.productName,
      });
    });

    // console.log(result);
    return res.status(200).json({status:"Success",message:"Successful fetch",result})
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        status: "Internal Server Error",
        message: "Something went wrong",
      });
  }
};
