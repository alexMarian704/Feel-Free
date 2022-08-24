
export const detectMobile = () => {
    const isMobileDevice = window.navigator.userAgent.toLowerCase().includes("mobi");
    return isMobileDevice
}