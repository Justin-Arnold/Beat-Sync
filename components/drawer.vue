<template>
    <div class="text-white absolute transition-all flex duration-400" :class="viewportAnchorClasses" ref="drawerWrapper">
        <div ref="drawerContent">
            <slot></slot>
        </div>
        <div class="flex -z-[1] justify-center" :class="{'flex-col': anchor === 'left' || anchor === 'right'}">
            <span
                class="glass transition-all duration-300 text-5xl rounded-full p-2 hover:cursor-pointer"
                @click="toggle"
                :class="activatorAnchorClasses"
            >
                😏
            </span>
        </div>
    </div>
</template>

<script lang="ts" setup>

const isOpen = ref(false)
const drawerContent: Ref<HTMLElement | null> = ref(null)
const drawerWrapper: Ref<HTMLElement | null> = ref(null)


type Props = {
    anchor: 'left' | 'right' | 'top' | 'bottom'
}
const props = defineProps<Props>();

const viewportAnchorClasses = computed(() => {
    const classMap = {
        left: 'top-1/2 left-0 -translate-y-1/2',
        right: '',
        top: '',
        bottom: 'flex-col-reverse bottom-0 left-1/2 -translate-x-1/2'
    }
    return classMap[props.anchor]
})

const activatorAnchorClasses = computed(() => {
    const classMap = {
        left: '-translate-x-1/2 hover:cursor-pointer hover:translate-x-0',
        right: '',
        top: '',
        bottom: 'translate-y-1/2 hover:cursor-pointer hover:translate-y-0'
    }
    return classMap[props.anchor]
})

watch(isOpen, (value) => {
    if (!value) {
        if (!drawerWrapper.value) return
            drawerWrapper.value.style.transform = props.anchor === 'left' || props.anchor === 'right' ?
                `translateX(-${drawerContent.value?.offsetWidth}px) translateY(-50%)`
                :
                `translateY(${drawerContent.value?.offsetHeight}px) translateX(-50%)`
    } else {
        if (!drawerWrapper.value) return
        drawerWrapper.value.style.transform = props.anchor === 'left' || props.anchor === 'right' ?
            `translateX(0px) translateY(-50%)`
            :
            `translateY(0px) translateX(-50%)`
    }
})

function toggle() {
    isOpen.value = !isOpen.value
}

onMounted(() => {
    if (!drawerWrapper.value) return
    drawerWrapper.value.style.transform = props.anchor === 'left' || props.anchor === 'right' ?
        `translateX(-${drawerContent.value?.offsetWidth}px) translateY(-50%)`
        :
        `translateY(${drawerContent.value?.offsetHeight}px) translateX(-50%)`
})

</script>
