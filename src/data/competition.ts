// Official 2026 season; offseason events are excluded.
// Verified against FIRST and The Blue Alliance on 2026-09-04.
export const season2026 = {
  record: [60, 13, 0],
  districtRank: 6,
  districtPoints: 313,
  firstUrl: 'https://frc-events.firstinspires.org/2026/team/9470',
  tbaUrl: 'https://www.thebluealliance.com/team/9470/2026',
};

export const events2026 = [
  {
    id: 'half-moon-bay', name: 'Half Moon Bay', date: 'March 6–8', location: 'Half Moon Bay, CA',
    result: 'Event winner', record: [14, 3, 0], rank: 3,
    award: 'Excellence in Engineering Award', awardSponsor: 'Engineering award sponsored by Littelfuse',
    allianceName: 'Alliance 1', alliance: [
      { team: 1678, role: 'Captain' }, { team: 9470, role: 'First pick' },
      { team: 7607, role: 'Second pick' }, { team: 5760, role: 'Backup' },
    ],
    points: { qualification: 19, alliance: 16, playoff: 30, award: 5, total: 70 },
    url: 'https://www.thebluealliance.com/event/2026cahal',
  },
  {
    id: 'silicon-valley', name: 'Silicon Valley', date: 'March 13–15', location: 'Woodside, CA',
    result: 'Event winner', record: [16, 1, 0], rank: 2,
    award: 'Industrial Design Award', presentedBy: 'Event presented by Apple',
    allianceName: 'Alliance 1', alliance: [
      { team: 254, role: 'Captain' }, { team: 9470, role: 'First pick' }, { team: 6665, role: 'Second pick' },
    ],
    points: { qualification: 21, alliance: 16, playoff: 30, award: 5, total: 72 },
    url: 'https://www.thebluealliance.com/event/2026casnv',
  },
  {
    id: 'california-northern', name: 'California Northern State Championship', date: 'April 9–12', location: 'Daly City, CA',
    result: 'Finalist', record: [15, 4, 0], rank: 2,
    allianceName: 'Alliance 2', alliance: [
      { team: 9470, role: 'Captain' }, { team: 1678, role: 'First pick' }, { team: 6665, role: 'Second pick' },
    ],
    points: { qualification: 66, alliance: 45, playoff: 60, award: 0, total: 171 },
    url: 'https://www.thebluealliance.com/event/2026cancmp',
  },
  {
    id: 'archimedes', name: 'Archimedes Division', date: 'April 29–May 2', location: 'Houston, TX',
    result: 'Division winner', record: [14, 3, 0], rank: 2,
    note: 'FIRST Championship. The winning alliance advanced to Einstein.',
    allianceName: 'Alliance 1', alliance: [
      { team: 5940, role: 'Captain' }, { team: 9470, role: 'First pick' },
      { team: 3006, role: 'Second pick' }, { team: 7407, role: 'Third pick' },
    ],
    url: 'https://www.thebluealliance.com/event/2026arc',
  },
  {
    id: 'einstein', name: 'Einstein Field', date: 'May 2', location: 'Houston, TX',
    result: 'Playoff round 3', record: [1, 2, 0],
    note: 'FIRST Championship playoffs between division winners. Our alliance was eliminated in round 3 of the double-elimination bracket.',
    allianceName: 'Archimedes alliance', alliance: [
      { team: 5940, role: 'Captain' }, { team: 9470, role: 'First pick' },
      { team: 3006, role: 'Second pick' }, { team: 7407, role: 'Third pick' },
    ],
    url: 'https://www.thebluealliance.com/event/2026cmptx',
  },
];

// Team 9470's alliance is always listed first, regardless of field color.
export const selectedMatches = [
  { event: 'Archimedes', match: 'Final 3', ours: 689, theirs: 527, alliance: [7407, 5940, 9470], opponents: [27, 1114, 4096], key: '2026arc_f1m3' },
  { event: 'Archimedes', match: 'Qualification 108', ours: 885, theirs: 431, alliance: [9470, 1114, 548], opponents: [3494, 587, 2960], key: '2026arc_qm108' },
  { event: 'Einstein', match: 'Playoff match 5', ours: 703, theirs: 599, alliance: [7407, 5940, 9470], opponents: [3506, 2056, 6329], key: '2026cmptx_sf5m1' },
  { event: 'Silicon Valley', match: 'Playoff match 7', ours: 725, theirs: 216, alliance: [6665, 254, 9470], opponents: [6814, 6418, 6962], key: '2026casnv_sf7m1' },
  { event: 'Half Moon Bay', match: 'Final 2', ours: 601, theirs: 328, alliance: [5760, 1678, 9470], opponents: [971, 604, 7413], key: '2026cahal_f1m2' },
  { event: 'Half Moon Bay', match: 'Qualification 47', ours: 720, theirs: 123, alliance: [1678, 9584, 9470], opponents: [7419, 7607, 852], key: '2026cahal_qm47' },
];

export const previousSeasons = [
  { year: 2025, game: 'REEFSCAPE', awards: [
    { name: 'Autonomous Award', event: 'Pinnacles Regional' },
  ], url: 'https://frc-events.firstinspires.org/2025/team/9470' },
  { year: 2024, game: 'CRESCENDO · Rookie season', awards: [
    { name: 'Regional Finalist', event: 'Silicon Valley Regional' },
    { name: 'Rookie Inspiration Award', event: 'Silicon Valley Regional' },
    { name: 'Rookie Inspiration Award', event: 'East Bay Regional' },
  ], url: 'https://frc-events.firstinspires.org/2024/team/9470' },
];
