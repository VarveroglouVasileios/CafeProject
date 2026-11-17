<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { menu } from '@/data/menu'
import { formatEuro } from '@/lib/pickup'
import { findOrder, setStatus } from '@/lib/store'

const route = useRoute()
const order = computed(() => findOrder(String(route.params.ref)))
const nameOf = (id: string) => menu.find((m) => m.id === id)?.name ?? id
const labels = { new: 'Στάλθηκε στην κουζίνα', preparing: 'Ετοιμάζεται', ready: 'Έτοιμη για παραλαβή', collected: 'Παραλήφθηκε από εσάς', cancelled: 'Ακυρώθηκε' } as const
</script>

<template>
  <div class="wrap">
    <div v-if="!order" class="card panel" style="margin-top: 2rem"><p>Η παραγγελία δεν βρέθηκε σε αυτόν τον browser.</p><RouterLink class="btn" to="/">Αρχική</RouterLink></div>
    <article v-else class="card ticket" aria-labelledby="t">
      <h1 id="t">{{ order.status === 'cancelled' ? 'Ακυρώθηκε' : 'Στείλαμε την παραγγελία!' }}</h1>
      <p class="big">{{ order.slot }}</p>
      <p><b>{{ order.date }}</b> · κωδικός <b>{{ order.ref }}</b></p>
      <p role="status"><b>{{ labels[order.status] }}</b></p>
      <dl>
        <div v-for="l in order.lines" :key="l.id"><dt>{{ l.qty }} × {{ nameOf(l.id) }}</dt></div>
        <div style="border-top: 3px solid var(--ink); margin-top: .4rem; padding-top: .5rem; font-weight: 800"><dt>Σύνολο</dt><dd style="margin: 0">{{ formatEuro(order.total) }}</dd></div>
      </dl>
      <p class="hint">Ενδεικτικό demo: δεν έγινε πραγματική παραγγελία.</p>
      <p style="display: flex; gap: .6rem; justify-content: center; flex-wrap: wrap">
        <button v-if="order.status === 'new'" class="btn btn-ghost" @click="setStatus(order.id, 'cancelled')">Ακύρωση</button>
        <RouterLink class="btn btn-dark" to="/menu">Νέα παραγγελία</RouterLink>
      </p>
    </article>
  </div>
</template>
