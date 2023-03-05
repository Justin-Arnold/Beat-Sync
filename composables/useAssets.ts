export default function useAssets() {
    const svgs = import.meta.glob('/src/assets/*.svg');
    const pngs = import.meta.glob('/src/assets/*.png');
    const jpegs = import.meta.glob('/src/assets/*.jpeg');

    return {
        gridMap: pngs['../assets/driddark.png'].default,
        heightMap: pngs['../assets/displacement.png'].default,
        shineMap: pngs['../assets/shine.png'].default,
    };
}