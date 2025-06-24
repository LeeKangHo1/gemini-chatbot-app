<!-- src/views/ChatView.vue -->
<template>
  <div class="chat-wrapper d-flex flex-column">
    <MessageList :messages="messages" :isLoading="isLoading" />

    <ImagePreview
      v-if="selectedImage"
      :imageUrl="imagePreviewUrl"
      @remove="removeImage"
    />

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
import { useChatStore } from '@/stores/chatStore';
import { handleSendMessageLogic } from '@/services/chatService.js';

import MessageList from '@/components/MessageList.vue';
import MessageInput from '@/components/MessageInput.vue';
import ImagePreview from '@/components/ImagePreview.vue';

const chatStore = useChatStore();
const { messages, isLoading } = storeToRefs(chatStore);
const userInput = ref('');
const selectedImage = ref(null);

const imagePreviewUrl = computed(() => {
  return selectedImage.value ? URL.createObjectURL(selectedImage.value) : '';
});

onMounted(() => {
  chatStore.subscribeToChanges();
});

const handleFileChange = (file) => {
  if (file && file.type.startsWith('image/')) {
    selectedImage.value = file;
  }
};

const removeImage = () => {
  selectedImage.value = null;
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
