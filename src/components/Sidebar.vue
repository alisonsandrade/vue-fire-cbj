<template>
  <v-navigation-drawer
    v-model="show"
    class="deep-purple accent-5"
    dark
    :permanent="$vuetify.breakpoint.mdAndDown ? false : true"
    app
    width="320px"
  >
    <v-list-item class="px-2 py-5">
      <v-list-item-title
        class="text-capitalize"
        align="center"
      >
        <v-icon size="60">mdi-bitcoin</v-icon>
        <h1 class="headline">CBJ</h1>
        <span class="subtitle-1">{{ tenant }}</span>
      </v-list-item-title>

    </v-list-item>
    <v-list>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        link
        :to="item.link"
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-row
      justify="center"
      class="mt-4"
    >
      <v-date-picker
        v-model="picker"
        type="month"
        locale="pt-br"
      />
    </v-row>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          block
          @click="logout"
        >
          Sair
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { auth, db } from '../plugins/firebase'

export default {
  name: 'Sidebar',

  props: {
    value: Boolean
  },

  data () {
    return {
      picker: new Date().toISOString().substr(0, 10), // Formato: 2021-03
      selectedItem: 0,
      drawer: false,
      items: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', link: '/' },
        { title: 'Perfil', icon: 'mdi-account-box', link: '/perfil' },
        { title: 'Sobre', icon: 'mdi-chat-alert-outline', link: '/about' }
      ],
      tenant: ''
    }
  },

  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        if (!value) this.$emit('input', value)
      }
    }
  },

  mounted () {
    this.onInit()
  },

  watch: {
    async picker (value) {
      if (this.$route.path !== '/home') {
        await this.$router.push('/home')
      }
      this.$eventBus.$emit('month', value)
    }
  },

  methods: {
    async onInit () {
      try {
        const snapShot = await db.collection('users').get()
        snapShot.forEach(doc => {
          if (doc.id === auth.currentUser.uid) {
            this.tenant = doc.data().tenant
          }
        })
      } catch (error) {
        console.error(error)
      }
    },

    async logout () {
      if (!window.confirm('Tem certeza que deseja sair?')) return
      try {
        await auth.signOut()
        this.$router.push('/login')
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

