import { Forecast } from "../models/store.forecast.model.js";

export const getStoreForecast = async (req, res) => {
  try {
    const employee = req.user;
    const company = employee.companyName;
    const { location } = req.body;

    const details = await Forecast.find({
      companyName: company,
      location: location,
    });
    return res.status(200).json({
        status:"Success",
        message:"Fetch Successful",
        data:details
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
        status:"Internal Server Error",
        message:"Something went worng"
    })
  }
};


export const getProdcutForecast = async (req, res) => {
    try {
      const employee = req.user;
      const company = employee.companyName;
      const { productName } = req.body;
  
      const details = await Forecast.find({
        companyName: company,
        product_name:productName
      });
      return res.status(200).json({
          status:"Success",
          message:"Fetch Successful",
          data:details
      })
    } catch (error) {
        console.log(error)
      return res.status(500).json({
          status:"Internal Server Error",
          message:"Something went worng"
      })
    }
  };

export const getStoreProduct = async(req,res)=>{
    try {
        const stores = new Set();
        const products = new Set();
        const company = (req.user).companyName
        const details = await Forecast.find({companyName:company}).select("product_name location")
        details.forEach((item)=>{
            stores.add(item.location);
            products.add(item.product_name)
        })

        return res.status(200).json({
            status:"Success",
            message:"Fetch Successful",
            data:{
                stores:Array.from(stores),
                products:Array.from(products)
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status:"Internal Server Error",
            message:"Something went worng"
        })
    }
}