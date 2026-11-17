<script setup lang="ts">
import { computed, ref } from 'vue'
import { menu } from '@/data/menu'
import { NEXT_STATUS, SLOT_CAPACITY, slotLoad, slotTimes, toISODate, formatEuro, type Status } from '@/lib/pickup'
import { orders, resetDemo, setStatus } from '@/lib/store'

const authed = ref(false)
const password = ref('')
const wrong = ref(false)
function login() {
  authed.value = password.value === 'demo'
  wrong.value = !authed.value
}
const today = toISODate(new Date())
const cols: { id: Status; label: string; action: string }[] = [
  { id: 'new', label: 'Νέες', action: 'Ξεκίνα' },
  { id: 'preparing', label: 'Ετοιμάζονται', action: 'Έτοιμη' },
  { id: 'ready', label: 'Έτοιμες', action: 'Παραλήφθηκε' },
  { id: 'collected', label: 'Παραδόθηκαν', action: '' },
]
const todays = computed(() => orders.value.filter((o) => o.date === today).sort((a, b) => a.slot.localeCompare(b.slot)))
const inCol = (s: Status) => todays.value.filter((o) => o.status === s)
const nameOf = (id: string) => menu.find((m) => m.id === id)?.name ?? id
const load = computed(() => slotTimes().map((t) => ({ t, n: slotLoad(orders.value, today, t) })).filter((x) => x.n > 0))
function advance(id: string, s: Status) {
  const next = NEXT_STATUS[s]
  if (next) setStatus(id, next)
}
function reset() {
  if (confirm('Να επανέλθουν οι αρχικές δοκιμαστικές παραγγελίες;')) resetDemo()
}
</script>

<template>
  <div class="wrap">
    <h1 class="page-title">Κουζίνα</h1>
    <form v-if="!authed" class="card panel" style="max-width: 26rem; margin-top: 1.5rem" @submit.prevent="login">
      <div class="field"><label for="pw">Κωδικός πρόσβασης</label><input id="pw" v-model="password" type="password" /><p class="hint">Κωδικός demo: demo</p><p v-if="wrong" class="err" role="alert">Ο κωδικός δεν είναι σωστός.</p></div>
      <button class="btn">Είσοδος</button>
    </form>
    <template v-else>
      <p style="margin: 1rem 0 0; font-weight: 700">Φορτίο ανά ώρα παραλαβής (όριο {{ SLOT_CAPACITY }})</p>
      <div class="load"><span v-for="x in load" :key="x.t" :class="{ full: x.n >= SLOT_CAPACITY }">{{ x.t }} · {{ x.n }}/{{ SLOT_CAPACITY }}</span></div>
      <div class="kanban">
        <section v-for="c in cols" :key="c.id" class="col" :aria-label="c.label">
          <h2>{{ c.label }} <span>{{ inCol(c.id).length }}</span></h2>
          <article v-for="o in inCol(c.id)" :key="o.id" class="card tk">
            <header><span>{{ o.slot }}</span><span>{{ o.ref }}</span></header>
            <p style="margin: .2rem 0; font-weight: 800">{{ o.name }} · {{ formatEuro(o.total) }}</p>
            <ul><li v-for="l in o.lines" :key="l.id">{{ l.qty }} × {{ nameOf(l.id) }}</li></ul>
            <div class="row">
              <button v-if="c.action" class="mini" @click="advance(o.id, o.status)">{{ c.action }}</button>
              <button v-if="o.status === 'new'" class="mini alt" @click="setStatus(o.id, 'cancelled')">Ακύρωση</button>
            </div>
          </article>
        </section>
      </div>
      <p><button class="btn btn-ghost" @click="reset">Επαναφορά demo</button> <button class="btn btn-ghost" @click="authed = false">Έξοδος</button></p>
    </template>
  </div>
</template>
