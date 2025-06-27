// 📄 파일 경로: src/stores/openaiChatStore.js
import { defineStore } from 'pinia'

// localStorage 키
const CHAT_HISTORY_KEY = 'openai-chat-history'

// Base64 → Blob URL
function base64ToBlobUrl(base64, mimeType) {
  try {
    const byteCharacters = atob(base64)
    const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })
    return URL.createObjectURL(blob)
  } catch (e) {
    console.error("Base64 to Blob URL 변환 실패:", e)
    return ''
  }
}

export const useChatStore = defineStore('openaiChat', {
  state: () => {
    const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY)

    let messages = []
    if (savedMessages) {
      messages = JSON.parse(savedMessages).map(msg => {
        if (msg.imageData) {
          msg.imageUrl = base64ToBlobUrl(msg.imageData, msg.imageMimeType)
        }
        return msg
      })
    }

    return {
      messages,
      isLoading: false,
      error: null,
      isSubscribed: false
    }
  },

  getters: {
    getHistoryForApi: (state) =>
      state.messages
        .filter(msg => !msg.isError)
        .map(msg => ({
          role: msg.role,
          content: msg.text
        }))
  },

  actions: {
    addMessage(message) {
      this.messages.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...message
      })
    },

    subscribeToChanges() {
      if (this.isSubscribed) return

      this.$subscribe((mutation, state) => {
        const MAX_MESSAGES = 50
        const MAX_IMAGE_MESSAGES = 10
        let imageCount = 0

        const messagesToSave = state.messages
          .slice(-MAX_MESSAGES)
          .map(msg => {
            const { imageUrl, ...rest } = msg

            if (rest.imageData) {
              if (imageCount >= MAX_IMAGE_MESSAGES) {
                delete rest.imageData
                delete rest.imageMimeType
              } else {
                imageCount++
              }
            }

            return rest
          })

        try {
          localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesToSave))
        } catch (e) {
          console.warn('💥 openai localStorage 저장 실패', e)
        }
      })

      this.isSubscribed = true
    },

    clearChatHistory() {
      this.messages = []
      localStorage.removeItem(CHAT_HISTORY_KEY)
    }
  }
})
