import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

interface recipeSummary extends recipe {
  cookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: any = null;

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  const name:string = recipeName.toLowerCase();
  let ret: string = "";

  for (const a of name) {
    if (a.match(/[a-z ]/i)) {
      if (ret.length === 0 || ret[ret.length - 1] === ' ') {
        ret += a.toUpperCase();
      } else
      ret += a;
    }
    if (a === '-' || a === '_') {
      ret += " ";
    }
  }
  if (ret.length === 0) {
    return null;
  }
  return ret;
}

let cookbookEntries: cookbookEntry[] = [ ];

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req: Request, res: Response) => {
  let entry = req.body;
  if (entry.type !== "recipe" && entry.type !== "ingredient") {
    res.status(400).send("Invalid type");
    return;
  }
  if (entry.type === "ingredient") {
    if (!entry.hasOwnProperty("cookTime" ) || entry.cookTime < 0) {
      res.status(400).send("Incorrect cookTime");
      return;
    }
  }
  if (entry.type === "recipe") {
    const set = new Set();
    for (const i of entry.requiredItems) {
      if (set.has(i.name)) {
        res.status(400).send("Duplicate requiredItems");
        return;
      }
      set.add(i.name);
    }
  }
  cookbookEntries.forEach(e => {
    e.name === entry.name ? res.status(400).send("Entry already exists") : null;
  });
  cookbookEntries.push(entry);
  res.status(200).send(); 
});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  let name = req.query.name;
  let sum:recipeSummary;
  let entry = cookbookEntries.find(e => e.name === name);
  if (entry === undefined) {
    res.status(400).send();
    return;
  }
  if (entry.type === "ingredient") {
    res.status(400).send();
    return;
  }
  let requiredItems = entry.name.requiredItems;
  let ret = "";
  requiredItems.forEach(i => {
    ret += `${i.name} x${i.quantity}, `;
  }
  );
  res.status(200).send(ret);
});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
