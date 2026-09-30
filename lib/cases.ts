import type { CaseFile } from "./types";

export const CASES: CaseFile[] = [
  {
    id: "gallery-heist",
    name: "The Gallery Heist",
    crimeSummary:
      "The Vantree Gallery's centerpiece, a 17th-century emerald necklace, vanished from a locked display case sometime between 9:00 PM and 11:00 PM last Friday. The alarm was disabled from the inside. You were one of six people with after-hours access.",
    location: "Vantree Gallery, 4th Floor East Wing",
    timeOfCrime: "Friday, between 9:00 PM and 11:00 PM",
    suspectDescription:
      "A gallery curator with keycard access to the east wing after hours.",
    alibi:
      "I was at Rosa's Diner on 8th Street from 8:30 PM until almost midnight, having dinner alone after a long week. I left my phone in the car, which is why no one could reach me.",
    alibiFacts: {
      time: "8:30 PM to midnight",
      place: "Rosa's Diner on 8th Street",
      person: "alone",
      object: "phone left in the car",
    },
    evidence: [
      {
        id: "receipt",
        label: "Diner Receipt",
        teaser: "A crumpled receipt found in the suspect's coat pocket.",
        clue:
          "Your receipt from Rosa's Diner is timestamped 7:52 PM — nearly forty minutes before you claim you arrived.",
        isBluff: false,
        targetCategory: "time",
      },
      {
        id: "keycard-log",
        label: "Keycard Access Log",
        teaser: "Gallery security keeps a digital log of every badge swipe.",
        clue:
          "The east wing keycard log shows your badge was used to re-enter the gallery at 9:41 PM Friday night.",
        isBluff: false,
        targetCategory: "place",
      },
      {
        id: "waiter-statement",
        label: "Waiter's Statement",
        teaser: "A witness statement from the diner's night shift waiter.",
        clue:
          "We spoke to your waiter — he says you were on a phone call for most of the meal, arguing with someone about 'timing'.",
        isBluff: false,
        targetCategory: "person",
      },
      {
        id: "parking-ticket",
        label: "Parking Ticket",
        teaser: "A city parking ticket pulled from the record.",
        clue:
          "We pulled a parking ticket issued two blocks from the gallery at 9:15 PM Friday — registered to your license plate.",
        isBluff: true,
        targetCategory: "place",
      },
    ],
  },
  {
    id: "warehouse-fire",
    name: "The Warehouse Fire",
    crimeSummary:
      "A fire broke out at the Dockside Storage warehouse late Tuesday night, destroying an insured shipment worth $2.3 million. Fire marshals ruled it arson — accelerant was used near the loading bay. You are the warehouse's night shift supervisor.",
    location: "Dockside Storage, Pier 14",
    timeOfCrime: "Tuesday, approximately 11:30 PM",
    suspectDescription: "The night shift supervisor, last to leave the warehouse.",
    alibi:
      "I clocked out at 10:45 PM and drove straight home. My roommate can confirm I was back by 11:15 because we watched the end of a movie together before bed.",
    alibiFacts: {
      time: "clocked out 10:45 PM, home by 11:15",
      place: "home",
      person: "roommate",
      object: "a movie",
    },
    evidence: [
      {
        id: "badge-out",
        label: "Badge-Out Record",
        teaser: "The warehouse's clock-out system logs every badge scan.",
        clue:
          "Your badge-out record shows you clocked out at 11:22 PM, not 10:45 — thirty-seven minutes later than you told us.",
        isBluff: false,
        targetCategory: "time",
      },
      {
        id: "gas-receipt",
        label: "Gas Station Receipt",
        teaser: "A gas station two blocks from the pier keeps camera-timestamped receipts.",
        clue:
          "A gas station two blocks from Pier 14 has you on camera at 11:38 PM — thirteen minutes after the fire started.",
        isBluff: false,
        targetCategory: "place",
      },
      {
        id: "roommate-statement",
        label: "Roommate's Statement",
        teaser: "Your roommate was interviewed separately.",
        clue:
          "Your roommate told us you got home closer to midnight, and that you watched the movie alone the next morning, not together that night.",
        isBluff: false,
        targetCategory: "person",
      },
      {
        id: "lighter-fluid",
        label: "Purchase Record",
        teaser: "A hardware store purchase record from that week.",
        clue:
          "We found a hardware store record of lighter fluid purchased on your store loyalty card that same afternoon.",
        isBluff: true,
        targetCategory: "object",
      },
    ],
  },
  {
    id: "office-embezzlement",
    name: "The Ledger Discrepancy",
    crimeSummary:
      "Auditors discovered $180,000 quietly siphoned from Marrow & Finch Accounting over the past six months, routed through a shell vendor account. You had sole access to the vendor approval system during that period.",
    location: "Marrow & Finch Accounting, Suite 900",
    timeOfCrime: "Ongoing, discovered this past Monday during quarterly audit",
    suspectDescription: "A senior accounts payable clerk with vendor approval access.",
    alibi:
      "I never touched the vendor account outside business hours. Every approval I made was during my normal 9-to-5 shift, at my desk, with my manager Dana nearby the whole time.",
    alibiFacts: {
      time: "9-to-5 business hours only",
      place: "at my desk",
      person: "Dana, my manager",
      object: "vendor approval system",
    },
    evidence: [
      {
        id: "login-timestamps",
        label: "System Login Timestamps",
        teaser: "IT keeps login timestamps for the vendor approval portal.",
        clue:
          "The vendor portal shows six separate logins between 11 PM and 2 AM under your credentials — well outside your 9-to-5 claim.",
        isBluff: false,
        targetCategory: "time",
      },
      {
        id: "badge-swipe",
        label: "Building Badge Swipe",
        teaser: "The building's after-hours badge log.",
        clue:
          "Building security shows your badge swiping into Suite 900 at 11:04 PM on three of those nights — not at your desk during the day.",
        isBluff: false,
        targetCategory: "place",
      },
      {
        id: "dana-statement",
        label: "Dana's Statement",
        teaser: "Your manager was interviewed about your working hours.",
        clue:
          "Dana told us she left the office by 6 PM every day that quarter and never once saw you working late.",
        isBluff: false,
        targetCategory: "person",
      },
      {
        id: "vpn-log",
        label: "VPN Access Log",
        teaser: "A corporate VPN log pulled by IT security.",
        clue:
          "IT's VPN log shows a remote connection to the vendor system from an unregistered device the night before the audit.",
        isBluff: true,
        targetCategory: "object",
      },
    ],
  },
];

export function getCaseById(id: string): CaseFile | undefined {
  return CASES.find((c) => c.id === id);
}

export function getRandomCase(): CaseFile {
  return CASES[Math.floor(Math.random() * CASES.length)];
}
