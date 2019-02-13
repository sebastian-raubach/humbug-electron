<template>
  <div>
    <b-navbar toggleable="md" type="dark" variant="primary">
      <b-navbar-brand href="#" @click="back"><back-icon :size="48" /> <img id="logo" src="~@/assets/logo-no-bg.svg" width="30" height="30" class="d-inline-block align-top"> About</b-navbar-brand>
    </b-navbar>
    <div class="navbar-margin">
      <div class="bs4-row hutton-banner">
        <div id="hutton-banner-hunger" class="bs4-col"></div>
        <div id="hutton-banner-education" class="bs4-col"></div>
        <div id="hutton-banner-water" class="bs4-col"></div>
        <div id="hutton-banner-energy" class="bs4-col"></div>
        <div id="hutton-banner-work" class="bs4-col"></div>
        <div class="bs4-w-100 bs4-d-md-none bs4-d-lg-none bs4-d-xl-none"></div>
        <div id="hutton-banner-industry" class="bs4-col"></div>
        <div id="hutton-banner-consumption" class="bs4-col"></div>
        <div id="hutton-banner-climate" class="bs4-col"></div>
        <div id="hutton-banner-land" class="bs4-col"></div>
        <div id="hutton-banner-partnership" class="bs4-col"></div>
      </div>
    </div>
    <b-container>
      <b-row class="h-100">
        <b-col sm=6 class="my-auto">
          <a href="http://www.hutton.ac.uk" target="_blank" title="The James Hutton Institute">
            <img class="img-fluid header-img mx-auto d-block" src="~@/assets/jhi.svg">
          </a>
        </b-col>
        <b-col sm=6 class="my-auto">
          <a href="https://ics.hutton.ac.uk" target="_blank" title="Software Development Group">
            <img class="img-fluid header-img mx-auto d-block" src="~@/assets/sdg.svg" >
          </a>
        </b-col>
      </b-row>

      <h1>Humbug {{ version }}</h1>
      <p>Humbug was written, designed and developed by Sebastian Raubach and Paul Shaw.</p>
      <p>The following people have been instrumental in getting Humbug up and running: Iain Milne and Gordon Stephen.</p>
      <p>&copy; {{ new Date().getFullYear() }} Information &amp; Computational Sciences, The James Hutton Institute</p>

      <div class="text-center">
        <b-btn-group>
          <b-btn><web-icon /> Humbug homepage</b-btn>
          <b-btn><email-icon /> Send us an email</b-btn>
          <b-btn><twitter-icon /> Follow us on Twitter</b-btn>
        </b-btn-group>
      </div>
    </b-container>
  </div>
</template>

<script>
import BackIcon from 'vue-material-design-icons/ArrowLeft.vue'
import EmailIcon from 'vue-material-design-icons/Email.vue'
import TwitterIcon from 'vue-material-design-icons/Twitter.vue'
import WebIcon from 'vue-material-design-icons/Web.vue'
const { app } = require('electron').remote

export default {
  data: function () {
    return {
      version: app.getVersion()
    }
  },
  components: {
    BackIcon, EmailIcon, TwitterIcon, WebIcon
  },
  methods: {
    back: function () {
      this.$router.push('landing-page')
    }
  }
}
</script>

<style>
  .navbar-margin {
    margin-bottom: 15px;
  }
  .header-img {
    width: 100%;
  }

  @media (min-width: 992px) {
    .header-img {
      width: 75%;
    }
  }
  @media (min-width: 1200px) {
    .header-img {
      width: 50%;
    }
  }
</style>
