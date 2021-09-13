<template>
  <!-- <router-link :to="link" style="text-decoration: none"> -->
    <section v-if="external">
    <q-item clickable tag="a" target="_target" :href="link" @click="sendEvent()"> <!--   > -->
     <q-item-section v-if="icon" avatar>
        <q-icon :name="icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ title }}</q-item-label>
        <q-item-label caption>
          {{ caption }}
        </q-item-label>
      </q-item-section>
    </q-item>
    </section>
    <section v-else>
      <router-link :to="link" style="text-decoration: none; color: inherit;">
        <q-item> 
        <q-item-section v-if="icon" avatar>
          <q-icon :name="icon" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ title }}</q-item-label>
          <q-item-label caption>
            {{ caption }}
          </q-item-label>
        </q-item-section>
      </q-item>
      </router-link>
    </section>
    
  <!-- </router-link> -->
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EssentialLink',
  methods: {
    sendEvent() {
      this.$emit('closeDrawer');
      console.log("emit emit")
    }
  },
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: '#'
    },

    icon: {
      type: String,
      default: ''
    },

    external: {
      type: Boolean,
      default: false
    }
  }
})
</script>
