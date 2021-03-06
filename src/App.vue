<template>
  <v-app app>
    <v-main>
      <Layout />
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
    Layout: () => import('@/components/Layout')
  },

  data: () => ({
    //
  }),
};
</script>
