<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { categories, menu } from '@/data/menu'
import { formatEuro } from '@/lib/pickup'
import { img } from '@/lib/storage'
import { addToCart, cart, cartCount, cartSum, changeQty } from '@/lib/store'

const active = ref<string>('all')
const shown = computed(() => (active.value === 'all' ? menu : menu.filter((m) => m.category === active.value)))
const nameOf = (id: string) => menu.find((m) => m.id === id)?.name ?? id
const priceOf = (id: string) => menu.find((m) => m.id === id)?.price ?? 0
const announce = ref('')
function add(id: string) {
  addToCart(id)
  announce.value = `${nameOf(id)} προστέθηκε στο καλάθι`
}
</script>

<template>
  <div class="wrap">
    <h1 class="page-title">Το μενού</h1>
    <div class="menu-layout">
      <section aria-label="Προϊόντα">
        <div class="tabs" role="group" aria-label="Κατηγορίες">
          <button class="tab" :aria-pressed="active === 'all'" @click="active = 'all'">Όλα</button>
          <button v-for="c in categories" :key="c.id" class="tab" :aria-pressed="active === c.id" @click="active = c.id">{{ c.label }}</button>
        </div>
        <article v-for="m in shown" :key="m.id" class="card dish">
          <img :src="img(m.image ?? 'coffee')" :alt="m.name" loading="lazy" width="104" height="104" />
          <div><h3>{{ m.name }}</h3><p>{{ m.desc }}</p></div>
          <div><span class="price">{{ formatEuro(m.price) }}</span><button class="add" @click="add(m.id)" :aria-label="`Προσθήκη: ${m.name}`">+ Προσθήκη</button></div>
        </article>
        <p style="font-size: .85rem">Οι τιμές είναι ενδεικτικές. Για αλλεργίες, ενημερώστε το προσωπικό κατά την παραλαβή.</p>
      </section>

      <aside class="card basket" aria-label="Καλάθι">
        <h2>Καλάθι ({{ cartCount }})</h2>
        <p v-if="!cart.length" class="empty">Δεν έχετε προσθέσει κάτι ακόμα.</p>
        <div v-for="l in cart" :key="l.id" class="line">
          <span>{{ nameOf(l.id) }}<br /><small>{{ formatEuro(priceOf(l.id) * l.qty) }}</small></span>
          <span class="qty">
            <button :aria-label="`Λιγότερα: ${nameOf(l.id)}`" @click="changeQty(l.id, l.qty - 1)">−</button>
            <b aria-live="polite">{{ l.qty }}</b>
            <button :aria-label="`Περισσότερα: ${nameOf(l.id)}`" @click="changeQty(l.id, l.qty + 1)">+</button>
          </span>
        </div>
        <div class="total"><span>Σύνολο</span><span>{{ formatEuro(cartSum) }}</span></div>
        <RouterLink v-if="cart.length" class="btn" style="width: 100%; box-sizing: border-box" to="/pickup">Διάλεξε ώρα παραλαβής</RouterLink>
        <p class="sr-only" role="status" style="position: absolute; left: -999px">{{ announce }}</p>
      </aside>
    </div>
  </div>
</template>
