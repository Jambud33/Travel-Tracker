import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';
//import { createClient } from '@supabase/supabase-js'

//const supabaseURL = `${process.env.DB_URL}`;
//const supabaseKey = `${process.env.SB_KEY}`;

//const supabase = createClient(supabaseURL, supabaseKey);
const app = express();
const port = `${process.env.PORT}`;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// connect to database
const db = new pg.Client({
  user: `${process.env.USER}`,
  host: `${process.env.HOST}`,
  database: "postgresql://world_vyms_user:6FHOIQjSheOKp4rjvbARQZfBRr6NOoMs@dpg-d965s367r5hc73fr1o80-a/world_vyms";
  //database: `${process.env.DATABASE}`,
  password: `${process.env.PASSWORD}`,
  port: `${process.env.PORT}`
});
db.connect();    


// function to retrieve visited countries list from db
async function checkVisited(){
  try{
let response = await db.query("SELECT country_code FROM public.countries WHERE visited = 'true'");  
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
  });
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
  await db.query(`UPDATE countries SET visited = 'true' WHERE country_name ILIKE '%${newCountry}%' OR country_name SIMILAR TO '${newCountry}'`);
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
