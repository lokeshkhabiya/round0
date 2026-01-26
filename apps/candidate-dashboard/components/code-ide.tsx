import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS, LANGUAGE_VERSIONS } from "@/utils/constants";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { evaluateCode, runCode } from "@/api/operations/code-api";
import { Bot } from "lucide-react";
import { toast } from "sonner";
import { useInterviewTokenPayloadStore } from "@/stores/interview-token-payload-store";
import { useConversationContext } from "../context/conversation-context";
import { Badge } from "./ui/badge";

const languages = Object.entries(LANGUAGE_VERSIONS);

interface ToolArguments {
	language: string;
	starter_code?: string;
	instructions?: string;
	time_limit?: string;
}

interface CodeIDEProps {
	tool?: {
		id: string;
		tool: string;
		arguments: ToolArguments;
	};
}

const CodeIDE = ({ tool }: CodeIDEProps) => {
	const [code, setCode] = useState("");
	const [language, setLanguage] = useState("");
	const [output, setOutput] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { token } = useInterviewTokenPayloadStore();
	const { submitToolResult } = useConversationContext();

	// Handle tool arguments when tool prop is provided
	useEffect(() => {
		if (tool?.arguments) {
			if (tool.arguments.language) {
				setLanguage(tool.arguments.language);
				setCode(tool.arguments.starter_code || CODE_SNIPPETS[tool.arguments.language] || "");
			}
		}
	}, [tool]);

	const onSelect = (lang: string) => {
		setLanguage(lang);
		setCode(CODE_SNIPPETS[lang]);
	};

	const executeCode = async () => {
		if (!language) {
			setError("Please select a language first");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const { run: result } = await runCode(language, code);
			setOutput(result.output.split("\n"));
			if (result.stderr) {
				setError(result.stderr);
			}
		} catch (err) {
			console.error("Error executing code:", err);
			setError((err as Error).message || "An error occurred while executing the code");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmitForEvaluation = async () => {
		const response = await evaluateCode(
			language,
			code,
			"Code for adding two numbers",
			token as string
		);
		if (response?.success) {
			toast.success(response?.message);
			console.log(response?.data);
		} else {
			toast.error(response?.message);
		}
	};

	// Submit tool result when tool is provided (used in agent conversation)
	const submitCode = () => {
		if (tool) {
			const result = {
				code,
				language,
				output: output.join('\n'),
				success: code.trim().length > 0,
				metadata: {
					lines: code.split('\n').length,
					characters: code.length,
					timestamp: new Date().toISOString()
				}
			};
			submitToolResult('code_editor', result);
		}
	};

	return (
		<div className="w-full h-full flex flex-col">
			{/* Tool Instructions (when used by agent) */}
			{tool?.arguments?.instructions && (
				<div className="p-4 bg-blue-50 border-b">
					<h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
					<p className="text-blue-800 text-sm">{tool.arguments.instructions}</p>
					{tool.arguments.time_limit && (
						<p className="text-blue-700 text-xs mt-1">
							Time limit: {tool.arguments.time_limit}
						</p>
					)}
				</div>
			)}

			<div className="flex-1 flex">
				<div className="w-[50%]">
					<div className="flex justify-between items-center p-2">
						<div className="font-bold ml-3">CODE EDITOR</div>
						<div className="flex items-center gap-2">
							{tool && (
								<Badge variant="outline" className="mr-2">
									Agent Tool
								</Badge>
							)}
							<Select onValueChange={onSelect} value={language}>
								<SelectTrigger className="w-[130px] bg-black text-white">
									<SelectValue
										placeholder="Select Language"
										className="text-white"
									/>
								</SelectTrigger>
								<SelectContent>
									{languages.map(([lang, version]) => {
										return (
											<SelectItem key={lang} value={lang}>
												{lang} ({version})
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>
					</div>
					<Editor
						height="100%"
						language={language}
						theme="vs-dark"
						value={code}
						onChange={(value) => setCode(value || "")}
					/>
				</div>
				<div className="w-[50%]">
					<div className="flex items-center justify-between p-2">
						<div className="flex gap-2">
							<Button
								className="w-[100px] h-8"
								onClick={executeCode}
								disabled={isLoading || !language}
							>
								{isLoading ? "Running..." : "Run Code"}
							</Button>
							{tool && (
								<Button
									size="sm"
									onClick={submitCode}
									className="flex items-center gap-1"
								>
									Submit to Agent
								</Button>
							)}
						</div>
						<div className="font-bold mr-5">OUTPUT</div>
					</div>
					<div className="h-full border border-gray-700 bg-black text-green-400 p-4 font-mono text-sm overflow-auto relative">
						<div className="mb-2 text-gray-500">$ output</div>
						<pre className="whitespace-pre-wrap">
							{isLoading ? (
								<span className="text-yellow-400">
									Executing...
									<span className="animate-pulse">█</span>
								</span>
							) : error ? (
								<span className="text-red-400">{error}</span>
							) : output.length > 0 ? (
								output.map((line: string, index: number) => (
									<div key={index}>{line}</div>
								))
							) : (
								"Click Run Code to see the output"
							)}
						</pre>

						<Button
							className="absolute bottom-4 right-4 z-10 text-black hover:text-green-400 hover:cursor-pointer text-xs"
							variant="outline"
							onClick={handleSubmitForEvaluation}
						>
							<Bot className="h-12 w-12 mr-2" />
							Submit for Evaluation
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CodeIDE;
