const cron = require('node-cron');
const moment = require('moment');
const nodemailer = require('nodemailer');

const User = require('../models/User'); // Import the User model
const Company = require('../models/Company'); // Import the Company model
const { parse } = require('path');

const transporter = nodemailer.createTransport({
  pool: true,
  service: "gmail",
  maxConnections: 10,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendMail = async (mailOptions) => {
  return transporter.sendMail(mailOptions).then(info => {
    console.log(`${moment().format('DD/MM/YYYY')} - Done, message was sent to `, mailOptions.to);
  }).catch(error => {
    logger(`Error on send EMAIL: `, { error, mailOptions });
    console.error(error);
    console.error(`Message WAS NOT sent to ${mailOptions.to}`);
  })
};

// Found new job every 3 hours
// const newJobNotification = cron.schedule('0 */3 * * *', async () => {
//   console.log('Finding new job...');
//   try {
//     // Fetch all customers
//     const customers = await User.getAll();
//     const now = new Date();
//     let totalNewJobs = 0;
//     // Iterate through each customer
//     let html = '';
//     for (const customer of customers) {
//       const { id: userId, companies } = customer;
//       if (customer.name != 'Benjamin') continue; // For testing purposes
//       if (!Array.isArray(companies)) continue;

//       // Iterate through each company
//       for (const company of companies) {

//         let content = '';
//         let newJobs = 0;
//         for (job of company.jobs) {
//           const found = new Date(job.found);
//           const diffInHours = Math.abs(now - found) / 36e5; // Convert milliseconds to hours
//           // console.log('diffInHours', diffInHours, now, found);
//           if (diffInHours <= 3) {
//             newJobs++;
//             content += `
//             <div style="display: flex; align-items: center;">
//               <p style='font-size: 20px; margin: 0 30px 0 0;'>${newJobs}.</p>
//               <p style='font-size: 20px; margin: 0 30px 0 0;'>${job.title}</p>
//               <p style='font-size: 20px; margin: 0;'>${job.link}</p>
//             </div>`;
//           }
//         }
//         if (newJobs > 0) {
//           html += `<h1 style='font-size: 30px'>Customer ${company.name} has ${newJobs} ${newJobs > 1 ? 'new positions' : 'new position'}</h1>` + content;
//         }
//         totalNewJobs += newJobs;
//       }
//     }

//     // console.log('Total new jobs found:', totalNewJobs);
//     // console.log('HTML content:', html);

//     if (totalNewJobs > 0) {
//       const mailOptions = {
//         from: { address: process.env.GMAIL_USER, name: "Commit Offshore Notifications" },
//         to: process.env.GMAIL_TO,
//         subject: totalNewJobs > 1 ? "New positions found for monitored customers" : "New position found for monitored customers",
//         html
//       };
//       await sendMail(mailOptions);
//     }
//     console.log('Periodic scan task completed.');
//   } catch (error) {
//     console.error('Error during periodic scan task:', error.message);
//   }
// });

// // Schedule a task to run every 12 hours
// const periodicScan = cron.schedule('0 */12 * * *', async () => {
//   console.log('Running periodic scan task...');
//   try {
//     // Fetch all customers
//     const customers = await User.getAll();

//     // Iterate through each customer
//     for (const customer of customers) {
//       const { id: userId, companies } = customer;
//       if (customer.name != 'Benjamin') continue; // For testing purposes
//       if (!Array.isArray(companies)) continue;

//       // Iterate through each company
//       for (const company of companies) {
//         const { last_scan_date, id: companyId, period } = company;

//         // Check if the company needs to be scanned based on scanFrequency
//         const now = new Date();
//         const lastScan = last_scan_date ? new Date(last_scan_date) : null;
//         if (period.at(-1) === 'h') {
//           // Calculate the next scan time
//           const frequencyInMs = parseInt(period) * 36e5; // Convert period to milliseconds

//           if (!lastScan || now - lastScan >= frequencyInMs) {
//             console.log(`Scanning company ${company.name} for user ${userId}...`);
//             const res = await Company.scanCompany({ id: userId, companyId: companyId });
//             console.log(`Scan result for company ${company.name}:`, res);
//           }
//         }
//       }
//     }

//     console.log('Periodic scan task completed.');
//   } catch (error) {
//     console.error('Error during periodic scan task:', error.message);
//   }
// });

const croneExecutor = () => {
  // periodicScan.start();
  // newJobNotification.start();
}

module.exports = { croneExecutor }
