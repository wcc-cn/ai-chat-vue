import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'

// Configure DOMPurify to allow safe elements
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'blockquote', 'code', 'pre',
  'span', 'div', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
]

const ALLOWED_ATTR = [
  'href', 'title', 'class', 'style'
]

/**
 * Convert markdown to HTML with proper sanitization and syntax highlighting
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  try {
    const html = marked.parse(markdown) as string

    // Apply syntax highlighting to code blocks
    const highlightedHtml = html.replace(
      /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
      (_match, language, code) => {
        try {
          const decodedCode = htmlDecode(code)
          if (language && hljs.getLanguage(language)) {
            const highlighted = hljs.highlight(decodedCode, { language }).value
            return `<pre><code class="language-${language} hljs ${language}">${highlighted}</code></pre>`
          }
          const highlighted = hljs.highlightAuto(decodedCode).value
          return `<pre><code class="hljs">${highlighted}</code></pre>`
        } catch (error) {
          console.error('Highlight.js error:', error)
          return _match
        }
      }
    )

    return DOMPurify.sanitize(highlightedHtml, {
      ALLOWED_TAGS,
      ALLOWED_ATTR
    })
  } catch (error) {
    console.error('Markdown parsing error:', error)
    // Fallback: just escape and display as plain text
    return escapeHtml(markdown)
  }
}

/**
 * Strip markdown formatting for plain text display
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return ''

  return markdown
    // // Remove code blocks (keep content)
    .replace(/```[\w]*\n([\s\S]*?)```/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove bold
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // Remove italic
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove links, keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
}

/**
 * Check if markdown contains code blocks
 */
export function hasCodeBlocks(markdown: string): boolean {
  return /```[\w]*\n[\s\S]*?```/.test(markdown)
}

/**
 * Extract code blocks from markdown content
 */
export function extractCodeBlocks(markdown: string): Array<{ language: string; content: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  const blocks: Array<{ language: string; content: string }> = []
  let match

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || 'plaintext',
      content: match[2]
    })
  }

  return blocks
}

/**
 * Detect programming language from markdown code block
 */
export function detectLanguage(content: string): string {
  const match = content.match(/^```(\w+)/m)
  return match ? match[1] : 'plaintext'
}

/**
 * Truncate markdown content to a specified length while preserving code blocks
 */
export function truncateMarkdown(markdown: string, maxLength: number): string {
  if (markdown.length <= maxLength) {
    return markdown
  }

  const stripped = stripMarkdown(markdown)
  if (stripped.length <= maxLength) {
    return markdown
  }

  const truncated = stripped.substring(0, maxLength - 3)
  return truncated + '...'
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * Decode HTML entities
 */
function htmlDecode(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}
