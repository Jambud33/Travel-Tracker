import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';
//import { createClient } from '@supabase/supabase-js'

//const supabaseURL = `${process.env.DB_URL}`;
//const supabaseKey = `${process.env.SB_KEY}`;

//const supabase = createClient(supabaseURL, supabaseKey);
const app = express();
const port = 3000;

// code from local development on potgresql:
const db = new pg.Client({
  user: `${process.env.USER}`,
  host: `${process.env.HOST}`,
  database: `${process.env.DATABASE}`,
  password: `${process.env.PASSWORD}`,
  port: `${process.env.PORT}`
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// code from local development on potgresql:
db.connect();    

// function to retrieve visited countries list from db
async function checkVisited(){
// code from local development on potgresql:
let response = await db.query("SELECT code FROM public.visited_countries");  
/*const {data} = await supabase
.from('visited_countries')
.select() */

let list =[];
const resp = response.rows;


resp.forEach((item)=>{
  list.push(item.code);
});

return list
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
  const visited = await checkVisited();
  console.log("NC: "+ newCountry);
  try{
  // code from local development on potgresql:
  let response = await db.query(`SELECT country_code FROM countries WHERE country_name ILIKE '%${newCountry}%' OR country_name SIMILAR TO '${newCountry}'`);
  // newCountryCode = newCountryCode.rows[0].country_code;
  /*const resp = await supabase
  .from('countries')
  .select('country_code')
  .ilike('country_name', `%${newCountry}%`) */
 // const newCountryCode = resp.data[0].country_code;
 const newCountryCode = response.rows[0].country_code;
 console.log("DATA: " + JSON.stringify(newCountryCode));
  try{
    // code from local development on potgresql:
  const text ='INSERT INTO visited_countries (name,code) VALUES($1,$2)';
  const values = [newCountry, newCountryCode];
  await db.query(text, values);

   /*await supabase 
   .from('visited_countries')
   .insert({ name: `${newCountry}`, code: `${newCountryCode}` } ); 
    */
  
  }catch (error) {
    console.log("country already accounted for!")
    res.locals.error= `${newCountry} already accounted for!`;
  }

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
