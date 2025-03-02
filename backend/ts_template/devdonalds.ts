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

interface recipeSummary {
  name: string;
  cookTime: number;
  ingredients: requiredItem[];
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
    if (!entry.hasOwnProperty("requiredItems")) {
      res.status(400).send("Missing requiredItems");
      return;
    }
    const set = new Set();
    for (const i of entry.requiredItems) {
      if (set.has(i.name) || i.type === "recipe") {
        res.status(400).send("Duplicate requiredItems");
        return;
      }
      set.add(i.name);
    }
  }
  for (const e of cookbookEntries) {
    if (e.name === entry.name) {
      res.status(400).send("Entry already exists");
      return;
    }
  }
  cookbookEntries.push(entry);
  res.status(200).send(); 
});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req: Request, res: Response) => {
  let name = req.query.name as string;
  if (!name) {
    res.status(400).send("Name query parameter is required");
    return;
  }

  let recipeSummary: recipeSummary = {
    name: name,
    cookTime: 0,
    ingredients: []
  };

  // Recursively go through recipes and add up cookTime and ingredients
  const x = (name: string, recipeSummary: recipeSummary) => {
    const r = cookbookEntries.find(e => e.name === name) as recipe;
    if (r === undefined || r.type === "ingredient") {
      res.status(400).send("Recipe not found");
      return;
    }

    for (const a of r.requiredItems) {
      const ingredient = cookbookEntries.find(e => e.name === a.name) as ingredient | recipe;
      if (ingredient === undefined) {
        res.status(400).send("Ingredient not found");
        return;
      }

      // Kinda cooked naming them all ingredient ngl but its metaphorical
      if (ingredient.type === "ingredient") {
        recipeSummary.cookTime += (ingredient as ingredient).cookTime * a.quantity;
        let j = recipeSummary.ingredients.find(e => e.name === ingredient.name);
        if (j === undefined) {
          recipeSummary.ingredients.push({
            name: ingredient.name,
            quantity: a.quantity
          } as requiredItem);
        } else {
          j.quantity += a.quantity;
        }
      }
      if (ingredient.type === "recipe") {
        x(ingredient.name, recipeSummary);
      }
    }
  };

  x(name, recipeSummary);
  res.status(200).json(recipeSummary);
});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
