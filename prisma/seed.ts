import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";

const db = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  }),
});

const pizzaSizes = JSON.stringify([
  { name: 'Small 10"', priceDelta: 0 },
  { name: 'Medium 12"', priceDelta: 4 },
  { name: 'Large 16"', priceDelta: 8 },
]);

const burgerAddons = JSON.stringify([
  { name: "Extra Cheese", price: 1.5 },
  { name: "Bacon", price: 2.5 },
  { name: "Fried Egg", price: 1.5 },
  { name: "Extra Patty", price: 4 },
]);

const pizzaAddons = JSON.stringify([
  { name: "Extra Mozzarella", price: 2 },
  { name: "Mushrooms", price: 1.5 },
  { name: "Pepperoni", price: 2 },
  { name: "Jalapeños", price: 1 },
]);

const categories = [
  { name: "Starters", slug: "starters", sortOrder: 1 },
  { name: "Burgers", slug: "burgers", sortOrder: 2 },
  { name: "Pizza", slug: "pizza", sortOrder: 3 },
  { name: "Pasta", slug: "pasta", sortOrder: 4 },
  { name: "Grill & Mains", slug: "mains", sortOrder: 5 },
  { name: "Desserts", slug: "desserts", sortOrder: 6 },
  { name: "Drinks", slug: "drinks", sortOrder: 7 },
];

type SeedItem = {
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  calories: number;
  ingredients: string;
  allergens: string;
  isVeg?: boolean;
  isSpicy?: boolean;
  isFeatured?: boolean;
  category: string;
  sizes?: string;
  addons?: string;
};

const items: SeedItem[] = [
  // Starters
  { name: "Crispy Calamari", slug: "crispy-calamari", description: "Golden fried calamari rings served with lemon aioli and marinara.", price: 11.99, image: "🦑", calories: 420, ingredients: "Calamari, flour, garlic, lemon, aioli", allergens: "Shellfish, Gluten, Egg", category: "starters" },
  { name: "Garlic Bread Supreme", slug: "garlic-bread-supreme", description: "Toasted sourdough with roasted garlic butter and melted mozzarella.", price: 7.49, image: "🥖", calories: 380, ingredients: "Sourdough, garlic, butter, mozzarella, parsley", allergens: "Gluten, Dairy", isVeg: true, category: "starters" },
  { name: "Buffalo Wings", slug: "buffalo-wings", description: "Eight crispy wings tossed in house buffalo sauce with blue cheese dip.", price: 12.99, image: "🍗", calories: 640, ingredients: "Chicken wings, buffalo sauce, blue cheese, celery", allergens: "Dairy", isSpicy: true, isFeatured: true, category: "starters" },
  { name: "Bruschetta Trio", slug: "bruschetta-trio", description: "Heirloom tomato, whipped ricotta, and mushroom bruschetta on grilled ciabatta.", price: 9.99, image: "🍅", calories: 310, ingredients: "Ciabatta, tomato, ricotta, mushrooms, basil, olive oil", allergens: "Gluten, Dairy", isVeg: true, category: "starters" },
  // Burgers
  { name: "The Golden Smash", slug: "golden-smash-burger", description: "Double smashed beef patties, aged cheddar, caramelized onions, house sauce on a brioche bun.", price: 14.99, image: "🍔", calories: 890, ingredients: "Beef, cheddar, brioche, onion, house sauce, pickles", allergens: "Gluten, Dairy, Egg", isFeatured: true, category: "burgers", addons: burgerAddons },
  { name: "Smoky BBQ Bacon Burger", slug: "smoky-bbq-bacon-burger", description: "Flame-grilled patty, crispy bacon, onion rings, smoked BBQ glaze.", price: 15.99, image: "🥓", calories: 980, ingredients: "Beef, bacon, BBQ sauce, onion rings, cheddar", allergens: "Gluten, Dairy", category: "burgers", addons: burgerAddons },
  { name: "Crispy Chicken Burger", slug: "crispy-chicken-burger", description: "Buttermilk fried chicken, slaw, pickles, and spicy mayo.", price: 13.49, image: "🐔", calories: 760, ingredients: "Chicken, buttermilk, cabbage slaw, pickles, mayo", allergens: "Gluten, Dairy, Egg", isSpicy: true, category: "burgers", addons: burgerAddons },
  { name: "Garden Veggie Burger", slug: "garden-veggie-burger", description: "House-made chickpea & beet patty, avocado, sprouts, vegan aioli.", price: 12.99, image: "🥗", calories: 560, ingredients: "Chickpeas, beets, avocado, sprouts, vegan aioli", allergens: "Gluten, Sesame", isVeg: true, category: "burgers", addons: burgerAddons },
  // Pizza
  { name: "Margherita Classica", slug: "margherita-classica", description: "San Marzano tomatoes, fior di latte mozzarella, fresh basil, olive oil.", price: 13.99, image: "🍕", calories: 820, ingredients: "Tomato, mozzarella, basil, olive oil, dough", allergens: "Gluten, Dairy", isVeg: true, isFeatured: true, category: "pizza", sizes: pizzaSizes, addons: pizzaAddons },
  { name: "Pepperoni Inferno", slug: "pepperoni-inferno", description: "Double pepperoni, mozzarella, hot honey drizzle, chili flakes.", price: 16.49, image: "🌶️", calories: 1050, ingredients: "Pepperoni, mozzarella, hot honey, chili, dough", allergens: "Gluten, Dairy", isSpicy: true, category: "pizza", sizes: pizzaSizes, addons: pizzaAddons },
  { name: "Truffle Mushroom Pizza", slug: "truffle-mushroom-pizza", description: "Wild mushrooms, truffle cream, taleggio, arugula, parmesan.", price: 17.99, image: "🍄", calories: 900, ingredients: "Mushrooms, truffle cream, taleggio, arugula, parmesan, dough", allergens: "Gluten, Dairy", isVeg: true, category: "pizza", sizes: pizzaSizes, addons: pizzaAddons },
  { name: "BBQ Chicken Pizza", slug: "bbq-chicken-pizza", description: "Smoked chicken, red onion, cilantro, mozzarella, tangy BBQ base.", price: 16.99, image: "🍗", calories: 980, ingredients: "Chicken, BBQ sauce, red onion, cilantro, mozzarella, dough", allergens: "Gluten, Dairy", category: "pizza", sizes: pizzaSizes, addons: pizzaAddons },
  // Pasta
  { name: "Spaghetti Carbonara", slug: "spaghetti-carbonara", description: "Guanciale, egg yolk, pecorino romano, cracked black pepper.", price: 15.49, image: "🍝", calories: 850, ingredients: "Spaghetti, guanciale, egg, pecorino, pepper", allergens: "Gluten, Dairy, Egg", isFeatured: true, category: "pasta" },
  { name: "Penne Arrabbiata", slug: "penne-arrabbiata", description: "Spicy tomato sugo, garlic, chili, fresh basil, parmesan.", price: 12.99, image: "🌶️", calories: 620, ingredients: "Penne, tomato, garlic, chili, basil, parmesan", allergens: "Gluten, Dairy", isVeg: true, isSpicy: true, category: "pasta" },
  { name: "Creamy Chicken Alfredo", slug: "creamy-chicken-alfredo", description: "Fettuccine in parmesan cream with grilled chicken and herbs.", price: 16.49, image: "🧀", calories: 940, ingredients: "Fettuccine, chicken, cream, parmesan, herbs", allergens: "Gluten, Dairy", category: "pasta" },
  { name: "Seafood Linguine", slug: "seafood-linguine", description: "Shrimp, mussels, and calamari in white wine garlic sauce.", price: 19.99, image: "🦐", calories: 720, ingredients: "Linguine, shrimp, mussels, calamari, white wine, garlic", allergens: "Gluten, Shellfish", category: "pasta" },
  // Mains
  { name: "Grilled Ribeye Steak", slug: "grilled-ribeye-steak", description: "12oz prime ribeye, herb butter, roasted potatoes, seasonal greens.", price: 29.99, image: "🥩", calories: 1100, ingredients: "Ribeye, butter, potatoes, greens, rosemary", allergens: "Dairy", isFeatured: true, category: "mains" },
  { name: "Herb Roasted Salmon", slug: "herb-roasted-salmon", description: "Atlantic salmon, lemon beurre blanc, asparagus, wild rice.", price: 23.99, image: "🐟", calories: 680, ingredients: "Salmon, lemon, butter, asparagus, wild rice", allergens: "Fish, Dairy", category: "mains" },
  { name: "Chicken Tikka Platter", slug: "chicken-tikka-platter", description: "Char-grilled tikka skewers, saffron rice, mint chutney, naan.", price: 17.99, image: "🍢", calories: 780, ingredients: "Chicken, yogurt, spices, rice, naan, mint", allergens: "Gluten, Dairy", isSpicy: true, category: "mains" },
  { name: "Grilled Veggie Platter", slug: "grilled-veggie-platter", description: "Charred seasonal vegetables, halloumi, couscous, romesco sauce.", price: 15.99, image: "🥦", calories: 540, ingredients: "Zucchini, peppers, halloumi, couscous, romesco", allergens: "Gluten, Dairy, Nuts", isVeg: true, category: "mains" },
  // Desserts
  { name: "Molten Chocolate Cake", slug: "molten-chocolate-cake", description: "Warm chocolate lava cake with vanilla bean gelato.", price: 8.99, image: "🍫", calories: 620, ingredients: "Chocolate, butter, eggs, flour, gelato", allergens: "Gluten, Dairy, Egg", isVeg: true, isFeatured: true, category: "desserts" },
  { name: "Classic Tiramisu", slug: "classic-tiramisu", description: "Espresso-soaked ladyfingers, mascarpone cream, cocoa dust.", price: 7.99, image: "🍰", calories: 480, ingredients: "Mascarpone, espresso, ladyfingers, cocoa, eggs", allergens: "Gluten, Dairy, Egg", isVeg: true, category: "desserts" },
  { name: "New York Cheesecake", slug: "new-york-cheesecake", description: "Baked vanilla cheesecake with berry compote.", price: 7.49, image: "🍓", calories: 550, ingredients: "Cream cheese, graham crust, berries, vanilla", allergens: "Gluten, Dairy, Egg", isVeg: true, category: "desserts" },
  // Drinks
  { name: "Fresh Lemon Mint Cooler", slug: "lemon-mint-cooler", description: "Hand-pressed lemonade with fresh mint and sparkling water.", price: 4.99, image: "🍋", calories: 120, ingredients: "Lemon, mint, sugar, sparkling water", allergens: "", isVeg: true, category: "drinks" },
  { name: "Mango Lassi", slug: "mango-lassi", description: "Creamy yogurt smoothie with Alphonso mango and cardamom.", price: 5.49, image: "🥭", calories: 240, ingredients: "Mango, yogurt, cardamom, honey", allergens: "Dairy", isVeg: true, category: "drinks" },
  { name: "Iced Caramel Latte", slug: "iced-caramel-latte", description: "Double espresso over ice with milk and caramel drizzle.", price: 5.99, image: "☕", calories: 210, ingredients: "Espresso, milk, caramel, ice", allergens: "Dairy", isVeg: true, category: "drinks" },
  { name: "Berry Blast Smoothie", slug: "berry-blast-smoothie", description: "Strawberry, blueberry, banana, and oat milk blend.", price: 6.49, image: "🫐", calories: 260, ingredients: "Strawberry, blueberry, banana, oat milk", allergens: "", isVeg: true, category: "drinks" },
];

const reviewSeeds: { itemSlug: string; author: string; rating: number; comment: string }[] = [
  { itemSlug: "golden-smash-burger", author: "Ayesha K.", rating: 5, comment: "Best smash burger in town — the house sauce is unreal!" },
  { itemSlug: "golden-smash-burger", author: "Daniel R.", rating: 4, comment: "Juicy and flavorful. Would love more pickles." },
  { itemSlug: "margherita-classica", author: "Sofia M.", rating: 5, comment: "Tastes like Naples. Perfect char on the crust." },
  { itemSlug: "buffalo-wings", author: "Omar S.", rating: 5, comment: "Crispy, saucy, perfect heat level. My weekly order." },
  { itemSlug: "spaghetti-carbonara", author: "Elena V.", rating: 5, comment: "Authentic carbonara — no cream, just silky egg and pecorino." },
  { itemSlug: "grilled-ribeye-steak", author: "Marcus T.", rating: 4, comment: "Cooked a perfect medium rare. Herb butter is a must." },
  { itemSlug: "molten-chocolate-cake", author: "Priya N.", rating: 5, comment: "That molten center with the gelato... heavenly." },
  { itemSlug: "truffle-mushroom-pizza", author: "James L.", rating: 5, comment: "The truffle cream base is worth every penny." },
];

async function main() {
  // Wipe in FK-safe order so the seed is idempotent
  await db.review.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.reservation.deleteMany();
  await db.menuItem.deleteMany();
  await db.category.deleteMany();
  await db.coupon.deleteMany();
  await db.user.deleteMany();

  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    const created = await db.category.create({ data: c });
    categoryMap.set(c.slug, created.id);
  }

  const itemMap = new Map<string, string>();
  for (const item of items) {
    const { category, ...data } = item;
    const created = await db.menuItem.create({
      data: { ...data, categoryId: categoryMap.get(category)! },
    });
    itemMap.set(item.slug, created.id);
  }

  for (const r of reviewSeeds) {
    await db.review.create({
      data: {
        menuItemId: itemMap.get(r.itemSlug)!,
        authorName: r.author,
        rating: r.rating,
        comment: r.comment,
      },
    });
  }

  await db.coupon.createMany({
    data: [
      { code: "WELCOME10", type: "PERCENT", value: 10, minSubtotal: 20 },
      { code: "FLAT5", type: "FIXED", value: 5, minSubtotal: 30 },
      { code: "GOLDEN20", type: "PERCENT", value: 20, minSubtotal: 50 },
    ],
  });

  await db.user.create({
    data: {
      email: "admin@goldenfork.dev",
      name: "Admin",
      role: "ADMIN",
      passwordHash: await hash(process.env.ADMIN_PASSWORD ?? "admin123", 10),
    },
  });

  // A couple of demo orders so the admin dashboard and tracking have data
  const demoOrders = [
    {
      orderNumber: "GF-DEMO01",
      customerName: "Ayesha Khan",
      customerEmail: "ayesha@example.com",
      customerPhone: "+1 555 0101",
      fulfillment: "DELIVERY",
      address: "42 Maple Street, Springfield",
      status: "OUT_FOR_DELIVERY",
      paymentMethod: "COD",
      lines: [
        { slug: "golden-smash-burger", qty: 2 },
        { slug: "lemon-mint-cooler", qty: 2 },
      ],
    },
    {
      orderNumber: "GF-DEMO02",
      customerName: "Daniel Reyes",
      customerEmail: "daniel@example.com",
      customerPhone: "+1 555 0102",
      fulfillment: "PICKUP",
      address: null,
      status: "PREPARING",
      paymentMethod: "PAY_AT_RESTAURANT",
      lines: [
        { slug: "margherita-classica", qty: 1 },
        { slug: "classic-tiramisu", qty: 2 },
      ],
    },
    {
      orderNumber: "GF-DEMO03",
      customerName: "Sofia Marino",
      customerEmail: "sofia@example.com",
      customerPhone: "+1 555 0103",
      fulfillment: "DELIVERY",
      address: "7 Harbor View, Springfield",
      status: "DELIVERED",
      paymentMethod: "COD",
      lines: [
        { slug: "seafood-linguine", qty: 1 },
        { slug: "molten-chocolate-cake", qty: 1 },
      ],
    },
  ];

  for (const o of demoOrders) {
    const orderItems = o.lines.map((l) => {
      const item = items.find((i) => i.slug === l.slug)!;
      return {
        menuItemId: itemMap.get(l.slug)!,
        name: item.name,
        size: null,
        addons: null,
        unitPrice: item.price,
        quantity: l.qty,
        lineTotal: item.price * l.qty,
      };
    });
    const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
    const deliveryFee = o.fulfillment === "DELIVERY" && subtotal < 35 ? 3.99 : 0;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + deliveryFee + tax;
    await db.order.create({
      data: {
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        fulfillment: o.fulfillment,
        address: o.address,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.status === "DELIVERED" ? "PAID" : "PENDING",
        subtotal,
        deliveryFee,
        tax,
        total,
        items: { create: orderItems },
      },
    });
  }

  console.log(
    `Seeded ${categories.length} categories, ${items.length} menu items, ${reviewSeeds.length} reviews, 3 coupons, 3 demo orders.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
