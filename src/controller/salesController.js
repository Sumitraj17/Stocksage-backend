import { Sales } from "../models/sales.models.js";

export const createSaleController = async (req, res) => {
  try {
    const { productId, customerId, unitsSold, date } = req.body;
    switch (true) {
      case !productId:
        return res.status(500).send({ error: "Product ID is required" });
      case !customerId:
        return res.status(500).send({ error: "Customer ID is required" });
      case !unitsSold:
        return res.status(500).send({ error: "Units Sold is required" });
      case !date:
        return res.status(500).send({ error: "Date is required" });
    }

    const sale = new Sales(req.body);
    await sale.save();
    res.status(201).send({
      success: true,
      message: "Sale record created successfully",
      sale,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating sale record",
    });
  }
};
