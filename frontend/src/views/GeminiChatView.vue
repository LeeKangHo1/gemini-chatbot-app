<!-- src/views/GeminiChatView.vue -->

<template>
  <div class="chat-wrapper d-flex flex-column">
    <MessageList :messages="messages" :isLoading="isLoading" />

    <div v-if="selectedImages.length > 0" class="p-2 d-flex flex-wrap">
      <ImagePreview
        v-for="(img, idx) in selectedImages"
        :key="idx"
        :imageUrl="getPreviewUrl(img)"
        @remove="() => removeImage(idx)"
      />
    </div>

    <MessageInput
      v-model:input="userInput"
      :isLoading="isLoading"
      @file-selected="handleFileChange"
      @send="handleSendMessage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '../stores/geminiChatStore';
import { handleSendMessageLogic } from '../services/geminiChatService.js';

import MessageList from '../components/MessageList.vue';
import MessageInput from '../components/MessageInput.vue';
import ImagePreview from '../components/ImagePreview.vue';

// Pinia 상태
const chatStore = useChatStore();
const { messages, isLoading } = storeToRefs(chatStore);

// 사용자 입력 및 선택 이미지
const userInput = ref('');
const selectedImages = ref([]);

// 컴포넌트 마운트 시 대화 상태 감지 시작
onMounted(() => {
  chatStore.subscribeToChanges();
});

// 이미지 선택 처리
const handleFileChange = (files) => {
  selectedImages.value = files;
};

// 이미지 제거
const removeImage = (index) => {
  const file = selectedImages.value[index];
  URL.revokeObjectURL(file); // 메모리 누수 방지
  selectedImages.value.splice(index, 1);
};

// 이미지 미리보기용 URL 생성
const getPreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

// 메시지 전송 처리
const handleSendMessage = async (formData) => {
  const message = formData.get('message')?.trim();
  const hasImage = formData.getAll('imageFiles').length > 0;
  const hasAttachment = !!formData.get('attachment');

  if (!message && !hasImage && !hasAttachment) return;

  userInput.value = '';
  selectedImages.value = [];

  await handleSendMessageLogic(formData);
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
</style>
