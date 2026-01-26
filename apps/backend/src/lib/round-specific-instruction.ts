import { INTERVIEW_ROUND_TYPE } from "@prisma/client";

export const getRoundSpecificInstructions = (
    roundType: INTERVIEW_ROUND_TYPE
): string => {
    switch (roundType) {
        case "skill_assessment":
            return `
SKILL ASSESSMENT SPECIFIC INSTRUCTIONS:
- Focus on hands-on technical evaluation
- Use code_editor tool for coding challenges
- Ask about specific technologies mentioned in the job requirements
- Test problem-solving with real-world scenarios
- Evaluate code quality, efficiency, and best practices
- Ask follow-up questions about implementation choices

SUGGESTED QUESTION AREAS:
- Data structures and algorithms
- Framework-specific knowledge
- Debugging and troubleshooting
- Code optimization
- Best practices and design patterns
- Real-world application of concepts`;

        case "behavioral":
            return `
BEHAVIORAL INTERVIEW SPECIFIC INSTRUCTIONS:
- Use STAR method (Situation, Task, Action, Result) for evaluation
- Focus on past experiences and how they handle situations
- Assess leadership, teamwork, and problem-solving approach
- Look for examples of growth mindset and adaptability
- No tools typically needed for this round type

SUGGESTED QUESTION AREAS:
- Leadership and teamwork examples
- Handling challenging situations
- Career growth and learning
- Conflict resolution
- Time management and prioritization
- Company culture fit`;

        case "system_design":
            return `
SYSTEM DESIGN SPECIFIC INSTRUCTIONS:
- Use whiteboard tool for architecture diagrams
- Focus on scalability, reliability, and performance
- Ask about trade-offs and design decisions
- Evaluate understanding of distributed systems
- Test knowledge of databases, caching, and APIs
- Assess ability to design for scale

SUGGESTED QUESTION AREAS:
- Design a web application architecture
- Database design and optimization
- API design and versioning
- Caching strategies
- Load balancing and scaling
- Microservices vs monolith decisions`;

        default:
            return `
GENERAL INTERVIEW INSTRUCTIONS:
- Adapt questions based on the role requirements
- Use tools as appropriate for practical assessment
- Balance technical and soft skills evaluation
- Maintain professional and engaging conversation`;
    }
};

export const jobSpecificInstructions = (job_title: string): string => {
	switch (job_title) {
		case "Full Stack developer":
			return `
FULL STACK DEVELOPER SPECIFIC INSTRUCTIONS:
- Assess both frontend and backend skills.
- Frontend: Ask about component architecture, state management (e.g., Redux, Zustand), and framework knowledge (React, Vue, etc.).
- Backend: Ask about API design (REST, GraphQL), database choices (SQL vs. NoSQL), and authentication/authorization strategies.
- DevOps: Briefly touch on deployment processes, CI/CD, and containerization (Docker).
- Ask them to explain a complex project they've worked on, detailing their role in both the frontend and backend.`;
		case "Data Analyst":
			return `
DATA ANALYST SPECIFIC INSTRUCTIONS:
- Focus on data manipulation, analysis, and visualization.
- SQL: Pose a complex query problem involving joins, subqueries, and window functions.
- Python/R: Ask about libraries used for data analysis (e.g., Pandas, NumPy, dplyr).
- Visualization: Ask how they would visualize a specific dataset to convey insights to stakeholders (mention tools like Tableau, Power BI).
- Present a hypothetical business problem and ask them to outline the steps they would take to analyze the relevant data.`;
		case "Financial Analyst":
			return `
FINANCIAL ANALYST SPECIFIC INSTRUCTIONS:
- Evaluate financial modeling, valuation, and analytical skills.
- Modeling: Ask about their experience building 3-statement financial models from scratch.
- Valuation: Discuss different valuation methodologies (DCF, Precedent Transactions, etc.) and when to use them.
- Ask about their understanding of financial statements (Income Statement, Balance Sheet, Cash Flow).
- Pose a question about a recent economic event and its potential impact on a specific industry.`;
		case "Software Quality Engineer":
			return `
SOFTWARE QUALITY ENGINEER SPECIFIC INSTRUCTIONS:
- Focus on testing methodologies, automation, and processes.
- Test Strategy: Ask them to describe how they would create a test plan for a new feature.
- Automation: Inquire about their experience with automation frameworks (e.g., Selenium, Cypress, Playwright) and when to use automation vs. manual testing.
- Performance: Ask about their experience with load testing and performance analysis.
- Bug Lifecycle: Discuss their process for reporting, tracking, and verifying bugs.`;
		case "Product Manager":
			return `
PRODUCT MANAGER SPECIFIC INSTRUCTIONS:
- Assess product sense, execution, and strategic thinking.
- Prioritization: Give them a scenario with competing features and ask how they would prioritize them.
- User Focus: Ask about a time they used user feedback to significantly change a product.
- Metrics: Discuss which Key Performance Indicators (KPIs) they would track for a given product and why.
- Stakeholder Management: Ask about a time they had to manage conflicting interests from different stakeholders.`;
		case "AI/ML Engineer":
			return `
AI/ML ENGINEER SPECIFIC INSTRUCTIONS:
- Dive deep into machine learning concepts and practical application.
- Foundational Concepts: Ask about the bias-variance tradeoff, or to explain a specific algorithm like Gradient Boosting or a Transformer network.
- MLOps: Inquire about their experience with model deployment, monitoring, and versioning.
- Problem Formulation: Present a business problem and ask them to frame it as an ML problem (e.g., classification, regression).
- Ask about a challenging ML project, focusing on data preprocessing, model selection, and evaluation.`;
		case "Digital Marketing":
			return `
DIGITAL MARKETING SPECIFIC INSTRUCTIONS:
- Evaluate their expertise across various digital channels and analytics.
- SEO/SEM: Ask about their approach to keyword research and campaign optimization.
- Content Marketing: Discuss how they would create a content strategy to attract a specific target audience.
- Analytics: Provide a sample set of campaign data and ask for their analysis and recommendations.
- Ask them to describe a successful marketing campaign they managed and what made it effective.`;
		case "Sales Representative in Financial Sector":
			return `
SALES REPRESENTATIVE IN FINANCIAL SECTOR SPECIFIC INSTRUCTIONS:
- Assess their understanding of financial products and services.
- Product Knowledge: Ask about their experience with various financial instruments (e.g., stocks, bonds, mutual funds) and their suitability for different client profiles.
- Sales Strategy: Discuss their approach to identifying and acquiring new clients in the financial sector.
- Regulatory Compliance: Inquire about their familiarity with financial regulations and how they ensure compliance during the sales process.
- Client Relationship Management: Ask them to describe a time they managed a challenging client relationship and how they resolved any issues.`;
		case "Business Analyst":
			return `
BUSINESS ANALYST SPECIFIC INSTRUCTIONS:
- Evaluate their ability to analyze business processes and requirements.
- Requirement Gathering: Ask about their approach to eliciting and documenting business requirements from stakeholders.
- Process Improvement: Discuss a time they identified a bottleneck in a business process and how they addressed it.
- Tools and Techniques: Inquire about their proficiency with business analysis tools (e.g., JIRA, Confluence) and methodologies (e.g., Agile, Waterfall).
- Communication: Ask them to describe how they have effectively communicated complex technical information to non-technical stakeholders.`;
		default:
			return "";
	}
}
