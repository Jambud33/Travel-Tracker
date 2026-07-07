import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';

const app = express();
const port = `${process.env.PORT}`;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// connect to database

const db = new pg.Client({
  user: `${process.env.USER}`,
  database: `${process.env.DATABASE}`,
  host: `${process.env.HOST}`,
  //host: `${process.env.DB_URL}`,
  password: `${process.env.PASSWORD}`,
  port: `${process.env.PORT}`
});

/*
const db = new pg.Client({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
*/
//db.connect();    


// function to retrieve visited countries list from db
async function checkVisited(){
 await db.connect();
 
  try{

let response = await db.query("SELECT country_code FROM public.world WHERE visited = 'true'");  
console.log(response);
const resp = response.rows;
console.log("response: "+ JSON.stringify(resp));
let list =[];

resp.forEach((item)=>{
  list.push(item.country_code);
});
console.log("list: "+ list);
return list
  }catch {(err => {
    console.error("Async operation failed:", err); 
  })
  } finally{
 db.end();
  }
}

/*---------------REST ACTIONS---------------*/
// GET action when home page loaded
app.get("/", async (req, res) => {
  const list = await checkVisited();
  res.render("index.ejs", {countries: list, total: list.length});
});

//POST action when new country added
app.post("/add", async (req,res)=>{
  const newCountry = req.body.country;

  try{
  await db.query(`UPDATE world SET visited = 'true' WHERE country_name ILIKE '%${newCountry}%' OR country_name SIMILAR TO '${newCountry}'`);
   } catch (error){
    console.log("not in db");
    res.locals.error= `${newCountry} not in database. Please try again`;
  }
  
  const codes= await checkVisited();
  console.log("codes: "+ codes);
  res.render("index.ejs",{countries: codes, total: codes.length });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
