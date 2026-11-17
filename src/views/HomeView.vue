<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { img } from '@/lib/storage'

const board = [
  ['Flat white', '3,20'], ['Φραπέ με γάλα', '3,00'], ['Avocado toast, αυγό ποσέ', '8,50'],
  ['Pancakes με φρούτα και μέλι', '7,50'], ['Τυρόπιτα του φούρνου', '2,80'],
]
const marquee = 'Καφές ✺ Brunch ✺ Φρέσκο ψωμί ✺ Φραπέ ✺ Παραλαβή σε 10΄ ✺ '.repeat(2)
</script>

<template>
  <div class="wrap hero">
    <div class="hero-copy" style="position: relative">
      <h1>Ο καφές σας, <em>έτοιμος.</em></h1>
      <p class="hero-lead">Παραγγείλετε από το κινητό, διαλέξτε ώρα και πάρτε τον στο χέρι όταν φτάσετε. Χωρίς ουρά.</p>
      <p style="margin-top: 2rem; display: flex; flex-wrap: wrap; gap: 1.4rem; align-items: center">
        <RouterLink class="btn" to="/menu">Παραγγείλτε τώρα</RouterLink>
        <span style="font: 700 1.3rem 'Playpen Sans'; transform: rotate(-4deg)">...έτοιμο σε 10 λεπτά!</span>
      </p>
      <div class="sticker" aria-label="Demo concept">Demo<br />concept</div>
    </div>
    <div class="hero-photo">
      <img :src="img('terrace')" alt="Βεράντα του café με θέα τη θάλασσα και δύο πιάτα brunch" width="1024" height="576" />
      <div class="ticket-chip">
        <small>ΠΑΡΑΛΑΒΗ</small><strong>9:15</strong>
        <span class="steam" aria-hidden="true"><i></i><i></i><i></i></span>
        <small style="color: inherit; font-family: Inter; font-weight: 700; letter-spacing: 0">Flat white + κρουασάν</small>
      </div>
    </div>
  </div>

  <div class="marquee" aria-hidden="true"><div class="marquee-track"><span>{{ marquee }}</span><span>{{ marquee }}</span></div></div>

  <section class="board">
    <div class="wrap board-grid">
      <div>
        <h2>Ο πίνακας της ημέρας</h2>
        <p class="chalk">γραμμένος με κιμωλία, κάθε πρωί</p>
        <div v-for="[name, price] in board" :key="name" class="item"><span>{{ name }}</span><b>{{ price }}</b></div>
        <p style="margin-top: 1.6rem"><RouterLink class="btn btn-ghost" style="color: var(--yellow); border-color: var(--yellow)" to="/menu">Όλο το μενού →</RouterLink></p>
        <p style="font-size: .85rem; opacity: .65">Οι τιμές είναι ενδεικτικές.</p>
      </div>
      <div class="polaroids">
        <img :src="img('brunch')" alt="Avocado toast με αυγό ποσέ" loading="lazy" />
        <img :src="img('pancakes')" alt="Pancakes με φρούτα και μέλι" loading="lazy" />
        <img :src="img('coffee')" alt="Flat white με κρουασάν" loading="lazy" />
        <img :src="img('frappe')" alt="Φραπές με θέα στη θάλασσα" loading="lazy" />
      </div>
    </div>
  </section>

  <section class="wrap">
    <h2 class="page-title" style="padding-top: 3rem">Πώς γίνεται</h2>
    <div class="steps">
      <div class="card step"><i>1</i><h3>Διαλέξτε τι θέλετε</h3><p>Βάζετε στο καλάθι καφέδες και σνακ.</p></div>
      <div class="card step"><i>2</i><h3>Ορίστε ώρα</h3><p>Κάθε 15 λεπτά, με όριο παραγγελιών ανά ώρα, ώστε να είναι πάντα φρέσκο.</p></div>
      <div class="card step"><i>3</i><h3>Περάστε και πάρτε</h3><p>Λέτε το όνομά σας και φεύγετε.</p></div>
    </div>
  </section>
</template>
