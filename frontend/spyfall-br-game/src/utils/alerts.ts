// Alertas de turno e de votação: som sintetizado (Web Audio, sem arquivos),
// vibração no celular e notificação do navegador. Tudo é "best effort":
// qualquer API indisponível ou bloqueada é ignorada em silêncio.

let audioContext: AudioContext | null = null

function beep(frequency: number, startOffset: number, duration = 0.12) {
    try {
        const Ctor = window.AudioContext || (window as any).webkitAudioContext
        if (!Ctor) {
            return
        }
        audioContext = audioContext ?? new Ctor()
        if (audioContext.state === 'suspended') {
            void audioContext.resume()
        }
        const oscillator = audioContext.createOscillator()
        const gain = audioContext.createGain()
        const start = audioContext.currentTime + startOffset
        oscillator.frequency.value = frequency
        gain.gain.setValueAtTime(0.15, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
        oscillator.connect(gain)
        gain.connect(audioContext.destination)
        oscillator.start(start)
        oscillator.stop(start + duration)
    } catch {
        // sem áudio, sem problemas
    }
}

export function playTurnSound() {
    beep(880, 0)
    beep(1320, 0.15)
}

export function playTickSound() {
    beep(1200, 0, 0.05)
}

export function playVoteSound() {
    beep(660, 0)
    beep(660, 0.18)
}

export function vibrateTurn() {
    try {
        navigator.vibrate?.([200, 100, 200])
    } catch {
        // ignore
    }
}

export function alertMyTurn() {
    playTurnSound()
    vibrateTurn()
}

export function requestNotificationPermission() {
    try {
        if ('Notification' in window && Notification.permission === 'default') {
            void Notification.requestPermission()
        }
    } catch {
        // ignore
    }
}

export function notifyBrowser(title: string, body: string) {
    try {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body })
        }
    } catch {
        // ignore
    }
}

export function notifyVoteOpened(title: string, body: string) {
    try {
        playVoteSound()
        navigator.vibrate?.(200)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body })
        }
    } catch {
        // ignore
    }
}
