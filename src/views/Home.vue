<template>
  <div class="home">
    <BloqueioList />
  </div>
</template>

<script>

export default {
  name: 'Home',

  components: {
    BloqueioList: () => import('@/components/BloqueioList')
  },

  data: () => ({
    //
  })
}
</script>
