<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "ok"): void;
}>();

const dialog = ref<HTMLDialogElement | null>(null);

defineExpose({
  close: () => {
    if (dialog.value) dialog.value.close();
  },
  open: () => {
    if (dialog.value) dialog.value.showModal();
  },
});
</script>
<template>
  <dialog class="modal" ref="dialog" :open="false">
    <div class="box">
      <div class="modal-content">
        <slot />
      </div>
      <div class="modal-actions">
        <button
          @click="
            dialog?.close();
            emit('ok');
          "
        >
          Ok
        </button>
        <button
          @click="
            dialog?.close();
            emit('close');
          "
        >
          Cancel
        </button>
        <slot name="actions" />
      </div>
    </div>
  </dialog>
</template>
<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  max-height: 100vh;
  max-width: 100vw;
}
.modal::backdrop {
  width: 100vw;
  height: 100vh;
}
.modal[open] {
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal .box {
  background-color: #fff;
  padding: 2em;
  width: 90%;
}
.modal .modal-actions {
  margin-top: 1em;
  display: flex;
  justify-content: space-between;
}
.modal .modal-actions button {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-left: 0.5em;
  padding: 1em 0.5em;
}
.modal .modal-actions button:first-child {
  margin-left: 0;
}

</style>
