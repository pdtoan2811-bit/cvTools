import type { CvData } from "./types";

/**
 * Bùi Công Minh — transcribed from "Account Manager | Bui Cong Minh.pdf".
 * Used as the starter document; Minh edits it from there.
 */
export const MINH: CvData = {
  name: "Bùi Công Minh",
  title: "Account Manager",
  photo: "",
  accent: "#1f5fbf",

  contact: {
    location: "Hanoi, Vietnam",
    phone: "036 201 6991",
    email: "minh.buicong9x@gmail.com",
    website: "https://bit.ly/3T46T7P",
  },

  summary: [
    "Account Manager with 5+ years in B2B sales and customer success. Currently at Avada Commerce, closing and retaining Shopify merchant accounts for Joy Loyalty.",
    "A track record in onboarding, renewals, and cross-team coordination across fast-growing SaaS and e-commerce companies.",
    "Currently looking for a new long-term environment that challenges me to learn more and puts my capabilities to excellent use.",
  ],

  experience: [
    {
      role: "Enterprise AE",
      company: "Avada Group, Avada Commerce",
      period: "Nov 2024 — Present",
      headline: "Brought Joy to the world",
      points: [
        "Source and close new business for Joy Loyalty, Avada Commerce's flagship solution, across inbound and outbound channels",
        "Manage a portfolio of Shopify merchants across the US, UK, EMEA, and APAC, from discovery through demo, renewal, and upsell",
        "Build channel partnerships with development and marketing retention agencies to generate recurring referral pipeline",
        "Coordinate with Product and Support teams on onboarding and custom feature requests to keep client satisfaction high",
      ],
      achievements: [
        {
          label: "Team",
          points: [
            "Contributed to a sales team that drove over 50% of Joy Loyalty's 2025 MRR",
            "Closed and retained high-profile brands (Paula's Choice Vietnam, Chautfifth, Anua Japan, Boody Japan, Favs Beauty Japan)",
          ],
        },
        {
          label: "Personal",
          points: [
            "Closed 200+ Joy Loyalty deals as of June 2026; 20% are high-profile accounts at $499+/month MRR minimum",
            "Held churn under 2% on high-profile Joy Ultimate accounts",
            "Conducted 5 Shopify Plus case studies with video testimonials, published on the Joy Loyalty website",
            "Fed client feedback into the Joy Ultimate feature roadmap, directly contributing to product features and in-app user experience",
            "Cross-sold high-profile accounts into Joy Subscription and Joy Wishlist",
          ],
        },
      ],
      productsLabel: "Products I sell & support",
      products: [
        {
          name: "Joy",
          tagline: "Loyalty, rewards, points & VIP tiers",
          url: "https://apps.shopify.com/joyio",
          logo: "/logos/joy.png",
        },
        {
          name: "Joy Subscription",
          tagline: "Recurring revenue & subscription toolkit",
          url: "https://apps.shopify.com/joy-subscription",
          logo: "/logos/joy-subscription.png",
        },
      ],
    },
    {
      role: "B2B AE, Vietnam",
      company: "Savvycom Software Development",
      period: "Aug 2024 — Probation ended",
      points: [
        "Identified new IT outsourcing opportunities in Vietnam and built relationships with domestic clients and vendors",
        "Ran client meetings to align on needs and coordinated Pre-sale and Delivery teams on execution",
        "Sourced a sales-qualified lead through email outreach",
      ],
      achievements: [
        {
          points: [
            "Closed a $31K deal 1.5 months into the probation period",
            "Identified an SQL (sales-qualified lead) through email outreach before transferring it to the team",
          ],
        },
      ],
    },
    {
      role: "B2B AE, Global",
      company: "Lit Group, LitExtension",
      period: "Aug 2023 — Aug 2024",
      headline: "Found, approached, nurtured, increased revenue from new leads, and repeated",
      points: [
        "Sourced new e-commerce partners and business opportunities through outreach and team collaboration",
        "Managed client relationships and ran discovery meetings for overseas clients",
        "Acted as project manager on client projects, from contract execution to delivery",
        "Tracked upsell and cross-sell opportunities within existing accounts",
      ],
      achievements: [
        {
          points: [
            "Booked ~10 cold meetings a month; 90% converted to long-term partnerships, 10% to immediate deals",
            "Resolved a quality assurance dispute that led to a $9.2K upsell",
            "Contributed visuals and voice-over to LitCommerce product marketing videos",
          ],
        },
      ],
    },
    {
      role: "Onboarding",
      company: "GemCommerce, Shopify GemPages",
      period: "Jan 2022 — Aug 2023",
      headline: "Converted free users into loyal customers",
      points: [
        "Acquired 1,200+ new paying users through outreach; 95% retained as paying customers",
        "Onboarded new GemPages users via live chat, email, and video demo calls",
        "Presented monthly customer insight reports that shaped UI/UX and feature decisions",
      ],
      achievements: [
        {
          points: [
            "Best Employee of the Year, 2022 — GemCommerce's top company-wide ranking",
            "Customer Success Team Spotlight award, September and October 2022",
            "Consistently onboarded ~200 new users/month at a 30–50% conversion rate",
          ],
        },
      ],
    },
    {
      role: "Writer & Customer Success",
      company: "GemCommerce, Shopify GemPages",
      period: "Apr 2021 — Dec 2022",
      headline: "Wrote tried-and-true help docs that guide users on how to make the most of GemPages",
      points: [
        "Wrote 200+ help articles and supported 10,000+ Shopify merchants via chat, email, and video calls",
        "Turned a 1-star Shopify review into a 4-star rating through support alone, no incentives offered",
      ],
      achievements: [
        {
          points: [
            "Contributed to GemPages' UX/UI revamp — feature naming scheme and description wording from a user's perspective",
          ],
        },
      ],
    },
    {
      role: "Tech Support",
      company: "Tek Experts, on behalf of Microsoft",
      period: "Feb 2020 — Mar 2021",
      headline: "Got Office apps up & running, and Microsoft customers happy",
      points: [
        "Supported 300+ monthly Microsoft customers on Office and account issues via chat and phone",
      ],
      achievements: [
        {
          points: [
            "Ranked Outstanding by Team Manager for 2020 — the highest performance ranking at Tek Experts",
            "Achieved the Cluster A badge for multiple months in succession for exceeding assigned KPI",
            "Obtained the MVP badge and ranked 1st after the 2-month training period",
          ],
        },
      ],
    },
    {
      role: "Sales Associate",
      company: "Asia Eyes Travel | Paloma Cruise Halong Bay",
      period: "Feb 2019 — Jul 2019",
      headline: "Helped foreign tourists discover Vietnam in the most affordable ways",
      points: [
        "Closed an $8K tourism deal two months into the role; built custom Southeast Asia itineraries for foreign travelers",
      ],
    },
    {
      role: "Copywriter / Translator / Editor",
      company: "Vietnamnet.vn | Tintucvietnam.vn",
      period: "Jun 2017 — Jan 2019",
      headline: "Brought cutting-edge tech news to thousands of online readers",
      points: [
        "Covered tech, politics, and military news; translated and interpreted for international partners",
      ],
    },
    {
      role: "Translator",
      company: "Book Translator",
      period: "Jun 2017 — Jan 2018",
      points: [
        "Translated books across Science, Technology, Family, Health and Fitness",
      ],
    },
  ],

  education: [
    {
      degree: "Bachelor's degree of Spanish Language",
      school: "Hanoi University",
      period: "2013 — 2018",
      certifications: [
        "Certified Level C1 of Spanish language (Hanoi University)",
        "Oxford CEFR C2 level of English (2021, GemCommerce)",
        "Oxford CEFR C1 level of English (2020, Tek Experts)",
      ],
    },
  ],

  skills: [
    "B2B Sales & Account Management",
    "Shopify Ecosystem",
    "Customer Success & Onboarding",
    "Channel Partnerships",
    "HubSpot",
    "Upsell & Cross-sell",
    "Technical Writing",
    "Discovery & Demo Calls",
  ],

  languages: [
    { name: "English", level: "Highly proficient" },
    { name: "Spanish", level: "Advanced" },
    { name: "Vietnamese", level: "Native" },
  ],

  links: [{ label: "Portfolio", url: "https://bit.ly/3T46T7P" }],

  projects: [
    {
      group: "Joy Loyalty landing pages, built with AI (Avada Commerce, 2026)",
      name: "CoolVita",
      description: "Joy Loyalty landing page",
      url: "http://bit.ly/3R2VnJj",
    },
    {
      group: "Joy Loyalty landing pages, built with AI (Avada Commerce, 2026)",
      name: "Songmont",
      description: "Joy Loyalty landing page",
      url: "https://bit.ly/44yvjZA",
    },
    {
      group: "Joy Loyalty landing pages, built with AI (Avada Commerce, 2026)",
      name: "The Game Collection",
      description: "Joy Loyalty landing page",
      url: "https://bit.ly/3RJvQoz",
    },
    {
      group: "LitCommerce YouTube marketing videos (Lit Group, 2023)",
      name: "LitCommerce Quickgrid",
      description: "Product marketing video — visuals & voice-over",
      url: "https://bit.ly/3RH2VBC",
    },
    {
      group: "LitCommerce YouTube marketing videos (Lit Group, 2023)",
      name: "Multi-channel connect",
      description: "Product marketing video — visuals & voice-over",
      url: "https://bit.ly/4bwbIgk",
    },
    {
      group: "Most-viewed articles (Vietnamnet, 2018)",
      name: "Steve Jobs' daughter",
      description: "Feature article",
      url: "https://bit.ly/4wbJ38L",
    },
    {
      group: "Most-viewed articles (Vietnamnet, 2018)",
      name: "Life of YouTubers",
      description: "Feature article",
      url: "https://bit.ly/4wuoDrT",
    },
    {
      group: "Most-viewed articles (Vietnamnet, 2018)",
      name: "Elon Musk's life",
      description: "Feature article",
      url: "https://bit.ly/4ytvSS9",
    },
  ],
};
