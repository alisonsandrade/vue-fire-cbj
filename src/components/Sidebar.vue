<template>
  <v-navigation-drawer
    v-model="drawer"
    class="deep-purple accent-5"
    dark
    permanent
    app
    width="320px"
  >
    <v-list-item class="px-2 py-5">
      <v-list-item-title
        class="text-capitalize"
        align="center"
      >
        <v-icon size="60">mdi-bitcoin</v-icon><br>CBJ
      </v-list-item-title>
    </v-list-item>
    <v-list>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        link
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
        <v-btn block>
          Sair
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'Sidebar',

  data () {
    return {
      picker: new Date().toISOString().substr(0, 10), // Formato: 2021-03
      selectedItem: 0,
      drawer: null,
      items: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard' },
        { title: 'Account', icon: 'mdi-account-box' },
        { title: 'Admin', icon: 'mdi-gavel' },
      ],
    }
  },

  watch: {
    picker (value) {
      this.$eventBus.$emit('month', value)
    }
  }
}
</script>

