<!-- src/views/ChatView.vue -->
<template>
  <div class="chat-wrapper d-flex flex-column">
    <transition-group name="message-fade" tag="div" class="message-list flex-grow-1 p-3">
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @retry="retryMessage"
      />
      <div v-if="isLoading" key="loading" class="message-item d-flex mb-4 bot">
        <div class="avatar"><span>🤖</span></div>
        <div class="message-content">
          <div class="message-bubble bg-light border">
            <TypingIndicator />
          </div>
        </div>
      </div>
      <div ref="bottomRef" :key="'bottom-ref'"></div>
    </transition-group>

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
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/stores/chatStore';
import { handleSendMessageLogic } from '@/services/chatService.js';
import MessageItem from '@/components/MessageItem.vue';
import TypingIndicator from '@/components/TypingIndicator.vue';
import MessageInput from '@/components/MessageInput.vue';
import ImagePreview from '@/components/ImagePreview.vue';

const chatStore = useChatStore();
const { messages, isLoading } = storeToRefs(chatStore);
const userInput = ref('');
const bottomRef = ref(null);
const selectedImage = ref(null);

const imagePreviewUrl = computed(() => {
  return selectedImage.value ? URL.createObjectURL(selectedImage.value) : '';
});

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

const handleFileChange = (file) => {
  if (file && file.type.startsWith('image/')) {
    selectedImage.value = file;
  }
};

const removeImage = () => {
  selectedImage.value = null;
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
</style>
