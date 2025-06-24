<!-- src/components/MessageItem.vue -->
<template>
  <div class="message-item d-flex mb-4" :class="{ user: message.role === 'user', bot: message.role === 'bot' }">
    <div class="avatar">
      <span v-if="message.role === 'bot'">🤖</span>
      <span v-else>🧑</span>
    </div>
    <div class="message-content">
      <div class="message-bubble" :class="bubbleClass">

        <!-- 봇 메시지 -->
        <div v-if="message.role === 'bot'" class="markdown-content">
          <div v-if="message.isError">
            {{ message.text }}
            <button v-if="message.retry" class="btn btn-sm btn-outline-danger mt-2" @click="$emit('retry', message)">
              재시도
            </button>
          </div>
          <div v-else v-html="renderMarkdown(message.text)"></div>
        </div>

        <!-- 사용자 메시지 -->
        <div v-else>
          <div v-if="message.imageUrl" class="user-message-with-image">
            <img :src="message.imageUrl" alt="User uploaded image" class="attached-image-thumbnail mb-2" />
            <p v-if="message.text" class="m-0">{{ message.text }}</p>
          </div>
          <p v-else class="m-0">{{ message.text }}</p>
        </div>
      </div>

      <!-- 🕒 메시지 시간 -->
      <small class="text-muted d-block mt-1 text-end">
        {{ formattedTime }}
      </small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  message: Object
})

const emit = defineEmits(['retry'])

const bubbleClass = computed(() => {
  return {
    'bg-primary-subtle': props.message.role === 'user',
    'bg-light': props.message.role === 'bot',
    'border': props.message.role === 'bot',
    'text-danger border-danger': props.message.isError
  }
})

const renderMarkdown = (text) => {
  if (!text) return ''
  const rawHtml = marked.parse(text, { breaks: true, gfm: true })
  return DOMPurify.sanitize(rawHtml)
}

const formattedTime = computed(() => {
  if (!props.message.timestamp) return ''
  const date = new Date(props.message.timestamp)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
})
</script>

<style scoped>
.message-item {
  display: flex;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.message-item.user {
  flex-direction: row;
  justify-content: flex-end;
}

.message-item.bot {
  flex-direction: row;
  justify-content: flex-start;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.message-item.bot .avatar {
  background-color: #6c757d;
  margin-right: 0.75rem;
  order: 0;
}

.message-item.user .avatar {
  background-color: #0d6efd;
  margin-left: 0.75rem;
  order: 2; /* 아바타를 오른쪽으로 이동 */
}

.message-item.user .message-content {
  order: 1;
  margin-left: auto;
}

.message-content {
  max-width: 80%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-bubble {
  display: inline-block;
  word-break: break-word;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  max-width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.user .message-bubble {
  border-top-right-radius: 0.25rem;
  background-color: #d1e7ff;
  color: #002b5c;
}

.bot .message-bubble {
  border-top-left-radius: 0.25rem;
  background-color: #ffffff;
  margin-right: auto; 
}

.message-content small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  text-align: right;
  color: #6c757d;
}

/* 마크다운 콘텐츠 */
.markdown-content :first-child {
  margin-top: 0;
}

.markdown-content :last-child {
  margin-bottom: 0;
}

.markdown-content p {
  margin-bottom: 0.5rem;
}

.markdown-content pre {
  background-color: #282c34;
  color: #abb2bf;
  padding: 1rem;
  border-radius: 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.markdown-content code {
  font-family: 'Courier New', Courier, monospace;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 1.5rem;
}

/* 이미지 첨부 */
.user-message-with-image .attached-image-thumbnail {
  max-width: 200px;
  max-height: 200px;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid #dee2e6;
}

</style>
