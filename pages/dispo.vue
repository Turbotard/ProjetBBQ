<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <v-card class="pa-5">
          <v-card-title class="text-h5">Disponibilités pour {{ pseudo }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="(day, index) in days" :key="index" cols="12" sm="6" md="4">
                <v-card
                  :class="{
                    'green lighten-4': availabilities[index] === true,
                    'red lighten-4': availabilities[index] === false
                  }"
                  class="ma-2"
                  outlined
                  @click="toggleAvailability(index)"
                >
                  <v-card-title>{{ day }}</v-card-title>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="d-flex flex-column flex-md-row justify-space-between">
            <v-btn @click="saveAvailabilities" color="primary" class="mb-2 mb-md-0">Sauvegarder</v-btn>
            <v-btn to="/global" color="secondary" class="mb-2 mb-md-0">Voir les disponibilités globales</v-btn>
            <v-btn @click="disconnect" color="error">Déconnexion</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="passwordDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">Mot de passe requis</v-card-title>
        <v-card-text>
          <v-text-field v-model="password" label="Mot de passe" type="password" outlined></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="saveAvailabilities">Confirmer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const pseudo = ref('');
const days = Array.from({ length: 31 }, (_, i) => `Juillet ${i + 1}`);
const availabilities = ref(Array(31).fill(false));
const router = useRouter();
const passwordDialog = ref(false);
const password = ref('');

const toggleAvailability = (index) => {
  if (availabilities.value[index] !== undefined) {
    availabilities.value[index] = !availabilities.value[index];
  }
};

const saveAvailabilities = async () => {
  password.value = localStorage.getItem('password') || '';

  if (!password.value) {
    alert('Mot de passe requis');
    return;
  }

  try {
    await axios.post('/api/availabilities', {
      pseudo: pseudo.value,
      availabilities: availabilities.value,
      password: password.value,
    });
    alert('Disponibilités sauvegardées!');
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.error || "Une erreur s'est produite. Veuillez réessayer.");
  }
};

const loadAvailabilities = async () => {
  try {
    const { data } = await axios.get('/api/availabilities');
    const userAvailability = data.find(item => item.pseudo === pseudo.value);
    if (userAvailability && userAvailability.availabilities) {
      availabilities.value = userAvailability.availabilities;
    } else {
      availabilities.value = Array(31).fill(false);
    }
  } catch (error) {
    console.error(error);
  }
};

const disconnect = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pseudo');
    localStorage.removeItem('password');
    router.push('/');
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    pseudo.value = localStorage.getItem('pseudo') || '';
    loadAvailabilities();
  }
});
</script>

<style>
.green.lighten-4 {
  border: 2px solid green;
}

.red.lighten-4 {
  border: 2px solid red;
}

.yellow.lighten-4 {
  border: 2px solid yellow;
}
</style>
