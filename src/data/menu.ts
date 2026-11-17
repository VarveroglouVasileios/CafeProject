import type { MenuItem } from '@/lib/pickup'

export const categories = [
  { id: 'coffee', label: 'Καφές και ροφήματα' },
  { id: 'brunch', label: 'Brunch' },
  { id: 'bakery', label: 'Φούρνος' },
] as const

// Prices are illustrative.
export const menu: MenuItem[] = [
  { id: 'espresso', name: 'Espresso', desc: 'Διπλός, από μείγμα Βραζιλίας και Αιθιοπίας.', price: 2.2, category: 'coffee', image: 'coffee' },
  { id: 'flat-white', name: 'Flat white', desc: 'Διπλός espresso με βελουτέ γάλα.', price: 3.2, category: 'coffee', image: 'coffee' },
  { id: 'freddo', name: 'Freddo cappuccino', desc: 'Με κρύο αφρόγαλα, όπως πρέπει.', price: 3.6, category: 'coffee', image: 'frappe' },
  { id: 'frappe', name: 'Φραπέ', desc: 'Γλυκός, μέτριος ή σκέτος.', price: 3.0, category: 'coffee', image: 'frappe' },
  { id: 'avocado', name: 'Avocado toast', desc: 'Ψωμί ολικής, αβοκάντο, αυγό ποσέ, σουσάμι.', price: 8.5, category: 'brunch', image: 'brunch' },
  { id: 'pancakes', name: 'Pancakes με φρούτα', desc: 'Τρία αφράτα, με εποχιακά φρούτα και μέλι.', price: 7.5, category: 'brunch', image: 'pancakes' },
  { id: 'omelette', name: 'Ομελέτα του φούρνου', desc: 'Με φέτα, ντομάτα και φρέσκο ψωμί.', price: 7.0, category: 'brunch', image: 'brunch' },
  { id: 'sandwich', name: 'Σάντουιτς γαλοπούλα', desc: 'Με τυρί, μαρούλι και μουστάρδα μελιού.', price: 5.5, category: 'brunch', image: 'bakery' },
  { id: 'tyropita', name: 'Τυρόπιτα', desc: 'Σφολιάτα με φέτα και μυζήθρα, ζεστή από τον φούρνο.', price: 2.8, category: 'bakery', image: 'bakery' },
  { id: 'koulouri', name: 'Κουλούρι', desc: 'Με σουσάμι, κάθε πρωί φρέσκο.', price: 1.2, category: 'bakery', image: 'bakery' },
  { id: 'croissant', name: 'Κρουασάν βουτύρου', desc: 'Τραγανό από έξω, μαλακό μέσα.', price: 2.6, category: 'bakery', image: 'coffee' },
]
