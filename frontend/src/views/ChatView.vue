<!-- src/views/ChatView.vue -->
<template>
  <div class="chat-wrapper d-flex flex-column">
    <transition-group name="message-fade" tag="div" class="message-list flex-grow-1 p-3">
      <div v-for="message in messages" :key="message.id" class="message-item d-flex mb-4"
        :class="{ 'user': message.role === 'user', 'bot': message.role === 'bot' }">
        <div class="avatar">
          <span v-if="message.role === 'bot'">🤖</span>
          <span v-else>🧑</span>
        </div>
        <div class="message-content">
          <div class="message-bubble" :class="{
            'bg-primary-subtle': message.role === 'user',
            'bg-light': message.role === 'bot',
            'border': message.role === 'bot',
            'text-danger border-danger': message.isError
          }">
            
            <!-- ✅ START: 이 부분이 핵심 수정 사항입니다. -->
            <!-- 1. 봇 메시지일 경우 -->
            <div v-if="message.role === 'bot'" class="markdown-content">
              <div v-if="message.isError">
                {{ message.text }}
                <button v-if="message.retry" class="btn btn-sm btn-outline-danger mt-2" @click="retryMessage(message)">재시도</button>
              </div>
              <div v-else v-html="renderMarkdown(message.text)"></div>
            </div>

            <!-- 2. 사용자 메시지일 경우 -->
            <div v-else>
              <!-- 2-1. 이미지가 포함된 사용자 메시지 -->
              <div v-if="message.imageUrl" class="user-message-with-image">
                <img :src="message.imageUrl" alt="User uploaded image" class="attached-image-thumbnail mb-2">
                <p v-if="message.text" class="m-0">{{ message.text }}</p>
              </div>
              <!-- 2-2. 텍스트만 있는 사용자 메시지 -->
              <p v-else class="m-0">{{ message.text }}</p>
            </div>
            <!-- ✅ END: 수정 끝. -->

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

    <div v-if="selectedImage" class="image-preview-wrapper p-3 border-top">
      <div class="image-preview-container">
        <img :src="imagePreviewUrl" alt="Image preview" class="img-thumbnail" />
        <button class="btn-close" @click="removeImage" aria-label="Remove image"></button>
      </div>
    </div>

    <div class="message-input-form p-3 bg-white border-top">
      <form @submit.prevent="handleSendMessage">
        <div class="input-group">
          <input ref="fileInput" type="file" @change="handleFileChange" accept="image/*" style="display: none;" />
          <button class="btn btn-outline-secondary" type="button" @click="triggerFileInput" :disabled="isLoading">📎</button>
          <input v-model="userInput" type="text" class="form-control" placeholder="메시지를 입력하세요..." :disabled="isLoading"
            aria-label="Message input" />
          <button class="btn btn-primary" type="submit" :disabled="isLoading">전송</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/stores/chatStore';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { handleSendMessageLogic } from '@/services/chatService.js';

const chatStore = useChatStore();
const { messages, isLoading } = storeToRefs(chatStore);
const userInput = ref('');
const bottomRef = ref(null);
const fileInput = ref(null);
const selectedImage = ref(null);

const imagePreviewUrl = computed(() => {
  return selectedImage.value ? URL.createObjectURL(selectedImage.value) : '';
});

const renderMarkdown = (text) => {
  if (!text) return '';
  const rawHtml = marked.parse(text, { breaks: true, gfm: true });
  return DOMPurify.sanitize(rawHtml);
};

watch(messages, async () => {
  await nextTick();
  if (bottomRef.value) {
    bottomRef.value.scrollIntoView({ behavior: 'smooth' });
  }
}, { deep: true });

onMounted(async () => {
  chatStore.subscribeToChanges();
  await nextTick();
  if (bottomRef.value) {
    bottomRef.value.scrollIntoView({ behavior: 'auto' });
  }
});

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    selectedImage.value = file;
  }
};

const removeImage = () => {
  selectedImage.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const retryMessage = async (message) => {
  await handleSendMessageLogic(message.originalText, null);
};

const handleSendMessage = async () => {
  const message = userInput.value.trim();
  if (!message && !selectedImage.value) return;
  const imageFile = selectedImage.value;
  userInput.value = '';
  removeImage();
  await handleSendMessageLogic(message, imageFile);
};
</script>

<style lang="scss" scoped>
/* ✅ ADD: 사용자 메시지 버블 안의 이미지 썸네일 스타일 */
.user-message-with-image .attached-image-thumbnail {
  max-width: 200px;
  max-height: 200px;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid #dee2e6;
}

/* 전송 전 이미지 미리보기 */
.image-preview-wrapper { background-color: #f8f9fa; }
.image-preview-container { position: relative; display: inline-block; max-width: 150px; }
.image-preview-container .img-thumbnail { max-width: 100%; height: auto; }
.image-preview-container .btn-close { position: absolute; top: -10px; right: -10px; background-color: white; border-radius: 50%; padding: 0.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }

/* 기존 스타일 */
.chat-wrapper { height: calc(100vh - 12rem); max-height: 700px; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; overflow: hidden; background-color: #ffffff; border: 1px solid #e0e5eb; border-radius: 0.75rem; box-shadow: 0 10px 30px -5px rgba(18, 22, 33, 0.15); }
.message-list { background-color: #f0f4f8; padding: 1.5rem !important; overflow-y: auto; flex-grow: 1; }
.message-item { display: flex; align-items: flex-end; margin-bottom: 1.5rem; }
.message-item.user { flex-direction: row-reverse; }
.avatar { width: 40px; height: 40px; border-radius: 50%; color: white; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; flex-shrink: 0; }
.message-item.bot .avatar { background-color: #6c757d; margin-right: 1rem; }
.message-item.user .avatar { background-color: #0d6efd; margin-left: 1rem; }
.message-content { max-width: 80%; }
.message-bubble { padding: 0.75rem 1rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
.message-bubble p { white-space: pre-wrap; word-break: break-word; margin: 0; }
.user .message-bubble { border-top-right-radius: 0.25rem; background-color: #d1e7ff; color: #002b5c; }
.bot .message-bubble { border-top-left-radius: 0.25rem; background-color: #ffffff; }
.markdown-content :first-child { margin-top: 0; }
.markdown-content :last-child { margin-bottom: 0; }
.markdown-content p { margin-bottom: 0.5rem; }
.markdown-content pre { background-color: #282c34; color: #abb2bf; padding: 1rem; border-radius: 0.5rem; white-space: pre-wrap; word-break: break-all; }
.markdown-content code { font-family: 'Courier New', Courier, monospace; }
.markdown-content ul, .markdown-content ol { padding-left: 1.5rem; }
.message-input-form { background-color: #ffffff; border-top: 1px solid #e0e5eb; padding: 1rem; }
.message-fade-enter-active { transition: all 0.3s ease-out; }
.message-fade-leave-active { transition: all 0.2s ease-in; }
.message-fade-enter-from, .message-fade-leave-to { opacity: 0; transform: translateY(20px); }
.typing-indicator span { height: 8px; width: 8px; background-color: #9E9EA1; border-radius: 50%; display: inline-block; animation: wave 1.3s infinite; margin: 0 2px; }
.typing-indicator span:nth-of-type(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-of-type(3) { animation-delay: 0.4s; }
@keyframes wave { 0%, 60%, 100% { transform: initial; } 30% { transform: translateY(-8px); } }
</style>