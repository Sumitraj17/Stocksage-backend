import fs from "fs";
import { PassThrough } from "stream";
import csv from "csv-parser"; // Library to parse CSV files
import moment from "moment"; // For robust date parsing
import { Sales } from "../models/sales.models.js"; // MongoDB model for the `Sales` collection
import path from "path";
import axios from "axios";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import PDFDocument from "pdfkit";
import FormData from "form-data";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Forecast } from "../models/store.forecast.model.js";
const __filepath = fileURLToPath(import.meta.url);
const __dirname = dirname(__filepath);
export const createSaleController = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "CSV file is required" });
    }

    const csvFilePath = req.file.path;
    console.log("Uploaded CSV File Path:", csvFilePath);
    const employee = req.user;
    const salesData = [];

    // Read and parse the CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv()) // Parse CSV file into JSON objects
      .on("data", (row) => {
        try {
          // Extract and validate fields from the row
          const {
            id,
            date,
            store, // Assuming these are column names in the CSV
            item,
            unitSold,
            sales,
            product_name,
            customer_name,
          } = row;

          // Validate required fields
          if (!date || !item || !sales || !customer_name) {
            return; // Skip invalid rows
          }

          // Parse the date using moment.js for the `DD-MM-YYYY` format
          const parsedDate = moment(date.trim(), "DD-MM-YYYY", true);
          if (!parsedDate.isValid()) {
            console.warn(`Invalid date format in row: ${JSON.stringify(row)}`);
            return; // Skip rows with invalid dates
          }

          // Map and clean the data for MongoDB
          salesData.push({
            id: id,
            date: parsedDate.toDate(), // Convert moment date to JavaScript Date
            storeId: store?.trim() || null,
            productId: item.trim(),
            unitsSold: parseInt(unitSold.trim(), 10), // Convert `sales` to a number
            sales: parseInt(sales.trim(), 10),
            productName: product_name?.trim() || null,
            customerId: customer_name.trim(),
            companyName: req.user?.companyName || "Default Company", // Default value for company
            filePath: csvFilePath,
          });
        } catch (rowError) {
          console.error("Error processing row:", row, rowError);
        }
      })
      .on("end", async () => {
        try {
          // Insert all valid sales data into MongoDB
          const savedRecords = await Sales.insertMany(salesData);

          // Cleanup: Delete the uploaded CSV file
          // fs.unlinkSync(csvFilePath);

          res.status(201).json({
            success: true,
            message: "Sales records processed successfully",
            records: savedRecords,
          });
        } catch (dbError) {
          console.error("Error saving data to MongoDB:", dbError);

          // Cleanup: Delete the uploaded CSV file
          fs.unlinkSync(csvFilePath);

          res.status(500).json({
            success: false,
            error: dbError.message,
            message: "Failed to save sales data to MongoDB",
          });
        }
      })
      .on("error", (error) => {
        console.error("Error processing CSV file:", error);

        // Cleanup: Delete the uploaded CSV file
        fs.unlinkSync(csvFilePath);

        res.status(500).json({
          success: false,
          error: error.message,
          message: "Error processing CSV file",
        });
      });
  } catch (error) {
    console.error("Error:", error);

    // Cleanup: Remove the uploaded file if an error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error processing request",
    });
  }
};

export const updatedcreateSaleController = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "CSV file is required" });
    }

    const csvFilePath = req.file.path;
    console.log("Uploaded CSV File Path:", csvFilePath);

    const salesData = new Map(); // To aggregate data by product and month

    // Read and parse the CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv()) // Parse CSV file into JSON objects
      .on("data", (row) => {
        try {
          // Extract and validate fields from the row
          const {
            id,
            date,
            item, // Assuming this is the ProductID in the CSV
            unitSold,
            sales,
            product_name,
          } = row;

          // Validate required fields
          if (!date || !item || !unitSold || !sales) {
            return; // Skip invalid rows
          }

          // Parse the date using moment.js for the `DD-MM-YYYY` format
          const parsedDate = moment(date.trim(), "YYYY-MM-DD", true);
          if (!parsedDate.isValid()) {
            console.warn(`Invalid date format in row: ${JSON.stringify(row)}`);
            return; // Skip rows with invalid dates
          }

          // Extract the month as `YYYY-MM`
          const month = parsedDate.format("YYYY-MM");

          // Prepare the key for grouping
          const key = `${item.trim()}_${month}`;

          // Aggregate data
          if (!salesData.has(key)) {
            salesData.set(key, {
              productId: item.trim(),
              productName: product_name?.trim() || null,
              unitsSold: parseInt(unitSold.trim(), 10), // Fix field name here
              sales: parseInt(sales.trim(), 10),
              month,
              companyName: req.user?.companyName || "Default Company", // Default value for company
              filePath: csvFilePath,
            });
          } else {
            const existingData = salesData.get(key);
            existingData.unitsSold += parseInt(unitSold.trim(), 10); // Fix field name here
            existingData.sales += parseInt(sales.trim(), 10);
            salesData.set(key, existingData);
          }
        } catch (rowError) {
          console.error("Error processing row:", row, rowError);
        }
      })
      .on("end", async () => {
        try {
          // Prepare final aggregated data
          const aggregatedSalesData = Array.from(salesData.values());

          // Insert all valid aggregated sales data into MongoDB
          const savedRecords = await Sales.insertMany(aggregatedSalesData);

          // Cleanup: Delete the uploaded CSV file
          // fs.unlinkSync(csvFilePath);

          res.status(201).json({
            success: true,
            message: "Sales records processed successfully",
            records: savedRecords,
          });
        } catch (dbError) {
          console.error("Error saving data to MongoDB:", dbError);

          // Cleanup: Delete the uploaded CSV file
          fs.unlinkSync(csvFilePath);

          res.status(500).json({
            success: false,
            error: dbError.message,
            message: "Failed to save sales data to MongoDB",
          });
        }
      })
      .on("error", (error) => {
        console.error("Error processing CSV file:", error);

        // Cleanup: Delete the uploaded CSV file
        fs.unlinkSync(csvFilePath);

        res.status(500).json({
          success: false,
          error: error.message,
          message: "Error processing CSV file",
        });
      });
  } catch (error) {
    console.error("Error:", error);

    // Cleanup: Remove the uploaded file if an error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error processing request",
    });
  }
};

export const getAllSalesDetails = async (req, res) => {
  try {
    const employee = req.user;
    const sales = await Sales.find({ companyName: employee.companyName });
    return res
      .status(200)
      .json({ status: "Success", message: "Fetch Successful", sales });
  } catch (error) {
    return res.status(500).json({
      status: "Internal Server Error",
      message: "Something went wrong",
    });
  }
};

export const forecasting = async (req, res) => {
  try {
    const employee = req.user;
    const company = employee.companyName;

    // Check if a file is uploaded (new data) or if the old file is to be used
    let filePath = null;
    console.log(req.file);
    if (req.file) {
      // If a new file is uploaded, save it and use its path
      const uploadedFile = req.file; // Assume the file is available in req.file (from multer)
      filePath = uploadedFile.path;
      console.log(filePath);
    } else {
      // If no file is uploaded, fetch the file path from the database (old data)
      const salesRecord = await Sales.findOne({ companyName: company });
      if (salesRecord && salesRecord.filePath) {
        filePath = salesRecord.filePath;
      }
    }

    // If no file path is found, return an error
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ error: "CSV file not found" });
    }

    // Create a FormData instance and attach the file
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath)); // Attach the CSV file

    // Send the CSV file to your model for forecasting
    const modelResponse = await axios.post(
      "http://0.0.0.0:8000/predict/",
      formData,
      {
        headers: {
          ...formData.getHeaders(), // Include appropriate headers for multipart/form-data
        },
      }
    );
    // console.log(modelResponse.data.product)
    const store_data = modelResponse.data.store_aggregated_prediction;

    store_data.forEach((item) => {
      const forecast = new Forecast({
        storeId: item.store,
        productId: item.item,
        product_name: item.product_name,
        month: item.month,
        location: item.location,
        predicted_unit: item.total_unitSold,
        companyName:company
      });
      // Save the forecast object, e.g., to a database
      forecast
        .save()
        .then(() => {
          // console.log(`Forecast for ${item.product_name} saved successfully.`);
        })
        .catch((err) => {
          console.error(`Error saving forecast for ${item.product_name}:`, err);
        });
    });
    // Generate report using the model's response (JSON data)
    const reportFilePath = await generateReport(modelResponse.data.product);

    // Read the saved PDF file as a buffer
    const reportBuffer = fs.readFileSync(reportFilePath);

    // Send the generated report to frontend as PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=forecasting_report.pdf"
    );
    res.send(reportBuffer); // Use res.send to send a buffer as response
  } catch (error) {
    console.error("Error during forecasting:", error.message);
    res.status(500).json({ error: "Error processing the data" });
  }
};

const generateReport = async (jsonData) => {
  try {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Prediction Report", 105, 20, { align: "center" });

    // Add table
    const tableData = jsonData.map((row) => [
      row.productId || "",
      row.productName || "",
      parseInt(row.total_predicted_unit) || 0, // Ensure unitSold is an integer (fallback to 0 if not a valid number)
      row.month || "",
      row.store_with_highest_unit_sold_prediction || "",
    ]);

    doc.autoTable({
      head: [
        [
          "Product ID",
          "Product Name",
          "Predicted Units",
          "Month",
          "Store with Highest Units",
        ],
      ],
      body: tableData,
      startY: 30,
    });

    // Add bar chart
    const barChartBuffer = await generateChart(jsonData, "bar");
    const base64BarChart = barChartBuffer.toString("base64");
    doc.addImage(
      base64BarChart,
      "PNG",
      10,
      doc.autoTable.previous.finalY + 10,
      180,
      100
    );

    // Define file path for saving the PDF report
    const filePath = path.join(__dirname, "reports", "forecasting_report.pdf");

    // Save the PDF as a file
    doc.save(filePath);

    // Return the file path where the PDF is saved
    return filePath;
  } catch (err) {
    console.error("Error generating report:", err);
    throw err; // Re-throw the error to be caught in the calling function
  }
};

const generateChart = async (jsonData, chartType = "bar") => {
  const chartJS = new ChartJSNodeCanvas({ width: 600, height: 400 });

  // Sort the data by 'total_predicted_unit' in descending order and take the top 10
  const sortedData = jsonData
    .sort((a, b) => b.total_predicted_unit - a.total_predicted_unit)
    .slice(0, 10);

  // console.log(`Generating ${chartType} chart with data:`, sortedData);

  // Define chart data based on chart type
  const chartData = {
    labels: sortedData.map((row) => row.productName),
    datasets: [
      {
        label: "Total Predicted Units",
        data: sortedData.map((row) => row.total_predicted_unit),
        backgroundColor:
          chartType === "pie"
            ? sortedData.map(
                (_, index) =>
                  `rgba(${(index * 50) % 255}, ${(index * 70) % 255}, 192, 0.6)`
              )
            : "rgba(75, 192, 192, 0.6)",
        borderColor:
          chartType === "pie"
            ? sortedData.map(
                (_, index) =>
                  `rgba(${(index * 50) % 255}, ${(index * 70) % 255}, 192, 1)`
              )
            : "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        hoverBackgroundColor:
          chartType === "pie"
            ? sortedData.map(
                (_, index) =>
                  `rgba(${(index * 50) % 255}, ${(index * 70) % 255}, 192, 0.8)`
              )
            : "rgba(75, 192, 192, 0.8)",
        hoverBorderColor:
          chartType === "pie"
            ? sortedData.map(
                (_, index) =>
                  `rgba(${(index * 50) % 255}, ${(index * 70) % 255}, 192, 1)`
              )
            : "rgba(75, 192, 192, 1)",
      },
    ],
  };

  // Chart configuration based on the selected chart type
  const chartConfig = {
    type: chartType, // 'bar', 'line', or 'pie'
    data: chartData,
    options: {
      responsive: true,
      scales:
        chartType !== "pie"
          ? {
              x: {
                beginAtZero: true,
                ticks: {
                  autoSkip: false,
                  maxRotation: 45,
                  minRotation: 45,
                },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 200,
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
            }
          : undefined,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Units: ${context.raw}`;
            },
          },
        },
      },
    },
  };

  // Render and return the chart as a buffer
  return await chartJS.renderToBuffer(chartConfig);
};

// get based on store

const getStoreForecast = async (req, res) => {};
