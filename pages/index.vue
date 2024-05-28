<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" offset-md="3">
        <v-card class="pa-5">
          <v-card-title class="text-h5">Entrer votre pseudo</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="pseudo"
                label="Entrez votre pseudo"
                outlined
                :rules="pseudoRules"
                :error-messages="pseudoErrors"
                @input="validatePseudo"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="checkPseudo" :disabled="!valid" color="primary">Continuer</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const pseudo = ref('');
const valid = ref(false);
const pseudoErrors = ref([]);
const router = useRouter();

const pseudoRules = [
  v => !!v || 'Le pseudo est requis',
  v => v.length >= 3 || 'Le pseudo doit avoir au moins 3 caractères',
  v => /^[a-zA-Zà-ÿÀ-ÿ\s]+$/.test(v) || 'Le pseudo ne peut contenir que des lettres et des accents'
];

const validatePseudo = () => {
  pseudoErrors.value = [];
  for (let rule of pseudoRules) {
    const error = rule(pseudo.value);
    if (typeof error === 'string') {
      pseudoErrors.value.push(error);
    }
  }
};

const checkPseudo = async () => {
  if (!valid.value) return;
  
  try {
    const { data } = await axios.get('/api/availabilities');
    localStorage.setItem('pseudo', pseudo.value);
    router.push('/dispo');
  } catch (error) {
    console.error(error);
    alert("Une erreur s'est produite. Veuillez réessayer.");
  }
};
</script>
