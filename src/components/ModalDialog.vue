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
            emit('close');
          "
        >
          Cancel
        </button>
        <button
          @click="
            dialog?.close();
            emit('ok');
          "
        >
          Ok
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
  width: 120%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal::backdrop {
  width: 100%;
  height: 100%;
}
.model[open] {
  display: flex;
}
.modal .box {
  background-color: #fff;
  padding: 1em;
}
.modal .modal-actions {
  display: flex;
  justify-content: space-between;
}
.modal .modal-actions button {
  width: 100%;
}
</style>
