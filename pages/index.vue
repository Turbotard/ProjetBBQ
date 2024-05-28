<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" offset-md="3">
        <v-card class="pa-5">
          <v-card-title class="text-h5">Entrer votre pseudo et mot de passe</v-card-title>
          <v-card-text>
            <v-text-field v-model="pseudo" label="Entrez votre pseudo" outlined></v-text-field>
            <v-text-field v-model="password" label="Entrez le mot de passe" type="password" outlined></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="checkCredentials" color="primary">Continuer</v-btn>
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
import bcrypt from 'bcryptjs';

const pseudo = ref('');
const password = ref('');
const router = useRouter();

const checkCredentials = async () => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password.value, salt);

    const { data } = await axios.post('/api/checkUser', {
      pseudo: pseudo.value,
      password: hashedPassword,
    });

    localStorage.setItem('pseudo', pseudo.value);
    localStorage.setItem('password', hashedPassword);
    router.push('/dispo');
  } catch (error) {
    console.error(error);
    alert(error.response.data.error || "Une erreur s'est produite. Veuillez réessayer.");
  }
};
</script>
