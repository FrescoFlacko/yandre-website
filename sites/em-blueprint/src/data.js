/*
 * All profile content for the blueprint site lives here.
 *
 * Source: Yan's LinkedIn profile screenshots (2026-09-30), including the
 * Experience and Projects sections. Truncated LinkedIn text ("...more") is
 * left out rather than guessed.
 * Set `pending: true` on any entry to render it as a red "redline" placeholder.
 */
window.PROFILE = {
  name: "Yanique Andre",
  callsign: "yan",
  headline: "Senior Technology Officer, BMO",
  tagline: "Engineering leadership",
  location: "Brampton, Ontario, Canada",
  linkedin: "https://www.linkedin.com/in/yanique-andre",
  github: "https://github.com/FrescoFlacko",

  quote: {
    text: "Tell me and I forget, teach me and I may remember, involve me and I learn.",
    by: "Benjamin Franklin",
  },
  summary: {
    text:
      "First introduced to programming by hacking and scripting Pokémon games at 12. " +
      "University showed there is more to creating software than writing code that works: " +
      "algorithms, data structures, design patterns. Today: a dedicated, curious self-learner " +
      "who went from shipping iOS apps to leading the teams that build BMO's branch technology.",
  },

  // First professional role; drives the console's `uptime`.
  firstShip: "2017-04-01",
  firstShipLabel: "Codewater Tech",

  // Diagram lanes, top to bottom.
  lanes: [
    { id: "foundation", label: "Foundation" },
    { id: "client", label: "Mobile & clients" },
    { id: "web3", label: "Web3 projects" },
    { id: "bmo", label: "BMO" },
  ],

  // Each node is one box on the architecture diagram, placed to scale by date.
  // `end: null` means ongoing.
  nodes: [
    {
      id: "guelph",
      lane: "foundation",
      kind: "Education",
      title: "University of Guelph",
      start: "2013-09",
      end: "2018-04",
      stack: ["Algorithms", "Data structures", "OOP", "Design patterns", "Databases", "Networks"],
      notes: [
        "Bachelor of Computing: Honours, Computer Science, 2013 to 2018.",
        "Activities: Volunteer Note Taker.",
        "Coursework included Software Engineering and Software System Development & Integration.",
      ],
    },
    {
      id: "premiere",
      lane: "client",
      kind: "Project",
      title: "Premiere",
      start: "2016-04",
      end: "2017-05",
      stack: ["Java", "Swift", "Xcode", "Android Studio", "HTTP + JSON"],
      notes: [
        "Find parties and events around the city on a map, and follow friends, clubs or promoters for updates.",
        "Orchestrated the entire project: wireframes, user interface design and every feature.",
        "Learned Android and iOS from scratch by researching Java and Swift and improving through trial and error.",
        "Handled messages to servers and APIs through HTTP requests and JSON serialization.",
      ],
    },
    {
      id: "codewater",
      lane: "client",
      kind: "iOS Developer",
      title: "Codewater Tech",
      start: "2017-04",
      end: "2017-08",
      place: "Brampton, ON",
      stack: ["iOS", "Swift", "Xcode"],
      notes: ["Executed the development of the iOS application for the company's clients."],
    },
    {
      id: "escy",
      lane: "client",
      kind: "Project",
      title: "Escy",
      start: "2017-06",
      end: "2017-08",
      stack: ["Core Location", "Google Maps", "Firebase", "App Store", "Google Play"],
      notes: [
        "Find barber shops nearby, book appointments and post promotions for your shop.",
        "Implemented Core Location for current coordinates, Google Maps for shop locations and Firebase for server hosting.",
        "Shipped the app to the iOS App Store and Google Play Store.",
      ],
    },
    {
      id: "citysight",
      lane: "client",
      kind: "Project",
      title: "CitySight",
      start: "2017-08",
      end: "2018-01",
      stack: ["Swift", "Xcode", "CocoaPods"],
      notes: [
        "Dating app for meeting people nearby by swiping on profiles or searching on your own.",
        "Built the application independently for the client using Xcode and Swift.",
        "Brought in libraries and frameworks through CocoaPods to make the app more efficient.",
      ],
    },
    {
      id: "hikma",
      lane: "client",
      kind: "Consultant · Freelance",
      title: "Hikma360",
      start: "2019-11",
      end: "2020-03",
      place: "Toronto, Ontario",
      stack: ["Angular", "Ionic"],
      notes: [
        "Freelance consultant who aided in development of the product, built with Angular and Ionic.",
        "A client testimonial is attached to this role on LinkedIn.",
      ],
    },
    {
      id: "mango",
      lane: "web3",
      kind: "Project",
      title: "Mango Heroes",
      start: "2021-11",
      end: "2022-04",
      stack: ["React", "Solana", "Metaplex Candy Machine", "Mango Markets"],
      notes: [
        "NFT platform on Solana: 7,000 generated comic-style artworks made available to buy through Metaplex's Candy Machine.",
        "Created the entire front-end website in React, where users buy the NFT and view project info, social links and the whitepaper.",
        "Integrated the NFT into Mango Markets, a Solana DeFi application.",
      ],
    },
    {
      id: "parier",
      lane: "web3",
      kind: "Project",
      title: "Parier",
      start: "2022-01",
      end: "2022-07",
      stack: ["React", "@solana/web3.js", "Smart contracts"],
      notes: [
        "Betting platform on Solana where users bet on what price a company's stock will open at in the next market session.",
        "Constructed the entire application in React, using the Solana web3 library to talk to the Parier smart contracts.",
        "Assisted in building the smart contracts and deploying them on the Solana blockchain.",
      ],
    },
    {
      id: "dev",
      lane: "bmo",
      kind: "BMO · Full-time",
      title: "Software Developer",
      start: "2018-09",
      end: "2022-06",
      place: "Greater Toronto Area",
      stack: ["iOS", "Bamboo", "CI/CD", "Unit testing"],
      notes: [
        "Lead developer for the EEMA project: software design, development, testing and deployment.",
        "Coordinated maintenance of 5+ iOS applications under the Digitization team, keeping them current with iOS and BMO standards.",
        "Organized certificates, developer certificates and distribution certificates.",
        "Archived, exported and deployed the iOS apps to production.",
        "Oversaw the DevOps CI/CD setup in Bamboo, cutting overall build time by 70%.",
        "Wrote unit tests to hold 80% code coverage.",
      ],
    },
    {
      id: "lead",
      lane: "bmo",
      kind: "BMO · Full-time",
      title: "Lead Developer",
      start: "2022-06",
      end: "2023-01",
      place: "Toronto, Ontario · Remote",
      stack: ["Team of 5+", "BitBucket", "Bamboo", "Artifactory", "Ansible", "AWS ECS", "ECR", "DynamoDB"],
      notes: [
        "Led a team of 5+ developers on a branch technology web application.",
        "Developed the frontend for 4 web applications used by more than 800 branches across Canada.",
        "Kept development and business teams aligned on requirements.",
        "Set up the CI/CD pipeline on BitBucket, Bamboo, Artifactory and Ansible.",
        "Set up AWS services for the project, including ECS, ECR and DynamoDB.",
        "Maintained documentation of all technical information for every project.",
        "Spearheaded the Digitization team's interview process, hiring 10+ engineers.",
      ],
    },
    {
      id: "techlead",
      lane: "bmo",
      kind: "BMO · Full-time",
      title: "Technical Lead",
      start: "2023-01",
      end: "2025-02",
      stack: ["Azure AD", "Single Sign-On"],
      notes: [
        "Set up the technology for a scheduling application used within branches.",
        "Established the Azure AD project for Single Sign-On integration.",
      ],
    },
    {
      id: "sto",
      lane: "bmo",
      kind: "BMO · Current",
      title: "Senior Technology Officer",
      start: "2025-02",
      end: null,
      stack: ["Leadership"],
      notes: ["Current role at BMO, after 8 years and four titles at the bank."],
    },
  ],

  // Directed edges: what each stage fed into.
  edges: [
    ["premiere", "codewater", "first role"],
    ["codewater", "escy", "mobile"],
    ["escy", "citysight", ""],
    ["guelph", "dev", "graduated"],
    ["dev", "hikma", ""],
    ["mango", "parier", "Solana"],
    ["dev", "lead", "promoted"],
    ["lead", "techlead", "promoted"],
    ["techlead", "sto", "promoted"],
  ],

  // Impact figures, each quoted from a role above.
  metrics: [
    { value: "800+", unit: "branches", label: "use the 4 web apps whose frontend Yan built", source: "lead" },
    { value: "10+", unit: "engineers", label: "hired through the interview process Yan ran", source: "lead" },
    { value: "−70%", unit: "build time", label: "after the Bamboo CI/CD overhaul", source: "dev" },
    { value: "80%", unit: "coverage", label: "unit test coverage held on the iOS apps", source: "dev" },
    { value: "5+", unit: "developers", label: "led on the branch technology web app", source: "lead" },
    { value: "7,000", unit: "NFTs", label: "generated artworks sold through the site Yan built", source: "mango" },
  ],

  // Skills grouped the way a service catalog groups dependencies.
  capabilities: [
    { group: "Proficient", items: ["Angular", "JavaScript", "SCSS", "CSS", "HTML", "Swift", "Java", "C", "Python", "iOS", "Android"] },
    { group: "Familiar", items: ["Objective-C", "Spring Boot", "PHP", "React", "Solana"] },
    { group: "Tooling", items: ["Xcode", "Android Studio", "Sketch", "BitBucket", "Bamboo", "Artifactory", "Ansible", "AWS", "Azure AD", "Firebase"] },
  ],
};
