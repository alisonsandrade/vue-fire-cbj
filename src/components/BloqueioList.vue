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
        ></v-text-field>

        <v-btn
          icon
          @click="dialog = true"
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
                <span v-if="item.exequente">
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
                {{ item.dataBloqueio ? dayNow(item.dataBloqueio) : dayNow(item.dataRequisicao) }}
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
      </v-list>
    </v-card>

    <v-row
      class="mt-4"
      justify="end"
    >
      <v-col
        cols="12"
        sm="4"
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
                    Total Requisitado
                  </v-list-item-title>
                  <v-list-item-subtitle class="white--text">{{ totalRequisitado }}</v-list-item-subtitle>

                  <v-list-item-title class="title mb-1 mt-2 white--text">
                    Total Bloqueado
                  </v-list-item-title>
                  <v-list-item-subtitle class="white--text">{{ totalBloqueado }}</v-list-item-subtitle>
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
    searchItem: [],
    itemsLocal: [],
    dialog: false,
    overlay: false,
    snackbar: false,
    text: 'Registro salvo com sucesso',
    objBloqueio: {}
  }),

  computed: {
    items: {
      get () {
        return this.itemsLocal
      },
      set (value) {
        if (value) this.itemsLocal = value
      }
    },

    totalRequisitado () {
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

    filteredItems () {
      return this.searchItem.filter((item) => {
        return item.exequente.join(', ').toLowerCase().match(this.search) ||
          item.executado.join(', ').toLowerCase().match(this.search) ||
          item.numeroProcesso.toLowerCase().match(this.search) ||
          item.numeroProtocolo.toLowerCase().match(this.search) ||
          item.status.toLowerCase().match(this.search)
      })
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
      if (status.toLowerCase().includes('aguardando')) {
        return 'info'
      }
      if (status.toLowerCase().includes('integralmente')) {
        return 'success'
      }
      if (status.toLowerCase().includes('parcialmente')) {
        return 'warning'
      }
    },

    editBloqueio (obj) {
      this.objBloqueio = Object.assign({}, obj)
      this.dialog = true
    },

    async init () {
      this.overlay = true
      try {
        const data = await BloqueioService.getBloqueios()
        this.items = data
        this.searchItem = this.items
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