const employeeTemplate = (cmpName, employeeName, employeeEmail,employeePassword) => {
  let text = `Dear ${employeeName},

Welcome to StockSage!

You have been successfully registered as an employee. Here are your login credentials:

Username: ${employeeName}
UserEmail:${employeeEmail}
Password: ${employeePassword}

We strongly recommend that you change your password after your first login to ensure account security.

What’s next?
- Log in to your StockSage account using the credentials provided.
- Explore your personalized dashboard for inventory insights.
- Stay up-to-date with StockSage’s demand forecasting and inventory management tools.

If you have any questions or need assistance, feel free to reach out to our support team.

Thank you for being a part of our team!

Best regards,
The StockSage Team
stocksage2024@gmail.com`;

  return text;
};

export {
  employeeTemplate,
};
