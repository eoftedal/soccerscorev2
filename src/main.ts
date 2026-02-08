import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

window.crypto.randomUUID =
    window.crypto.randomUUID ??
    function () {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);

        // Per RFC 4122 §4.4
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        const toHex = (value: number) => value.toString(16).padStart(2, "0");
        const hex = Array.from(bytes, toHex).join("");

        return [
            hex.slice(0, 8),
            hex.slice(8, 12),
            hex.slice(12, 16),
            hex.slice(16, 20),
            hex.slice(20),
        ].join("-");
    };
