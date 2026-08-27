<template>
  <button
    v-if="hasPhotos"
    type="button"
    class="photo-trigger"
    :aria-label="`Open ${photos.length} photos`"
    :style="triggerStyle"
    @click.stop="openPhotoViewer"
  >
    <i class="pi pi-camera" />
    <span>{{ photos.length }}</span>
  </button>

  <PhotoViewerDialog
    v-model:visible="photoViewerVisible"
    :photos="photos"
    :initial-photo-index="photoViewerIndex"
    :allow-show-on-map="allowShowOnMap"
    @show-on-map="handlePhotoShowOnMap"
    @close="closePhotoViewer"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import PhotoViewerDialog from '@/components/dialogs/PhotoViewerDialog.vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  },
  allowShowOnMap: {
    type: Boolean,
    default: true
  },
  accentColor: {
    type: String,
    default: 'var(--gp-primary)'
  },
  hoverBgColor: {
    type: String,
    default: 'var(--gp-primary-light)'
  }
})

const emit = defineEmits(['photo-show-on-map'])

const photoViewerVisible = ref(false)
const photoViewerIndex = ref(0)

const hasPhotos = computed(() => Array.isArray(props.photos) && props.photos.length > 0)
const triggerStyle = computed(() => ({
  '--photo-trigger-color': props.accentColor,
  '--photo-trigger-hover-bg': props.hoverBgColor
}))

const openPhotoViewer = () => {
  photoViewerIndex.value = 0
  photoViewerVisible.value = true
}

const closePhotoViewer = () => {
  photoViewerVisible.value = false
  photoViewerIndex.value = 0
}

const handlePhotoShowOnMap = (photo) => {
  emit('photo-show-on-map', photo)
}
</script>

<style scoped>
.photo-trigger {
  border: 1px solid var(--gp-primary-light);
  border-radius: 999px;
  background: var(--gp-surface-white);
  color: var(--photo-trigger-color);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.photo-trigger:hover {
  background: var(--photo-trigger-hover-bg);
}
</style>
