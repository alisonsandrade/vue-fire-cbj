<template>
  <v-container>
    <Sidebar />

    <v-toolbar flat>
      <v-toolbar-title>
        <span class="caption">CBJ v.1.0.0</span><br>{{ $route.name }}
      </v-toolbar-title>
      <v-app-bar
        flat
        color="rgba(0,0,0,0)"
        class="ml-16"
      >
        <v-tabs
          v-model="tab"
          color="purple"
          slider-size="3"
        >
          <v-tab>
            <v-btn
              fab
              color="purple lighten-4"
              elevation="0"
              to="/"
            >
              <v-icon color="purple">mdi-currency-usd</v-icon>
            </v-btn>
          </v-tab>

          <v-tab>
            <v-btn
              fab
              color="purple lighten-4"
              elevation="0"
              to="/about"
            >
              <v-icon color="indigo">mdi-chat-alert-outline</v-icon>
            </v-btn>
          </v-tab>
        </v-tabs>
      </v-app-bar>

      <v-spacer></v-spacer>

      <v-badge
        bordered
        bottom
        color="green"
        dot
        offset-x="10"
        offset-y="10"
      >
        <v-avatar size="40">
          <v-img src="https://cdn.vuetifyjs.com/images/lists/2.jpg" />
        </v-avatar>
      </v-badge>

    </v-toolbar>

    <v-container class="ma-1">
      <router-view>
        <!-- Rotas filhas -->
      </router-view>
    </v-container>

  </v-container>
</template>

<script>
export default {
  name: 'Layout',

  components: {
    Sidebar: () => import('@/components/Sidebar')
  },

  data: () => ({
    tab: null
  }),

  watch: {
    $route (route) {
      this.tab = route.path === '/about' ? 1 : 0
    }
  }

}
</script>