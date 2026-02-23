const mongoose = require("mongoose");
const BehavioralQuestion = require("../models/BehavioralQuestion");

const behavioralQuestions = [
  // Leadership (8 questions)
  {
    question: "Tell me about a time when you had to lead a team through a difficult project.",
    category: "Leadership",
    difficulty: "medium",
    description: "Tests your ability to motivate and guide team members during challenging situations.",
    tips: [
      "Describe your leadership style",
      "Explain how you kept the team motivated",
      "Show specific outcomes and team growth",
      "Highlight how you handled conflicts or obstacles",
    ],
  },
  {
    question: "Give an example of when you had to make a difficult decision that affected your team.",
    category: "Leadership",
    difficulty: "hard",
    description: "Evaluates decision-making skills and accountability.",
    tips: [
      "Show the complexity of the situation",
      "Explain your decision-making process",
      "Discuss how you communicated the decision",
      "Share the results and lessons learned",
    ],
  },
  {
    question: "Describe a situation where you had to delegate tasks to team members.",
    category: "Leadership",
    difficulty: "medium",
    description: "Assesses delegation and trust-building abilities.",
    tips: [
      "Explain why delegation was necessary",
      "Show how you matched tasks to capabilities",
      "Describe how you supported team members",
      "Highlight successful outcomes",
    ],
  },
  {
    question: "Tell me about a time when you failed as a leader and how you recovered.",
    category: "Leadership",
    difficulty: "hard",
    description: "Tests self-awareness, humility, and commitment to improvement.",
    tips: [
      "Be honest about the failure",
      "Take responsibility without excuses",
      "Explain what you learned",
      "Show how you applied those lessons",
    ],
  },
  {
    question: "Describe a time when you needed to inspire your team to achieve a challenging goal.",
    category: "Leadership",
    difficulty: "medium",
    description: "Evaluates motivation and vision-setting abilities.",
    tips: [
      "Paint the vision clearly",
      "Explain your inspiration techniques",
      "Show personal involvement and commitment",
      "Share measurable success metrics",
    ],
  },
  {
    question: "Tell me about a time when you had to manage up with your manager or stakeholder.",
    category: "Leadership",
    difficulty: "hard",
    description: "Tests ability to communicate effectively with leadership.",
    tips: [
      "Show respect and professionalism",
      "Explain how you presented your case",
      "Demonstrate understanding of their perspective",
      "Share the positive outcome",
    ],
  },
  {
    question: "Give an example of when you successfully built and mentored a new team member.",
    category: "Leadership",
    difficulty: "medium",
    description: "Assesses mentoring and development skills.",
    tips: [
      "Describe the initial state and gaps",
      "Explain your mentoring approach",
      "Show measurable development",
      "Highlight their eventual success",
    ],
  },
  {
    question: "Describe a situation where you had to lead through change or uncertainty.",
    category: "Leadership",
    difficulty: "hard",
    description: "Tests ability to lead during transitions.",
    tips: [
      "Explain the nature of the change",
      "Show how you adapted your leadership",
      "Describe how you managed team anxiety",
      "Share positive outcomes from the change",
    ],
  },

  // Teamwork (8 questions)
  {
    question: "Tell me about a time when you worked effectively in a diverse team.",
    category: "Teamwork",
    difficulty: "medium",
    description: "Evaluates collaboration and inclusivity skills.",
    tips: [
      "Highlight team diversity (backgrounds, skills, perspectives)",
      "Show respect for different viewpoints",
      "Explain how diversity strengthened outcomes",
      "Give specific examples of collaboration",
    ],
  },
  {
    question: "Describe a situation where you had to work with someone you didn't initially get along with.",
    category: "Teamwork",
    difficulty: "hard",
    description: "Tests conflict resolution and adaptability.",
    tips: [
      "Be honest about initial challenges",
      "Show efforts to understand their perspective",
      "Explain how you found common ground",
      "Highlight improved working relationship",
    ],
  },
  {
    question: "Give an example of when you asked for help from colleagues or teammates.",
    category: "Teamwork",
    difficulty: "medium",
    description: "Assesses humility and collaborative approach.",
    tips: [
      "Show self-awareness about limitations",
      "Explain why asking for help was the right choice",
      "Describe how others contributed",
      "Share the better outcomes from collaboration",
    ],
  },
  {
    question: "Tell me about a time when you had to sacrifice your ideas for the team's benefit.",
    category: "Teamwork",
    difficulty: "hard",
    description: "Tests ability to prioritize team success over individual preferences.",
    tips: [
      "Show you had a strong perspective",
      "Explain the team's reasoning",
      "Demonstrate support for the team decision",
      "Highlight positive results",
    ],
  },
  {
    question: "Describe a situation where your team achieved something you couldn't have done alone.",
    category: "Teamwork",
    difficulty: "medium",
    description: "Evaluates appreciation for teamwork and interdependence.",
    tips: [
      "Clearly explain the goal's magnitude",
      "Detail each team member's contribution",
      "Show coordination and communication",
      "Emphasize the power of collaboration",
    ],
  },
  {
    question: "Give an example of when you supported a team member who was struggling.",
    category: "Teamwork",
    difficulty: "medium",
    description: "Tests empathy and supportiveness.",
    tips: [
      "Show genuine concern for their situation",
      "Explain specific support you provided",
      "Describe how they recovered or improved",
      "Show positive impact on team dynamics",
    ],
  },
  {
    question: "Tell me about a time when a team member didn't pull their weight and how you handled it.",
    category: "Teamwork",
    difficulty: "hard",
    description: "Assesses ability to address performance issues diplomatically.",
    tips: [
      "Show fairness and objectivity",
      "Explain how you approached the conversation",
      "Describe the underlying issues you discovered",
      "Share constructive resolution",
    ],
  },
  {
    question: "Describe a project where you had to coordinate across multiple teams or departments.",
    category: "Teamwork",
    difficulty: "hard",
    description: "Tests cross-functional collaboration abilities.",
    tips: [
      "Explain the complexity of coordination",
      "Show how you aligned different priorities",
      "Describe communication strategies",
      "Share successful project outcome",
    ],
  },

  // Problem-Solving (10 questions)
  {
    question: "Tell me about a complex problem you solved at work and your approach.",
    category: "Problem-Solving",
    difficulty: "medium",
    description: "Evaluates analytical and problem-solving skills.",
    tips: [
      "Explain the problem's complexity clearly",
      "Walk through your systematic approach",
      "Show how you gathered information",
      "Share the innovative solution and results",
    ],
  },
  {
    question: "Describe a situation where you had to think creatively to solve a problem.",
    category: "Problem-Solving",
    difficulty: "hard",
    description: "Tests innovation and outside-the-box thinking.",
    tips: [
      "Show why traditional approaches didn't work",
      "Explain your creative process",
      "Describe how you validated the idea",
      "Share measurable impact",
    ],
  },
  {
    question: "Give an example of when you had to troubleshoot a technical or operational issue.",
    category: "Problem-Solving",
    difficulty: "medium",
    description: "Assesses technical problem-solving ability.",
    tips: [
      "Clearly explain the technical issue",
      "Detail your troubleshooting steps",
      "Show systematic elimination of possibilities",
      "Explain the root cause and fix",
    ],
  },
  {
    question: "Tell me about a time when you had to solve a problem with limited resources.",
    category: "Problem-Solving",
    difficulty: "hard",
    description: "Tests resourcefulness and ingenuity.",
    tips: [
      "Clearly define the resource constraints",
      "Show creative use of available resources",
      "Explain how you prioritized",
      "Share the effective solution achieved",
    ],
  },
  {
    question: "Describe a situation where you had to identify and fix a recurring problem.",
    category: "Problem-Solving",
    difficulty: "medium",
    description: "Evaluates root cause analysis and systemic thinking.",
    tips: [
      "Show pattern recognition",
      "Explain your root cause analysis",
      "Describe preventive measures implemented",
      "Share long-term results",
    ],
  },
  {
    question: "Tell me about a time when you had to make a decision with incomplete information.",
    category: "Problem-Solving",
    difficulty: "hard",
    description: "Tests decision-making under uncertainty.",
    tips: [
      "Acknowledge the information gaps",
      "Show how you gathered available data",
      "Explain your decision criteria",
      "Share how you managed the risk",
    ],
  },
  {
    question: "Give an example of when you questioned a process or system and improved it.",
    category: "Problem-Solving",
    difficulty: "medium",
    description: "Assesses critical thinking and initiative.",
    tips: [
      "Explain what seemed inefficient",
      "Show how you investigated issues",
      "Describe stakeholder engagement",
      "Share measurable improvements",
    ],
  },
  {
    question: "Describe a situation where you had to balance competing priorities and constraints.",
    category: "Problem-Solving",
    difficulty: "hard",
    description: "Tests prioritization and trade-off analysis.",
    tips: [
      "Clearly present each priority's importance",
      "Explain the constraints",
      "Show your decision framework",
      "Share how you communicated the trade-offs",
    ],
  },
  {
    question: "Tell me about a time when you had to learn something quickly to solve a problem.",
    category: "Problem-Solving",
    difficulty: "medium",
    description: "Evaluates learning agility and resourcefulness.",
    tips: [
      "Describe what you needed to learn",
      "Explain your accelerated learning approach",
      "Show how you applied new knowledge",
      "Share successful problem resolution",
    ],
  },
  {
    question: "Describe a situation where you prevented a potential problem before it occurred.",
    category: "Problem-Solving",
    difficulty: "medium",
    description: "Tests proactive thinking and risk management.",
    tips: [
      "Show your foresight and risk awareness",
      "Explain the potential impact",
      "Describe preventive actions taken",
      "Share avoided problems or consequences",
    ],
  },

  // Communication (8 questions)
  {
    question: "Tell me about a time when you had to communicate complex information clearly.",
    category: "Communication",
    difficulty: "medium",
    description: "Evaluates clarity and ability to simplify complexity.",
    tips: [
      "Explain the complexity of the information",
      "Describe techniques you used for clarity",
      "Show how you tailored to the audience",
      "Share confirmation of understanding",
    ],
  },
  {
    question: "Describe a situation where you had to deliver bad news to a stakeholder.",
    category: "Communication",
    difficulty: "hard",
    description: "Tests professionalism and empathy in difficult communications.",
    tips: [
      "Show preparation and thoughtfulness",
      "Explain how you took responsibility",
      "Describe how you presented solutions",
      "Share how stakeholder reacted positively",
    ],
  },
  {
    question: "Give an example of when you had to present an idea you weren't fully confident about.",
    category: "Communication",
    difficulty: "medium",
    description: "Assesses confidence and persuasion despite uncertainty.",
    tips: [
      "Show the basis for your belief",
      "Explain how you acknowledged uncertainties",
      "Describe your presentation approach",
      "Share the reception and learning",
    ],
  },
  {
    question: "Tell me about a time when you had to adjust your communication style for different audiences.",
    category: "Communication",
    difficulty: "medium",
    description: "Tests adaptability in communication.",
    tips: [
      "Give specific audience examples",
      "Explain the style differences",
      "Show why adaptation mattered",
      "Share successful outcomes",
    ],
  },
  {
    question: "Describe a situation where miscommunication caused a problem and how you resolved it.",
    category: "Communication",
    difficulty: "hard",
    description: "Evaluates ability to identify and fix communication breakdowns.",
    tips: [
      "Acknowledge the miscommunication honestly",
      "Explain how you discovered the gap",
      "Show immediate corrective action",
      "Share how you prevented recurrence",
    ],
  },
  {
    question: "Tell me about a time when you had to persuade someone to your viewpoint.",
    category: "Communication",
    difficulty: "hard",
    description: "Tests persuasion and influence skills.",
    tips: [
      "Explain the initial disagreement",
      "Show respect for their perspective",
      "Describe your persuasion approach",
      "Share how they came around",
    ],
  },
  {
    question: "Give an example of when you asked for feedback and acted on it.",
    category: "Communication",
    difficulty: "medium",
    description: "Assesses receptiveness to feedback.",
    tips: [
      "Show humility in asking",
      "Explain the feedback received",
      "Describe specific actions taken",
      "Share improvement results",
    ],
  },
  {
    question: "Describe a situation where you had to listen actively to resolve a conflict.",
    category: "Communication",
    difficulty: "medium",
    description: "Evaluates active listening and empathy.",
    tips: [
      "Show genuine interest in understanding",
      "Explain what you learned from listening",
      "Describe how understanding helped",
      "Share positive resolution",
    ],
  },

  // Conflict Resolution (7 questions)
  {
    question: "Tell me about a conflict you had with a colleague and how you resolved it.",
    category: "Conflict Resolution",
    difficulty: "hard",
    description: "Tests conflict management and interpersonal skills.",
    tips: [
      "Give honest account of the conflict",
      "Show you understood both perspectives",
      "Explain your resolution approach",
      "Share improved relationship outcome",
    ],
  },
  {
    question: "Describe a situation where two team members had competing interests and how you mediated.",
    category: "Conflict Resolution",
    difficulty: "hard",
    description: "Assesses mediation and fairness skills.",
    tips: [
      "Show impartiality and fairness",
      "Explain how you understood each position",
      "Describe your mediation approach",
      "Share win-win resolution achieved",
    ],
  },
  {
    question: "Give an example of when you had to address an unethical situation at work.",
    category: "Conflict Resolution",
    difficulty: "hard",
    description: "Tests integrity and courage in difficult situations.",
    tips: [
      "Show clear ethical reasoning",
      "Explain the risks you took",
      "Describe your approach to addressing it",
      "Share positive organizational impact",
    ],
  },
  {
    question: "Tell me about a time when you had to provide critical feedback to a peer.",
    category: "Conflict Resolution",
    difficulty: "hard",
    description: "Evaluates ability to give constructive criticism.",
    tips: [
      "Show genuine desire to help",
      "Explain how you approached the conversation",
      "Describe specific, actionable feedback",
      "Share how they received and acted on it",
    ],
  },
  {
    question: "Describe a situation where you had to compromise to reach a resolution.",
    category: "Conflict Resolution",
    difficulty: "medium",
    description: "Tests willingness to find middle ground.",
    tips: [
      "Show what was important to each party",
      "Explain the compromise reached",
      "Describe how both sides accepted it",
      "Share sustainable solution achieved",
    ],
  },
  {
    question: "Tell me about a time when you had to accept feedback you disagreed with.",
    category: "Conflict Resolution",
    difficulty: "medium",
    description: "Tests open-mindedness and professionalism.",
    tips: [
      "Acknowledge your initial position",
      "Show your reasoning for acceptance",
      "Explain how you acted on it",
      "Share positive outcomes",
    ],
  },
  {
    question: "Describe a situation where you had to address a customer or client complaint.",
    category: "Conflict Resolution",
    difficulty: "medium",
    description: "Assesses customer service and problem resolution.",
    tips: [
      "Show empathy for their situation",
      "Explain how you resolved the issue",
      "Describe how you rebuilt trust",
      "Share customer satisfaction outcome",
    ],
  },

  // Adaptability (7 questions)
  {
    question: "Tell me about a time when you had to adapt to significant changes at work.",
    category: "Adaptability",
    difficulty: "medium",
    description: "Tests flexibility and resilience.",
    tips: [
      "Describe the nature of the change",
      "Show initial challenges faced",
      "Explain how you adapted",
      "Share positive outcomes achieved",
    ],
  },
  {
    question: "Give an example of when you had to learn a completely new skill quickly.",
    category: "Adaptability",
    difficulty: "medium",
    description: "Evaluates learning agility.",
    tips: [
      "Explain the skill and its importance",
      "Describe your learning approach",
      "Show timeline for competency",
      "Share how it benefited you",
    ],
  },
  {
    question: "Describe a situation where circumstances forced you to change your initial plan.",
    category: "Adaptability",
    difficulty: "hard",
    description: "Tests flexibility and problem-solving under new constraints.",
    tips: [
      "Clearly explain the original plan",
      "Describe what changed and why",
      "Show your revised approach",
      "Share the adjusted outcomes",
    ],
  },
  {
    question: "Tell me about a time when you had to work in an ambiguous or undefined situation.",
    category: "Adaptability",
    difficulty: "hard",
    description: "Assesses comfort with ambiguity and self-direction.",
    tips: [
      "Acknowledge the ambiguity",
      "Explain how you brought clarity",
      "Describe your proactive approach",
      "Share successful outcomes",
    ],
  },
  {
    question: "Describe a situation where you had to adjust your work style to fit a new role or team.",
    category: "Adaptability",
    difficulty: "medium",
    description: "Tests ability to adapt to new environments.",
    tips: [
      "Explain the differences in the new role",
      "Show what you adjusted",
      "Describe how you integrated",
      "Share successful transition results",
    ],
  },
  {
    question: "Give an example of when you pivoted your approach based on feedback.",
    category: "Adaptability",
    difficulty: "medium",
    description: "Evaluates responsiveness to input.",
    tips: [
      "Describe your initial approach",
      "Explain the feedback received",
      "Show how you adjusted quickly",
      "Share improved outcomes",
    ],
  },
  {
    question: "Tell me about a time when you had to handle multiple competing deadlines.",
    category: "Adaptability",
    difficulty: "medium",
    description: "Tests prioritization under pressure.",
    tips: [
      "Describe the deadline pressures",
      "Show your prioritization approach",
      "Explain coordination with stakeholders",
      "Share how all deadlines were met",
    ],
  },

  // Customer Focus (6 questions)
  {
    question: "Tell me about a time when you went above and beyond for a customer or user.",
    category: "Customer Focus",
    difficulty: "medium",
    description: "Evaluates customer service dedication.",
    tips: [
      "Show genuine desire to help",
      "Describe what 'above and beyond' meant",
      "Explain how you identified the need",
      "Share customer satisfaction impact",
    ],
  },
  {
    question: "Describe a situation where you had to balance customer demands with business constraints.",
    category: "Customer Focus",
    difficulty: "hard",
    description: "Tests ability to serve customers while respecting limitations.",
    tips: [
      "Explain each party's perspective",
      "Show creative solution-finding",
      "Describe how you communicated trade-offs",
      "Share outcome that pleased customers",
    ],
  },
  {
    question: "Give an example of when you identified and solved a customer problem before they reported it.",
    category: "Customer Focus",
    difficulty: "hard",
    description: "Assesses proactive customer service.",
    tips: [
      "Show your awareness or analysis",
      "Explain how you anticipated the issue",
      "Describe your proactive solution",
      "Share customer appreciation impact",
    ],
  },
  {
    question: "Tell me about a time when you had to deliver disappointing news to a customer gracefully.",
    category: "Customer Focus",
    difficulty: "medium",
    description: "Tests empathy and communication.",
    tips: [
      "Show care for their disappointment",
      "Explain how you delivered the news",
      "Describe how you offered alternatives",
      "Share how they felt respected",
    ],
  },
  {
    question: "Describe a situation where you improved customer experience through a process change.",
    category: "Customer Focus",
    difficulty: "medium",
    description: "Evaluates customer-centric improvements.",
    tips: [
      "Explain the original experience issues",
      "Show how you identified improvements",
      "Describe the change implemented",
      "Share measurable customer satisfaction gains",
    ],
  },
  {
    question: "Give an example of when you gathered customer feedback and made improvements based on it.",
    category: "Customer Focus",
    difficulty: "medium",
    description: "Tests customer feedback responsiveness.",
    tips: [
      "Explain your feedback gathering method",
      "Describe what customers requested",
      "Show how you implemented changes",
      "Share improved customer metrics",
    ],
  },
];

const seedBehavioralQuestions = async () => {
  try {
    await BehavioralQuestion.deleteMany({});
    await BehavioralQuestion.insertMany(behavioralQuestions);
    console.log(`✅ Seeded ${behavioralQuestions.length} behavioral questions`);
  } catch (error) {
    console.error("❌ Error seeding behavioral questions:", error);
  }
};

module.exports = seedBehavioralQuestions;
