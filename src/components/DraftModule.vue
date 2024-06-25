<template>
  <div class="container">
    <h1>Dofus Draft Module</h1>
    <div class="draft">
      <div class="team">
        <h2>
          <input
            type="text"
            v-model="draftData.teamAName"
            @input="adjustInputWidth($event.target)"
            @change="updateTeamName('A')"
            placeholder="Team A"
          />
        </h2>
        <button :disabled="selectedTeam === 'A'" @click="selectTeam('A')">Sélectionner Team A</button>
        <div class="picks-section">
          <h3 class="section-title">Picks</h3>
          <div class="picks">
            <img v-for="(pick, index) in draftData.teamAPicks" :key="index" :src="getPickImage(pick)" :alt="pick" />
          </div>
        </div>
        <div class="bans-section">
          <h3 class="section-title">Bans</h3>
          <div class="bans">
            <img v-for="(ban, index) in draftData.teamABans" :key="index" :src="getPickImage(ban)" :alt="ban" />
          </div>
        </div>
      </div>
      <div class="team">
        <h2>
          <input
            type="text"
            v-model="draftData.teamBName"
            @input="adjustInputWidth($event.target)"
            @change="updateTeamName('B')"
            placeholder="Team B"
          />
        </h2>
        <button :disabled="selectedTeam === 'B'" @click="selectTeam('B')">Sélectionner Team B</button>
        <div class="picks-section">
          <h3 class="section-title">Picks</h3>
          <div class="picks">
            <img v-for="(pick, index) in draftData.teamBPicks" :key="index" :src="getPickImage(pick)" :alt="pick" />
          </div>
        </div>
        <div class="bans-section">
          <h3 class="section-title">Bans</h3>
          <div class="bans">
            <img v-for="(ban, index) in draftData.teamBBans" :key="index" :src="getPickImage(ban)" :alt="ban" />
          </div>
        </div>
      </div>
    </div>
    <div class="map-section">
      <h2 class="section-title">Map</h2>
      <input type="text" v-model="draftData.mapInput" placeholder="Enter map code (e.g., A1)" @change="updateMapImage" />
      <img v-if="draftData.mapImage" :src="draftData.mapImage" :alt="`Carte ${draftData.mapInput}`" />
    </div>
    <div class="controls">
      <button @click="resetDraft">Reset Draft</button>
      <button @click="generateRandomDraft">Draft Aléatoire</button>
    </div>
    <div class="selection" v-show="!draftData.draftCompleted">
      <h3 v-html="selectionTitle"></h3>
      <div class="class-grid">
        <img
          v-for="cls in availableClasses"
          :key="cls"
          :src="getPickImage(cls)"
          :alt="cls"
          :class="{ disabled: selectedTeam !== draftOrder[draftData.currentStep].team }"
          @click="confirmSelection(cls)"
        />
      </div>
    </div>
    <div v-show="draftData.draftCompleted" class="results-section">
      <h2>Résultats de la Draft</h2>
      <div class="results-container">
        <div class="team-result">
          <h2>{{ draftData.teamAName }}</h2>
          <div class="picks">
            <img v-for="(pick, index) in draftData.teamAPicks" :key="index" :src="getResultImage(pick)" :alt="pick" />
          </div>
        </div>
        <div class="team-result">
          <h2>{{ draftData.teamBName }}</h2>
          <div class="picks">
            <img v-for="(pick, index) in draftData.teamBPicks" :key="index" :src="getResultImage(pick)" :alt="pick" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/supabase'

export default {
  data() {
    return {
      classes: [
        'Ecaflip', 'Eniripsa', 'Iop', 'Cra', 'Feca', 'Sacrieur', 'Sadida',
        'Osamodas', 'Enutrof', 'Sram', 'Xelor', 'Pandawa', 'Roublard',
        'Zobal', 'Steamer', 'Eliotrope', 'Huppermage', 'Ouginak', 'Forgelance'
      ],
      draftData: {
        teamAName: "Team A",
        teamBName: "Team B",
        teamAPicks: [],
        teamABans: [],
        teamBPicks: [],
        teamBBans: [],
        currentStep: 0,
        draftCompleted: false,
        selectedTeam: '',
        mapInput: '',
        mapImage: ''
      },
      draftOrder: [
        { team: 'A', action: 'ban' }, { team: 'B', action: 'ban' },
        { team: 'A', action: 'ban' }, { team: 'B', action: 'ban' },
        { team: 'A', action: 'pick' }, { team: 'B', action: 'pick' },
        { team: 'B', action: 'ban' }, { team: 'A', action: 'ban' },
        { team: 'B', action: 'ban' }, { team: 'A', action: 'ban' },
        { team: 'B', action: 'pick' }, { team: 'A', action: 'pick' },
        { team: 'A', action: 'ban' }, { team: 'B', action: 'ban' },
        { team: 'A', action: 'pick' }, { team: 'B', action: 'pick' }
      ],
      availableClasses: [],
      selectedTeam: ''
    };
  },
  computed: {
    selectionTitle() {
      if (this.draftData.draftCompleted) return '';
      const { team, action } = this.draftOrder[this.draftData.currentStep];
      const teamName = team === 'A' ? this.draftData.teamAName : this.draftData.teamBName;
      const actionText = action.toUpperCase();
      return `${teamName} choisi une classe à <span class="${action === 'ban' ? 'ban-text' : 'pick-text'}">${actionText}</span>`;
    }
  },
  async mounted() {
    this.resetDraft();
    this.setupRealtimeListener();
  },
  methods: {
    async setupRealtimeListener() {
      supabase
        .from('draft')
        .on('UPDATE', payload => {
          this.draftData = payload.new;
        })
        .subscribe();

      const { data, error } = await supabase
        .from('draft')
        .select('*')
        .single();

      if (data) {
        this.draftData = data;
      }
    },
    adjustInputWidth(input) {
      input.style.width = `${input.value.length + 1}ch`;
    },
    selectTeam(team) {
      this.draftData.selectedTeam = team;
      this.updateDraftData();
    },
    updateTeamName(team) {
      if (team === 'A') {
        this.draftData.teamAName = event.target.value;
      } else {
        this.draftData.teamBName = event.target.value;
      }
      this.updateDraftData();
    },
    resetDraft() {
      this.draftData = {
        teamAName: 'Team A',
        teamBName: 'Team B',
        teamAPicks: [],
        teamABans: [],
        teamBPicks: [],
        teamBBans: [],
        currentStep: 0,
        draftCompleted: false,
        selectedTeam: '',
        mapInput: '',
        mapImage: ''
      };
      this.updateDraftData();
      this.nextStep();
    },
    nextStep() {
      if (this.draftData.currentStep >= this.draftOrder.length) {
        this.draftData.draftCompleted = true;
        this.generateFinalDraft();
        return;
      }
      this.updateDraftData();
    },
    confirmSelection(selectedClass) {
      if (this.draftData.draftCompleted || this.draftData.selectedTeam !== this.draftOrder[this.draftData.currentStep].team) return;
      const { team, action } = this.draftOrder[this.draftData.currentStep];
      if (action === 'ban') {
        if (team === 'A') {
          this.draftData.teamABans.push(selectedClass);
        } else {
          this.draftData.teamBBans.push(selectedClass);
        }
      } else {
        if (team === 'A') {
          this.draftData.teamAPicks.push(selectedClass);
        } else {
          this.draftData.teamBPicks.push(selectedClass);
        }
      }
      this.availableClasses = this.availableClasses.filter(cls => cls !== selectedClass);
      this.draftData.currentStep++;
      if (this.draftData.currentStep < this.draftOrder.length) {
        this.nextStep();
      } else {
        this.generateFinalDraft();
      }
      this.updateDraftData();
    },
    generateFinalDraft() {
      this.draftData.draftCompleted = true;
      this.updateDraftData();
    },
    updateMapImage() {
      this.draftData.mapImage = this.draftData.mapInput ? `maps/${this.draftData.mapInput}.png` : '';
      this.updateDraftData();
    },
    generateRandomDraft() {
      this.resetDraft();
      const randomClasses = [...this.classes];
      this.draftOrder.forEach(({ team, action }) => {
        const randomIndex = Math.floor(Math.random() * randomClasses.length);
        const randomClass = randomClasses.splice(randomIndex, 1)[0];
        if (action === 'ban') {
          if (team === 'A') {
            this.draftData.teamABans.push(randomClass);
          } else {
            this.draftData.teamBBans.push(randomClass);
          }
        } else {
          if (team === 'A') {
            this.draftData.teamAPicks.push(randomClass);
          } else {
            this.draftData.teamBPicks.push(randomClass);
          }
        }
      });
      this.draftData.mapInput = `A${Math.floor(Math.random() * 50) + 1}`;
      this.updateMapImage();
      this.generateFinalDraft();
    },
    getPickImage(className) {
      return `img/${className}.png`;
    },
    getResultImage(className) {
      return `classes/${className}.png`;
    },
    updateDraftData() {
      supabase
        .from('draft')
        .update(this.draftData)
        .eq('id', 1);
    }
  }
};
</script>

<style scoped>
body, html {
  font-family: 'Inter', Arial, sans-serif;
  background-color: #121212;
  color: #ffffff;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.container {
  width: 100%;
  height: 100%;
  max-width: 1200px;
  background-color: #1e1e1e;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #ffffff;
}
.draft {
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
}
.team {
  width: 45%;
  text-align: center;
}
.team button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  color: #ffffff;
  background-color: #333333;
  border: 2px solid #ffffff;
  border-radius: 5px;
}
.picks-section, .bans-section {
  margin-top: 10px;
}
.section-title {
  color: #ffffff; /* Mots en blanc */
}
.picks img {
  width: 70px;
  height: 70px;
  margin: 5px;
  border: 2px solid #ffffff;
  border-radius: 5px;
}
.bans img {
  width: 50px;
  height: 50px;
  margin: 5px;
  border: 2px solid #ffffff;
  border-radius: 5px;
}
.map-section {
  margin-top: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.map-section img {
  width: 100%;
  max-width: 600px;
  border: 2px solid #ffffff;
  border-radius: 10px;
  margin-top: 10px;
  object-fit: cover;
}
.controls {
  margin-top: 20px;
  text-align: center;
}
.controls button {
  margin: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  color: #ffffff;
  background-color: #333333;
  border: 2px solid #ffffff;
  border-radius: 5px;
}
.selection {
  margin-top: 20px;
  text-align: center;
}
.class-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.class-grid img {
  width: 50px;
  height: 50px;
  margin: 5px;
  border: 2px solid #ffffff;
  border-radius: 5px;
  cursor: pointer;
}
.class-grid img.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
input[type="text"] {
  font-size: 24px;
  text-align: center;
  border: 2px solid #ffffff;
  background: none;
  color: #ffffff;
  width: auto;
  min-width: 100px;
  max-width: 100%;
  padding: 5px;
}
.ban-text {
  color: red;
  font-weight: bold;
}
.pick-text {
  color: green;
  font-weight: bold;
}
.results-section {
  margin-top: 40px;
  background-color: #2e2e2e;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  color: #ffffff;
  text-align: center;
}
.results-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.team-result {
  width: 45%;
}
.team-result .picks {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.team-result .picks img {
  width: 150px;
  height: 450px;
  margin: 5px;
  border: 2px solid #ffffff;
  border-radius: 5px;
}
.footer {
  background-color: #1e1e1e;
  padding: 10px;
  width: 100%;
  text-align: center;
  border-radius: 10px;
  margin-top: 20px;
  color: #ffffff;
  font-size: 14px;
}
.footer a {
  color: #ffffff;
  text-decoration: none;
  font-weight: bold;
}
</style>
