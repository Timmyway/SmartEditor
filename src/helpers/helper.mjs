export function getResolution() {
    var resolution = {};
    resolution.width = window.screen.width * window.devicePixelRatio
    resolution.height = window.screen.height * window.devicePixelRatio
    return resolution;
}