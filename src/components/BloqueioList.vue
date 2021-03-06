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
        <v-list-item-group
          v-model="selected"
          active-class="pink--text"
          multiple
        >
          <template v-for="(item, index) in filteredItems">
            <v-list-item :key="item.title">
              <template v-slot:default="{ active }">
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
                      color="info"
                      label
                      text-color="white"
                      small
                    >
                      Aguardando ordem de bloqueio
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-list-item-action-text>
                    {{ item.dataRequisicao ? dayNow(item.dataRequisicao) : dayNow(item.dataBloqueio) }}
                  </v-list-item-action-text>

                  <v-icon
                    v-if="!active"
                    color="grey lighten-1"
                  >
                    mdi-star-outline
                  </v-icon>

                  <v-icon
                    v-else
                    color="yellow darken-3"
                  >
                    mdi-star
                  </v-icon>
                </v-list-item-action>
              </template>
            </v-list-item>

            <v-divider
              v-if="index < items.length - 1"
              :key="index"
            ></v-divider>
          </template>
        </v-list-item-group>
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
                  <v-list-item-subtitle class="white--text">R$ 8.520,50</v-list-item-subtitle>

                  <v-list-item-title class="title mb-1 mt-2 white--text">
                    Total Bloqueado
                  </v-list-item-title>
                  <v-list-item-subtitle class="white--text">R$ 3.500,25</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <FormBloqueio v-model="dialog" />

  </div>
</template>

<script>
import moment from 'moment'
moment.locale('pt-br')

import BloqueioService from '../services/bloqueio-service.js'

export default {
  name: 'BloqueioList',

  components: {
    FormBloqueio: () => import('@/components/FormBloqueio')
  },

  data: () => ({
    search: '',
    selected: [2],
    searchItem: [],
    itemsLocal: [],
    dialog: false
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

    filteredItems () {
      return this.searchItem.filter((item) => {
        return item.exequente.join(', ').toLowerCase().match(this.search) ||
          item.numeroProcesso.toLowerCase().match(this.search) ||
          item.numeroProtocolo.toLowerCase().match(this.search) ||
          item.status.toLowerCase().match(this.search)
        // item.action.toLowerCase().match(this.search)
      })
    }
  },

  async mounted () {
    // setTimeout(() => this.searchItem = this.items)

    this.init()
  },

  methods: {
    dayNow (date) {
      console.log('dt', date)
      if (date) {
        return moment(new Date(date)).toNow()
      }
    },

    clearSearch () {
      this.search = ''
    },

    async init () {
      try {
        const data = await BloqueioService.getBloqueios()
        this.items = data
        this.searchItem = this.items
        console.log('items', this.items)
      } catch (error) {
        console.log('error bloqueiolist', error)
      }
    }
  }
}
</script>