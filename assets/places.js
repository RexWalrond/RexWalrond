/* Field Notes — the single source of truth for every place on the site.
 *
 * The map reads this; the trip cards and site lists on trips.html carry
 * matching `id` attributes so a marker can point at its write-up. If a place
 * is added here it appears on the map immediately — add the card by hand and
 * give it `id="place-<id>"` to wire the two together.
 *
 * Coordinates are trailhead / site / summit points to roughly 3dp (~100 m).
 * They are where the thing is, not a recorded GPS track.
 *
 *   kind    backcountry | dive | ski
 *   status  done        | wish
 */
window.PLACES = [

  /* ------------------------- backcountry: walked ------------------------- */
  {
    id: "four-pass-loop",
    kind: "backcountry", status: "done",
    name: "Four Pass Loop",
    where: "Maroon Bells–Snowmass Wilderness, CO",
    when: "August 2019", year: 2019,
    lat: 39.071, lon: -106.951,
    stats: [["~26 mi", "distance"], ["~7,900 ft", "gain"], ["12,500 ft", "high point"]],
    note: "Four passes over 12,000 feet in one loop through the Elk Range. The trip that started all of this.",
    tag: "First trip"
  },
  {
    id: "rainier-dc",
    kind: "backcountry", status: "done",
    name: "Mt Rainier — Disappointment Cleaver",
    where: "Mount Rainier NP, WA",
    when: "July 2020", year: 2020,
    lat: 46.853, lon: -121.760,
    stats: [["~18 mi", "distance"], ["~9,000 ft", "gain"], ["14,411 ft", "summit"]],
    note: "Glaciated climb, roped team, staged camps at Muir and Ingraham Flats. First mountain I stood on top of.",
    tag: "Summited", summited: true
  },
  {
    id: "jmt-clouds-rest",
    kind: "backcountry", status: "done",
    name: "John Muir Trail — Clouds Rest & Half Dome",
    where: "Yosemite NP, CA",
    when: "June 2021", year: 2021,
    lat: 37.768, lon: -119.490,
    stats: [["~40 mi", "distance"], ["~7,500 ft", "gain"], ["9,926 ft", "high point"]],
    note: "South out of Tuolumne with the two detours that make the trip. Clouds Rest has the better view."
  },
  {
    id: "teton-crest",
    kind: "backcountry", status: "done",
    name: "Teton Crest Trail — extended loop",
    where: "Grand Teton NP, WY",
    when: "August 2022", year: 2022,
    lat: 43.732, lon: -110.876,
    stats: [["~50 mi", "distance"], ["~9,000 ft", "gain"], ["10,720 ft", "high point"]],
    note: "Death Canyon Shelf and Alaska Basin, closed over Paintbrush Divide rather than walking out the standard finish."
  },
  {
    id: "bowman-kintla",
    kind: "backcountry", status: "done",
    name: "Bowman Lake to Kintla Lake",
    where: "Glacier NP, MT",
    when: "August 2023", year: 2023,
    lat: 48.883, lon: -114.281,
    stats: [["~32 mi", "distance"], ["~5,500 ft", "gain"], ["7,470 ft", "high point"]],
    note: "The far northwest corner of the park, over Brown and Boulder passes. Grizzly country the whole way."
  },
  {
    id: "onion-whitney",
    kind: "backcountry", status: "done",
    name: "Onion Valley to Whitney Portal",
    where: "Sierra Nevada, CA",
    when: "August 2025", year: 2025,
    lat: 36.679, lon: -118.292,
    stats: [["~50 mi", "distance"], ["~12,000 ft", "gain"], ["13,600 ft", "high point"]],
    note: "In over Kearsarge to pick up the JMT, then Forester Pass and Trail Crest. The most sustained altitude of anything here."
  },

  /* ------------------------ backcountry: on the list ------------------------ */
  { id: "zion", kind: "backcountry", status: "wish", name: "Zion National Park",
    where: "Utah", lat: 37.298, lon: -113.026, meta: "Canyon country" },
  { id: "matterhorn", kind: "backcountry", status: "wish", name: "The Matterhorn",
    where: "Zermatt, Switzerland", lat: 45.976, lon: 7.658, meta: "14,692 ft" },
  { id: "kilimanjaro", kind: "backcountry", status: "wish", name: "Kilimanjaro",
    where: "Tanzania", lat: -3.066, lon: 37.355, meta: "19,341 ft" },
  { id: "denali", kind: "backcountry", status: "wish", name: "Mount McKinley (Denali)",
    where: "Alaska Range, AK", lat: 63.069, lon: -151.007, meta: "20,310 ft" },
  { id: "vinson", kind: "backcountry", status: "wish", name: "Mount Vinson",
    where: "Ellsworth Mountains, Antarctica", lat: -78.525, lon: -85.617, meta: "16,050 ft" },

  /* ----------------------------- dive: logged ----------------------------- */
  { id: "devils-den", kind: "dive", status: "done", name: "Devil’s Den",
    where: "Williston, FL", lat: 29.428, lon: -82.696, meta: "Spring · cavern" },
  { id: "blue-grotto", kind: "dive", status: "done", name: "Blue Grotto",
    where: "Williston, FL", lat: 29.360, lon: -82.700, meta: "Spring · cavern" },
  { id: "ginnie-springs", kind: "dive", status: "done", name: "Ginnie Springs",
    where: "High Springs, FL", lat: 29.836, lon: -82.700, meta: "Spring · cavern system" },
  { id: "troy-spring", kind: "dive", status: "done", name: "Troy Spring",
    where: "Branford, FL", lat: 30.006, lon: -82.996, meta: "Spring · Suwannee River" },
  { id: "royal-spring", kind: "dive", status: "done", name: "Royal Spring",
    where: "Live Oak, FL", lat: 30.226, lon: -82.936, meta: "Spring · Suwannee River" },
  { id: "paradise-spring", kind: "dive", status: "done", name: "Paradise Spring",
    where: "Ocala, FL", lat: 29.187, lon: -82.140, meta: "Spring · cavern" },
  { id: "hudson-grotto", kind: "dive", status: "done", name: "Hudson Grotto",
    where: "Hudson, FL", lat: 28.366, lon: -82.664, meta: "Spring · cavern" },
  { id: "catalina", kind: "dive", status: "done", name: "Catalina Island",
    where: "California", lat: 33.395, lon: -118.417, meta: "Kelp forest · open water" },

  /* ---------------------------- dive: on the list ---------------------------- */
  { id: "silfra", kind: "dive", status: "wish", name: "Silfra fissure",
    where: "Þingvellir, Iceland", lat: 64.256, lon: -21.117, meta: "Between two plates" },
  { id: "king-crab", kind: "dive", status: "wish", name: "King crab dive",
    where: "Alaska", lat: 59.643, lon: -151.547, meta: "Cold water" },
  { id: "kelp-sa", kind: "dive", status: "wish", name: "Kelp forests",
    where: "South Africa", lat: -34.135, lon: 18.435, meta: "Cold water · kelp" },
  { id: "kona-manta", kind: "dive", status: "wish", name: "Manta ray night dive",
    where: "Kona, Hawaii", lat: 19.733, lon: -156.058, meta: "Night · pelagics" },
  { id: "blue-hole", kind: "dive", status: "wish", name: "Great Blue Hole",
    where: "Lighthouse Reef, Belize", lat: 17.316, lon: -87.535, meta: "Blue hole · deep" },
  { id: "newfoundland", kind: "dive", status: "wish", name: "Kelp & eelgrass beds",
    where: "Newfoundland, Canada", lat: 47.562, lon: -52.712, meta: "Cold water · kelp" },

  /* --------------------------------- ski --------------------------------- */
  { id: "alta", kind: "ski", status: "done", name: "Alta",
    where: "Little Cottonwood Canyon, UT", lat: 40.589, lon: -111.638, meta: "Skiers only" },
  { id: "snowbird", kind: "ski", status: "done", name: "Snowbird",
    where: "Little Cottonwood Canyon, UT", lat: 40.581, lon: -111.656, meta: "Steep · deep" },
  { id: "deer-valley", kind: "ski", status: "done", name: "Deer Valley",
    where: "Park City, UT", lat: 40.637, lon: -111.478, meta: "Skiers only · groomed" },
  { id: "park-city", kind: "ski", status: "done", name: "Park City",
    where: "Park City, UT", lat: 40.651, lon: -111.508, meta: "Sprawling" },
  { id: "vail", kind: "ski", status: "done", name: "Vail",
    where: "Vail, CO", lat: 39.606, lon: -106.355, meta: "Back Bowls" },
  { id: "telluride", kind: "ski", status: "done", name: "Telluride",
    where: "Telluride, CO", lat: 37.936, lon: -107.812, meta: "San Juans · steep" },
  { id: "sun-valley", kind: "ski", status: "done", name: "Sun Valley",
    where: "Ketchum, ID", lat: 43.697, lon: -114.352, meta: "Bald Mountain" }
];

/* Framing presets for the map. `pad` is in degrees of latitude. */
window.PLACE_VIEWS = [
  { id: "world",   label: "World",        bounds: null },
  { id: "west",    label: "Western US",   bounds: [-125.5, 32.0, -104.0, 49.5] },
  { id: "springs", label: "Florida",      bounds: [-83.6, 27.9, -81.6, 30.6] }
];
