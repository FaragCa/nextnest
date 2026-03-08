// New York State cities and neighborhoods for autocomplete
const NY_LOCATIONS = [
  // Major Cities
  "New York, NY", "Buffalo, NY", "Rochester, NY", "Yonkers, NY", "Syracuse, NY",
  "Albany, NY", "New Rochelle, NY", "Mount Vernon, NY", "Schenectady, NY", "Utica, NY",
  "White Plains, NY", "Troy, NY", "Niagara Falls, NY", "Binghamton, NY", "Ithaca, NY",
  "Saratoga Springs, NY", "Poughkeepsie, NY", "Kingston, NY", "Newburgh, NY", "Middletown, NY",
  "Elmira, NY", "Auburn, NY", "Watertown, NY", "Plattsburgh, NY", "Jamestown, NY",
  "Glens Falls, NY", "Oneonta, NY", "Batavia, NY", "Cortland, NY", "Beacon, NY",
  // NYC Boroughs
  "Manhattan, NY", "Brooklyn, NY", "Queens, NY", "Bronx, NY", "Staten Island, NY",
  // Manhattan Neighborhoods
  "Upper West Side, Manhattan, NY", "Upper East Side, Manhattan, NY", "Midtown, Manhattan, NY",
  "Chelsea, Manhattan, NY", "Greenwich Village, Manhattan, NY", "SoHo, Manhattan, NY",
  "Tribeca, Manhattan, NY", "Financial District, Manhattan, NY", "Harlem, Manhattan, NY",
  "East Harlem, Manhattan, NY", "Washington Heights, Manhattan, NY", "Inwood, Manhattan, NY",
  "Lower East Side, Manhattan, NY", "East Village, Manhattan, NY", "Hell's Kitchen, Manhattan, NY",
  "Murray Hill, Manhattan, NY", "Gramercy Park, Manhattan, NY", "Flatiron, Manhattan, NY",
  "NoHo, Manhattan, NY", "Nolita, Manhattan, NY", "Chinatown, Manhattan, NY",
  "Little Italy, Manhattan, NY", "Battery Park City, Manhattan, NY", "Morningside Heights, Manhattan, NY",
  // Brooklyn Neighborhoods
  "Williamsburg, Brooklyn, NY", "Park Slope, Brooklyn, NY", "DUMBO, Brooklyn, NY",
  "Brooklyn Heights, Brooklyn, NY", "Bushwick, Brooklyn, NY", "Greenpoint, Brooklyn, NY",
  "Bed-Stuy, Brooklyn, NY", "Crown Heights, Brooklyn, NY", "Prospect Heights, Brooklyn, NY",
  "Carroll Gardens, Brooklyn, NY", "Cobble Hill, Brooklyn, NY", "Boerum Hill, Brooklyn, NY",
  "Fort Greene, Brooklyn, NY", "Red Hook, Brooklyn, NY", "Sunset Park, Brooklyn, NY",
  "Bay Ridge, Brooklyn, NY", "Flatbush, Brooklyn, NY", "Bensonhurst, Brooklyn, NY",
  "Sheepshead Bay, Brooklyn, NY", "Brighton Beach, Brooklyn, NY", "Coney Island, Brooklyn, NY",
  "Borough Park, Brooklyn, NY", "Dyker Heights, Brooklyn, NY", "Kensington, Brooklyn, NY",
  "Midwood, Brooklyn, NY", "Marine Park, Brooklyn, NY", "Mill Basin, Brooklyn, NY",
  // Queens Neighborhoods
  "Astoria, Queens, NY", "Long Island City, Queens, NY", "Flushing, Queens, NY",
  "Jackson Heights, Queens, NY", "Forest Hills, Queens, NY", "Rego Park, Queens, NY",
  "Bayside, Queens, NY", "Jamaica, Queens, NY", "Woodside, Queens, NY",
  "Sunnyside, Queens, NY", "Ridgewood, Queens, NY", "Elmhurst, Queens, NY",
  "Corona, Queens, NY", "Kew Gardens, Queens, NY", "Howard Beach, Queens, NY",
  "Ozone Park, Queens, NY", "Fresh Meadows, Queens, NY", "Woodhaven, Queens, NY",
  "Rockaway Beach, Queens, NY", "Far Rockaway, Queens, NY",
  // Bronx Neighborhoods
  "Riverdale, Bronx, NY", "Pelham Bay, Bronx, NY", "Fordham, Bronx, NY",
  "Mott Haven, Bronx, NY", "Hunts Point, Bronx, NY", "Parkchester, Bronx, NY",
  "Throgs Neck, Bronx, NY", "Morris Park, Bronx, NY", "City Island, Bronx, NY",
  "Co-op City, Bronx, NY", "Kingsbridge, Bronx, NY",
  // Staten Island Neighborhoods
  "St. George, Staten Island, NY", "Todt Hill, Staten Island, NY",
  "Great Kills, Staten Island, NY", "Tottenville, Staten Island, NY",
  "New Dorp, Staten Island, NY", "Stapleton, Staten Island, NY",
  // Long Island
  "Hempstead, NY", "Brookhaven, NY", "Islip, NY", "Oyster Bay, NY", "Babylon, NY",
  "Huntington, NY", "Smithtown, NY", "North Hempstead, NY", "Riverhead, NY",
  "Southampton, NY", "East Hampton, NY", "Garden City, NY", "Great Neck, NY",
  "Mineola, NY", "Port Washington, NY", "Manhasset, NY", "Roslyn, NY",
  "Syosset, NY", "Massapequa, NY", "Levittown, NY", "Hicksville, NY",
  "Farmingdale, NY", "Commack, NY", "Dix Hills, NY", "Centereach, NY",
  "Hauppauge, NY", "Stony Brook, NY", "Port Jefferson, NY",
  // Westchester County
  "White Plains, NY", "Scarsdale, NY", "Larchmont, NY", "Mamaroneck, NY",
  "Rye, NY", "Harrison, NY", "Bronxville, NY", "Tuckahoe, NY",
  "Pelham, NY", "Eastchester, NY", "Dobbs Ferry, NY", "Hastings-on-Hudson, NY",
  "Irvington, NY", "Tarrytown, NY", "Sleepy Hollow, NY", "Ossining, NY",
  "Peekskill, NY", "Croton-on-Hudson, NY", "Pleasantville, NY", "Chappaqua, NY",
  "Bedford, NY", "Katonah, NY", "Mount Kisco, NY", "Yorktown Heights, NY",
  // Rockland County
  "Nyack, NY", "Pearl River, NY", "Nanuet, NY", "New City, NY", "Suffern, NY",
  "Spring Valley, NY", "Haverstraw, NY", "Stony Point, NY",
  // Hudson Valley
  "Beacon, NY", "Cold Spring, NY", "Garrison, NY", "Pawling, NY",
  "Rhinebeck, NY", "Red Hook, NY", "Woodstock, NY", "Saugerties, NY",
  "New Paltz, NY", "Highland, NY", "Wappingers Falls, NY",
  // Capital Region
  "Saratoga Springs, NY", "Clifton Park, NY", "Niskayuna, NY",
  "Colonie, NY", "Guilderland, NY", "Latham, NY", "Delmar, NY",
  // ZIP Code patterns
  "10001", "10002", "10003", "10004", "10005", "10006", "10007", "10009",
  "10010", "10011", "10012", "10013", "10014", "10016", "10017", "10018",
  "10019", "10020", "10021", "10022", "10023", "10024", "10025", "10026",
  "10027", "10028", "10029", "10030", "10031", "10032", "10033", "10034",
  "10035", "10036", "10037", "10038", "10039", "10040", "10044", "10065",
  "10069", "10075", "10103", "10110", "10111", "10112", "10115", "10128",
  "10280", "10282", "11201", "11203", "11204", "11205", "11206", "11207",
  "11208", "11209", "11210", "11211", "11212", "11213", "11214", "11215",
  "11216", "11217", "11218", "11219", "11220", "11221", "11222", "11223",
  "11224", "11225", "11226", "11228", "11229", "11230", "11231", "11232",
  "11233", "11234", "11235", "11236", "11237", "11238", "11239",
];

export default NY_LOCATIONS;
