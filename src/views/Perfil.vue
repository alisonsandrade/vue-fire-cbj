<template>
  <div>
    <v-row justify="center">
      <v-avatar size="150">
        <img
          :src="user.photoURL || require('@/assets/perfil.png')"
          alt="Foto do perfil do usuário"
        >
      </v-avatar>
    </v-row>
    <h1 class="headline pb-2">Usuário</h1>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-text-field
        v-model="user.uid"
        outlined
        dense
        disabled
        label="UID"
      ></v-text-field>

      <v-text-field
        v-model="user.displayName"
        outlined
        dense
        :counter="200"
        :rules="nameRules"
        label="Nome"
        @keypress.enter="validate"
      ></v-text-field>

      <v-text-field
        v-model="user.email"
        outlined
        dense
        disabled
        :rules="emailRules"
        label="E-mail"
        required
      ></v-text-field>

      <v-text-field
        v-model="user.photoURL"
        outlined
        dense
        label="URL da imagem de perfil"
        @keypress.enter="validate"
      ></v-text-field>

      <p class="caption">Último acesso ao sistema em {{ new Date(user.lastSignInTime).toLocaleString() }}</p>

      <v-btn
        :disabled="!valid"
        color="success"
        class="mr-4"
        @click="validate"
      >
        Atualizar perfil
      </v-btn>

      <v-btn
        color="secondary"
        class="mr-4"
        @click="changePassword"
      >
        Alterar a senha
      </v-btn>
    </v-form>

    <v-snackbar
      v-model="snackbar"
      color="success"
    >
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <v-overlay :value="overlay"></v-overlay>
  </div>
</template>

<script>
import { auth } from '../plugins/firebase'

export default {
  name: 'Perfil',

  data: () => ({
    user: {
      uid: '',
      displayName: '',
      email: '',
      phoneNumber: '',
      photoURL: '',
      lastSignInTime: ''
    },
    overlay: false,
    snackbar: false,
    snackbarMessage: 'Registro atualizado com sucesso!',
    valid: true,
    nameRules: [
      v => !!v || 'Nome é obrigatório',
      v => (v && v.length <= 100) || 'Name must be less than 100 characters',
    ],
    emailRules: [
      v => !!v || 'E-mail é obrigatório',
      v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido',
    ]
  }),

  mounted () {
    this.onInit()
  },

  methods: {
    async onInit () {
      try {
        this.overlay = true

        const user = await auth.currentUser

        this.user.uid = user.uid
        this.user.displayName = user.displayName
        this.user.email = user.email
        this.user.photoURL = user.photoURL
        this.user.lastSignInTime = user.metadata.lastSignInTime
      } catch (error) {
        this.snackbar = true
        this.snackbarMessage = error.message
      } finally {
        this.overlay = false
      }

    },
    async validate () {
      this.$refs.form.validate()

      try {
        this.overlay = true

        await auth.currentUser.updateProfile({ ...this.user })

        this.snackbar = true
      } catch (error) {
        this.snackbar = true
        this.snackbarMessage = error.message
      } finally {
        this.overlay = false
      }
    },

    async changePassword () {
      if (this.user.email != null) {
        try {
          this.overlay = true
          await auth.sendPasswordResetEmail(this.user.email)
          this.snackbar = true
          this.snackbarMessage = `Foi encaminhado um e-mail para ${this.user.email} para redefinição de sua senha. Siga os procedimentos para alteração de sua senha.`
        } catch (error) {
          this.snackbar = true
          this.snackbarMessage = error.message
        } finally {
          this.overlay = false
        }
      }

    }
  }
}
</script>