import { createApp, onMounted, ref } from "vue";
import "@fahimc/react-web-component-bridge-test-components/web-components";
import { sampleCustomers } from "@fahimc/react-web-component-bridge-test-components";

createApp({
  setup() {
    const picker = ref<(HTMLElement & { customers: unknown[]; focusSearch(): void }) | null>(null);
    onMounted(() => {
      if (picker.value) {
        picker.value.customers = sampleCustomers().slice(0, 12);
      }
    });
    return { picker };
  },
  template:
    '<rwcb-customer-picker ref="picker" selected-id="c2" @customer-select="event => console.log(event.detail)"><span slot="empty-state">No results</span></rwcb-customer-picker>'
}).mount("#app");
