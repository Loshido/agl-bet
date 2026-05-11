export default async () => {
    // dynamic import => not called = not downloaded
    const confetti = await import('canvas-confetti')

    const canvas = document.getElementById('confetti') as HTMLCanvasElement
    const ctx = confetti.create(canvas)
    const rand = (max: number, min: number) => min + Math.floor(Math.random() * (max - min))

    function frame() {
        const d1 = rand(97, 90) * 0.01
        const d2 = rand(97, 90) * 0.01
        ctx({
            particleCount: rand(4, 1),
            startVelocity: 10,
            spread: 65,
            angle: 60,
            origin: { x: 0, y: 1 },
            colors: ["#FC43A1", "#FFFFFF"],
            decay: d1,
            scalar: 0.5 + Math.random() * 0.5,
        })
        ctx({
            particleCount: rand(4, 1),
            startVelocity: 10,
            spread: 65,
            angle: 105,
            decay: d2,
            origin: { x: 1, y: 1 },
            colors: ["#FC43A1", "#FFFFFF"],
            scalar: 0.5 + Math.random() * 0.5
        });
        requestAnimationFrame(frame);
    }

    frame()
}