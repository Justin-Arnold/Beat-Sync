import { useSessionStore } from "~~/store/SessionStore";
import { usePlayerStore } from "~~/store/PlayerStore";
import { service as spotifyService } from '../util/spotifyService';
import { ref, watch } from "vue";
import { storeToRefs } from "pinia"
import { scaleLog } from 'd3-scale'
import { min } from 'd3-array'
import { ease } from '~~/util/easing'
import { AudioAnalysis, AudioFeatures, AudioSegment, TimeInterval, AudioSection } from "spotify-types";


interface Hooks {
    tatums: (data: any) => void;
    segments: (data: any) => void;
    beats: (data: any) => void;
    bars: (data: any) => void;
    sections: (data: any) => void;
}

type IntervalType = 'tatums' | 'segments' | 'beats' | 'bars' | 'sections';


interface ActiveIntervals {
    tatums: TimeInterval;
    segments: AudioSegment;
    beats: TimeInterval;
    bars: TimeInterval;
    sections: AudioSection;
}

const sessionStore = useSessionStore();
const playerStore = usePlayerStore();
const { accessToken } = storeToRefs(sessionStore);
// const { getCurrentPlayback, getTrackAudioAnalysis, getTrackAudioFeatures } = playerStore;
const { currentProgress, currentlyPlaying, isPlaying, trackAnalysis, trackFeatures } = storeToRefs(playerStore);

export const useSync = (pingDelay = 2500) => {
    const activeIntervals: Ref<ActiveIntervals> = ref({
        tatums: {} as TimeInterval,
        segments: {} as AudioSegment,
        beats: {} as TimeInterval,
        bars: {} as TimeInterval,
        sections: {} as AudioSection
    })
    const intervalTypes: IntervalType[] = Object.keys(activeIntervals.value) as IntervalType[];
    const isActivelySyncing: Ref<boolean> = ref(false);
    const isInitialized: Ref<boolean> = ref(false);
    const initialized = ref(false);

    const hooks: Ref<Hooks> = ref({
        tatums: (data) => {},
        segments: (data) => {},
        beats: (data) => {},
        bars: (data) => {},
        sections: (data) => {}
    });

    //watch each key in the activeIntervals object, and call the corresponding hook
    const deepWatcher = (property: IntervalType) => {
        watch(
          () => activeIntervals.value[property],
          (newValue, oldValue) => {
            if (newValue !== oldValue) {
              hooks.value[property](newValue);
            }
          },
          { deep: true }
        );
      };

    Object.keys(activeIntervals.value).forEach((property) => deepWatcher(property as IntervalType));
    const animateFrameCallback = ref(() => {})
    function animateFrame(callback: () => void) {
        animateFrameCallback.value = callback
    }
    if (initialized.value === false) {
        tick()
        initialized.value = true
    }
    ping();


    function on(interval: IntervalType, callback: (data: any) => void) {
        hooks.value[interval] = callback;
    }

    function ping() {
        setTimeout(() => getCurrentlyPlaying(), pingDelay)
    }

    async function getCurrentlyPlaying () {
        try {
            const data = currentlyPlaying.value
            if (!data || !isPlaying.value) {
                if (isActivelySyncing.value === true) {
                    isActivelySyncing.value = false
                }
                return ping()
            }
            processResponse(data)
        } catch ({ status }) {
        if (status === 401) {
            sessionStore.logout('/')
        }
        }
    }

    function processResponse(data: any) {
        const songsInSync = (JSON.stringify(data.item) === JSON.stringify(currentlyPlaying.value))
        if (isInitialized.value === false || !songsInSync || isActivelySyncing.value === false) {
            return getTrackInfo(data)
        }
        ping()
    }




    async function getTrackInfo(data: any) {
        if (initialized.value === false) {
            tick()
            initialized.value = true
        }
        if (isActivelySyncing.value === false) {
            isActivelySyncing.value = true
        }
        ping()
    }

    function tick() {
        requestAnimationFrame(tick)
        animateFrameCallback.value()
        if (isActivelySyncing.value) {
            setActiveIntervals()
        }
    }

    function setActiveIntervals () {
        const determineInterval = (type: IntervalType) => {
            if (!trackAnalysis.value) return
            const analysis = trackAnalysis.value[type];
            const progress = currentProgress.value;
            //get the index of the interval that contains the current progress
            const index = analysis.findIndex((interval: any) => {
                const lowEnd = interval.start*1000;
                const highEnd = interval.start*1000 + interval.duration*1000;
                return lowEnd <= progress && progress < highEnd;
            })

            return index;
        };
        intervalTypes.forEach((type) => {
            if(!trackAnalysis.value) return;
            const index = determineInterval(type);
            if(!index) return;
            activeIntervals.value[type] = trackAnalysis.value[type][index];
        });

    }

    return { activeIntervals, hooks, on, animateFrame}
}