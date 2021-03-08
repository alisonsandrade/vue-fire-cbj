<template>
  <v-menu
    bottom
    min-width="200px"
    rounded
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        x-large
        v-on="on"
      >
        <v-avatar size="40">
          <v-img :src="user.photoURL || require('@/assets/perfil.png')" />
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-list-item-content class="justify-center">
        <div class="mx-auto text-center pa-2">
          <v-avatar size="48">
            <v-img :src="user.photoURL || require('@/assets/perfil.png')" />
          </v-avatar>
          <h3>{{ user.displayName }}</h3>
          <p class="caption mt-1">
            {{ user.email }}
          </p>
          <v-divider class="my-3"></v-divider>
          <v-btn
            depressed
            rounded
            text
            to="/perfil"
          >
            Editar perfil
          </v-btn>
          <v-divider class="my-3"></v-divider>
          <v-btn
            depressed
            rounded
            text
            @click="logout"
          >
            Sair
          </v-btn>
        </div>
      </v-list-item-content>
    </v-card>
  </v-menu>
</template>

<script>
import { auth } from '../plugins/firebase'

export default {
  name: 'Profile',

  data: () => ({
    user: {
      displayName: '',
      email: '',
      photoURL: ''
    },
  }),

  mounted () {
    this.onInit()
  },

  methods: {
    async onInit () {
      try {
        const { displayName, email, photoURL } = await auth.currentUser
        this.user.displayName = displayName
        this.user.email = email
        this.user.photoURL = photoURL
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
