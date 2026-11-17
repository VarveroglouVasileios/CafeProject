/** Pure order-ahead logic for the café: slots, capacity, cart maths and validation. */

export const OPEN_MIN = 7 * 60 + 30 // 07:30
export const CLOSE_MIN = 15 * 60 // last pickup slot starts before 15:00
export const SLOT_STEP = 15
export const SLOT_CAPACITY = 8 // load units per 15-minute slot
export const LEAD_MIN = 10 // minimum preparation time for same-day orders
export const BIG_ORDER_ITEMS = 4 // orders with this many items or more weigh double

export type Category = 'coffee' | 'brunch' | 'bakery'
export type Status = 'new' | 'preparing' | 'ready' | 'collected' | 'cancelled'

export interface MenuItem {
  id: string
  name: string
  desc: string
  price: number
  category: Category
  image?: string
}

export interface CartLine {
  id: string
  qty: number
}

export interface Order {
  id: string
  ref: string
  name: string
  phone: string
  date: string // YYYY-MM-DD
  slot: string // HH:MM
  lines: CartLine[]
  total: number
  status: Status
  createdAt: number
}

export interface SlotInfo {
  time: string
  load: number
  remaining: number
  available: boolean
  reason: 'ok' | 'past' | 'full'
}

export const pad = (n: number): string => String(n).padStart(2, '0')
export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
export const fromMinutes = (min: number): string => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`
export const toISODate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function slotTimes(): string[] {
  const out: string[] = []
  for (let m = OPEN_MIN; m < CLOSE_MIN; m += SLOT_STEP) out.push(fromMinutes(m))
  return out
}

export const itemCount = (lines: CartLine[]): number => lines.reduce((s, l) => s + l.qty, 0)

/** A big order occupies the kitchen twice as much as a small one. */
export const orderWeight = (lines: CartLine[]): number => (itemCount(lines) >= BIG_ORDER_ITEMS ? 2 : 1)

export function slotLoad(orders: Order[], date: string, slot: string): number {
  return orders
    .filter((o) => o.date === date && o.slot === slot && o.status !== 'cancelled')
    .reduce((sum, o) => sum + orderWeight(o.lines), 0)
}

export function availableSlots(opts: { orders: Order[]; date: string; now: Date; weight: number }): SlotInfo[] {
  const { orders, date, now, weight } = opts
  const today = toISODate(now)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return slotTimes().map((time) => {
    const load = slotLoad(orders, date, time)
    const remaining = Math.max(0, SLOT_CAPACITY - load)
    const isPast = date < today || (date === today && toMinutes(time) < nowMin + LEAD_MIN)
    if (isPast) return { time, load, remaining, available: false, reason: 'past' as const }
    if (load + weight > SLOT_CAPACITY) return { time, load, remaining, available: false, reason: 'full' as const }
    return { time, load, remaining, available: true, reason: 'ok' as const }
  })
}

export function setQty(lines: CartLine[], id: string, qty: number): CartLine[] {
  const rest = lines.filter((l) => l.id !== id)
  if (qty <= 0) return rest
  const prev = lines.find((l) => l.id === id)
  return prev ? lines.map((l) => (l.id === id ? { ...l, qty } : l)) : [...rest, { id, qty }]
}

export const addLine = (lines: CartLine[], id: string): CartLine[] =>
  setQty(lines, id, (lines.find((l) => l.id === id)?.qty ?? 0) + 1)

export function cartTotal(lines: CartLine[], menu: MenuItem[]): number {
  const cents = lines.reduce((sum, l) => {
    const item = menu.find((m) => m.id === l.id)
    return sum + (item ? Math.round(item.price * 100) * l.qty : 0)
  }, 0)
  return cents / 100
}

export const formatEuro = (n: number): string => `${n.toFixed(2).replace('.', ',')} €`

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, '').replace(/^(\+30|0030)/, '')
}

export const isValidPhone = (raw: string): boolean => /^69\d{8}$/.test(normalizePhone(raw))

export interface OrderInput {
  name: string
  phone: string
  date: string
  slot: string
  lines: CartLine[]
}

export type OrderErrors = Partial<Record<'name' | 'phone' | 'slot' | 'cart', string>>

export function validateOrder(input: OrderInput, orders: Order[], now: Date): OrderErrors {
  const errors: OrderErrors = {}
  if (input.name.trim().length < 2) errors.name = 'Συμπληρώστε το όνομά σας.'
  if (!isValidPhone(input.phone)) errors.phone = 'Συμπληρώστε ελληνικό κινητό με 10 ψηφία, που αρχίζει από 69.'
  if (input.lines.length === 0) errors.cart = 'Το καλάθι είναι άδειο.'
  const slot = availableSlots({ orders, date: input.date, now, weight: orderWeight(input.lines) }).find(
    (s) => s.time === input.slot,
  )
  if (!slot) errors.slot = 'Επιλέξτε ώρα παραλαβής.'
  else if (!slot.available) errors.slot = slot.reason === 'full' ? 'Η ώρα μόλις γέμισε. Επιλέξτε άλλη.' : 'Η ώρα αυτή έχει περάσει.'
  return errors
}

export const NEXT_STATUS: Record<Status, Status | null> = {
  new: 'preparing',
  preparing: 'ready',
  ready: 'collected',
  collected: null,
  cancelled: null,
}

export function makeRef(seq: number): string {
  return `AL-${String(seq).padStart(4, '0')}`
}
