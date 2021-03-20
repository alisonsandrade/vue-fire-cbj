<template>
  <div>
    <v-card class="mx-auto">
      <v-toolbar
        color="deep-purple accent-5"
        dark
      >
        <v-toolbar-title>Total: {{ items.length }} bloqueio(s)</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-text-field
          class="mx-3 mt-7"
          flat
          label="Localizar"
          prepend-inner-icon="mdi-magnify"
          solo-inverted
          v-model="search"
          clearable
          @click:clear="clearSearch"
        />

        <v-btn
          icon
          @click="addBloqueio"
        >
          <v-icon>mdi-plus-box-multiple</v-icon>
        </v-btn>
      </v-toolbar>

      <v-list two-line>
        <template v-for="(item, index) in filteredItems">
          <v-list-item
            :key="item._id"
            @click.prevent="editBloqueio(item)"
          >
            <v-list-item-content>
              <v-list-item-title>
                <span v-if="item.exequente.length > 0">
                  {{ item.exequente.join(', ') }} x
                </span>
                <span>
                  {{ item.executado ? item.executado.join(', ') : '' }}
                </span>
              </v-list-item-title>

              <v-list-item-subtitle class="text--primary">
                Processo n.º: {{ item.numeroProcesso }} -
                Protocolo SISBAJUD n.º: {{ item.numeroProtocolo }}
              </v-list-item-subtitle>

              <v-list-item-subtitle>
                <v-chip
                  class="mt-1"
                  color="deep-purple"
                  outlined
                  label
                  small
                >
                  R$ {{ item.valor }}
                </v-chip>
                <v-chip
                  class="ml-2 mt-1"
                  :color="colorStatus(item.status)"
                  label
                  text-color="white"
                  small
                >
                  {{ item.status }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action>
              <v-list-item-action-text>
                {{ dayNow(item.dataRequisicao) }}
              </v-list-item-action-text>

              <MenuDrop
                :data="item"
                @reload="(init(), snackbar = true)"
              />

            </v-list-item-action>
          </v-list-item>

          <v-divider
            v-if="index < items.length - 1"
            :key="index"
          ></v-divider>
        </template>
        <template v-if="filteredItems.length === 0">
          <v-alert
            type="warning"
            class="ma-3"
          >Nenhum registro encontrado!</v-alert>
        </template>
      </v-list>
    </v-card>

    <v-row
      class="mt-4"
      justify="end"
    >
      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <v-hover
          v-slot="{ hover }"
          open-delay="200"
        >
          <v-card
            color="cyan darken-1"
            :elevation="hover ? 16 : 2"
          >
            <v-card-title>
              <v-icon
                large
                left
                color="white"
              >
                mdi-bitcoin
              </v-icon>
              <span class="title white--text font-weight-regular">Balanço mensal</span>
            </v-card-title>

            <v-card-text class="text-center">
              <v-list-item>
                <v-list-item-content>

                  <v-list-item-title class="title mb-1 white--text">
                    Pendente de Bloqueio
                  </v-list-item-title>
                  <v-list-item-subtitle class="white--text">{{ totalPendenteBloqueio }}</v-list-item-subtitle>

                  <v-list-item-title class="title mb-1 mt-2 white--text">
                    Requisições Bloqueadas
                  </v-list-item-title>
                  <v-list-item-subtitle class="white--text">{{ totalBloqueado }}</v-list-item-subtitle>

                  <v-list-item-title class="title mt-6 secondary--text">
                    Total*: {{ totalRequisitado }}
                  </v-list-item-title>
                  <small>*Incluem todos os valores, inclusive as penhoras negativas.</small>
                </v-list-item-content>
              </v-list-item>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <FormBloqueio
      v-model="dialog"
      @reload="(init(), snackbar = true)"
      :data="objBloqueio"
    />

    <v-snackbar
      v-model="snackbar"
      color="success"
    >
      {{ text }}

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
import moment from 'moment'
moment.locale('pt-br')

import BloqueioService from '../services/bloqueio-service.js'

export default {
  name: 'BloqueioList',

  components: {
    FormBloqueio: () => import('@/components/FormBloqueio'),
    MenuDrop: () => import('@/components/MenuDrop')
  },

  data: () => ({
    search: '',
    items: [],
    dialog: false,
    overlay: false,
    snackbar: false,
    text: 'Registro salvo com sucesso',
    objBloqueio: {
      _id: null,
      dataRequisicao: new Date().toISOString().substr(0, 10),
      dataBloqueio: null,
      numeroProtocolo: null,
      numeroProcesso: null,
      exequente: [],
      executado: [],
      status: 'Aguardando Bloqueio', // Valor padrão inicial
      valor: null
    }
  }),

  created () {
    this.$eventBus.$on('month', (mesAtual) => {
      this.init(mesAtual)
    })
  },

  computed: {
    filteredItems () {
      if (!this.search) {
        return this.items
      }

      return this.items.filter((item) => {
        return item.exequente.join(', ').toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
          item.executado.join(', ').toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
          item.numeroProcesso.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
          item.numeroProtocolo.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
          item.status.toLowerCase().indexOf(this.search.toLowerCase()) !== -1
      })
    },

    totalPendenteBloqueio () {
      const total = this.filteredItems.reduce((acc, currentValue) => {
        if (currentValue.status.toLowerCase().includes('aguardando')) {
          acc = acc + this.formatValor(currentValue.valor)
        }
        return acc
      }, 0)

      return total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
    },

    totalBloqueado () {
      const total = this.filteredItems.reduce((acc, currentValue) => {
        if (currentValue.status.toLowerCase().includes('bloqueado')) {
          acc = acc + this.formatValor(currentValue.valor)
        }
        return acc
      }, 0)

      return total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
    },

    totalRequisitado () {
      const total = this.filteredItems.reduce((acc, currentValue) => {
        acc = acc + this.formatValor(currentValue.valor)
        return acc
      }, 0)

      return total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
    }
  },

  async mounted () {
    this.init()
  },

  methods: {
    dayNow (date) {
      if (date) {
        return moment(new Date(date)).toNow()
      }
    },

    clearSearch () {
      this.search = ''
    },

    colorStatus (status) {
      let returnValue
      switch (status) {
        case 'Bloqueado Integralmente':
          returnValue = 'success'
          break
        case 'Bloqueado Parcialmente':
          returnValue = 'warning'
          break
        case 'Penhora Negativa':
          returnValue = 'secondary'
          break
        default:
          returnValue = 'primary'
      }
      return returnValue
    },

    addBloqueio () {
      this.objBloqueio = Object.assign({}, this.$options.data().objBloqueio) // Adiciona um objeto em branco
      this.dialog = true
    },

    editBloqueio (obj) {
      this.objBloqueio = Object.assign({}, obj)
      this.dialog = true
    },

    async init (params) {
      const mesAtual = params || new Date().toISOString().substr(0, 7)

      this.overlay = true
      try {
        const data = await BloqueioService.getBloqueios(mesAtual)
        this.items = data
      } catch (error) {
        console.log('error bloqueiolist', error)
      } finally {
        this.overlay = false
      }
    },

    formatValor (valor) {
      if (valor) {
        return parseFloat(valor.replaceAll('.', '').replace(',', '.'))
      }
    }
  }
}
</script>