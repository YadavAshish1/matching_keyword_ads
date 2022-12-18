const express = require('express');
const dotenv = require("dotenv")
const mongo = require('mongodb');
const app = express.Router();
dotenv.config()
const MongoClient = mongo.MongoClient;

app.post("/liveData",(req,res)=>{
  const search = req.body.searchValue;
  console.log(search);
  const fetchData =  (search) =>{ return new Promise(async (resolve , reject) =>{
    try{
      const client = new MongoClient(process.env.url);
      client.connect();
			const db = client.db('assesment');
      
      const auditCollection = db.collection('ads');
			const aggregateQuery = [
        
        { $lookup: {
          from: "companies",
            localField: "companyId",    // field in the ads collection
            foreignField: "_id",  // field in companies collection
            as: "company"
          },
        },
        { 
          $unwind: '$company'
        },
        {
          $addFields: {
            "Company_Name": "$company.name",
            "url": "$company.url",
          }
        },
        //query on combined collection
        {$match: { $or: [{ 'primaryText': { $regex:  search, $options: 'i'} }, { 'headline': { $regex: search, $options: 'i'} },{ 'description': { $regex: search, $options: 'i'} },{'Company_Name':{$regex:search,$options:'i'}}] }},
      
        {
          $project:{
            primaryText:1,
            headline:1,
            description:1,
            imageUrl : 1,
            Company_Name:1,
            url : 1,
            CTA : 1,
          }
        }
      
    ];
			const auditCursor = auditCollection.aggregate(aggregateQuery);
			const result = await auditCursor.toArray();
         resolve(result);
      }catch(err){
        reject(err);
      }
    })
  }
  fetchData(search).then((result)=>{
    console.log(result);
    res.send(result)
  })
       
  })

  module.exports = app