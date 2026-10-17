export interface AreaInfo {
  name: string;
  slug: string;
  span: string;
  para: string;
  nearby: string[];
}

/** Neighborhood pages, copied from AREAS in the client build.py (2026-10-16). Order is the menu/footer order. */
export const AREAS_LIST: AreaInfo[] = [
  {
    name: "Downtown",
    slug: "affordable-cannabis-in-downtown-dc-weed-deals",
    span: "from Gallery Place to Farragut Square",
    para: "From the office towers around Metro Center to the apartments near Mount Vernon Square, Torch brings flower, pre-rolls, vapes and edibles to your door.",
    nearby: ["Penn Quarter", "Chinatown", "Shaw", "Logan Circle", "Capitol Hill"],
  },
  {
    name: "Adams Morgan",
    slug: "adams-morgan-weed-delivery-dc",
    span: "from 18th Street to Kalorama Park",
    para: "Whether you're heading out for a night on 18th Street or staying in near Meridian Hill Park, Torch brings top-shelf flower, pre-rolls, vapes and edibles straight to your Adams Morgan door.",
    nearby: ["Columbia Heights", "Dupont Circle", "U Street", "Logan Circle", "Shaw"],
  },
  {
    name: "Columbia Heights",
    slug: "affordable-cannabis-columbia-heights-dc",
    span: "from 14th Street to Sherman Avenue",
    para: "From the shops around 14th and Irving to the rowhouses off Sherman Avenue, Columbia Heights gets free delivery on every order, packed discreetly, with cash on delivery.",
    nearby: ["Petworth", "Adams Morgan", "U Street", "Shaw", "Brookland"],
  },
  {
    name: "Brookland",
    slug: "brookland-dc-weed-delivery-catholic-university-area-torch-cannabis",
    span: "around Catholic University and Monroe Street Market",
    para: "Near Catholic University, Monroe Street Market or the quiet streets toward Fort Totten, Brookland residents 21+ get free delivery from Torch with cash on delivery.",
    nearby: ["Petworth", "Columbia Heights", "H Street", "Capitol Hill", "Shaw"],
  },
  {
    name: "Shaw",
    slug: "shaw-dc-cannabis-delivery-dispensary",
    span: "from the Howard Theatre to the Convention Center",
    para: "From 7th Street to the Howard Theatre, Shaw gets free delivery from Torch on every order. Order flower, pre-rolls or edibles for a night in and we bring it to you.",
    nearby: ["U Street", "Logan Circle", "Downtown", "Columbia Heights", "Adams Morgan"],
  },
  {
    name: "Logan Circle",
    slug: "cannabis-delivery-in-logan-circle-dc-torch-dispensary",
    span: "along 14th Street and P Street",
    para: "Along the 14th Street corridor and the brownstones around the circle, Logan Circle gets fast, free delivery from Torch in unmarked packaging.",
    nearby: ["Dupont Circle", "Shaw", "U Street", "Downtown", "Adams Morgan"],
  },
  {
    name: "Capitol Hill",
    slug: "cannabis-delivery-in-capitol-hill-dc-torch-dispensary",
    span: "from Eastern Market to Lincoln Park",
    para: "From Eastern Market to Lincoln Park and Barracks Row, Capitol Hill neighbors get free delivery on every order, with cash on delivery.",
    nearby: ["H Street", "Navy Yard", "Downtown", "Brookland", "Shaw"],
  },
  {
    name: "Navy Yard",
    slug: "cannabis-delivery-in-navy-yard-dc-torch",
    span: "around Nationals Park and the Yards",
    para: "Before a game at Nationals Park or after a walk along the Yards, Navy Yard residents can get flower, vapes and edibles delivered free from Torch.",
    nearby: ["Capitol Hill", "Anacostia", "Downtown", "H Street", "Shaw"],
  },
  {
    name: "Dupont Circle",
    slug: "cannabis-delivery-in-dupont-circle-dc-torch-dispensary",
    span: "from Connecticut Avenue to 17th Street",
    para: "From Connecticut Avenue to the cafes on 17th Street, Dupont Circle gets free, discreet delivery from Torch, seven days a week.",
    nearby: ["Logan Circle", "Adams Morgan", "Georgetown", "U Street", "Downtown"],
  },
  {
    name: "Petworth",
    slug: "cannabis-delivery-in-petworth-dc-torch",
    span: "around Upshur Street and Grant Circle",
    para: "Around Upshur Street, Grant Circle and the Georgia Avenue corridor, Petworth residents 21+ get free delivery from Torch with cash on delivery.",
    nearby: ["Columbia Heights", "Brookland", "Adams Morgan", "U Street", "Shaw"],
  },
  {
    name: "U Street",
    slug: "cannabis-delivery-on-u-street-dc-torch",
    span: "from the 9:30 Club to Ben's Chili Bowl",
    para: "From the 9:30 Club to Ben's Chili Bowl, U Street gets free delivery from Torch, whether you're gearing up for a show or settling in for the night.",
    nearby: ["Shaw", "Logan Circle", "Adams Morgan", "Columbia Heights", "Dupont Circle"],
  },
  {
    name: "Georgetown",
    slug: "cannabis-delivery-in-georgetown-dc-torch-dispensary",
    span: "from M Street to Georgetown University",
    para: "From the waterfront and M Street to the quiet blocks near the university, Georgetown residents and visitors 21+ get free delivery from Torch.",
    nearby: ["Dupont Circle", "Adams Morgan", "Downtown", "Logan Circle", "U Street"],
  },
  {
    name: "H Street",
    slug: "cannabis-delivery-on-h-street-ne-dc-torch",
    span: "along the H Street NE corridor",
    para: "Along the H Street NE corridor, from Union Station to the Atlas District, Torch delivers free with cash on delivery.",
    nearby: ["Capitol Hill", "Navy Yard", "Brookland", "Downtown", "Shaw"],
  },
  {
    name: "Penn Quarter",
    slug: "cannabis-delivery-in-penn-quarter-dc-torch",
    span: "from Capital One Arena to the Navy Memorial",
    para: "From the apartments above 7th Street to the blocks around Capital One Arena and the Navy Memorial, Torch brings flower, pre-rolls, vapes and edibles to your door.",
    nearby: ["Downtown", "Chinatown", "Shaw", "Capitol Hill", "NoMa"],
  },
  {
    name: "Woodley Park",
    slug: "cannabis-delivery-in-woodley-park-dc-torch",
    span: "around Connecticut Avenue and the National Zoo",
    para: "From the rowhouses off Connecticut Avenue to the quiet blocks near the National Zoo and Rock Creek Park, Woodley Park residents 21+ get free delivery from Torch with cash on delivery.",
    nearby: ["Adams Morgan", "Dupont Circle", "Columbia Heights", "Georgetown", "Petworth"],
  },
  {
    name: "Foggy Bottom",
    slug: "cannabis-delivery-in-foggy-bottom-dc-torch",
    span: "from Washington Circle to the Kennedy Center",
    para: "From Washington Circle to the Kennedy Center and the Watergate, Foggy Bottom gets free, discreet delivery from Torch, seven days a week.",
    nearby: ["Georgetown", "Dupont Circle", "Downtown", "Logan Circle", "Penn Quarter"],
  },
  {
    name: "NoMa",
    slug: "cannabis-delivery-in-noma-dc-torch",
    span: "from Union Station to the Metropolitan Branch Trail",
    para: "From the towers around the NoMa-Gallaudet Metro to the Metropolitan Branch Trail, NoMa gets free delivery from Torch on every order, packed in unmarked bags.",
    nearby: ["H Street", "Shaw", "Capitol Hill", "Brookland", "Penn Quarter"],
  },
  {
    name: "Anacostia",
    slug: "cannabis-delivery-in-anacostia-dc-torch",
    span: "from Good Hope Road to Anacostia Park",
    para: "From the shops on Good Hope Road and the Big Chair on Martin Luther King Jr Avenue to the blocks near the Frederick Douglass house and Anacostia Park, Torch brings flower, pre-rolls, vapes and edibles right to your door.",
    nearby: ["Congress Heights", "Fairlawn", "Hillcrest", "Navy Yard", "Capitol Hill"],
  },
  {
    name: "Congress Heights",
    slug: "cannabis-delivery-in-congress-heights-dc-torch",
    span: "along Martin Luther King Jr Avenue SE",
    para: "Along Martin Luther King Jr Avenue and around the arena at St. Elizabeths East, Congress Heights residents 21+ get free delivery from Torch with cash on delivery.",
    nearby: ["Anacostia", "Hillcrest", "Fairlawn", "Navy Yard", "Capitol Hill"],
  },
  {
    name: "Hillcrest",
    slug: "cannabis-delivery-in-hillcrest-dc-torch",
    span: "off Pennsylvania Avenue SE and Naylor Road",
    para: "On the tree-lined streets off Pennsylvania Avenue and Naylor Road, Hillcrest gets free, discreet delivery from Torch, seven days a week.",
    nearby: ["Fairlawn", "Anacostia", "Congress Heights", "Capitol Hill", "Navy Yard"],
  },
  {
    name: "Fairlawn",
    slug: "cannabis-delivery-in-fairlawn-dc-torch",
    span: "between Anacostia Park and Pennsylvania Avenue SE",
    para: "Between Anacostia Park and Pennsylvania Avenue, along Minnesota Avenue and Good Hope Road, Fairlawn neighbors get free delivery on every order, packed in unmarked bags.",
    nearby: ["Anacostia", "Hillcrest", "Congress Heights", "Capitol Hill", "Navy Yard"],
  },
  {
    name: "Friendship Heights",
    slug: "cannabis-delivery-in-friendship-heights-dc-torch",
    span: "around Wisconsin Avenue and Chevy Chase, DC",
    para: "From the shops along Wisconsin Avenue to the tree-lined streets of Chevy Chase, DC, Friendship Heights residents 21+ get free delivery from Torch with cash on delivery.",
    nearby: ["Chevy Chase", "Tenleytown", "Woodley Park", "Georgetown", "Dupont Circle"],
  },
];

export const AREAS_BY_SLUG: Record<string, AreaInfo> = Object.fromEntries(
  AREAS_LIST.map((a) => [a.slug, a])
);

export const AREA_URL_MAP: Record<string, string> = Object.fromEntries(
  AREAS_LIST.map((a) => [a.name, `/${a.slug}`])
);
