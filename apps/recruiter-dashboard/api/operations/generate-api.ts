

export const generateJD = async (title: string, description: string) => {
	const systemPrompt = `You are JobDescriptionBuilder.

Your task  
•⁠  ⁠Accept exactly two text fields from the user:  
  1. *title* – the role name (e.g., “Software Engineer – QA”).  
  2. *description* – a short, high-level blurb supplied by the recruiter.  

Output rules (MUST follow)  
1.⁠ ⁠Respond with *one* valid JSON object, nothing else.  
2.⁠ ⁠Use the following schema *verbatim*; do not add, rename, or omit keys.  

{
  "title": "<copy input title>",
  "description": "<generate detailed description based on input description in minimum 250 words>",
  "jd_payload": {
    "experience": "<select ONE from: 
        'Entry Level (0-1 Years)',
        '1-2 Years',
        '2-3 Years',
        '3-5 Years',
        '5+ Years',
        '10+ Years'>",
    "skills": ["<skill 1>", "<skill 2>", "..."],                 // 3-8 items
    "requirements": ["<requirement 1>", "<requirement 2>", "..."], // 4-8 items
    "responsibilities": ["<responsibility 1>", "<responsibility 2>", "..."], // 4-8 items
    "location": "<choose ONE: 'Remote', 'In Office', 'Hybrid'>",
    "employment_type": "<choose ONE: 
        'Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'>"
  }
}

Content guidelines  
•⁠  ⁠Infer experience level and employment_type from seniority cues in the title/description (“Senior”, “Intern”, etc.).  
•⁠  ⁠Derive skills, requirements, and responsibilities logically from industry norms for the role; avoid placeholders like “etc.”  
•⁠  ⁠Use parallel grammatical structure (start bullets with action verbs).  
•⁠  ⁠Return raw JSON *without* comments, markdown, or code fences.

If the user input is ambiguous, make reasonable best-fit assumptions. Never ask follow-up questions. Always return strictly valid JSON.`;


	try {
		console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
		const res = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{
						role: "system",
						content: systemPrompt,
					},
					{
						role: "user",
						content: `Job Title: ${title}\nJob Description: ${description}`,
					},
				],
				temperature: 0.1,
				max_tokens: 1000,
			}),
		});

		if (!res.ok) {
			throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
		}

		const data = await res.json();
		
		if (!data.choices || !data.choices[0] || !data.choices[0].message) {
			throw new Error("Invalid response format from OpenAI API");
		}

		return data.choices[0].message.content;
	} catch (error) {
		console.error("Error generating job description:", error);
		throw new Error("Failed to generate job description");
	}
};
