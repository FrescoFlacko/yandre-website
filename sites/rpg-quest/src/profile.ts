// All of the site's words live in this one file: the résumé facts and the
// in-game dialogue built from them.
//
// Source: Yanique's LinkedIn profile (screenshots shared in the project,
// Sep 2026). Nothing here is invented; the game only re-voices those facts.

export interface Role {
  years: string;
  title: string;
  org: string;
  place?: string;
  notes: string[];
}

export interface Project {
  name: string;
  years: string;
  what: string;
  did: string;
  tech: string[];
}

export interface Skill {
  name: string;
  tier: "Proficient" | "Familiar" | "Tooling";
}

export const profile = {
  name: "Yanique Andre",
  handle: "YANIQUE",
  title: "Senior Technology Officer at BMO",
  location: "Brampton, Ontario",
  education: "University of Guelph · Bachelor of Computing (Honours), Computer Science · 2013–2018",
  quote: "Tell me and I forget, teach me and I may remember, involve me and I learn.",
  quoteBy: "Benjamin Franklin",
  links: {
    linkedin: "https://www.linkedin.com/in/yanique-andre",
    linkedinLabel: "linkedin.com/in/yanique-andre",
    github: "https://github.com/FrescoFlacko",
    githubLabel: "github.com/FrescoFlacko",
  },

  about: [
    "Yanique started programming at 12 by hacking and scripting Pokémon games, then picked up C++, C#, Visual Basic and small frameworks before high school.",
    "A Computer Science degree at Guelph added algorithms, data structures and design patterns, and the lesson that there is more to software than code that works.",
    "Eight years at BMO took Yanique from iOS developer to leading teams, hiring engineers and running branch technology used across Canada.",
  ],

  roles: [
    {
      years: "Feb 2025 – Now",
      title: "Senior Technology Officer",
      org: "BMO",
      notes: ["Senior technology leadership at BMO."],
    },
    {
      years: "Jan 2023 – Feb 2025",
      title: "Technical Lead",
      org: "BMO",
      notes: [
        "Set up the technology for a scheduling application used within branches.",
        "Established an Azure AD project for single sign-on.",
      ],
    },
    {
      years: "Jun 2022 – Jan 2023",
      title: "Lead Developer",
      org: "BMO",
      place: "Toronto · Remote",
      notes: [
        "Led a team of 5+ developers on a branch technology web application.",
        "Built the front end for 4 web apps used by 800+ branches across Canada.",
        "Kept development and business teams aligned on requirements.",
        "Set up CI/CD on Bitbucket, Bamboo, Artifactory and Ansible.",
        "Set up AWS services including ECS, ECR and DynamoDB.",
        "Ran the Digitization team's interview process, hiring 10+ engineers.",
      ],
    },
    {
      years: "Nov 2019 – Mar 2020",
      title: "Consultant",
      org: "Hikma360 · Freelance",
      place: "Toronto",
      notes: ["Consulted on and helped build an app with Angular and Ionic."],
    },
    {
      years: "Sep 2018 – Jun 2022",
      title: "Software Developer",
      org: "BMO",
      place: "Greater Toronto Area",
      notes: [
        "Lead developer on the EEMA project, from design to deployment.",
        "Maintained 5+ iOS apps for the Digitization team.",
        "Owned certificates and production releases for the iOS apps.",
        "Bamboo CI/CD that cut build time by 70%.",
        "Held unit test coverage at 80%.",
      ],
    },
    {
      years: "Apr – Aug 2017",
      title: "iOS Developer",
      org: "Codewater Tech",
      place: "Brampton",
      notes: ["Built the iOS application for the company's clients."],
    },
  ] as Role[],

  projects: [
    {
      name: "Parier",
      years: "Jan – Jul 2022",
      what: "A Solana betting platform where users bet on the price a company's stock will open at.",
      did: "Built the whole app in React with @solana/web3, and helped build and deploy the smart contracts.",
      tech: ["React", "Solana"],
    },
    {
      name: "Mango Heroes",
      years: "Nov 2021 – Apr 2022",
      what: "An NFT platform on Solana with 7,000 generated comic-style artworks sold through Metaplex's Candy Machine.",
      did: "Built the React front end and integrated the NFTs into Mango Markets, a Solana DeFi app.",
      tech: ["React", "Solana", "Metaplex"],
    },
    {
      name: "CitySight",
      years: "Aug 2017 – Jan 2018",
      what: "A dating app for meeting people nearby by swiping or searching.",
      did: "Built independently for the client in Swift, with CocoaPods libraries.",
      tech: ["Swift", "Xcode"],
    },
    {
      name: "Escy",
      years: "Jun – Aug 2017",
      what: "Find nearby barbershops, book appointments and post promotions.",
      did: "Core Location, Google Maps and Firebase, shipped to the App Store and Google Play.",
      tech: ["iOS", "Android", "Firebase"],
    },
    {
      name: "Premiere",
      years: "Apr 2016 – May 2017",
      what: "A map of parties and events around the city, with updates from friends, clubs and promoters.",
      did: "Wireframes, UI and features end to end, learning Java and Swift by trial and error.",
      tech: ["Swift", "Java"],
    },
  ] as Project[],

  skills: [
    ...["Angular", "JavaScript", "Swift", "Java", "iOS", "Android", "HTML", "CSS", "SCSS", "Python", "C"].map(
      (name) => ({ name, tier: "Proficient" }) as Skill,
    ),
    ...["Objective-C", "Spring Boot", "PHP"].map((name) => ({ name, tier: "Familiar" }) as Skill),
    ...["Bitbucket", "Bamboo", "Artifactory", "Ansible", "AWS", "Azure AD", "Xcode", "Android Studio", "Sketch"].map(
      (name) => ({ name, tier: "Tooling" }) as Skill,
    ),
  ],

  stats: [
    { value: "800+", label: "branches using apps from Yanique's team" },
    { value: "10+", label: "engineers hired" },
    { value: "70%", label: "faster builds" },
    { value: "80%", label: "test coverage held" },
  ],
};
