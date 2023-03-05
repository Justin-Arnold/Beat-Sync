<template>
    <div class="exclusive-select" ref="container">
        <div
            class="outlined"
            :style="{ width: outlineWidth + 'px', transform: 'translateX(' + outlinePosition + 'px)' }"
        ></div>
        <button
            v-for="(option, index) in options"
            :key="index"
            :class="{ 'selected': selected === option }"
            @click="selectOption(option, index)"
        >
            {{ option }}
        </button>
    </div>
</template>

<script setup lang="ts">

// Define props
const props = defineProps<{
    options: string[]
}>()

// Define emit
const emit = defineEmits<{
    (event: 'update:selected', value: string): void
}>()

// Component data
const selected = ref<string>('')
const container = ref<HTMLElement | null>(null)
const outlineWidth = ref<number>(0)
const outlinePosition = ref<number>(0)

// Methods
const selectOption = (option: string, index: number) => {
    selected.value = option
    updateOutline(index)
    emit('update:selected', option)
}

const updateOutline = (index: number) => {
    if (container.value) {
        const button = container.value.querySelectorAll('button')[index] as HTMLElement
        outlineWidth.value = button.offsetWidth
        outlinePosition.value = button.offsetLeft
    }
}

onMounted(() => {
    if (props.options.length) {
        selected.value = props.options[0]
        updateOutline(0)
    }
})

watch(
    () => props.options,
    () => {
        if (props.options.length && !props.options.includes(selected.value)) {
        selected.value = props.options[0]
        updateOutline(0)
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.exclusive-select {
    display: flex;
    position: relative;
    overflow: hidden;
}

.outlined {
    @apply rounded border border-neutral-300;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    box-sizing: border-box;
    transition: transform 0.3s ease, width 0.3s ease;
    pointer-events: none;
}

button {
    margin-right: 5px;
    padding: 5px 10px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    outline: none;
    position: relative;
    z-index: 1;
    color: lightgray
}

button.selected {
    color: white;
}


</style>