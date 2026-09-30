/*
 * All content for the cinematic portfolio lives here.
 * Source: Yan's LinkedIn profile screenshots (2026-09-30): headline, About,
 * Experience, Education and Projects. Truncated LinkedIn text is left out.
 */
window.FILM = {
  name: "Yanique Andre",
  role: "Senior Technology Officer",
  company: "BMO",
  location: "Brampton, Ontario",
  linkedin: "https://www.linkedin.com/in/yanique-andre",
  github: "https://github.com/FrescoFlacko",

  // Opening lines, shown one per frame before the title card.
  coldOpen: [
    "Brampton, Ontario.",
    "A twelve-year-old figures out how to hack and script Pokémon games.",
    "Then C++. Then C#. Then Visual Basic. All before high school.",
  ],

  quote: {
    text: "Tell me and I forget, teach me and I may remember, involve me and I learn.",
    by: "Benjamin Franklin",
  },

  acts: [
    {
      id: "origin",
      num: "I",
      title: "Origin",
      years: "2013 – 2018",
      logline:
        "University showed there was more to software than code that works: algorithms, data structures, design patterns. So Yan started shipping.",
      scenes: [
        {
          when: "2013 – 2018",
          title: "University of Guelph",
          sub: "Bachelor of Computing, Honours, Computer Science",
          lines: ["Volunteer Note Taker."],
        },
        {
          when: "Apr 2016 – May 2017",
          title: "Premiere",
          sub: "Events app for iOS and Android",
          lines: [
            "Find parties and events around the city on a map, and follow the friends, clubs and promoters behind them.",
            "Wireframes, interface design and every feature, built solo while learning Java and Swift from scratch.",
          ],
        },
        {
          when: "Apr – Aug 2017",
          title: "Codewater Tech",
          sub: "iOS Developer · Brampton",
          lines: ["Executed the development of the iOS application for the company's clients."],
        },
        {
          when: "Jun – Aug 2017",
          title: "Escy",
          sub: "Barber booking app",
          lines: [
            "Core Location, Google Maps and Firebase.",
            "Shipped to the iOS App Store and Google Play Store.",
          ],
        },
        {
          when: "Aug 2017 – Jan 2018",
          title: "CitySight",
          sub: "Dating app, built for a client",
          lines: ["Built independently in Swift and Xcode, with libraries brought in through CocoaPods."],
        },
      ],
    },
    {
      id: "rise",
      num: "II",
      title: "The Rise",
      years: "2018 – 2023",
      logline: "Yan joins BMO as a developer. Four years later, Yan is leading the team.",
      scenes: [
        {
          when: "Sep 2018 – Jun 2022",
          title: "Software Developer",
          sub: "BMO · Greater Toronto Area",
          lines: [
            "Lead developer for the EEMA project: design, development, testing and deployment.",
            "Coordinated maintenance of 5+ iOS applications for the Digitization team and shipped them to production.",
            "Oversaw the Bamboo CI/CD setup and held unit test coverage at 80%.",
          ],
        },
        {
          when: "Jun 2022 – Jan 2023",
          title: "Lead Developer",
          sub: "BMO · Toronto, remote",
          lines: [
            "Led a team of 5+ developers on a branch technology web application.",
            "Built the frontend for 4 web applications used by more than 800 branches across Canada.",
            "Set up CI/CD on BitBucket, Bamboo, Artifactory and Ansible, plus AWS ECS, ECR and DynamoDB.",
            "Spearheaded the Digitization team's interview process.",
          ],
        },
      ],
      stats: [
        { value: 800, suffix: "+", label: "branches across Canada run the web apps whose frontend Yan built" },
        { value: 70, suffix: "%", prefix: "−", label: "build time after the Bamboo CI/CD overhaul" },
        { value: 10, suffix: "+", label: "engineers hired through the interview process Yan ran" },
        { value: 80, suffix: "%", label: "unit test coverage, held on production iOS apps" },
      ],
    },
    {
      id: "lead",
      num: "III",
      title: "Leadership",
      years: "2023 – now",
      logline: "The work shifts from writing the code to setting the direction.",
      scenes: [
        {
          when: "Jan 2023 – Feb 2025",
          title: "Technical Lead",
          sub: "BMO",
          lines: [
            "Set up the technology for a scheduling application used within branches.",
            "Established the Azure AD project for Single Sign-On integration.",
          ],
        },
        {
          when: "Feb 2025 – present",
          title: "Senior Technology Officer",
          sub: "BMO",
          lines: ["Eight years and four titles at the bank."],
        },
      ],
    },
  ],

  // Side projects, shown as short "reels" between the acts and the credits.
  reels: [
    {
      when: "Nov 2019 – Mar 2020",
      title: "Hikma360",
      sub: "Freelance consultant · Angular, Ionic",
      line: "Consulted on and aided development of the product. The client left a testimonial.",
    },
    {
      when: "Nov 2021 – Apr 2022",
      title: "Mango Heroes",
      sub: "React · Solana · Metaplex",
      line: "7,000 generated comic-style NFTs. Yan built the whole front end and integrated the NFT into Mango Markets.",
    },
    {
      when: "Jan – Jul 2022",
      title: "Parier",
      sub: "React · Solana smart contracts",
      line: "Bet on the price a company's stock opens at next session. Yan built the app and helped deploy the contracts.",
    },
  ],

  credits: [
    { role: "Written, directed and shipped by", names: ["Yanique Andre"] },
    { role: "Starring", names: ["Swift", "Angular", "JavaScript", "Java", "Python", "C", "HTML", "SCSS"] },
    { role: "Featuring", names: ["Objective-C", "Spring Boot", "PHP", "React", "Solana"] },
    { role: "Crew", names: ["Xcode", "Android Studio", "Sketch", "BitBucket", "Bamboo", "Artifactory", "Ansible", "AWS", "Azure AD", "Firebase"] },
    { role: "Filmed on location in", names: ["Brampton", "Guelph", "Toronto"] },
  ],
};
