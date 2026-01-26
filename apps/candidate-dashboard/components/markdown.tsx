import markdownit from "markdown-it";
import DOMPurify from 'dompurify';

// Enhanced markdown configuration for mentor chat responses
const md = markdownit({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true, // Enable line breaks for better formatting
});

// Configure links to open in new tabs
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  tokens[idx].attrPush(['target', '_blank']);
  tokens[idx].attrPush(['rel', 'noopener noreferrer']);
  return self.renderToken(tokens, idx, options);
};

export function RenderMarkdown({ markdown }: { markdown: string }) {
  // Clean up the markdown while preserving intentional formatting
  const cleanedMarkdown = markdown.trim();

  const html = md.render(cleanedMarkdown);
  
  return (
    <div
      className="markdown-mentor"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html, { ADD_ATTR: ['target'] }),
      }}
    />
  );
}