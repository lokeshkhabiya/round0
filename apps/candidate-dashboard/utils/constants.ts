export const LANGUAGE_VERSIONS = {
    javascript : "18.15.0",
    typescript : "5.0.3",
    java : "15.0.2",
    cpp : "10.2.0",
    python : "3.10.0"
}

export const CODE_SNIPPETS: Record<string, string> = {
    "": "\nSelect a Language in the above dropdown ^",
    javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
    typescript: `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
    python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
    java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
    cpp: `\n#include <iostream>\n#include <string>\n\nvoid greet(const std::string& name) {\n\tstd::cout << "Hello, " << name << "!" << std::endl;\n}\n\nint main() {\n\tgreet("Alex");\n\treturn 0;\n}\n`,
  };