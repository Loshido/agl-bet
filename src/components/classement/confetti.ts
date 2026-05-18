export default async () => {
    // dynamic import => not called = not downloaded
    const confetti = await import('canvas-confetti')

    const canvas = document.getElementById('confetti') as HTMLCanvasElement
    const ctx = confetti.create(canvas, {
        resize: true,
        useWorker: true
    })
    const rand = (max: number, min: number) => min + Math.floor(Math.random() * (max - min))
    const is_phone = window.innerWidth < 700

    function frame() {
        if(is_phone) {
            ctx({
                particleCount: rand(4, 1),
                angle: rand(90, 0),
                scalar: 0.8,
                startVelocity: 10,
                decay: 0.95,
                colors: ["#FC43A1", "#FFFFFF", "#FFE500"],
                shapes: ["square"],
                gravity: 0.5,
                disableForReducedMotion: true,
                origin: { 
                    x: rand(10, 0) * 0.1,
                    y: rand(10, 0) * 0.1
                }
            })
            
            requestAnimationFrame(frame)
            return
        }

        const d1 = rand(97, 90) * 0.01
        const d2 = rand(97, 90) * 0.01
        ctx({
            particleCount: rand(4, 1),
            startVelocity: 40,
            spread: 65,
            angle: 60,
            origin: { x: 0, y: 1 },
            colors: ["#FC43A1", "#FFFFFF", "#FFE500"],
            decay: d1,
            ticks: 100,
            scalar: 0.5 + Math.random() * 0.5,
        })

        ctx({
            particleCount: rand(4, 1),
            startVelocity: 40,
            spread: 65,
            angle: 105,
            decay: d2,
            origin: { x: 1, y: 1 },
            colors: ["#FC43A1", "#FFFFFF", "#FFE500"],
            scalar: 0.5 + Math.random() * 0.5
        });
        requestAnimationFrame(frame);
    }

    frame()
}