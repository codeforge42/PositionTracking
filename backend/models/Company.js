
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const Scraper = require('../services/scraper.js');
const Classifier = require('../services/classifier.js');
const crypto = require('crypto');
const User = require('./User.js');

class Company {
  
  static async getCompanyById(id) {
    try {
      const result = await pool.query(
        'SELECT companies FROM users WHERE id = $1',
        [id]
      );
      return result.rows.length ? result.rows[0].companies : null;
    } catch (error) {
      console.error('Error finding user by id:', error.message);
      throw error;
    }
  }

  static async updateCompany(addData) {
    const { id, companies } = addData;
  
    try {

      // Update user into database
      const result = await pool.query(
        'UPDATE users SET companies = $1::jsonb WHERE id = $2 RETURNING id, name, email, companies',
        [JSON.stringify(companies), id]
      );
  
      return result.rows[0]; // Return the newly created user
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  }

  static async scanCompany(scanData) {

    const { id, companyId } = scanData;

    // Check if user exists
    let companies;

    try {
      const result = await pool.query(
        'SELECT companies FROM users WHERE id = $1',
        [id]
      );
      companies = result.rows.length ? result.rows[0].companies : [];
    } catch (error) {
      console.error('Error finding user by id:', error.message);
      throw error;
    }
    const apiKey = process.env.OPENAI_API_KEY || '';
    const Classifier_Obj = new Classifier(apiKey);
    let classified_jobList = [], WebsitejobList = [], LinkedinjobList = [], jobList = [];
    const options = {
      customPrompt:
        'Analyze the following job posting. Does it describe a technical position like Software, Architect, Developer, QA, AQA, or DevOps,  programming, IT, data science, engineering, deploying, or Telecomunication similar technical skills including technical leader, IT Helpdesk? If yes, return a short explanation; if not, respond with "No match". Enterprise Account Manager, Business Development Representative arenot technical',
    };
    let result;
    for (const company of companies) {
      if (company.id.includes(companyId)) {
        // Await the Scraper function
        const links = [];
        company.jobs.map(job => links.push(job.link));
        WebsitejobList = await Scraper(company.name, company.website, apiKey, 1, links);
        if (WebsitejobList.found != 1) {
          if (JSON.parse(WebsitejobList.matches).length > 0) {
            let Jobs = [], PartList, Joblinks = [];
            for (const url of JSON.parse(WebsitejobList.matches)) {
              PartList = await Scraper(company.name, url, apiKey, 2, links);
    
              JSON.parse(PartList.jobs).map(job => {
                if (Joblinks.filter(j => j == job.link).length == 0) {
                  Jobs.push(job);
                  Joblinks.push(job.link);
                }
              });
            }
            WebsitejobList = { found: 1, jobs: JSON.stringify(Jobs) };
          }
        }
        LinkedinjobList = await Scraper(company.name, company.linkedin, apiKey, 2, links);
    
        jobList = [...JSON.parse(WebsitejobList.jobs), ...JSON.parse(LinkedinjobList.jobs)];
        
        const now  = new Date();
        classified_jobList = [];
        for (const job of jobList) {
          const jobPosting = {
            title: job.title,
            company: company.name,
            description: ''
          };
          if (apiKey) {
            // const result = await Classifier_Obj.classifyJobPosting(jobPosting, options);
            classified_jobList.push({
              id: crypto.randomBytes(16).toString('hex'),
              title: job.title,
              description: "",
              link: job.link,
              found: now
            });
          } else {
            classified_jobList.push({
              id: crypto.randomBytes(16).toString('hex'),
              title: job.title,
              description: job.detail,
              link: job.link,
              found: now
            });
          }
        }
    
        console.log('classifying completed');
        company.jobs = [...company.jobs, ...classified_jobList];
        company.last_scan_date = now.toISOString();
        result = company;
      }
    }
    
    // Update the database after processing all companies
    await pool.query(
      'UPDATE users SET companies = $1::jsonb WHERE id = $2',
      [JSON.stringify(companies), id]
    );
    if (companyId) return result;
    else return companies;
  }
  
  static async deleteRecord(deleteData) {

    const { id, companyId } = deleteData;

    // Check if user exists
    let companies;

    try {
      const result = await pool.query(
        'SELECT companies FROM users WHERE id = $1',
        [id]
      );
      companies = result.rows.length ? result.rows[0].companies : [];
    } catch (error) {
      console.error('Error finding user by id:', error.message);
      throw error;
    }
    for (const company of companies) {
      if (company.id.includes(companyId)) {
        company.jobs = [];
        company.last_scan_date = null;
      }
    }
    
    // Update the database after processing all companies
    await pool.query(
      'UPDATE users SET companies = $1::jsonb WHERE id = $2',
      [JSON.stringify(companies), id]
    );
    if (companyId) return 'Company record deleted successfully';
    else return 'All records deleted successfully';
  }
}

module.exports = Company;
