<script setup lang="ts">
import { roomStore } from '@/stores/room'
import IconPhone from '../icons/IconPhone.vue'
import { useRoomStore } from '@/stores/roomPinia'
const roomStorePinia = useRoomStore()

const onCallButtonClick = async () => {
  roomStorePinia.activateVideoChat()
}
</script>

<template>
  <div>
    <div class="contact-header d-flex align-items-center">
      <div class="d-flex justify-content-between" style="width: 100%; margin-right: 0.5rem">
        <div class="d-flex align-items-center ms-2">
          <a href="#"
            ><strong>{{ roomStore.roomName }}</strong></a
          >
        </div>
        <div>
          <button
            id="startCallButton"
            type="button"
            class="btn btn-light me-2"
            @click="onCallButtonClick"
          >
            <IconPhone />
          </button>
          <button
            type="button"
            class="btn btn-light"
            data-bs-toggle="modal"
            data-bs-target="#membersOnlineModal"
            id="membersOnlinebutton"
          >
            <span style="color: green" class="me-1">●</span>
            {{ roomStore.connectedUsers.length }} Members online
          </button>
        </div>
      </div>
    </div>
    <!-- Modal -->
    <div
      class="modal fade"
      id="membersOnlineModal"
      tabindex="-1"
      aria-labelledby="membersOnlineModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="membersOnlineModalLabel">Members online</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <ul class="list-group list-group-flush">
              <li class="list-group-item" v-for="user in roomStore.connectedUsers">
                {{ user.username }}
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-header {
  color: black;
  width: 100%;
  height: 50px;
  background: rgba(247, 249, 250, 1);
  box-shadow: 0 10px 6px -6px #ccc;
  z-index: 1;
}
</style>
