<template>
  <div
    id="login"
    class="d-flex align-center justify-center"
    style="min-height: 100vh;"
  >
    <v-card width="500px">
      <v-card-title class="primary white--text">
        <v-icon
          large
          left
          color="white"
        >
          mdi-login-variant
        </v-icon>
        <span class="title font-weight-bold">CBJ - Login de acesso</span>
      </v-card-title>

      <v-card>
        <v-alert
          v-model="alert"
          :type="typeAlert"
          dismissible
          class="ma-4"
        >
          {{ alertText }}
        </v-alert>

        <v-card-text class="pt-4">
          <div>
            <v-form
              v-model="valid"
              ref="form"
            >
              <v-text-field
                v-model="email"
                outlined
                prepend-inner-icon="mdi-email"
                label="Digite seu e-mail"
                :rules="emailRules"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                outlined
                prepend-inner-icon="mdi-key"
                label="Digite a sua senha"
                min="8"
                :append-icon="e1 ? 'mdi-visibility' : 'mdi-visibility_off'"
                :append-icon-cb="() => (e1 = !e1)"
                type="password"
                :rules="passwordRules"
                counter
                required
                @keyup.enter="login"
              ></v-text-field>
              <div class="text-center">
                <v-btn
                  @click="login"
                  class="primary mb-2"
                  block
                  :class=" { 'blue darken-4 white--text' : valid, disabled: !valid }"
                >Entrar</v-btn>
                <a
                  href="#"
                  @click="forgoted"
                >Esqueci minha senha</a>
              </div>
            </v-form>
          </div>
        </v-card-text>
      </v-card>
    </v-card>

    <v-overlay :value="overlay"></v-overlay>
  </div>
</template>

 <script>
import { auth } from '../plugins/firebase'

export default {
  data () {
    return {
      alert: false,
      alertText: 'Ocorreu um erro',
      typeAlert: 'error',
      overlay: false,
      valid: false,
      e1: false,
      password: '',
      passwordRules: [
        (v) => !!v || 'O campo senha é obrigatório',
      ],
      email: '',
      emailRules: [
        v => !!v || 'O campo e-mail é obrigatório',
        v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido',
      ]
    }
  },

  methods: {
    async login () {
      const queryRedirect = this.$route.query.redirect
      if (this.$refs.form.validate()) {
        this.overlay = true

        try {
          await auth.signInWithEmailAndPassword(this.email, this.password)
          this.$router.push(queryRedirect || '/home')
        } catch (error) {
          this.alert = true
          this.alertText = error.message
        } finally {
          this.overlay = false
        }
      }
    },

    async forgoted () {
      if (!this.email) {
        this.alert = true
        this.alertText = 'Para redefinir a senha é necessário informar o e-mail'
        return
      }

      try {
        this.overlay = true
        await auth.sendPasswordResetEmail(this.email)
        this.typeAlert = 'success'
        this.alertText = 'Em alguns instante será encaminhado um e-mail para sua caixa de entrada para redefinir a sua senha.'
      } catch (error) {
        this.alertText = error.messsage
      } finally {
        this.overlay = false
        this.alert = true
      }
    },

    clear () {
      this.$refs.form.reset()
    }
  }
}
 </script>

 <style scoped>
#login {
  background-image: url("https://images.unsplash.com/photo-1497733942558-e74c87ef89db?dpr=1&auto=compress,format&fit=crop&w=1650&h=&q=80&cs=tinysrgb&crop=");
  background-size: cover;
  overflow: hidden;
}

.loginOverlay {
  background: rgba(33, 150, 243, 0.3);
}
</style>