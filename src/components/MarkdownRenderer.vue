<template>
  <div class="markdown-renderer" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { markdownToHtml } from '../utils/markdown'

interface Props {
  content: string
}

const props = defineProps<Props>()

const renderedHtml = computed(() => {
  return markdownToHtml(props.content)
})
</script>

<style scoped>
.markdown-renderer {
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.markdown-renderer :deep(h1),
.markdown-renderer :deep(h2),
.markdown-renderer :deep(h3),
.markdown-renderer :deep(h4),
.markdown-renderer :deep(h5),
.markdown-renderer :deep(h6) {
  margin: 1em 0 0.5em;
  font-weight: 600;
}

.markdown-renderer :deep(h1) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  padding-bottom: 0.3em;
}

.markdown-renderer :deep(h2) {
  font-size: 1.3em;
}

.markdown-renderer :deep(h3) {
  font-size: 1.1em;
}

.markdown-renderer :deep(p) {
  margin: 0.5em 0;
}

.markdown-renderer :deep(ul),
.markdown-renderer :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-renderer :deep(li) {
  margin: 0.25em 0;
}

.markdown-renderer :deep(code) {
  background-color: var(--code-bg, #f3f4f6);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}

.markdown-renderer :deep(pre) {
  background-color: var(--pre-bg, #1f2937);
  color: var(--pre-text, #e5e7eb);
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-renderer :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.markdown-renderer :deep(blockquote) {
  border-left: 4px solid var(--blockquote-border, #3b82f6);
  padding-left: 1em;
  margin: 0.5em 0;
  color: var(--blockquote-text, #6b7280);
}

.markdown-renderer :deep(a) {
  color: var(--link-color, #3b82f6);
  text-decoration: underline;
}

.markdown-renderer :deep(a:hover) {
  text-decoration: none;
}

.markdown-renderer :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}

.markdown-renderer :deep(th),
.markdown-renderer :deep(td) {
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 0.5em;
}

.markdown-renderer :deep(th) {
  background-color: var(--th-bg, #f9fafb);
  font-weight: 600;
}

.markdown-renderer :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin: 1em 0;
}

.markdown-renderer :deep(strong) {
  font-weight: 600;
}
</style>
