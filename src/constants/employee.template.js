const employeeTemplate = (cmpName, empName) => {
    let text = `Dear ${empName},
  
  We are thrilled to welcome you to the ${cmpName} team! Your employee account has been successfully created on StockSage, the leading platform for inventory management and demand forecasting.
  
  As a valued team member, you now have access to StockSage's advanced tools to help manage inventory, track stock levels, and collaborate with your colleagues to streamline business operations.
  
  What's Next?
  Explore Your Dashboard: Log in to your StockSage account to access your personalized dashboard.
  Collaborate with Your Team: Start working with other team members to ensure efficient stock management and up-to-date demand forecasting.
  Access Real-Time Data: Stay informed with real-time inventory insights and reports to support better decision-making.
  If you have any questions or need assistance, don't hesitate to reach out to your Admin or our support team at any time. We're here to ensure you have everything you need to succeed in your role.
  
  Thank you for being part of the ${cmpName} family, and we look forward to achieving great things together!
  
  Best regards,
  The StockSage Team
  stocksage2024@gmail.com`;
  
    return text;
  };
  
  export { employeeTemplate };
  