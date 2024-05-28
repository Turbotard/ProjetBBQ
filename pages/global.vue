<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <v-card class="pa-5">
          <v-card-title class="text-h5">Disponibilités globales</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="(day, index) in days" :key="index" cols="12" sm="6" md="4">
                <v-card
                  :class="{
                    'green lighten-4': dayColor(index) === 'green',
                    'red lighten-4': dayColor(index) === 'red',
                    'yellow lighten-4': dayColor(index) === 'yellow'
                  }"
                  class="ma-2"
                  outlined
                  @click="openDialog(index)"
                >
                  <v-card-title>{{ day }}</v-card-title>
                  <v-card-subtitle>
                    {{ countAvailabilities(index, true) }} Présents, {{ countAvailabilities(index, false) }} Absents
                  </v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="d-flex flex-column flex-md-row justify-space-between">
            <v-btn to="/dispo" color="secondary" class="mb-2 mb-md-0">Retour aux disponibilités</v-btn>
            <v-btn @click="disconnect" color="error">Déconnexion</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h5">Détails pour {{ selectedDay }}</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <h6>Présents</h6>
              <v-list dense>
                <v-list-item v-for="(item, index) in availableList" :key="index">
                  <v-list-item-content>
                    <v-list-item-title class="green--text">{{ item }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <h6>Absents</h6>
              <v-list dense>
                <v-list-item v-for="(item, index) in unavailableList" :key="index">
                  <v-list-item-content>
                    <v-list-item-title class="red--text">{{ item }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const days = Array.from({ length: 31 }, (_, i) => `Juillet ${i + 1}`);
const allAvailabilities = ref([]);
const dialog = ref(false);
const selectedDay = ref('');
const availableList = ref([]);
const unavailableList = ref([]);
const router = useRouter();

const loadAvailabilities = async () => {
  try {
    const { data } = await axios.get('/api/availabilities');
    allAvailabilities.value = data;
  } catch (error) {
    console.error(error);
  }
};

const countAvailabilities = (index, present) => {
  return allAvailabilities.value.filter(item => item.availabilities[index] === present).length;
};

const dayColor = (index) => {
  const presentCount = countAvailabilities(index, true);
  const totalCount = allAvailabilities.value.length;
  const percentPresent = (presentCount / totalCount) * 100;

  if (percentPresent == 100) {
    return 'green';
  } else if (percentPresent > 70) {
    return 'yellow';
  } else {
    return 'red';
  }
};

const dayDetails = (index) => {
  availableList.value = allAvailabilities.value.filter(item => item.availabilities[index]).map(item => item.pseudo);
  unavailableList.value = allAvailabilities.value.filter(item => !item.availabilities[index]).map(item => item.pseudo);
};

const openDialog = (index) => {
  selectedDay.value = days[index];
  dayDetails(index);
  dialog.value = true;
};

const disconnect = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pseudo');
    router.push('/');
  }
};

onMounted(() => {
  loadAvailabilities();
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
