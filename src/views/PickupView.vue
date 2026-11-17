<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { menu } from '@/data/menu'
import { availableSlots, formatEuro, orderWeight, toISODate, type OrderErrors } from '@/lib/pickup'
import { cart, cartSum, changeQty, orders, placeOrder } from '@/lib/store'

const router = useRouter()
const now = ref(new Date())
const todayIso = computed(() => toISODate(now.value))
const tomorrowIso = computed(() => toISODate(new Date(now.value.getTime() + 86_400_000)))
const date = ref(todayIso.value)
const form = reactive({ name: '', phone: '', slot: '' })
const errors = ref<OrderErrors>({})
const nameOf = (id: string) => menu.find((m) => m.id === id)?.name ?? id

const slots = computed(() => availableSlots({ orders: orders.value, date: date.value, now: now.value, weight: orderWeight(cart.value) }))
const anyFree = computed(() => slots.value.some((s) => s.available))

function pickDate(d: string) {
  date.value = d
  now.value = new Date() // refresh so the lead time stays honest
  if (!slots.value.find((s) => s.time === form.slot)?.available) form.slot = ''
}
function submit() {
  now.value = new Date()
  const res = placeOrder({ name: form.name, phone: form.phone, date: date.value, slot: form.slot })
  errors.value = res.errors
  if (res.order) router.push({ name: 'ticket', params: { ref: res.order.ref } })
  else if (res.errors.slot) form.slot = ''
}
</script>

<template>
  <div class="wrap">
    <h1 class="page-title">Παραλαβή</h1>
    <div v-if="!cart.length" class="card panel" style="margin-top: 1.5rem">
      <p>Το καλάθι είναι άδειο.</p>
      <RouterLink class="btn" to="/menu">Δείτε το μενού</RouterLink>
    </div>
    <form v-else class="form-grid" novalidate @submit.prevent="submit">
      <div>
        <section class="card panel">
          <h2>1. Ημέρα και ώρα</h2>
          <div class="days" role="group" aria-label="Ημέρα">
            <button type="button" class="tab" :aria-pressed="date === todayIso" @click="pickDate(todayIso)">Σήμερα</button>
            <button type="button" class="tab" :aria-pressed="date === tomorrowIso" @click="pickDate(tomorrowIso)">Αύριο</button>
          </div>
          <div class="slots" role="group" aria-label="Ώρα παραλαβής">
            <button v-for="s in slots" :key="s.time" type="button" class="slot" :disabled="!s.available" :aria-pressed="form.slot === s.time" @click="form.slot = s.time">
              {{ s.time }}<small v-if="s.available">{{ s.remaining }} θέσεις</small><small v-else>{{ s.reason === 'full' ? 'γεμάτο' : '—' }}</small>
            </button>
          </div>
          <p v-if="!anyFree" class="err">Δεν υπάρχουν άλλες ώρες για αυτήν την ημέρα. Δοκιμάστε την επόμενη.</p>
          <p v-if="errors.slot" class="err" role="alert">{{ errors.slot }}</p>
          <p class="hint">Κάθε ώρα δέχεται περιορισμένες παραγγελίες, ώστε να είναι έτοιμες στην ώρα τους. Μεγάλες παραγγελίες (4+ προϊόντα) πιάνουν διπλή θέση.</p>
        </section>
        <section class="card panel">
          <h2>2. Τα στοιχεία σας</h2>
          <div class="field">
            <label for="name">Όνομα</label>
            <input id="name" v-model="form.name" autocomplete="given-name" :aria-invalid="!!errors.name" />
            <p v-if="errors.name" class="err" role="alert">{{ errors.name }}</p>
          </div>
          <div class="field">
            <label for="phone">Κινητό</label>
            <input id="phone" v-model="form.phone" inputmode="tel" autocomplete="tel" :aria-invalid="!!errors.phone" />
            <p class="hint">Π.χ. 6912345678. Θα το χρησιμοποιήσουμε μόνο για αυτή την παραγγελία.</p>
            <p v-if="errors.phone" class="err" role="alert">{{ errors.phone }}</p>
          </div>
        </section>
      </div>
      <aside class="card basket" aria-label="Η παραγγελία σας">
        <h2>Η παραγγελία</h2>
        <div v-for="l in cart" :key="l.id" class="line">
          <span>{{ l.qty }} × {{ nameOf(l.id) }}</span>
          <button type="button" class="mini alt" :aria-label="`Αφαίρεση: ${nameOf(l.id)}`" @click="changeQty(l.id, 0)">Αφαίρεση</button>
        </div>
        <div class="total"><span>Σύνολο</span><span>{{ formatEuro(cartSum) }}</span></div>
        <p class="hint" style="margin-bottom: 1rem">Πληρωμή στο ταμείο κατά την παραλαβή.</p>
        <button class="btn" style="width: 100%" :disabled="!form.slot">Στείλτε την παραγγελία</button>
        <p v-if="errors.cart" class="err">{{ errors.cart }}</p>
      </aside>
    </form>
  </div>
</template>
