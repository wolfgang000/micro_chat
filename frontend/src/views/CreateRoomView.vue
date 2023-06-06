<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Toast } from 'bootstrap'
import { v4 } from 'uuid'
import { ref } from 'vue'

const copyUrlToClipboard = async () => {
  const toast = new Toast(document.getElementById('create_room_toast') as any)
  try {
    await navigator.clipboard.writeText(roomUrl.value)
    toastMsg.value = 'Copied room link'
  } catch (e) {
    toastMsg.value = 'Unable to copy the room link'
    console.error(e)
  }
  toast.show()
}

const router = useRouter()
const roomId = ref('')
const roomUrl = ref('')
const toastMsg = ref('')

router.resolve
const onSubmit = () => {
  roomId.value = v4()
  const roomRoute = router.resolve({ name: 'chat-room', params: { roomId: roomId.value } })
  roomUrl.value = `${window.location.origin}${roomRoute.href}`
}
</script>

<template>
  <main>
    <div className="toast-container position-fixed top-0 end-0 p-3">
      <div
        id="create_room_toast"
        className="toast align-items-center text-bg-light border-0"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">
            {{ toastMsg }}
          </div>
        </div>
      </div>
    </div>

    <div class="container mt-5">
      <div v-if="roomId" class="">
        <div class="mb-3">
          <div>Your room is ready</div>
          <div>Share this link with the other participants</div>
        </div>
        <div class="mb-3">
          <div class="text-link-container d-inline-flex">
            <div class="text-link p-2">
              {{ roomUrl }}
              <button
                id="copy_room_link_button"
                @click="copyUrlToClipboard"
                type="button"
                class="btn btn-light ms-3"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
        <router-link
          id="go_to_room_link"
          class="btn btn-primary"
          :to="{ name: 'chat-room', params: { roomId: roomId } }"
        >
          Go to room
        </router-link>
      </div>
      <div v-else>
        <form @submit.prevent="onSubmit">
          <button id="create_room_button" class="btn btn-primary" type="submit">New room</button>
        </form>
      </div>
    </div>
  </main>
</template>
<style scoped>
.text-link-container {
  background: rgb(241, 243, 244);
}

.text-link {
}
</style>
