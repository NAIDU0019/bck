interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  type: string;
  pricePerWeight: { [key: string]: number };
  stockPerWeight: { [key: string]: number };
  tags?: string[];
  description?: string;
  ingredients?: string;
  tagline?: string;
}

// Reusable constants
const defaultVegPrices = { "100": 60, "250": 139, "500": 274, "1000": 549 };
const greenChiliPrices = { "100": 55, "250": 119, "500": 209, "1000": 379 };
const gingerPrices = { "100": 45, "250": 99, "500": 179, "1000": 329 };
const dryMangoPrices = { "100": 55, "250": 129, "500": 239, "1000": 449 };

const chickenPrices = { "100": 130, "250": 299, "500": 498, "1000": 999 };
const muttonPrices = { "100": 180, "250": 449, "500": 899, "1000": 1799 };
const fishPrices = { "100": 100, "250": 199, "500": 397, "1000": 889 };
const prawnPrices = {
  "100": 199,
  "250": 399,
  "500": 799,
  "1000": 1599
};

const crabPrices = { "100": 230, "250": 549, "500": 1099, "1000": 1999 };
const gonguraChickenPrices = { "100": 89, "250": 249, "500": 499, "1000": 899 };

const defaultStock = { "100": 10, "250": 30, "500": 30, "1000": 30 };
const limitedStock = { "100": 5, "250": 18, "500": 30, "1000": 30 };
const veryLimitedStock = { "100": 5, "250": 9, "500": 30, "1000": 30 };

export const products: Product[] = [
  {
    id: "mango-pickle",
    name: "Mango Pickle",
    image: "/mango.jpeg",
    category: "fruit",
    type: "veg",
    description: "A tangy and spicy pickle made with raw mangoes, mustard oil, and a blend of aromatic spices.",
    ingredients: "Raw mangoes, mustard oil, salt, fenugreek seeds, fennel seeds, nigella seeds, red chili powder, turmeric powder, asafoetida",
    pricePerWeight: defaultVegPrices,
    stockPerWeight: defaultStock,
    tagline: "Tantalize your taste buds with our tangy mango magic!",
  },
  {
    id: "lemon-pickle",
    name: "Lemon Pickle",
    image: "/lemon.jpg",
    category: "fruit",
    type: "veg",
    description: "A zingy and refreshing pickle made with fresh lemons and spices.",
    ingredients: "Lemons, salt, red chili powder, turmeric, mustard seeds, fenugreek, mustard oil",
    pricePerWeight: defaultVegPrices,
    stockPerWeight: defaultStock,
    tagline: "When life gives you lemons, pickle them to perfection!",
  },
  {
    id: "mixed-vegetable-pickle",
    name: "Mixed Vegetable Pickle",
    image: "/mixveg.jpg",
    category: "vegetable",
    type: "veg",
    description: "A colorful medley of vegetables pickled with our special blend.",
    ingredients: "Carrots, turnips, cauliflower, ginger, vinegar, mustard oil",
    pricePerWeight: defaultVegPrices,
    stockPerWeight: defaultStock,
    tagline: "Color, crunch, and spice in every bite!",
  },
  {
    id: "garlic-pickle",
    name: "Garlic Pickle",
    image: "/garlic.jpg",
    category: "vegetable",
    type: "veg",
    description: "Garlic pickle that adds bold flavor to any meal.",
    ingredients: "Garlic, mustard oil, fenugreek seeds, fennel, turmeric, chili",
    pricePerWeight: defaultVegPrices,
    stockPerWeight: defaultStock,
    tagline: "Garlic lovers, rejoice in every pungent punch!",
  },
  {
    id: "chicken-pickle",
    name: "Chicken Pickle",
    image: "/chicken.jpeg",
    category: "non-veg",
    type: "non-veg",
    description: "Spicy and flavorful chicken pickle made with authentic Andhra spices.",
    ingredients: "Chicken, mustard oil, chili powder, garlic, turmeric",
    pricePerWeight: chickenPrices,
    stockPerWeight: limitedStock,
    tagline: "Bold bites of Andhra-style chicken in every jar!",
  },
  {
    id: "fish-pickle",
    name: "Fish Pickle",
    image: "/fish.jpg",
    category: "non-veg",
    type: "non-veg",
    description: "Tangy and spicy fish pickle preserved in mustard oil.",
    ingredients: "Fish, garlic, chili powder, mustard oil, spices",
    pricePerWeight: fishPrices,
    stockPerWeight: defaultStock,
    tagline: "Catch the coastal kick with every spoon!",
  },
  {
    id: "green-chili-pickle",
    name: "Green Chili Pickle",
    image: "/gchilli.jpg",
    category: "vegetable",
    type: "veg",
    description: "Fiery green chili pickle made with mustard oil and aromatic spices.",
    ingredients: "Green chilies, mustard oil, fenugreek, turmeric, asafoetida",
    pricePerWeight: greenChiliPrices,
    stockPerWeight: defaultStock,
    tagline: "For those who like it hot and tangy!",
  },
  {
    id: "prawn-pickle",
    name: "Prawn Pickle",
    image: "/prawns.jpg",
    category: "non-veg",
    type: "non-veg",
    description: "Juicy prawns cooked and preserved in traditional pickle masala.",
    ingredients: "Prawns, mustard oil, garlic, ginger, vinegar",
    pricePerWeight: prawnPrices,
    stockPerWeight: defaultStock,
    tagline: "A sea of spice in every bite!",
  },
  {
    id: "ginger-pickle",
    name: "Ginger Pickle",
    image: "/ginger.jpg",
    category: "vegetable",
    type: "veg",
    description: "Zesty ginger pickle great for digestion and flavor enhancement.",
    ingredients: "Ginger, lemon juice, cumin, mustard oil, chili",
    pricePerWeight: gingerPrices,
    stockPerWeight: defaultStock,
    tagline: "Spice up your gut with a zingy twist!",
  },
  {
    id: "mutton-pickle",
    name: "Mutton Pickle",
    image: "/mutton.jpeg",
    category: "non-veg",
    type: "non-veg",
    description: "Slow-cooked tender mutton with bold spices.",
    ingredients: "Mutton, mustard oil, garlic, ginger, garam masala",
    pricePerWeight: muttonPrices,
    stockPerWeight: veryLimitedStock,
    tagline: "Bold, rich and meaty – the perfect indulgence!",
  },
  {
    id: "crab-pickle",
    name: "Crab Pickle",
    image: "/crab.jpg",
    category: "seafood",
    type: "non-veg",
    description: "Rich and spicy crab pickle that delivers coastal flavor with every bite.",
    ingredients: "Crab, mustard oil, chili powder, garlic, ginger, spices",
    pricePerWeight: crabPrices,
    stockPerWeight: defaultStock,
    tagline: "Dive into oceanic delight with every spicy claw!",
  },
  {
    id: "gongura-chicken-pickle",
    name: "Gongura Chicken Pickle",
    image: "/gchicken.jpg",
    category: "meat",
    type: "non-veg",
    description: "A fiery fusion of tangy gongura leaves and succulent chicken pieces.",
    ingredients: "Chicken, gongura leaves, mustard oil, red chili, garlic, spices",
    pricePerWeight: gonguraChickenPrices,
    stockPerWeight: defaultStock,
    tagline: "Tang meets spice in every bite!",
  },
  {
    id: "dry-mango-pickle",
    name: "Dry Mango Pickle",
    image: "/dmango.jpeg",
    category: "fruit",
    type: "veg",
    description: "Traditional sun-dried mango pickle infused with bold Indian spices.",
    ingredients: "Dry mango slices, mustard oil, salt, chili powder, asafoetida",
    pricePerWeight: dryMangoPrices,
    stockPerWeight: defaultStock,
    tagline: "Sun-kissed mango magic in every jar!",
  },
  {
    id: "tomato-pickle",
    name: "Tomato Pickle",
    image: "/tomato.jpg",
    category: "vegetable",
    type: "veg",
    description: "Juicy tomato pickle packed with Andhra-style flavors and fiery tang.",
    ingredients: "Tomatoes, mustard oil, chili powder, salt, fenugreek seeds",
    pricePerWeight: defaultVegPrices,
    stockPerWeight: defaultStock,
    tagline: "A burst of tangy tradition in every spoon!",
  },
];
