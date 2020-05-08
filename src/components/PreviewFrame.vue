<template>  
    <iframe :srcdoc="source" width="100%" height="100%" seamless></iframe>  
</template>

<script>
  export default {
      name: 'PreviewFrame',
      props: ['source'],
    data () {
      return {
                    
      }
    }    
  }
</script>