import { db, categoriesTable, requestsTable, bidsTable } from "@workspace/db";

const categories = [
  {
    name: "Televisie",
    slug: "televisie",
    icon: "📺",
    description: "Smart TV's, OLED, QLED en meer",
    fields: [
      { key: "screenSize", label: "Schermgrootte (inch)", type: "select", required: true, options: ["32", "43", "50", "55", "65", "75", "85"] },
      { key: "resolution", label: "Resolutie", type: "select", required: true, options: ["HD (1280x720)", "Full HD (1920x1080)", "4K Ultra HD", "8K"] },
      { key: "displayType", label: "Schermtype", type: "select", required: false, options: ["LED", "OLED", "QLED", "MiniLED", "AMOLED"] },
      { key: "smart", label: "Smart TV", type: "boolean", required: true },
      { key: "hdr", label: "HDR", type: "select", required: false, options: ["Geen", "HDR10", "HDR10+", "Dolby Vision"] },
      { key: "refreshRate", label: "Verversingssnelheid (Hz)", type: "select", required: false, options: ["50", "60", "100", "120", "144"] },
      { key: "notes", label: "Aanvullende wensen", type: "textarea", required: false, placeholder: "Bijv. gaming functies, specifieke apps..." },
    ],
  },
  {
    name: "Wasmachine",
    slug: "wasmachine",
    icon: "🫧",
    description: "Wasmachines, drogers en wasdrogers",
    fields: [
      { key: "type", label: "Type", type: "select", required: true, options: ["Wasmachine", "Droger", "Wasdroger"] },
      { key: "capacity", label: "Capaciteit (kg)", type: "select", required: true, options: ["5", "6", "7", "8", "9", "10", "11", "12"] },
      { key: "energyLabel", label: "Energielabel (minimaal)", type: "select", required: false, options: ["A", "B", "C", "D", "E"] },
      { key: "spinSpeed", label: "Toerental (max rpm)", type: "select", required: false, options: ["800", "1000", "1200", "1400", "1600"] },
      { key: "placement", label: "Plaatsing", type: "select", required: true, options: ["Vrijstaand", "Inbouw", "Maakt niet uit"] },
      { key: "notes", label: "Aanvullende wensen", type: "textarea", required: false, placeholder: "Bijv. stoomfunctie, allergikerprogramma..." },
    ],
  },
  {
    name: "Laptop",
    slug: "laptop",
    icon: "💻",
    description: "Laptops voor werk, gaming en studie",
    fields: [
      { key: "screenSize", label: "Schermgrootte (inch)", type: "select", required: true, options: ["13", "14", "15", "16", "17"] },
      { key: "processor", label: "Processor", type: "select", required: true, options: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Apple M1", "Apple M2", "Apple M3"] },
      { key: "ram", label: "RAM (GB)", type: "select", required: true, options: ["4", "8", "16", "32", "64"] },
      { key: "storage", label: "Opslag", type: "select", required: true, options: ["128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "1TB HDD"] },
      { key: "usage", label: "Gebruik", type: "select", required: true, options: ["Thuisgebruik", "Zakelijk", "Gaming", "Design/Video", "Studie"] },
      { key: "os", label: "Besturingssysteem", type: "select", required: false, options: ["Windows 11", "macOS", "Linux", "Maakt niet uit"] },
      { key: "notes", label: "Aanvullende wensen", type: "textarea", required: false, placeholder: "Bijv. touchscreen, goede batterijduur..." },
    ],
  },
  {
    name: "Smartphone",
    slug: "smartphone",
    icon: "📱",
    description: "Smartphones van alle merken",
    fields: [
      { key: "os", label: "Besturingssysteem", type: "select", required: true, options: ["Android", "iOS", "Maakt niet uit"] },
      { key: "storage", label: "Opslag (GB)", type: "select", required: true, options: ["64", "128", "256", "512", "1024"] },
      { key: "ram", label: "RAM (GB)", type: "select", required: false, options: ["4", "6", "8", "12", "16"] },
      { key: "camera", label: "Camera (minimaal MP)", type: "select", required: false, options: ["12", "48", "50", "64", "108", "200"] },
      { key: "battery", label: "Accu (minimaal mAh)", type: "select", required: false, options: ["3000", "4000", "5000", "6000"] },
      { key: "connectivity", label: "Connectiviteit", type: "select", required: false, options: ["4G", "5G", "Maakt niet uit"] },
      { key: "notes", label: "Aanvullende wensen", type: "textarea", required: false, placeholder: "Bijv. waterbestendig, specifieke camera functies..." },
    ],
  },
  {
    name: "Auto",
    slug: "auto",
    icon: "🚗",
    description: "Nieuwe en tweedehands auto's",
    fields: [
      { key: "bodyType", label: "Carrosserie", type: "select", required: true, options: ["Hatchback", "Sedan", "SUV", "Stationwagon", "Coupé", "Cabriolet", "MPV/Van", "Pickup"] },
      { key: "fuel", label: "Brandstof", type: "select", required: true, options: ["Benzine", "Diesel", "Elektrisch", "Hybride (plug-in)", "Hybride", "LPG", "Waterstof"] },
      { key: "transmission", label: "Transmissie", type: "select", required: true, options: ["Handgeschakeld", "Automaat", "Semi-automaat", "Maakt niet uit"] },
      { key: "minYear", label: "Bouwjaar (minimum)", type: "number", required: false, placeholder: "Bijv. 2018" },
      { key: "maxKm", label: "Max. kilometerstand", type: "number", required: false, placeholder: "Bijv. 80000" },
      { key: "seats", label: "Aantal zitplaatsen", type: "select", required: false, options: ["2", "4", "5", "7", "8+"] },
      { key: "notes", label: "Aanvullende wensen", type: "textarea", required: false, placeholder: "Bijv. trekhaak, navigatie, specifieke kleur..." },
    ],
  },
  {
    name: "Koelkast",
    slug: "koelkast",
    icon: "🧊",
    description: "Koelkasten, vriezers en koel-vriescombinaties",
    fields: [
      { key: "type", label: "Type", type: "select", required: true, options: ["Koelkast", "Vriezer", "Koel-vriescombinatie", "Side-by-side", "French door"] },
      { key: "capacity", label: "Inhoud (liter)", type: "select", required: true, options: ["< 100", "100-200", "200-300", "300-400", "400-500", "> 500"] },
      { key: "energyLabel", label: "Energielabel (minimaal)", type: "select", required: false, options: ["A", "B", "C", "D", "E"] },
      { key: "placement", label: "Plaatsing", type: "select", required: true, options: ["Vrijstaand", "Inbouw", "Maakt niet uit"] },
      { key: "noFrost", label: "No-frost", type: "boolean", required: false },
      { key: "notes", label: "Aanvullende wensen", type: "textarea", required: false, placeholder: "Bijv. water/ijsdispenser, speciale kleur..." },
    ],
  },
  {
    name: "Camera",
    slug: "camera",
    icon: "📷",
    description: "Digitale camera's, DSLR en systeemcamera's",
    fields: [
      { key: "type", label: "Type camera", type: "select", required: true, options: ["Compact", "Bridge", "DSLR", "Systeemcamera (mirrorless)", "Actiecamera", "Instant"] },
      { key: "megapixels", label: "Megapixels (minimaal)", type: "select", required: false, options: ["12", "16", "20", "24", "36", "45", "60"] },
      { key: "videoRes", label: "Video resolutie", type: "select", required: false, options: ["Full HD", "4K", "6K", "8K"] },
      { key: "usage", label: "Gebruik", type: "select", required: true, options: ["Hobby", "Semi-professioneel", "Professioneel", "Vlog/YouTube", "Sport/Actie"] },
      { key: "notes", label: "Aanvullende wensen", type: "textarea", required: false, placeholder: "Bijv. specifiek lenssysteem, wifi, touchscreen..." },
    ],
  },
  {
    name: "Fiets",
    slug: "fiets",
    icon: "🚲",
    description: "Fietsen, e-bikes en speed pedelecs",
    fields: [
      { key: "type", label: "Type fiets", type: "select", required: true, options: ["Stadsfiets", "Racefiets", "Mountainbike", "E-bike", "Speed pedelec", "Vouwfiets", "Bakfiets"] },
      { key: "electric", label: "Elektrisch", type: "boolean", required: true },
      { key: "frameSize", label: "Framemaat", type: "select", required: false, options: ["XS (< 50cm)", "S (50-54cm)", "M (54-58cm)", "L (58-62cm)", "XL (> 62cm)", "Weet ik niet"] },
      { key: "gears", label: "Aantal versnellingen", type: "select", required: false, options: ["Geen (single speed)", "3-7", "8-11", "12+", "Maakt niet uit"] },
      { key: "gender", label: "Voor", type: "select", required: false, options: ["Heer", "Dame", "Unisex"] },
      { key: "notes", label: "Aanvullende wensen", type: "textarea", required: false, placeholder: "Bijv. accu range, specifiek merk motor..." },
    ],
  },
];

async function seed() {
  console.log("🌱 Seeding categories...");

  for (const cat of categories) {
    const existing = await db
      .select()
      .from(categoriesTable)
      .where(
        // @ts-ignore
        (c: any) => c.slug === cat.slug
      );

    const existingRow = await db
      .select()
      .from(categoriesTable);
    
    const found = existingRow.find(r => r.slug === cat.slug);
    
    if (found) {
      console.log(`  ✓ Category "${cat.name}" already exists`);
      continue;
    }

    await db.insert(categoriesTable).values({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      fields: cat.fields,
    });
    console.log(`  + Created category "${cat.name}"`);
  }

  const allCategories = await db.select().from(categoriesTable);
  const catMap = new Map(allCategories.map(c => [c.slug, c]));

  const existingRequests = await db.select().from(requestsTable);
  if (existingRequests.length > 0) {
    console.log("✓ Demo requests already exist, skipping...");
    return;
  }

  console.log("🌱 Seeding demo requests and bids...");

  const tvCat = catMap.get("televisie");
  const laptopCat = catMap.get("laptop");
  const autoCat = catMap.get("auto");
  const smartphoneCat = catMap.get("smartphone");

  if (tvCat) {
    const [tvRequest] = await db.insert(requestsTable).values({
      title: "Samsung 65 inch 4K OLED TV",
      brand: "Samsung",
      description: "Op zoek naar een goede Samsung OLED televisie voor de woonkamer. Budget is niet het grootste issue, kwaliteit staat voorop.",
      categoryId: tvCat.id,
      specifications: {
        screenSize: "65",
        resolution: "4K Ultra HD",
        displayType: "OLED",
        smart: true,
        hdr: "Dolby Vision",
        refreshRate: "120",
        notes: "Gaming functies zijn een pré"
      },
      allowedOfferTypes: ["new", "refurbished"],
      allowSimilarModels: true,
      consumerName: "Jan de Vries",
      consumerEmail: "jan@example.com",
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    }).returning();

    await db.insert(bidsTable).values([
      {
        requestId: tvRequest.id,
        supplierName: "Peter Bakker",
        supplierStore: "MediaMarkt Amsterdam",
        supplierEmail: "peter@mediamarkt.nl",
        price: "1299.00",
        offerType: "new",
        modelName: "Samsung QE65S95C OLED",
        description: "Splinternieuwe Samsung OLED 65 inch met garantie. Direct uit voorraad leverbaar.",
        warrantyMonths: 24,
        deliveryDays: 2,
        isSimilarModel: false,
      },
      {
        requestId: tvRequest.id,
        supplierName: "Lisa van Dam",
        supplierStore: "CoolBlue Den Haag",
        supplierEmail: "lisa@coolblue.nl",
        price: "1189.00",
        offerType: "new",
        modelName: "Samsung QE65S95CATXXN",
        description: "Nieuwe Samsung OLED met gratis installatie en wegbrengen van je oude TV.",
        warrantyMonths: 24,
        deliveryDays: 3,
        isSimilarModel: false,
      },
      {
        requestId: tvRequest.id,
        supplierName: "Mark Hendriks",
        supplierStore: "TV Outlet Rotterdam",
        supplierEmail: "mark@tvoutlet.nl",
        price: "899.00",
        offerType: "refurbished",
        modelName: "Samsung QE65S95B OLED",
        description: "Refurbished vorig jaar model, in uitstekende staat met 12 maanden garantie.",
        warrantyMonths: 12,
        deliveryDays: 5,
        isSimilarModel: true,
      },
    ]);
  }

  if (laptopCat) {
    const [laptopRequest] = await db.insert(requestsTable).values({
      title: "Apple MacBook Pro 14 inch M3",
      brand: "Apple",
      description: "Zoek een MacBook Pro M3 voor professioneel videosnijwerk en design. Moet snel zijn en lang meegaan op de accu.",
      categoryId: laptopCat.id,
      specifications: {
        screenSize: "14",
        processor: "Apple M3",
        ram: "16",
        storage: "512GB SSD",
        usage: "Design/Video",
        os: "macOS",
        notes: "MagSafe, minimaal 2x USB-C, TouchID"
      },
      allowedOfferTypes: ["new"],
      allowSimilarModels: false,
      consumerName: "Sophie Visser",
      consumerEmail: "sophie@example.nl",
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    }).returning();

    await db.insert(bidsTable).values([
      {
        requestId: laptopRequest.id,
        supplierName: "Tom van der Berg",
        supplierStore: "Apple Premium Reseller Utrecht",
        supplierEmail: "tom@applereseller.nl",
        price: "2149.00",
        offerType: "new",
        modelName: "Apple MacBook Pro 14\" M3 Pro 18GB/512GB",
        description: "Nieuw in doos, inclusief Apple Care+ aanbieding. Vandaag besteld, morgen in huis.",
        warrantyMonths: 12,
        deliveryDays: 1,
        isSimilarModel: false,
      },
      {
        requestId: laptopRequest.id,
        supplierName: "Emma de Jong",
        supplierStore: "BCC Eindhoven",
        supplierEmail: "emma@bcc.nl",
        price: "2099.00",
        offerType: "new",
        modelName: "Apple MacBook Pro 14\" M3 16GB/512GB",
        description: "Nieuw exemplaar, incl. 2 jaar garantie via Apple. Gratis levering.",
        warrantyMonths: 24,
        deliveryDays: 2,
        isSimilarModel: false,
      },
    ]);
  }

  if (autoCat) {
    const [autoRequest] = await db.insert(requestsTable).values({
      title: "Volkswagen Golf 2020 of nieuwer",
      brand: "Volkswagen",
      description: "Zoek een betrouwbare Volkswagen Golf, liefst occasion in goede staat. Regelmatig gebruik woon-werkverkeer.",
      categoryId: autoCat.id,
      specifications: {
        bodyType: "Hatchback",
        fuel: "Benzine",
        transmission: "Handgeschakeld",
        minYear: "2020",
        maxKm: "80000",
        seats: "5",
        notes: "Airco, navigatie, liefst metallic kleur"
      },
      allowedOfferTypes: ["occasion", "refurbished"],
      allowSimilarModels: true,
      consumerName: "Rick Smit",
      consumerEmail: "rick@example.com",
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    }).returning();

    await db.insert(bidsTable).values([
      {
        requestId: autoRequest.id,
        supplierName: "Alex van Houten",
        supplierStore: "AutoCenter De Lely",
        supplierEmail: "alex@autocenterlely.nl",
        price: "22500.00",
        offerType: "occasion",
        modelName: "Volkswagen Golf 1.5 TSI Life 2021",
        description: "Golf uit 2021, 45.000 km, volledig dealer onderhouden. Inclusief navigatie en achteruitrijcamera.",
        warrantyMonths: 12,
        deliveryDays: 7,
        isSimilarModel: false,
      },
      {
        requestId: autoRequest.id,
        supplierName: "Karin Mulder",
        supplierStore: "Auto Palace Amsterdam",
        supplierEmail: "karin@autopalace.nl",
        price: "24900.00",
        offerType: "occasion",
        modelName: "Volkswagen Golf 2.0 TDI Style 2022",
        description: "Diesel Golf 2022 met alleen 30.000km. Panoramadak, leer, full opties.",
        warrantyMonths: 24,
        deliveryDays: 5,
        isSimilarModel: false,
      },
      {
        requestId: autoRequest.id,
        supplierName: "Dave Willemsen",
        supplierStore: "Seat & VW Specialist Breda",
        supplierEmail: "dave@seatvw.nl",
        price: "19990.00",
        offerType: "occasion",
        modelName: "SEAT Leon 1.5 TSI FR 2021",
        description: "Soortgelijk model, SEAT Leon is op hetzelfde platform gebouwd als Golf. Iets sportiever, zelfde betrouwbaarheid.",
        warrantyMonths: 12,
        deliveryDays: 3,
        isSimilarModel: true,
      },
    ]);
  }

  if (smartphoneCat) {
    const [phoneRequest] = await db.insert(requestsTable).values({
      title: "Samsung Galaxy S24 Ultra",
      brand: "Samsung",
      description: "Op zoek naar de Galaxy S24 Ultra voor professioneel camerawerk. S Pen is een must.",
      categoryId: smartphoneCat.id,
      specifications: {
        os: "Android",
        storage: "256",
        ram: "12",
        camera: "200",
        battery: "5000",
        connectivity: "5G",
        notes: "S Pen, titanium frame"
      },
      allowedOfferTypes: ["new", "refurbished"],
      allowSimilarModels: false,
      consumerName: "Maya Hassan",
      consumerEmail: "maya@example.nl",
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    }).returning();

    await db.insert(bidsTable).values([
      {
        requestId: phoneRequest.id,
        supplierName: "Bas Hoekstra",
        supplierStore: "GSM Planet",
        supplierEmail: "bas@gsmplanet.nl",
        price: "1249.00",
        offerType: "new",
        modelName: "Samsung Galaxy S24 Ultra 256GB Titanium Black",
        description: "Nieuw, ongeopend in doos. Inclusief Samsung headset cadeau.",
        warrantyMonths: 24,
        deliveryDays: 1,
        isSimilarModel: false,
      },
      {
        requestId: phoneRequest.id,
        supplierName: "Noor van Leeuwen",
        supplierStore: "Belsimpel",
        supplierEmail: "noor@belsimpel.nl",
        price: "1199.00",
        offerType: "new",
        modelName: "Samsung Galaxy S24 Ultra 256GB",
        description: "Nieuw toestel met 24 maanden fabrieksgarantie. Morgen geleverd bij bestelling voor 23:00.",
        warrantyMonths: 24,
        deliveryDays: 1,
        isSimilarModel: false,
      },
    ]);
  }

  console.log("✅ Seeding complete!");
}

seed().catch(console.error).finally(() => process.exit(0));
