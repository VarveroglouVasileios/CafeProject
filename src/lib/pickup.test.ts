import { describe, expect, it } from 'vitest'
import {
  addLine,
  availableSlots,
  cartTotal,
  isValidPhone,
  makeRef,
  normalizePhone,
  orderWeight,
  setQty,
  slotLoad,
  slotTimes,
  validateOrder,
  SLOT_CAPACITY,
  type MenuItem,
  type Order,
} from './pickup'

const menu: MenuItem[] = [
  { id: 'a', name: 'A', desc: '', price: 3.2, category: 'coffee' },
  { id: 'b', name: 'B', desc: '', price: 8.5, category: 'brunch' },
]
const at = (iso: string) => new Date(iso)
const order = (over: Partial<Order>): Order => ({
  id: 'x', ref: 'AL-0001', name: 'Test', phone: '6912345678', date: '2026-08-15', slot: '09:00',
  lines: [{ id: 'a', qty: 1 }], total: 3.2, status: 'new', createdAt: 0, ...over,
})

describe('slots', () => {
  it('runs every 15 minutes from 07:30 until before 15:00', () => {
    const t = slotTimes()
    expect(t[0]).toBe('07:30')
    expect(t[1]).toBe('07:45')
    expect(t[t.length - 1]).toBe('14:45')
    expect(t).toHaveLength(30)
  })

  it('blocks past slots and the 10 minute preparation window on the same day', () => {
    const slots = availableSlots({ orders: [], date: '2026-08-15', now: at('2026-08-15T09:00:00'), weight: 1 })
    expect(slots.find((s) => s.time === '08:45')?.reason).toBe('past')
    expect(slots.find((s) => s.time === '09:00')?.reason).toBe('past')
    expect(slots.find((s) => s.time === '09:00')?.available).toBe(false)
    expect(slots.find((s) => s.time === '09:15')?.available).toBe(true)
  })

  it('opens every slot for a future day and closes every slot for a past day', () => {
    const future = availableSlots({ orders: [], date: '2026-08-16', now: at('2026-08-15T20:00:00'), weight: 1 })
    expect(future.every((s) => s.available)).toBe(true)
    const past = availableSlots({ orders: [], date: '2026-08-14', now: at('2026-08-15T06:00:00'), weight: 1 })
    expect(past.every((s) => !s.available)).toBe(true)
  })
})

describe('capacity', () => {
  it('counts a big order double', () => {
    expect(orderWeight([{ id: 'a', qty: 3 }])).toBe(1)
    expect(orderWeight([{ id: 'a', qty: 4 }])).toBe(2)
    expect(orderWeight([{ id: 'a', qty: 2 }, { id: 'b', qty: 2 }])).toBe(2)
  })

  it('ignores cancelled orders when counting load', () => {
    const orders = [order({}), order({ status: 'cancelled' }), order({ lines: [{ id: 'a', qty: 5 }] })]
    expect(slotLoad(orders, '2026-08-15', '09:00')).toBe(3)
  })

  it('fills a slot at capacity and reopens it when an order is cancelled', () => {
    const full = Array.from({ length: SLOT_CAPACITY }, () => order({}))
    const now = at('2026-08-15T07:00:00')
    const slot = (orders: Order[]) =>
      availableSlots({ orders, date: '2026-08-15', now, weight: 1 }).find((s) => s.time === '09:00')!
    expect(slot(full).available).toBe(false)
    expect(slot(full).reason).toBe('full')
    expect(slot([...full.slice(1), order({ status: 'cancelled' })]).available).toBe(true)
  })

  it('refuses a heavy order into a slot that only has one unit left', () => {
    const orders = Array.from({ length: SLOT_CAPACITY - 1 }, () => order({}))
    const now = at('2026-08-15T07:00:00')
    const heavy = availableSlots({ orders, date: '2026-08-15', now, weight: 2 }).find((s) => s.time === '09:00')!
    const light = availableSlots({ orders, date: '2026-08-15', now, weight: 1 }).find((s) => s.time === '09:00')!
    expect(heavy.available).toBe(false)
    expect(light.available).toBe(true)
  })
})

describe('cart', () => {
  it('adds, changes and removes lines', () => {
    let lines = addLine([], 'a')
    lines = addLine(lines, 'a')
    lines = addLine(lines, 'b')
    expect(lines).toEqual([{ id: 'a', qty: 2 }, { id: 'b', qty: 1 }])
    expect(setQty(lines, 'a', 0)).toEqual([{ id: 'b', qty: 1 }])
  })

  it('sums in cents, so there is no floating point drift', () => {
    expect(cartTotal([{ id: 'a', qty: 3 }, { id: 'b', qty: 1 }], menu)).toBe(18.1)
    expect(cartTotal([{ id: 'zzz', qty: 2 }], menu)).toBe(0)
  })
})

describe('phone and validation', () => {
  it('accepts Greek mobiles with spaces and country code', () => {
    expect(normalizePhone('+30 691 234 5678')).toBe('6912345678')
    expect(isValidPhone('0030 691-234-5678')).toBe(true)
    expect(isValidPhone('2510123456')).toBe(false)
  })

  it('reports each problem and passes a good order', () => {
    const now = at('2026-08-15T08:00:00')
    const bad = validateOrder({ name: '', phone: '123', date: '2026-08-15', slot: '', lines: [] }, [], now)
    expect(Object.keys(bad).sort()).toEqual(['cart', 'name', 'phone', 'slot'])
    const good = validateOrder(
      { name: 'Μαρία', phone: '6912345678', date: '2026-08-15', slot: '09:00', lines: [{ id: 'a', qty: 1 }] },
      [], now,
    )
    expect(good).toEqual({})
  })

  it('numbers references with leading zeros', () => {
    expect(makeRef(7)).toBe('AL-0007')
  })
})
