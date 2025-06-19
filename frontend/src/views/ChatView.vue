<!-- src/views/ChatView.vue -->
<template>
  <div class="chat-wrapper d-flex flex-column">
    <transition-group name="message-fade" tag="div" class="message-list flex-grow-1 p-3">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item d-flex mb-4"
        :class="{ 'user': message.role === 'user', 'bot': message.role === 'bot' }"
      >
        <div class="avatar">
          <span v-if="message.role === 'bot'">🤖</span>
          <span v-else>🧑</span>
        </div>

        <div class="message-content">
          <div
            class="message-bubble"
            :class="{
              'bg-primary-subtle': message.role === 'user',
              'bg-light': message.role === 'bot',
              'border': message.role === 'bot',
              'text-danger border-danger': message.isError
            }"
          >
            <div v-if="message.role === 'bot'" class="markdown-content">
              <div v-if="message.isError">
                {{ message.text }}
                <!-- ✅ 재시도 버튼 -->
                <button v-if="message.retry" class="btn btn-sm btn-outline-danger mt-2" @click="retryMessage(message)">재시도</button>
              </div>
              <div v-else v-html="renderMarkdown(message.text)"></div>
            </div>
            <p v-else class="m-0">{{ message.text }}</p>
          </div>
        </div>
      </div>

      <div v-if="isLoading" key="loading" class="message-item d-flex mb-4 bot">
        <div class="avatar"><span>🤖</span></div>
        <div class="message-content">
          <div class="message-bubble bg-light border">
            <div class="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>

      <div ref="bottomRef" :key="'bottom-ref'"></div>
    </transition-group>

    <div class="message-input-form p-3 bg-white border-top">
      <form @submit.prevent="handleSendMessage">
        <div class="input-group">
          <input
            v-model="userInput"
            type="text"
            class="form-control"
            placeholder="메시지를 입력하세요..."
            :disabled="isLoading"
            aria-label="Message input"
          />
          <button class="btn btn-primary" type="submit" :disabled="isLoading">전송</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/stores/chatStore';
import { marked } from 'marked';
import { handleSendMessageLogic } from '@/services/chatService.js';

const chatStore = useChatStore();
const { messages, isLoading } = storeToRefs(chatStore);

const userInput = ref('');
const messageContainer = ref(null);
const bottomRef = ref(null);

const renderMarkdown = (text) => {
  if (!text) return '';
  return marked.parse(text, { breaks: true, gfm: true });
};

watch(messages, async () => {
  // console.log('🔽 스크롤 시도됨');
  await nextTick();
  if (bottomRef.value) {
    bottomRef.value.scrollIntoView({ behavior: 'smooth' });
    // console.log('✅ scrollIntoView 호출됨');
  } else {
    console.warn('❌ bottomRef 없음');
  }
}, { deep: true });

onMounted(async () => {
  await nextTick();
  if (bottomRef.value) {
    bottomRef.value.scrollIntoView({ behavior: 'auto' });
    // console.log('✅ onMounted: 초기 scrollIntoView 실행됨');
  }
});

// ✅ 재시도 버튼 클릭 시 호출
const retryMessage = async (message) => {
  await handleSendMessageLogic(message.originalText);
};

const handleSendMessage = async () => {
  const message = userInput.value.trim();
  if (!message) return;
  userInput.value = '';
  await handleSendMessageLogic(message);
};
</script>

<style lang="scss" scoped>
.chat-wrapper {
  height: calc(100vh - 12rem);
  max-height: 700px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ffffff;
  border: 1px solid #e0e5eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px -5px rgba(18, 22, 33, 0.15);
}

.message-list {
  background-color: #f0f4f8;
  padding: 1.5rem !important;
  overflow-y: auto;
  flex-grow: 1;
}

.message-item {
  display: flex;
  align-items: flex-end;
  margin-bottom: 1.5rem;

  &.user {
    flex-direction: row-reverse;
  }
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
  margin-right: 1rem;
}

.message-item.user .avatar {
  background-color: #0d6efd;
  margin-left: 1rem;
}

.message-content {
  max-width: 80%;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  p {
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }

  .user & {
    border-top-right-radius: 0.25rem;
    background-color: #d1e7ff;
    color: #002b5c;
  }

  .bot & {
    border-top-left-radius: 0.25rem;
    background-color: #ffffff;
  }
}

.markdown-content {
  :first-child {
    margin-top: 0;
  }

  :last-child {
    margin-bottom: 0;
  }

  p {
    margin-bottom: 0.5rem;
  }

  pre {
    background-color: #282c34;
    color: #abb2bf;
    padding: 1rem;
    border-radius: 0.5rem;
    white-space: pre-wrap;
    word-break: break-all;
  }

  code {
    font-family: 'Courier New', Courier, monospace;
  }

  ul,
  ol {
    padding-left: 1.5rem;
  }
}

.message-input-form {
  background-color: #ffffff;
  border-top: 1px solid #e0e5eb;
  padding: 1rem;
}

.message-fade-enter-active {
  transition: all 0.3s ease-out;
}

.message-fade-leave-active {
  transition: all 0.2s ease-in;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #9E9EA1;
  border-radius: 50%;
  display: inline-block;
  animation: wave 1.3s infinite;
  margin: 0 2px;

  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }

  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }
}

@keyframes wave {

  0%,
  60%,
  100% {
    transform: initial;
  }

  30% {
    transform: translateY(-8px);
  }
}
</style>
