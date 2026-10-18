/* The Kit — everything on the shelf, as one array.
 *
 * Source of truth for kit.html and for the hub's row figure, so the two can't
 * drift. Nothing here is rendered from hardcoded markup: add an item and it
 * appears on the page and in the count.
 *
 * `price` is a number in USD, or null where a reliable figure could not be
 * confirmed — null renders as "see site" rather than a made-up number, which
 * is the same rule the rest of the site follows. `asOf` is stamped on the page
 * so a reader knows the prices are a snapshot and the link is the live answer.
 *
 * `form` picks the drawn silhouette in kit.js. Add a new form there before
 * using it here, or the tile falls back to a plain box.
 *
 * Links go to the maker's own store wherever one exists. None of them are
 * affiliate links and nothing here is sponsored — worth keeping true.
 */
window.KIT = {
  asOf: "2026-09",

  groups: [
    {
      id: "health",
      label: "Health",
      blurb: "Daily. Most of it has been in rotation long enough to be boring, which is the point.",
      items: [
        {
          id: "tl-whey",
          brand: "Transparent Labs",
          name: "100% Grass-Fed Whey Protein Isolate",
          variant: "Blueberry Pancakes",
          what: "Protein powder",
          price: 64.99,
          form: "tub",
          url: "https://www.transparentlabs.com/collections/proteinseries/series-protein"
        },
        {
          id: "barebells",
          brand: "Barebells",
          name: "Protein Bar",
          variant: "Cookies & Caramel",
          what: "Protein bar",
          price: null,
          form: "bar",
          url: "https://shop.barebells.com/products/barebells-cookies-caramel"
        },
        {
          id: "raw-creatine",
          brand: "RAW Nutrition",
          name: "Creatine Monohydrate",
          variant: "Unflavored",
          what: "Creatine",
          price: 15.99,
          form: "tub",
          url: "https://getrawnutrition.com/products/raw-nutrition-creatine"
        },
        {
          id: "lmnt",
          brand: "LMNT",
          name: "Zero-Sugar Electrolytes",
          variant: "Raspberry Salt",
          what: "Electrolytes",
          price: 45.00,
          form: "stick",
          url: "https://drinklmnt.com/products/lmnt-recharge-electrolyte-drink"
        },
        {
          id: "blueprint-oil",
          brand: "Blueprint",
          name: "Snake Oil",
          variant: "High-polyphenol extra virgin",
          what: "Olive oil",
          price: 39.00,
          form: "bottle",
          url: "https://blueprint.bryanjohnson.com/products/extra-virgin-olive-oil"
        },
        {
          id: "blueprint-serum",
          brand: "Blueprint",
          name: "SFC Facial Serum",
          variant: null,
          what: "Serum",
          price: 59.00,
          form: "dropper",
          url: "https://blueprint.bryanjohnson.com/products/facial-serum"
        },
        {
          id: "blueprint-moisturizer",
          brand: "Blueprint",
          name: "SFC Facial Moisturizer",
          variant: null,
          what: "Face cream",
          price: 69.00,
          form: "jar",
          url: "https://blueprint.bryanjohnson.com/products/facial-moisturizer"
        },
        {
          id: "vanman-soap",
          brand: "VanMan",
          name: "Tallow & Honey Soap",
          variant: null,
          what: "Bar soap",
          price: null,
          form: "soap",
          url: "https://vanman.shop/products/new-vanmans-tallow-honey-soap"
        },
        {
          id: "lacolombe",
          brand: "La Colombe",
          name: "Deep Bleu",
          variant: "Organic dark roast",
          what: "Coffee",
          price: 18.00,
          form: "bag",
          url: "https://www.lacolombe.com/products/deep-bleu-organic"
        }
      ]
    },

    {
      id: "hiking",
      label: "Hiking",
      blurb: "What actually goes in the pack. Thin for now — the rest gets added as it earns its weight.",
      pending: "More coming soon",
      items: [
        {
          id: "first-ascent",
          brand: "First Ascent",
          name: "Handcrafted Instant Coffee",
          variant: "Single-serve packets",
          what: "Coffee",
          price: 14.99,
          priceFrom: true,
          form: "packet",
          url: "https://www.firstascentcoffee.com/collections/hand-crafted-instant-coffee"
        }
      ]
    }
  ]
};
