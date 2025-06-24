// js/coureurs.js
const COUREURS = [
    {
        "nom": "Zip Fer",
        "equipe": "Österreichisches Bier"
    },
    {
        "nom": "Marco Pantani",
        "equipe": "Big Farma"
    },
    {
        "nom": "John Lennon",
        "equipe": "Weed"
    },
    {
        "nom": "Van Sifer",
        "equipe": "Viesmann"
    },
    {
        "nom": "Dario Frigo",
        "equipe": "Saunier Duval"
    },
    {
        "nom": "Romain Blochon",
        "equipe": "Good Cheese"
    },
    {
        "nom": "Ba Varia",
        "equipe": "Nederlands Bier"
    },
    {
        "nom": "Yves Voncrevay",
        "equipe": "Gangster and Gentleman"
    },
    {
        "nom": "Ice Cube",
        "equipe": "Weed"
    },
    {
        "nom": "Carl Lewis",
        "equipe": "Doping"
    },
    {
        "nom": "Leo Pompasse",
        "equipe": "UCPSPA"
    },
    {
        "nom": "Mascare Pone",
        "equipe": "Team Burrata"
    },
    {
        "nom": "Fri Son",
        "equipe": "Team Gouda"
    },
    {
        "nom": "Otta Kringer",
        "equipe": "Österreichisches Bier"
    },
    {
        "nom": "Kaiser Bier",
        "equipe": "Österreichisches Bier"
    },
    {
        "nom": "Fritz Fass",
        "equipe": "Bier Brigade"
    },
    {
        "nom": "Matt Houston",
        "equipe": "RnB de Rue"
    },
    {
        "nom": "Thomas Voeckler",
        "equipe": "Froooonce"
    },
    {
        "nom": "Bernard Hinault",
        "equipe": "Froooonce"
    },
    {
        "nom": "Gorgone Zola",
        "equipe": "Team Burrata"
    },
    {
        "nom": "Mangetes Morbier",
        "equipe": "Good Cheese"
    },
    {
        "nom": "Al Libi",
        "equipe": "Gangster and Gentleman"
    },
    {
        "nom": "Riccardo Ricco",
        "equipe": "Saunier Duval"
    },
    {
        "nom": "Leer Dammer",
        "equipe": "Team Gouda"
    },
    {
        "nom": "Pico Don",
        "equipe": "Team Claquos"
    },
    {
        "nom": "Naruto Uzumaki",
        "equipe": "Daikin"
    },
    {
        "nom": "Duncan Coillotte",
        "equipe": "Good Cheese"
    },
    {
        "nom": "Fourme Dambert",
        "equipe": "Team Claquos"
    },
    {
        "nom": "Alessandro Ballan",
        "equipe": "Saunier Duval"
    },
    {
        "nom": "Frédéric Beigbedder",
        "equipe": "Over Dose Racing"
    },
    {
        "nom": "Julian Alaphilippe",
        "equipe": "Froooonce"
    },
    {
        "nom": "Dieter Bitburger",
        "equipe": "Bier Brigade"
    },
    {
        "nom": "Göss Her",
        "equipe": "Österreichisches Bier"
    },
    {
        "nom": "Johnny Hallyday",
        "equipe": "Over Dose Racing"
    },
    {
        "nom": "Bob Marley",
        "equipe": "Weed"
    },
    {
        "nom": "Justin Bieber",
        "equipe": "RnB de Rue"
    },
    {
        "nom": "Ra Chelle",
        "equipe": "UCPSPA"
    },
    {
        "nom": "Danilo Di Luca",
        "equipe": "Saunier Duval"
    },
    {
        "nom": "Hess Céhache",
        "equipe": "Rap Street Boys"
    },
    {
        "nom": "Wiz Khalifa",
        "equipe": "Weed"
    },
    {
        "nom": "Ughes Goboss",
        "equipe": "Gangster and Gentleman"
    },
    {
        "nom": "Richard Virenque",
        "equipe": "Froooonce"
    },
    {
        "nom": "Brillat Savarin",
        "equipe": "Team Claquos"
    },
    {
        "nom": "Tonton Graillou",
        "equipe": "Team Alençon"
    },
    {
        "nom": "Rez Iztense",
        "equipe": "Viesmann"
    },
    {
        "nom": "Kar Rate",
        "equipe": "Daikin"
    },
    {
        "nom": "Raymond Gold",
        "equipe": "Good Cheese"
    },
    {
        "nom": "Ma Roilles",
        "equipe": "Team Claquos"
    },
    {
        "nom": "Joël Givré",
        "equipe": "Frisquet"
    },
    {
        "nom": "Damiano Cunego",
        "equipe": "Saunier Duval"
    },
    {
        "nom": "Karl Beck",
        "equipe": "Bier Brigade"
    },
    {
        "nom": "Hirt Herbier",
        "equipe": "Österreichisches Bier"
    },
    {
        "nom": "Sashi Mi",
        "equipe": "Daikin"
    },
    {
        "nom": "Saint Emilion",
        "equipe": "20 Rouge"
    },
    {
        "nom": "K Kamaro",
        "equipe": "RnB de Rue"
    },
    {
        "nom": "Linde Boom",
        "equipe": "Nederlands Bier"
    },
    {
        "nom": "Bradley Wiggins",
        "equipe": "Suceurs 2 Roues"
    },
    {
        "nom": "Floyd Landis",
        "equipe": "Big Farma"
    },
    {
        "nom": "Al Kpote",
        "equipe": "Gangster and Gentleman"
    },
    {
        "nom": "Aurel San",
        "equipe": "Rap Street Boys"
    },
    {
        "nom": "Nicolas De Bourgueil",
        "equipe": "20 Rouge"
    },
    {
        "nom": "Bob Lacroute",
        "equipe": "Good Cheese"
    },
    {
        "nom": "Geiten Kaas",
        "equipe": "Team Gouda"
    },
    {
        "nom": "B Passi",
        "equipe": "RnB de Rue"
    },
    {
        "nom": "Luc Tenfré",
        "equipe": "Frisquet"
    },
    {
        "nom": "David Gaudu",
        "equipe": "Froooonce"
    },
    {
        "nom": "Rico Ta",
        "equipe": "Team Burrata"
    },
    {
        "nom": "Thierry Ardisson",
        "equipe": "Over Dose Racing"
    },
    {
        "nom": "Alessandro Petacchi",
        "equipe": "Saunier Duval"
    },
    {
        "nom": "Bank Ize",
        "equipe": "Frisquet"
    },
    {
        "nom": "Samy Naceri",
        "equipe": "Over Dose Racing"
    },
    {
        "nom": "Tyler. Hamilton",
        "equipe": "Big Farma"
    },
    {
        "nom": "Uwe Pilsner",
        "equipe": "Bier Brigade"
    },
    {
        "nom": "Maas Dam",
        "equipe": "Team Gouda"
    },
    {
        "nom": "Parmi Giano",
        "equipe": "Team Burrata"
    },
    {
        "nom": "Hans Hopfen",
        "equipe": "Bier Brigade"
    },
    {
        "nom": "Kami Kaze",
        "equipe": "Daikin"
    },
    {
        "nom": "Cam Ambert",
        "equipe": "Team Claquos"
    },
    {
        "nom": "Marion Jones",
        "equipe": "Doping"
    },
    {
        "nom": "Willy Denzey",
        "equipe": "RnB de Rue"
    },
    {
        "nom": "Miguel Indurain",
        "equipe": "Big Farma"
    },
    {
        "nom": "Gey Zer",
        "equipe": "Viesmann"
    },
    {
        "nom": "Michael Rasmussen",
        "equipe": "Big Farma"
    },
    {
        "nom": "Goudebananece Beaujolais",
        "equipe": "20 Rouge"
    },
    {
        "nom": "Lalande De Pomerol",
        "equipe": "20 Rouge"
    },
    {
        "nom": "Taka Tire",
        "equipe": "Daikin"
    },
    {
        "nom": "Ferme Laporte",
        "equipe": "Frisquet"
    },
    {
        "nom": "So Prano",
        "equipe": "Rap Street Boys"
    },
    {
        "nom": "Matt Pokora",
        "equipe": "RnB de Rue"
    },
    {
        "nom": "Heine Ken",
        "equipe": "Nederlands Bier"
    },
    {
        "nom": "Wiesel Burger",
        "equipe": "Österreichisches Bier"
    },
    {
        "nom": "Black Aime",
        "equipe": "Rap Street Boys"
    },
    {
        "nom": "Johan Museeuw",
        "equipe": "Big Farma"
    },
    {
        "nom": "Tom Simpson",
        "equipe": "Doping"
    },
    {
        "nom": "Delirium Tremens",
        "equipe": "Belgisch Bier"
    },
    {
        "nom": "Francesco Casagrande",
        "equipe": "Saunier Duval"
    },
    {
        "nom": "Yves Caille",
        "equipe": "Frisquet"
    },
    {
        "nom": "Gou Da",
        "equipe": "Team Gouda"
    },
    {
        "nom": "Ay Dam",
        "equipe": "Team Gouda"
    },
    {
        "nom": "Punti Gamer",
        "equipe": "Österreichisches Bier"
    },
    {
        "nom": "Trumer Pils",
        "equipe": "Österreichisches Bier"
    },
    {
        "nom": "Laurent Jalabert",
        "equipe": "Froooonce"
    },
    {
        "nom": "Hubert Savary de Beauregard",
        "equipe": "Team Alençon"
    },
    {
        "nom": "Jan Ullrich",
        "equipe": "Suceurs 2 Roues"
    },
    {
        "nom": "Grinne Dgeu",
        "equipe": "Rap Street Boys"
    },
    {
        "nom": "G Calo",
        "equipe": "RnB de Rue"
    },
    {
        "nom": "Max Weizen",
        "equipe": "Bier Brigade"
    },
    {
        "nom": "Vinz Cent",
        "equipe": "UCPSPA"
    },
    {
        "nom": "Sun Yang",
        "equipe": "Doping"
    },
    {
        "nom": "Ley Den",
        "equipe": "Team Gouda"
    },
    {
        "nom": "Gilles Tarot",
        "equipe": "Team Alençon"
    },
    {
        "nom": "Stro Mae",
        "equipe": "Rap Street Boys"
    },
    {
        "nom": "Lambrusco Prosecco",
        "equipe": "20 Rouge"
    },
    {
        "nom": "Tom Desbauges",
        "equipe": "Good Cheese"
    },
    {
        "nom": "Robert de la Bergerie",
        "equipe": "UCPSPA"
    },
    {
        "nom": "Mozza Rella",
        "equipe": "Team Burrata"
    },
    {
        "nom": "Ra Aekwon",
        "equipe": "Gangster and Gentleman"
    },
    {
        "nom": "Fabio Aroue",
        "equipe": "Suceurs 2 Roues"
    },
    {
        "nom": "Roch Fort",
        "equipe": "Team Claquos"
    },
    {
        "nom": "Yves Gêle",
        "equipe": "Frisquet"
    },
    {
        "nom": "Guivarch Kiri",
        "equipe": "Good Cheese"
    },
    {
        "nom": "Dra Ke",
        "equipe": "Weed"
    },
    {
        "nom": "Grim Bergen",
        "equipe": "Belgisch Bier"
    },
    {
        "nom": "Am Stel",
        "equipe": "Nederlands Bier"
    },
    {
        "nom": "Mobb Infamous",
        "equipe": "Gangster and Gentleman"
    },
    {
        "nom": "N'golo Comté",
        "equipe": "Good Cheese"
    },
    {
        "nom": "Piti Chou",
        "equipe": "Team Alençon"
    },
    {
        "nom": "Moincinq Degré",
        "equipe": "Frisquet"
    },
    {
        "nom": "Zun Dert",
        "equipe": "Nederlands Bier"
    },
    {
        "nom": "Bruno Krombacher",
        "equipe": "Bier Brigade"
    },
    {
        "nom": "Kanye West",
        "equipe": "Weed"
    },
    {
        "nom": "Oedipus Brewing",
        "equipe": "Nederlands Bier"
    },
    {
        "nom": "Stra Chino",
        "equipe": "Team Burrata"
    },
    {
        "nom": "Brie de Meaux",
        "equipe": "Team Claquos"
    },
    {
        "nom": "Kom Paan",
        "equipe": "Nederlands Bier"
    },
    {
        "nom": "Jan Hertog",
        "equipe": "Nederlands Bier"
    },
    {
        "nom": "West Malle",
        "equipe": "Belgisch Bier"
    },
    {
        "nom": "Mi Loud",
        "equipe": "UCPSPA"
    },
    {
        "nom": "Gilbert Lainé",
        "equipe": "Team Alençon"
    },
    {
        "nom": "Djou Houle",
        "equipe": "Rap Street Boys"
    },
    {
        "nom": "Maurice Greene",
        "equipe": "Doping"
    },
    {
        "nom": "Therm Hostat",
        "equipe": "Viesmann"
    },
    {
        "nom": "Ben Johnson",
        "equipe": "Doping"
    },
    {
        "nom": "Jay Z",
        "equipe": "Weed"
    },
    {
        "nom": "Elon Musk",
        "equipe": "Over Dose Racing"
    },
    {
        "nom": "Diego Maradona",
        "equipe": "Doping"
    },
    {
        "nom": "Jean-Claude Van Damme",
        "equipe": "Over Dose Racing"
    },
    {
        "nom": "Steven Kruijswijuijswijk",
        "equipe": "Suceurs 2 Roues"
    },
    {
        "nom": "Ki Inimod",
        "equipe": "Gangster and Gentleman"
    },
    {
        "nom": "Joseba Beloki",
        "equipe": "Suceurs 2 Roues"
    },
    {
        "nom": "Nippon Nimove",
        "equipe": "Daikin"
    },
    {
        "nom": "Jonas Vingegarde",
        "equipe": "Suceurs 2 Roues"
    },
    {
        "nom": "Otto Krug",
        "equipe": "Bier Brigade"
    },
    {
        "nom": "Raymond Poulidor",
        "equipe": "Froooonce"
    },
    {
        "nom": "Erik Zabel",
        "equipe": "Big Farma"
    },
    {
        "nom": "Kal Orifer",
        "equipe": "Viesmann"
    },
    {
        "nom": "Hiro Shima",
        "equipe": "Daikin"
    },
    {
        "nom": "Tim Montgomery",
        "equipe": "Doping"
    },
    {
        "nom": "Otto Clave",
        "equipe": "Viesmann"
    },
    {
        "nom": "Boil Her",
        "equipe": "Viesmann"
    },
    {
        "nom": "Jupi Ler",
        "equipe": "Belgisch Bier"
    },
    {
        "nom": "Cazu Martzu",
        "equipe": "Team Burrata"
    },
    {
        "nom": "Oudgard Den",
        "equipe": "Belgisch Bier"
    },
    {
        "nom": "Affli Gem",
        "equipe": "Belgisch Bier"
    },
    {
        "nom": "Maitre Gims",
        "equipe": "Rap Street Boys"
    },
    {
        "nom": "Lance Armstrong",
        "equipe": "Big Farma"
    },
    {
        "nom": "Chikun Gunya",
        "equipe": "Team Alençon"
    },
    {
        "nom": "Jean-Luc Delarue",
        "equipe": "Over Dose Racing"
    },
    {
        "nom": "Moos Tache",
        "equipe": "UCPSPA"
    },
    {
        "nom": "Gilberto Simoni",
        "equipe": "Saunier Duval"
    },
    {
        "nom": "Snoop Dog",
        "equipe": "Weed"
    },
    {
        "nom": "Robin Aitery",
        "equipe": "Frisquet"
    },
    {
        "nom": "Peco Rino",
        "equipe": "Team Burrata"
    },
    {
        "nom": "Clim Atizer",
        "equipe": "Viesmann"
    },
    {
        "nom": "Shin Kansen",
        "equipe": "Daikin"
    },
    {
        "nom": "Blue Fort",
        "equipe": "Team Gouda"
    },
    {
        "nom": "Doc Gyneco",
        "equipe": "RnB de Rue"
    },
    {
        "nom": "David Desnos",
        "equipe": "Team Alençon"
    },
    {
        "nom": "Vianney Pangrazy",
        "equipe": "Team Alençon"
    },
    {
        "nom": "Geraint Tomasse",
        "equipe": "Suceurs 2 Roues"
    },
    {
        "nom": "Henoc Beausejour",
        "equipe": "Gangster and Gentleman"
    },
    {
        "nom": "Pierre Palmade",
        "equipe": "Over Dose Racing"
    },
    {
        "nom": "Thibaut Pinot",
        "equipe": "Froooonce"
    },
    {
        "nom": "Muscat Rivesaltes",
        "equipe": "20 Rouge"
    },
    {
        "nom": "Rigoberto Ouran",
        "equipe": "Suceurs 2 Roues"
    },
    {
        "nom": "Stella Artois",
        "equipe": "Belgisch Bier"
    },
    {
        "nom": "Saint Nectaire",
        "equipe": "Team Claquos"
    },
    {
        "nom": "Lef Fe",
        "equipe": "Belgisch Bier"
    },
    {
        "nom": "Fort Pommard",
        "equipe": "20 Rouge"
    },
    {
        "nom": "Al Bane",
        "equipe": "UCPSPA"
    },
    {
        "nom": "Crozés Hermitage",
        "equipe": "20 Rouge"
    },
    {
        "nom": "Amande Ine",
        "equipe": "UCPSPA"
    }
];
