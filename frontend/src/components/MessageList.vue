<!-- src/components/MessageList.vue -->
<template>
  <transition-group name="message-fade" tag="div" class="message-list flex-grow-1 p-3">
    <MessageItem
      v-for="message in messages"
      :key="message.id"
      :message="message"
      @retry="handleRetry"
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
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import MessageItem from './MessageItem.vue'
import TypingIndicator from './TypingIndicator.vue'
import { handleSendMessageLogic } from '@/services/chatService'

const props = defineProps({
  messages: Array,
  isLoading: Boolean
})

const bottomRef = ref(null)

watch(() => props.messages, async () => {
  await nextTick()
  bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
}, { deep: true })

onMounted(() => {
  bottomRef.value?.scrollIntoView({ behavior: 'auto' })
})

const handleRetry = async (message) => {
  await handleSendMessageLogic(message.originalText, null)
}
</script>

<style scoped>
.message-list {
  background-color: #f0f4f8;
  padding: 1.5rem !important;
  overflow-y: auto;
  flex-grow: 1;
}
</style>
