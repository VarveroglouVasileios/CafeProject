<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { cartCount } from '@/lib/store'

const focusMain = () => document.getElementById('main')?.focus()
</script>

<template>
  <a class="skip" href="#main" @click.prevent="focusMain">Μετάβαση στο περιεχόμενο</a>
  <header class="top">
    <RouterLink to="/" class="logo">ALMYRA<span>.</span></RouterLink>
    <nav aria-label="Κύρια πλοήγηση">
      <RouterLink to="/menu">Μενού</RouterLink>
      <RouterLink to="/kitchen" class="hide-sm">Κουζίνα</RouterLink>
      <RouterLink to="/pickup" class="cart-link">Παραγγελία <b>{{ cartCount }}</b></RouterLink>
    </nav>
  </header>
  <main id="main" tabindex="-1"><RouterView /></main>
  <footer class="foot">
    <p class="foot-logo">ALMYRA.</p>
    <p>Demo concept · Φανταστική επιχείρηση · Οι παραγγελίες δεν είναι πραγματικές.<br />
      Σχεδιασμός και υλοποίηση: Βασίλειος Βαρβέρογλου · Οι φωτογραφίες είναι δημιουργημένες με AI και ενδεικτικές.</p>
  </footer>
</template>
