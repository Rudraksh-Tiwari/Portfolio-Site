type Listener = {
  el: Element
  margin: number
  cb: (visible: boolean) => void
  last: boolean
  added: number
}

const listeners = new Set<Listener>()
let raf = 0
let bound = false

/**
 * One shared, rAF-throttled visibility check for the whole page.
 *
 * This replaces IntersectionObserver deliberately. IO is the idiomatic choice,
 * but it only reports when it feels like it - in throttled, backgrounded or
 * non-compositing contexts it can fire once and then go quiet. Everything on
 * this page starts at opacity 0 and every canvas pauses when offscreen, so an
 * observer that stops reporting leaves the site blank and frozen. A geometry
 * check on scroll cannot silently stop.
 *
 * Cost is bounded: reveals unsubscribe the moment they fire, and the listener
 * set is empty once the page has been read through.
 */
function measure() {
  raf = 0
  const vh = window.innerHeight || document.documentElement.clientHeight
  const now = performance.now()
  for (const l of listeners) {
    const r = l.el.getBoundingClientRect()
    let visible = r.top < vh + l.margin && r.bottom > -l.margin

    // Failsafe: anything still hidden after 6s that is within roughly a screen
    // and a half of the reader gets shown regardless. Covers the case where the
    // visibility signal is arriving but the reveal never takes effect. Content
    // far below the fold is left alone so genuine scroll reveals still work.
    if (!visible && !l.last && now - l.added > 6000 && r.top < vh * 1.5) {
      visible = true
    }

    if (visible !== l.last) {
      l.last = visible
      l.cb(visible)
    }
  }
}

function schedule() {
  if (raf) return
  raf = requestAnimationFrame(measure)
}

let poll = 0

function startPoll() {
  if (poll) return
  // Safety net. Scroll events are the normal trigger, but they are not
  // guaranteed to arrive in every context - and everything on this page starts
  // at opacity 0, so "no scroll event" must never mean "page stays blank".
  // Costs one rect read per pending element, four times a second, and stops
  // entirely once every element has revealed.
  poll = window.setInterval(() => {
    if (listeners.size === 0) {
      clearInterval(poll)
      poll = 0
      return
    }
    // Call measure directly rather than through schedule(). The poll is the
    // safety net, and routing it through requestAnimationFrame would make it
    // depend on the very mechanism it exists to insure against - in any
    // context where rAF is throttled or never fires, the net must still work.
    measure()
  }, 250)
}

let io: IntersectionObserver | undefined

function bind() {
  if (bound) return
  bound = true
  // IntersectionObserver is the primary signal. A scroll listener is banned
  // (it fires per frame and cannot be batched at the source), and it is also
  // unnecessary: the observer reports entry, and the 250ms poll below covers
  // the contexts where the observer goes quiet.
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(() => measure(), { rootMargin: '200px' })
  }
  window.addEventListener('resize', schedule, { passive: true })
  document.addEventListener('visibilitychange', schedule)
}

export function observeVisibility(
  el: Element,
  cb: (visible: boolean) => void,
  margin = 0,
): () => void {
  bind()
  startPoll()
  const l: Listener = { el, margin, cb, last: false, added: performance.now() }
  listeners.add(l)
  io?.observe(el)

  // Measure immediately so anything already on screen reveals without waiting
  // for a scroll event that may never come.
  const vh = window.innerHeight || document.documentElement.clientHeight
  const r = el.getBoundingClientRect()
  const visible = r.top < vh + margin && r.bottom > -margin
  if (visible) {
    l.last = true
    cb(true)
  }

  return () => {
    listeners.delete(l)
    io?.unobserve(el)
  }
}

// Dev-only handle so the visibility system can be inspected from the console.
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__vp = { listeners, measure, schedule }
}

/** Nudge the shared check - call after the document height changes. */
export function refreshVisibility(): void {
  schedule()
}
