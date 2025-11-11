import gsap from "gsap";

export function sleep(time: number): Promise<void> {
    return new Promise(resolve => { 
        gsap.delayedCall(time < 0 ? 0 : time, resolve);
    });
}