<!-- src/views/ChatView.vue -->

<template>
  <div class="chat-wrapper d-flex flex-column">
    <!-- 메시지 목록 -->
    <MessageList :messages="messages" :isLoading="isLoading" />

    <!-- 이미지 미리보기 -->
    <ImagePreview
      v-if="selectedImage"
      :imageUrl="imagePreviewUrl"
      @remove="removeImage"
    />

    <!-- 메시지 입력 + 파일 첨부 -->
    <MessageInput
      v-model:input="userInput"
      :isLoading="isLoading"
      @file-selected="handleFileChange"
      @send="handleSendMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '../stores/chatStore';
import { handleSendMessageLogic } from '../services/chatService.js';

import MessageList from '../components/MessageList.vue';
import MessageInput from '../components/MessageInput.vue';
import ImagePreview from '../components/ImagePreview.vue';

// Pinia 상태 참조
const chatStore = useChatStore();
const { messages, isLoading } = storeToRefs(chatStore);

// 입력 메시지 및 이미지 상태
const userInput = ref('');
const selectedImage = ref(null);

// 선택된 이미지의 미리보기 URL 계산
const imagePreviewUrl = computed(() =>
  selectedImage.value ? URL.createObjectURL(selectedImage.value) : ''
);

// 마운트 시 채팅 상태 변경 감지 시작
onMounted(() => {
  chatStore.subscribeToChanges();
});

// 이미지 파일 선택 처리
const handleFileChange = (file) => {
  if (file && file.type.startsWith('image/')) {
    selectedImage.value = file;
  }
};

// 이미지 제거
const removeImage = () => {
  selectedImage.value = null;
};

// 메시지 및 파일 전송 (formData 활용)
const handleSendMessage = async (formData) => {
  const message = formData.get('message')?.trim();
  const hasImage = !!selectedImage.value;
  const hasAttachment = !!formData.get('attachment');

  if (!message && !hasImage && !hasAttachment) return;

  // 이미지가 있을 경우 formData에 추가
  if (hasImage) {
    formData.append('imageFile', selectedImage.value);
  }

  userInput.value = '';
  removeImage();

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
