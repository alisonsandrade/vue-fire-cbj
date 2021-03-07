<template>
  <v-menu
    open-on-hover
    end
    offset-y
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        dark
        text
        fab
        x-small
        v-bind="attrs"
        v-on="on"
      >
        <v-icon color="deep-purple accent-5">
          mdi-cog
        </v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        @click.prevent="item.method(item.title)"
      >
        <v-list-item-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import bloqueioService from '../services/bloqueio-service'
export default {
  name: 'MenuDrop',

  props: {
    data: {
      type: Object,
      require: true
    }
  },

  data: (vm) => ({
    items: [
      { title: 'Bloqueado Integralmente', icon: 'mdi-check-all', method: vm.updateStatus },
      { title: 'Bloqueado Parcialmente', icon: 'mdi-check', method: vm.updateStatus },
      { title: 'Excluir', icon: 'mdi-delete', method: vm.deleteBloqueio }
    ]
  }),

  methods: {
    async updateStatus (status) {
      const msgConfirm = window.confirm('Confirma a alteração de status?')
      if (!msgConfirm) return
      try {
        await bloqueioService.saveBloqueios({
          _id: this.data._id,
          dataBloqueio: new Date().toISOString().substr(0, 10),
          status
        })
        this.$emit('reload')
      } catch (error) {
        console.log(error)
      }
    },

    async deleteBloqueio () {
      const msgConfirm = window.confirm('Tem certeza que deseja excluir este registro?')
      if (!msgConfirm) return
      try {
        await bloqueioService.deleteBloqueio(this.data._id)
        this.$emit('reload')
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
