<template>
  <v-row justify="center">
    <v-dialog
      v-model="show"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Formulário de Cadastro</span>
        </v-card-title>

        <v-form
          v-model="valid"
          ref="form"
          lazy-validation
          @submit.prevent="onSubmit"
        >
          <v-card-text>
            <v-container>
              <v-row>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="form.dataRequisicao"
                    outlined
                    dense
                    type="date"
                    label="Data da Requisição"
                    :rules="[v => !!v || 'Campo obrigatório']"
                    required
                    hide-details="valid"
                  ></v-text-field>
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="form.dataBloqueio"
                    outlined
                    dense
                    type="date"
                    label="Data do Bloqueio"
                    :hide-details="valid"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="form.numeroProtocolo"
                    outlined
                    dense
                    label="Número do protocolo SISBAJUD*"
                    required
                    :hide-details="valid"
                    :rules="[v => !!v || 'Campo obrigatório']"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="form.numeroProcesso"
                    outlined
                    dense
                    label="Número do processo*"
                    :rules="[v => !!v || 'Campo obrigatório']"
                    required
                    :hide-details="valid"
                  ></v-text-field>
                </v-col>

                <v-col>
                  <v-combobox
                    v-model="form.exequente"
                    :items="partes"
                    outlined
                    dense
                    :search-input.sync="search"
                    hide-selected
                    label="Exequente"
                    multiple
                    persistent-hint
                    small-chips
                    :hide-details="valid"
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            Não foram encontrados resultados para "<strong>{{ search }}</strong>". Pressione <kbd>enter</kbd> para criar novo registro.
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </v-col>

                <v-col cols="12">
                  <v-combobox
                    v-model="form.executado"
                    :items="partes"
                    outlined
                    dense
                    :search-input.sync="search"
                    hide-selected
                    label="Executado"
                    multiple
                    persistent-hint
                    small-chips
                    :hide-details="valid"
                    :rules="[
                      v => !!v || 'Campo obrigatório',
                      v => v.length > 0 || 'Campo obrigatório'
                    ]"
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            Não foram encontrados resultados para "<strong>{{ search }}</strong>". Pressione <kbd>enter</kbd> para criar novo registro.
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="form.valor"
                    outlined
                    dense
                    label="Valor (R$)*"
                    required
                    :hide-details="valid"
                    :rules="[v => !!v || 'Campo obrigatório']"
                  ></v-text-field>
                </v-col>

              </v-row>

              <br>
              <small>*Campos obrigatórios</small>
            </v-container>
          </v-card-text>
          <v-card-actions class="mr-4">
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              @click="(show = false, reset())"
            >
              Fechar
            </v-btn>
            <v-btn
              :disabled="!valid"
              type="submit"
              color="primary"
            >
              Salvar
            </v-btn>
          </v-card-actions>

        </v-form>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import bloqueioService from '../services/bloqueio-service'
export default {
  name: 'FormBloqueio',

  props: {
    value: Boolean,
    data: {
      type: Object,
      default: () => { }
    }
  },

  data: () => {
    return {
      valid: true,
      formDefault: {
        _id: null,
        dataRequisicao: new Date().toISOString().substr(0, 10),
        dataBloqueio: null,
        numeroProtocolo: null,
        numeroProcesso: null,
        exequente: [],
        executado: [],
        status: 'Aguardando bloqueio', // Valor padrão inicial
        valor: null
      },
      partes: [],
      search: null
    }
  },

  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },

    form: {
      get () {
        return this.data ? this.data : this.formDefault
      },
      set (value) {
        this.formDefault = value
      }
    }
  },

  watch: {
    exequente (val) {
      if (val.length > 5) {
        this.$nextTick(() => this.form.exequente.pop())
      }
    },
  },

  mounted () {
    this.init()
  },

  methods: {
    async init () {
      const data = await bloqueioService.getPartes()
      this.partes = data.map(p => p.nome)
    },

    async onSubmit () {
      if (!this.$refs.form.validate()) {
        return
      }

      try {
        // Cadatra a parte exequente no BD apenas e ela não existir
        this.form.exequente.forEach(async parte => {
          if (!this.partes.includes(parte.toUpperCase())) {
            await bloqueioService.savePartes(parte)
          }
        })

        // Cadatra a parte executada no BD apenas e ela não existir
        this.form.executado.forEach(async parte => {
          if (!this.partes.includes(parte.toUpperCase())) {
            await bloqueioService.savePartes(parte)
          }
        })

        await bloqueioService.saveBloqueios({ ...this.form })

        this.$emit('reload')

        this.reset()

        this.show = false
      } catch (error) {
        console.error(error)
      }
    },

    reset () {
      this.$refs.form.reset()
    }
  }
}
</script>
