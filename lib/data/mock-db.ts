export const MOCK_DB = {
  startups: [
    {
      id: "s1",
      name: "AlloySphere",
      industry: "Startup Ecosystem",
      stage: "MVP",
      teamSize: 12,
      metrics: {
        tasks: 57,
        completed: 41,
        milestones: 8,
        investorInterest: 14,
        applications: 126,
        growth: "+18%",
      }
    },
    {
      id: "s2",
      name: "CollabHub",
      industry: "SaaS",
      stage: "Series A",
      teamSize: 45,
      metrics: {
        tasks: 120,
        completed: 105,
        milestones: 12,
        investorInterest: 4,
        applications: 200,
        growth: "+45%",
      }
    },
    {
      id: "s3",
      name: "MedVision",
      industry: "HealthTech",
      stage: "Seed",
      teamSize: 8,
      metrics: {
        tasks: 30,
        completed: 15,
        milestones: 3,
        investorInterest: 22,
        applications: 45,
        growth: "+10%",
      }
    }
  ],
  talent: {
    skills: ["AI", "Full Stack", "UI/UX"],
    metrics: {
      applications: 12,
      accepted: 4,
      activeStartups: 3,
      contributionScore: 91,
      profileStrength: 85,
    },
    opportunities: [
      { role: "Senior Product Designer", company: "CollabHub", match: 92 },
      { role: "Frontend Developer", company: "FinPilot AI", match: 85 },
      { role: "AI/ML Engineer", company: "MedVision", match: 78 }
    ]
  },
  investor: {
    metrics: {
      watchlist: 24,
      saved: 31,
      pipeline: 17,
      monthlyOpportunities: 148,
    },
    industries: ["AI", "SaaS", "Fintech", "HealthTech", "ClimateTech"],
    recentUpdates: [
      { company: "MedVision", type: "Funding", desc: "Raised $2M in Seed Round" },
      { company: "CollabHub", type: "Milestone", desc: "Reached 10,000 Active Users" }
    ]
  }
};
