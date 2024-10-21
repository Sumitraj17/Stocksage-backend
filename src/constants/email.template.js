const adminTemplate = (cmpName, cmpLoc, Admin) => {
  let text = `Dear ${Admin},

We are excited to inform you that your company, ${cmpName}, located at ${cmpLoc}, has been successfully registered on StockSage.

As the Admin/Manager, you now have full access to StockSage's powerful features, designed to help you forecast inventory demand, manage stock levels efficiently, and make data-driven decisions for your business.

What's Next?
Explore Your Dashboard: Log in to your StockSage account and explore your dashboard for real-time inventory insights.
Demand Forecasting: Take advantage of our demand forecasting feature, which leverages advanced algorithms to predict future inventory needs based on historical data and market trends.
Manage Your Team: You can now invite other team members to collaborate within the platform.
Set Up Your Preferences: Customize your settings to get the most out of StockSage's features.
If you have any questions or need assistance with your account, feel free to reach out to our support team. We're here to help!

Thank you for choosing StockSage to manage your company's inventory and demand forecasting needs. We look forward to supporting your business growth!

Best regards,
The StockSage Team
stocksage2024@gmail.com`;

    return text;
};

export {
    adminTemplate,
}
