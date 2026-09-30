// All of the site's content lives in this one file.
//
// Anything wrapped in {{double braces}} is a placeholder that has NOT been
// confirmed against Yanique's LinkedIn profile. It renders with a yellow
// "TBC" highlight so it can never be mistaken for fact. Replace the text
// (and drop the braces) once the real detail is known.
//
// Confirmed so far: name, location (Brampton, ON), the tech stack and
// taglines from the original site in this repo, GitHub and LinkedIn links.

export interface Role {
  years: string;
  title: string;
  org: string;
  dek: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Principle {
  title: string;
  body: string;
}

export interface QA {
  q: string;
  a: string;
}

export const profile = {
  name: "Yanique Andre",
  firstName: "Yanique",
  masthead: "YANDRE",
  role: "Software Engineering Manager",
  location: "Brampton, Ontario",
  issue: "Vol. 01 · The Leadership Issue",
  season: "Fall 2026",
  formerTagline: "Mobile & Web Developer",
  motto: ["Autodidact", "Polymath", "Human"],

  links: {
    linkedin: "https://www.linkedin.com/in/yanique-andre",
    github: "https://github.com/FrescoFlacko",
    githubHandle: "FrescoFlacko",
  },

  coverLines: [
    { kicker: "Cover story", text: "The autodidact who learned to lead" },
    { kicker: "Inside", text: "From Swift and Kotlin to one-on-ones" },
    { kicker: "Plus", text: "The playbook, the stack and ten questions" },
  ],

  feature: {
    headline: "The long way round to leadership",
    dek: "Self-taught on iOS, Android and the web, Yanique Andre now helps a whole team ship.",
    byline: "Feature · Brampton, ON",
    paragraphs: [
      "Before the title said manager, it said Mobile & Web Developer, and underneath that, three words that still work as a job description: autodidact, polymath, human. The stack on that early portfolio reads like a map of a restless curiosity: Swift and Objective-C, Kotlin and Java, React and Angular, Spring Boot, Firebase and Parse.",
      "That breadth is the through-line. {{A sentence on where Yanique started their career and what the first big project was, from LinkedIn.}}",
      "{{The moment the move into management happened: the company, the team size, and what made them say yes.}}",
      "Today Yanique leads as a software engineering manager {{at Company, TBC}}, where the work is less about which framework to pick and more about building the team that picks well.",
    ],
    pullQuote: "{{A line Yanique actually says about leading engineers. Replace with a real quote.}}",
  },

  chronology: [
    {
      years: "{{20XX – Now}}",
      title: "Software Engineering Manager",
      org: "{{Company TBC}}",
      dek: "{{Team size, scope and one headline result from LinkedIn.}}",
    },
    {
      years: "{{20XX – 20XX}}",
      title: "{{Senior / Lead Engineer}}",
      org: "{{Company TBC}}",
      dek: "{{What was built and what changed because of it.}}",
    },
    {
      years: "{{20XX – 20XX}}",
      title: "Mobile & Web Developer",
      org: "{{Company TBC}}",
      dek: "Native iOS and Android alongside React and Angular front ends. {{Add the employer and dates.}}",
    },
    {
      years: "{{20XX}}",
      title: "{{Education}}",
      org: "{{School TBC}}",
      dek: "{{Degree or program from LinkedIn.}}",
    },
  ] as Role[],

  numbers: [
    { value: "{{00}}", label: "engineers led" },
    { value: "{{00}}", label: "years shipping software" },
    { value: "{{00}}", label: "products launched" },
    { value: "3", label: "platforms shipped natively: iOS, Android, web" },
  ] as Stat[],

  // Draft management principles. Written to fit the profile's tone; Yanique
  // should rewrite these in their own words before the site goes public.
  playbook: [
    {
      title: "Teach yourself, then teach the team",
      body: "{{Draft: A self-taught engineer knows that the fastest way to learn is to ship something. I give people real problems early and stay close enough to catch them.}}",
    },
    {
      title: "Breadth is a leadership skill",
      body: "{{Draft: Having written Swift, Kotlin, Java and TypeScript means I can sit in any design review and ask the useful question.}}",
    },
    {
      title: "Human first",
      body: "{{Draft: The third word on my old site was human. Delivery follows trust, and trust follows being straight with people.}}",
    },
  ] as Principle[],

  stack: [
    { group: "Front end", items: ["React", "Angular", "Gatsby", "TypeScript", "JavaScript", "HTML", "CSS", "Sass"] },
    { group: "Back end", items: ["Java", "Spring Boot", "Firebase", "Parse"] },
    { group: "Mobile", items: ["Swift", "Objective-C", "iOS SDK", "Kotlin", "Android"] },
    { group: "Also", items: ["Python", "C", "Bash", "JSON"] },
    { group: "Tools", items: ["Xcode", "Android Studio", "Sketch", "Visual Studio"] },
  ],

  questions: [
    { q: "What does a good week look like for your team?", a: "{{Yanique's answer.}}" },
    { q: "What did writing native mobile code teach you about managing?", a: "{{Yanique's answer.}}" },
    { q: "What do you look for when you hire?", a: "{{Yanique's answer.}}" },
    { q: "What are you teaching yourself right now?", a: "{{Yanique's answer.}}" },
  ] as QA[],
};
