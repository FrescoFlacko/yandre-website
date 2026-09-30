// All of the site's content lives in this one file.
//
// Sources: Yanique's LinkedIn profile (screenshots shared in the project,
// Sep 2026) and the tagline and stack from the original site in this repo.
//
// Anything wrapped in {{double braces}} is an unconfirmed placeholder. It
// renders with a yellow "TBC" highlight so it can never be mistaken for
// fact. Replace the text (and drop the braces) once the detail is known.

export interface Role {
  years: string;
  title: string;
  org: string;
  place?: string;
  dek: string;
  notes?: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface Principle {
  title: string;
  body: string;
  evidence: string;
}

export interface Project {
  name: string;
  years: string;
  what: string;
  did: string;
  tech: string[];
}

export interface QA {
  q: string;
  a: string;
}

export const profile = {
  name: "Yanique Andre",
  firstName: "Yanique",
  masthead: "YANDRE",
  role: "Senior Technology Officer, BMO",
  location: "Brampton, Ontario",
  issue: "Vol. 01 · The Leadership Issue",
  season: "Fall 2026",
  motto: ["Autodidact", "Polymath", "Human"],

  links: {
    linkedin: "https://www.linkedin.com/in/yanique-andre",
    github: "https://github.com/FrescoFlacko",
    githubHandle: "FrescoFlacko",
  },

  coverLines: [
    { kicker: "Cover story", text: "From Pokémon scripts to 800 bank branches" },
    { kicker: "Inside", text: "Eight years, four titles, one bank" },
    { kicker: "Plus", text: "The playbook behind 10+ hires" },
  ],

  feature: {
    headline: "The long way round to leadership",
    dek: "Yanique Andre started by hacking Pokémon games at twelve. Eight years into a career at BMO, the job is building the teams that build the software.",
    byline: "Feature · Brampton, ON",
    paragraphs: [
      "The first program was a cheat. At twelve, Yanique Andre learned to hack and script Pokémon games, then kept pulling on the thread: C++, C#, Visual Basic and a handful of small frameworks, all before high school. By graduation the pattern was set. Learn it alone, then build something with it.",
      "University changed the frame. A Bachelor of Computing in Computer Science at the University of Guelph brought algorithms, data structures, object-oriented design and patterns, and with them the realization that there is more to creating software than writing code that works. A summer as an iOS developer at Codewater Tech in Brampton put that into practice before the degree was finished.",
      "In September 2018 Yanique joined BMO as a software developer on the Digitization team. The work was native iOS: lead developer on the EEMA project, keeping five-plus apps current with iOS and bank standards, owning certificates and production releases. A Bamboo pipeline cut build times by 70 percent and unit tests held coverage at 80 percent. On the side came a freelance stint consulting for Hikma360 on an Angular and Ionic app.",
      "The shift to leading people came in 2022. As lead developer, Yanique ran a team of five-plus engineers on branch technology, shipped the front end of four web applications used in more than 800 branches across Canada, and spearheaded the interview process that brought more than ten engineers into the company. As technical lead, the scope widened to platform decisions, including Azure AD single sign-on for a branch scheduling app. Since February 2025 the title has been Senior Technology Officer.",
    ],
    pullQuote: "“Tell me and I forget, teach me and I may remember, involve me and I learn.”",
    pullCredit: "Benjamin Franklin, the line that opens Yanique's profile",
  },

  chronology: [
    {
      years: "Feb 2025 – Now",
      title: "Senior Technology Officer",
      org: "BMO",
      dek: "Senior technology leadership at BMO, eight years after joining as a developer.",
    },
    {
      years: "Jan 2023 – Feb 2025",
      title: "Technical Lead",
      org: "BMO",
      dek: "Set up the technology for a scheduling application used within branches, including an Azure AD project for single sign-on.",
    },
    {
      years: "Jun 2022 – Jan 2023",
      title: "Lead Developer",
      org: "BMO",
      place: "Toronto · Remote",
      dek: "Led a team of 5+ developers on a branch technology web application.",
      notes: [
        "Built the front end for 4 web apps used by 800+ branches across Canada",
        "Kept development and business teams aligned on requirements",
        "Set up CI/CD on Bitbucket, Bamboo, Artifactory and Ansible",
        "Set up AWS services for the project, including ECS, ECR and DynamoDB",
        "Maintained technical documentation for every project",
        "Ran interviews for the Digitization team, hiring 10+ engineers",
      ],
    },
    {
      years: "Nov 2019 – Mar 2020",
      title: "Consultant",
      org: "Hikma360 · Freelance",
      place: "Toronto",
      dek: "Consulted on and helped develop an app built with Angular and Ionic.",
    },
    {
      years: "Sep 2018 – Jun 2022",
      title: "Software Developer",
      org: "BMO",
      place: "Greater Toronto Area",
      dek: "Lead developer on the EEMA project, from design through deployment.",
      notes: [
        "Maintained 5+ iOS apps for the Digitization team",
        "Owned certificates and production releases for the iOS apps",
        "Bamboo CI/CD that cut build time by 70%",
        "Held unit test coverage at 80%",
      ],
    },
    {
      years: "Apr – Aug 2017",
      title: "iOS Developer",
      org: "Codewater Tech",
      place: "Brampton",
      dek: "Built the iOS application for the company's clients.",
    },
    {
      years: "2013 – 2018",
      title: "Bachelor of Computing (Honours), Computer Science",
      org: "University of Guelph",
      dek: "Volunteer note taker.",
    },
  ] as Role[],

  numbers: [
    { value: "800+", label: "BMO branches using apps Yanique's team built" },
    { value: "10+", label: "engineers hired through the interview process Yanique ran" },
    { value: "70%", label: "cut in build time from a Bamboo CI/CD pipeline" },
    { value: "8", label: "years at BMO, across four roles" },
  ] as Stat[],

  playbook: [
    {
      title: "Involve people, don't just tell them",
      body: "The Franklin line at the top of Yanique's profile doubles as a management style. People learn by doing the work, so the work gets shared early.",
      evidence: "Kept development and business teams aligned on requirements as lead developer.",
    },
    {
      title: "Build the team on purpose",
      body: "Hiring is the highest-leverage thing an engineering lead does, so it gets real time and a real process.",
      evidence: "Spearheaded the Digitization team's interview process and hired 10+ engineers.",
    },
    {
      title: "Automate the path to production",
      body: "Fast, boring releases give a team its time back. Invest in the pipeline before it hurts.",
      evidence: "Bamboo CI/CD that cut build time by 70%, with unit test coverage held at 80%.",
    },
  ] as Principle[],

  stack: [
    { group: "Proficient", items: ["Angular", "JavaScript", "SCSS", "CSS", "HTML", "Swift", "Java", "C", "Python", "iOS", "Android"] },
    { group: "Familiar", items: ["Objective-C", "Spring Boot", "PHP"] },
    { group: "Delivery", items: ["Bitbucket", "Bamboo", "Artifactory", "Ansible", "AWS", "Azure AD"] },
    { group: "Tools", items: ["Xcode", "Android Studio", "Sketch"] },
    { group: "Also shipped", items: ["React", "TypeScript", "Kotlin", "Ionic", "Firebase", "Parse", "Solana", "Gatsby"] },
  ],

  // Side projects, newest first, from the Projects section of LinkedIn.
  projects: [
    {
      name: "Parier",
      years: "Jan – Jul 2022",
      what: "A betting platform on the Solana blockchain where users bet on the price a company's stock will open at in the next market session.",
      did: "Built the entire application in React, talking to the Parier smart contracts through @solana/web3, and helped build and deploy the contracts.",
      tech: ["React", "Solana", "Smart contracts"],
    },
    {
      name: "Mango Heroes",
      years: "Nov 2021 – Apr 2022",
      what: "An NFT platform on Solana offering 7,000 generated comic-style artworks through Metaplex's Candy Machine.",
      did: "Built the whole front-end site in React for buying the NFTs, and integrated them into Mango Markets, a Solana DeFi app.",
      tech: ["React", "Solana", "Metaplex"],
    },
    {
      name: "CitySight",
      years: "Aug 2017 – Jan 2018",
      what: "A dating app for meeting people nearby by swiping on profiles or searching directly.",
      did: "Built the app independently for the client in Swift, using CocoaPods libraries to make it more efficient.",
      tech: ["Swift", "Xcode", "CocoaPods"],
    },
    {
      name: "Escy",
      years: "Jun – Aug 2017",
      what: "Find nearby barbershops, book appointments and post promotions for your shop.",
      did: "Built location with Core Location, maps with Google Maps and the back end on Firebase, then shipped it to the App Store and Google Play.",
      tech: ["iOS", "Android", "Firebase"],
    },
    {
      name: "Premiere",
      years: "Apr 2016 – May 2017",
      what: "A map of parties and events around the city, with updates from the friends, clubs and promoters you follow.",
      did: "Ran the whole project from wireframes and UI design to features, teaching the Java and Swift needed to ship on Android and iOS along the way.",
      tech: ["Swift", "Java", "Android Studio"],
    },
  ] as Project[],

  questions: [
    {
      q: "How did it start?",
      a: "“I was first introduced into programming when I learned how to hack and script Pokemon games at the age of 12.”",
    },
    {
      q: "When did you know?",
      a: "“I continued learning and working on applications throughout high school… This is when I knew I had a passion and gift for software development.”",
    },
    {
      q: "What did university change?",
      a: "“This made me realize there is more to creating software than just writing code and ensuring that it works.”",
    },
    {
      q: "What comes next?",
      a: "“I am pursuing career opportunities that offer challenges, have impactful missions, and provide opportunities to grow.”",
    },
  ] as QA[],
};
