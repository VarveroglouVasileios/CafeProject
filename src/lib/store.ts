import { computed, ref, watch } from 'vue'
import { load, save } from './storage'
import {
  addLine, cartTotal, itemCount, makeRef, setQty, toISODate, validateOrder,
  type CartLine, type Order, type OrderErrors, type OrderInput, type Status,
} from './pickup'
import { menu } from '@/data/menu'

const KEY_ORDERS = 'almyra.orders.v1'
const KEY_CART = 'almyra.cart.v1'
const KEY_SEQ = 'almyra.seq.v1'

function seedOrders(now: Date): Order[] {
  const date = toISODate(now)
  const mk = (n: number, slot: string, name: string, lines: CartLine[], status: Status): Order => ({
    id: `seed-${n}`, ref: makeRef(n), name, phone: '6900000000', date, slot, lines,
    total: cartTotal(lines, menu), status, createdAt: now.getTime() - 3_600_000 + n,
  })
  const big: CartLine[] = [{ id: 'flat-white', qty: 2 }, { id: 'pancakes', qty: 2 }]
  return [
    mk(1, '08:00', 'Νίκος Π.', [{ id: 'espresso', qty: 1 }, { id: 'croissant', qty: 1 }], 'collected'),
    mk(2, '08:45', 'Ελένη Κ.', [{ id: 'freddo', qty: 2 }], 'ready'),
    mk(3, '09:00', 'Γιώργος Μ.', big, 'preparing'),
    mk(4, '09:00', 'Άννα Δ.', big, 'new'),
    mk(5, '09:00', 'Σταύρος Λ.', big, 'new'),
    mk(6, '09:00', 'Μαρία Τ.', big, 'new'),
    mk(7, '09:30', 'Κατερίνα Ρ.', [{ id: 'avocado', qty: 1 }, { id: 'flat-white', qty: 1 }], 'new'),
    mk(8, '10:15', 'Δημήτρης Α.', [{ id: 'tyropita', qty: 2 }, { id: 'frappe', qty: 2 }], 'new'),
  ]
}

export const orders = ref<Order[]>(load<Order[]>(KEY_ORDERS, []))
if (orders.value.length === 0) orders.value = seedOrders(new Date())
export const cart = ref<CartLine[]>(load<CartLine[]>(KEY_CART, []))
let seq = load<number>(KEY_SEQ, 8)

watch(orders, (v) => save(KEY_ORDERS, v), { deep: true })
watch(cart, (v) => save(KEY_CART, v), { deep: true })

export const cartCount = computed(() => itemCount(cart.value))
export const cartSum = computed(() => cartTotal(cart.value, menu))
export const addToCart = (id: string): void => { cart.value = addLine(cart.value, id) }
export const changeQty = (id: string, qty: number): void => { cart.value = setQty(cart.value, id, qty) }

export function placeOrder(input: Omit<OrderInput, 'lines'>): { order?: Order; errors: OrderErrors } {
  const lines = cart.value
  // Re-check at submit time: the slot may have filled since the page was opened.
  const errors = validateOrder({ ...input, lines }, orders.value, new Date())
  if (Object.keys(errors).length) return { errors }
  seq += 1
  save(KEY_SEQ, seq)
  const order: Order = {
    id: `o-${Date.now()}`, ref: makeRef(seq), name: input.name.trim(), phone: input.phone, date: input.date,
    slot: input.slot, lines: [...lines], total: cartTotal(lines, menu), status: 'new', createdAt: Date.now(),
  }
  orders.value = [...orders.value, order]
  cart.value = []
  return { order, errors }
}

export const findOrder = (ref: string): Order | undefined => orders.value.find((o) => o.ref === ref)
export function setStatus(id: string, status: Status): void {
  orders.value = orders.value.map((o) => (o.id === id ? { ...o, status } : o))
}
export function resetDemo(): void {
  seq = 8
  save(KEY_SEQ, seq)
  orders.value = seedOrders(new Date())
  cart.value = []
}
