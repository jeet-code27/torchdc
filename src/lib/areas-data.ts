export interface AreaInfo {
  name: string;
  slug: string;
  span: string;
  para: string;
  nearby: string[];
}

export const AREAS_LIST: AreaInfo[] = [
  {
    name: "Downtown",
    slug: "affordable-cannabis-in-downtown-dc-weed-deals",
    span: "from Gallery Place to Farragut Square",
    para: "Our home base is right here on G St NW, so Downtown orders are some of our fastest. From the office towers around Metro Center to the apartments near Mount Vernon Square, Torch brings flower, pre-rolls, vapes and edibles to your door.",
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
    para: "From the shops around 14th and Irving to the rowhouses off Sherman Avenue, Columbia Heights gets free delivery on every order, packed discreetly and handed over after a quick ID check.",
    nearby: ["Petworth", "Adams Morgan", "U Street", "Shaw", "Brookland"],
  },
  {
    name: "Brookland",
    slug: "brookland-dc-weed-delivery-catholic-university-area-torch-cannabis",
    span: "around Catholic University and Monroe Street Market",
    para: "Near Catholic University, Monroe Street Market or the quiet streets toward Fort Totten, Brookland residents 21+ get free delivery from Torch with cash paid at the door.",
    nearby: ["Petworth", "Columbia Heights", "H Street", "Capitol Hill", "Shaw"],
  },
  {
    name: "Shaw",
    slug: "shaw-dc-cannabis-delivery-dispensary",
    span: "from the Howard Theatre to the Convention Center",
    para: "From 7th Street to the Howard Theatre, Shaw is minutes from our G St NW home base. Order flower, pre-rolls or edibles for a night in and we bring it to you.",
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
    para: "From Eastern Market to Lincoln Park and Barracks Row, Capitol Hill neighbors get free delivery on every order, with cash paid at the door.",
    nearby: ["H Street", "Navy Yard", "Downtown", "Brookland", "Shaw"],
  },
  {
    name: "Navy Yard",
    slug: "cannabis-delivery-in-navy-yard-dc-torch",
    span: "around Nationals Park and the Yards",
    para: "Before a game at Nationals Park or after a walk along the Yards, Navy Yard residents can get flower, vapes and edibles delivered free from Torch.",
    nearby: ["Capitol Hill", "Downtown", "H Street", "Logan Circle", "Shaw"],
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
    para: "Around Upshur Street, Grant Circle and the Georgia Avenue corridor, Petworth residents 21+ get free delivery from Torch with a quick ID check at the door.",
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
    para: "Along the H Street NE corridor, from Union Station to the Atlas District, Torch delivers free with cash paid at the door and a quick ID check.",
    nearby: ["Capitol Hill", "Navy Yard", "Brookland", "Downtown", "Shaw"],
  },
];

export const AREAS_BY_SLUG: Record<string, AreaInfo> = Object.fromEntries(
  AREAS_LIST.map((a) => [a.slug, a])
);

export const AREA_URL_MAP: Record<string, string> = Object.fromEntries(
  AREAS_LIST.map((a) => [a.name, `/${a.slug}`])
);
