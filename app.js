const immutable = {
  secondsInMinute: 60,
  phases: {
    pomodoro: 'Pomodoro',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  },
  ticking: {
    noTicking: null,
    slowTicking: new Audio('slow-ticking.mp3'),
    fastTicking: new Audio('fast-ticking.mp3'),
    heartbeat: new Audio('heartbeat.mp3'),
    rainforest: new Audio('rainforest.mp3')
  },
  alarm: {
    noAlarm: null,
    bells: new Audio('front-desk-bells.mp3')
  }
}

const store = {
  mutable: {
    pomodoroSeconds: 25 * 60,
    shortBreakSeconds: 5 * 60,
    longBreakSeconds: 15 * 60,
    ticking: immutable.ticking.slowTicking,
    alarm: immutable.alarm.bells,
    pomodoros: 0,
    phase: immutable.phases.pomodoro,
    timerSeconds: 25 * 60,
    decrementer: null
  },
  mutatePomodoroMinutes: function(m) {
    this.mutable.pomodoroSeconds = m * immutable.secondsInMinute
  },
  mutateShortBreakMinutes: function(m) {
    this.mutable.shortBreakSeconds = m * immutable.secondsInMinute
  },
  mutateLongBreakMinutes: function(m) {
    this.mutable.longBreakSeconds = m * immutable.secondsInMinute
  },
  mutateTicking: function(s) {
    if (this.mutable.decrementer !== null) {
      this.stopTicking()
      this.mutable.ticking = immutable.ticking[s]
      this.startTicking()
    } else {
      this.mutable.ticking = immutable.ticking[s]
    }
  },
  mutateAlarm: function(s) {
    this.mutable.alarm = immutable.alarm[s]
  },
  startTicking: function() {
    if (this.mutable.ticking !== null) {
      this.mutable.ticking.addEventListener('ended', function() {
        this.currentTime = 0
        this.play()
      }, false);
      this.mutable.ticking.play()
    }
  },
  stopTicking: function() {
    if (this.mutable.ticking !== null) {
      this.mutable.ticking.removeEventListener('ended', function() {
        this.currentTime = 0
        this.play()
      }, false);
      this.mutable.ticking.pause()
    }
  },
  startDecrementer: function() {
    clearInterval(this.mutable.decrementer)
    this.mutable.decrementer = setInterval(function() {
      this.mutable.timerSeconds -= 1
    }.bind(this), 1000)
    this.startTicking()
  },
  stopDecrementer: function() {
    clearInterval(this.mutable.decrementer)
    this.mutable.decrementer = null
    this.stopTicking()
  },
  resetDecrementer: function() {
    this.stopDecrementer()
    this.resetSeconds()
  },
  resetSeconds: function() {
    if (this.mutable.phase === immutable.phases.pomodoro) this.mutable.timerSeconds = this.mutable.pomodoroSeconds
    else if (this.mutable.phase === immutable.phases.shortBreak) this.mutable.timerSeconds = this.mutable.shortBreakSeconds
    else if (this.mutable.phase === immutable.phases.longBreak) this.mutable.timerSeconds = this.mutable.longBreakSeconds
  },
  nextPhase: function() {
    if (this.mutable.alarm !== null) this.mutable.alarm.play()
    if (this.mutable.phase === immutable.phases.pomodoro) {
      this.mutable.pomodoros += 1
      if (this.mutable.pomodoros % 4 !== 0) {
        this.mutable.phase = immutable.phases.shortBreak
        this.mutable.seconds = this.mutable.shortBreakSeconds
      } else {
        this.mutable.phase = immutable.phases.longBreak
        this.mutable.seconds = this.mutable.longBreakSeconds
      }
    } else if (this.mutable.phase === immutable.phases.shortBreak || this.mutable.phase === immutable.phases.longBreak) {
      this.mutable.phase = immutable.phases.pomodoro
      this.mutable.seconds = this.mutable.pomodoroSeconds
    }
  }
}

const Timer = Vue.component('Timer', {
  template: `
  <div class="centered">
    <div class="header">Timer</div>
    <div class="subheader">{{shared.pomodoros}} Pomodoros</div>
    <div class="subheader">{{shared.phase}}</div>
    <div class="mammoth">{{time}}</div>
    <button v-if="shared.decrementer" @click="stop" class="button-primary wide-button">Stop</button>
    <button v-else @click="start" class="button-primary wide-button">Start</button>
    <button @click="reset" class="button-primary wide-button">Reset</button>
  </div>`,
  data: function() {
    return {
      shared: store.mutable
    }
  },
  computed: {
    time: function() {
      let minute = Math.floor(this.shared.timerSeconds / 60)
      let second = this.shared.timerSeconds % 60
      let m = minute > 9 ? minute : '0' + minute
      let s = second > 9 ? second : '0' + second
      return m + ':' + s
    }
  },
  watch: {
    'shared.timerSeconds': function(s) {
      if (s === 0) store.nextPhase()
    }
  },
  methods: {
    start: function() {
      store.startDecrementer()
    },
    stop: function() {
      store.stopDecrementer()
    },
    reset: function() {
      store.resetDecrementer()
    }
  }
})

const Tasks = Vue.component('Tasks', {
  template: `
  <div class="centered">
    <div class="header">Tasks</div>
    <div class="progress-label">{{progress}}%</div>
    <div class="progress-bar">
      <div :style="{width:progress + '%'}"></div>
    </div>
    <draggable v-model="tasks">
      <div v-for="(task, index) in tasks">
        <button @click="deleteTask(index)" class="remove-button"></button>
        <input type="checkbox" v-model="task.completed" :id="index"/>
        <label :for="index" class="check"/>
        <input type="number" v-model.number="task.points" min="1" oninput="validity.valid||(value=1)"/>
        <input type="text" v-model="task.name"/>
      </div>
    </draggable>
    <button @click="addTask(addName, addPoints)" class="add-button"></button>
    <div class="label">Points</span>
    <input type="number" value="1" v-model.number="addPoints" min="1" oninput="validity.valid||(value=1)"/>
    <div class="label">Name</span>
    <input type="text" v-model="addName"/>
  </div>`,
  data: function() {
    return {
      tasks: [],
      addName: '',
      addPoints: 1
    }
  },
  computed: {
    revampedTasks: function() {
      return this.tasks.map(function(v) {
        return {
          name: v.name,
          points: v.points === "" ? 0 : v.points,
          completed: v.completed
        }
      })
    },
    completedTasks: function() {
      return this.revampedTasks.filter(function(v) {
        return v.completed === true
      })
    },
    totalPointsArray: function() {
      return this.revampedTasks.map(function(v) {
        return v.points
      })
    },
    completedPointsArray: function() {
      return this.completedTasks.map(function(v) {
        return v.points
      })
    },
    totalPoints: function() {
      return this.totalPointsArray.reduce(function(a,v) {
        return a + v
      }, 0)
    },
    completedPoints: function() {
      return this.completedPointsArray.reduce(function(a,v) {
        return a + v
      }, 0)
    },
    progress: function() {
      if (this.totalPoints === 0) return 0
      return Math.floor(this.completedPoints / this.totalPoints * 100)
    }
  },
  methods: {
    addTask: function(name, points) {
      this.tasks.push({
        name: name,
        points: points === '' ? 1 : points,
        completed: false
      })
      this.addName = ''
      this.addPoints = 1
    },
    deleteTask: function(i) {
      this.tasks.splice(i, 1)
    }
  }
})

const Settings = Vue.component('Settings', {
  template: `
  <div class="centered">
    <div class="header">Settings</div>
    <div class="bottom-pad">
      <div class="subheader">Pomodoro Minutes</div>
      <input type="radio" id="pomodoroMinutes5" name="pomodoroMinutes" value="5" v-model.number="pomodoroMinutes">
      <label for="pomodoroMinutes5" class="radio"/>
      <div class="radio-label">5</div>
      <input type="radio" id="pomodoroMinutes10" name="pomodoroMinutes" value="10" v-model.number="pomodoroMinutes">
      <label for="pomodoroMinutes10" class="radio"/>
      <div class="radio-label">10</div>
      <input type="radio" id="pomodoroMinutes15" name="pomodoroMinutes" value="15" v-model.number="pomodoroMinutes">
      <label for="pomodoroMinutes15" class="radio"/>
      <div class="radio-label">15</div>
      <input type="radio" id="pomodoroMinutes20" name="pomodoroMinutes" value="20" v-model.number="pomodoroMinutes">
      <label for="pomodoroMinutes20" class="radio"/>
      <div class="radio-label">20</div>
      <input type="radio" id="pomodoroMinutes25" name="pomodoroMinutes" value="25" v-model.number="pomodoroMinutes">
      <label for="pomodoroMinutes25" class="radio"/>
      <div class="radio-label">25</div>
      <input type="radio" id="pomodoroMinutes30" name="pomodoroMinutes" value="30" v-model.number="pomodoroMinutes">
      <label for="pomodoroMinutes30" class="radio"/>
      <div class="radio-label">30</div>
      <input type="radio" id="pomodoroMinutes40" name="pomodoroMinutes" value="40" v-model.number="pomodoroMinutes">
      <label for="pomodoroMinutes40" class="radio"/>
      <div class="radio-label">40</div>
      <input type="radio" id="pomodoroMinutes50" name="pomodoroMinutes" value="50" v-model.number="pomodoroMinutes">
      <label for="pomodoroMinutes50" class="radio"/>
      <div class="radio-label">50</div>
      <input type="radio" id="pomodoroMinutes60" name="pomodoroMinutes" value="60" v-model.number="pomodoroMinutes">
      <label for="pomodoroMinutes60" class="radio"/>
      <div class="radio-label">60</div>
    </div>
    <div class="bottom-pad">
      <div class="subheader">Short Break Minutes</div>
      <input type="radio" id="shortBreakMinutes5" name="shortBreakMinutes" value="5" v-model.number="shortBreakMinutes">
      <label for="shortBreakMinutes5" class="radio"/>
      <div class="radio-label">5</div>
      <input type="radio" id="shortBreakMinutes10" name="shortBreakMinutes" value="10" v-model.number="shortBreakMinutes">
      <label for="shortBreakMinutes10" class="radio"/>
      <div class="radio-label">10</div>
      <input type="radio" id="shortBreakMinutes15" name="shortBreakMinutes" value="15" v-model.number="shortBreakMinutes">
      <label for="shortBreakMinutes15" class="radio"/>
      <div class="radio-label">15</div>
      <input type="radio" id="shortBreakMinutes20" name="shortBreakMinutes" value="20" v-model.number="shortBreakMinutes">
      <label for="shortBreakMinutes20" class="radio"/>
      <div class="radio-label">20</div>
      <input type="radio" id="shortBreakMinutes25" name="shortBreakMinutes" value="25" v-model.number="shortBreakMinutes">
      <label for="shortBreakMinutes25" class="radio"/>
      <div class="radio-label">25</div>
      <input type="radio" id="shortBreakMinutes30" name="shortBreakMinutes" value="30" v-model.number="shortBreakMinutes">
      <label for="shortBreakMinutes30" class="radio"/>
      <div class="radio-label">30</div>
    </div>
    <div class="bottom-pad">
      <div class="subheader">Long Break Minutes</div>
      <input type="radio" id="longBreakMinutes15" name="longBreakMinutes" value="15" v-model.number="longBreakMinutes">
      <label for="longBreakMinutes15" class="radio"/>
      <div class="radio-label">15</div>
      <input type="radio" id="longBreakMinutes30" name="longBreakMinutes" value="30" v-model.number="longBreakMinutes">
      <label for="longBreakMinutes30" class="radio"/>
      <div class="radio-label">30</div>
      <input type="radio" id="longBreakMinutes45" name="longBreakMinutes" value="45" v-model.number="longBreakMinutes">
      <label for="longBreakMinutes45" class="radio"/>
      <div class="radio-label">45</div>
      <input type="radio" id="longBreakMinutes60" name="longBreakMinutes" value="60" v-model.number="longBreakMinutes">
      <label for="longBreakMinutes60" class="radio"/>
      <div class="radio-label">60</div>
      <input type="radio" id="longBreakMinutes90" name="longBreakMinutes" value="90" v-model.number="longBreakMinutes">
      <label for="longBreakMinutes90" class="radio"/>
      <div class="radio-label">90</div>
      <input type="radio" id="longBreakMinutes120" name="longBreakMinutes" value="120" v-model.number="longBreakMinutes">
      <label for="longBreakMinutes120" class="radio"/>
      <div class="radio-label">120</div>
    </div>
    <div class="bottom-pad">
      <div class="subheader">Ticking</div>
      <input type="radio" id="noTicking" name="ticking" value="noTicking" v-model="ticking">
      <label for="noTicking" class="radio"/>
      <div class="radio-label">No Ticking</div>
      <input type="radio" id="slowTicking" name="ticking" value="slowTicking" v-model="ticking">
      <label for="slowTicking" class="radio"/>
      <div class="radio-label">Slow Ticking</div>
      <input type="radio" id="fastTicking" name="ticking" value="fastTicking" v-model="ticking">
      <label for="fastTicking" class="radio"/>
      <div class="radio-label">Fast Ticking</div>
      <input type="radio" id="heartbeat" name="ticking" value="heartbeat" v-model="ticking">
      <label for="heartbeat" class="radio"/>
      <div class="radio-label">Heartbeat</div>
      <input type="radio" id="rainforest" name="ticking" value="rainforest" v-model="ticking">
      <label for="rainforest" class="radio"/>
      <div class="radio-label">Rainforest</div>
    </div>
    <div class="bottom-pad">
      <div class="subheader">Alarm</div>
      <input type="radio" id="noAlarm" name="alarm" value="noAlarm" v-model="alarm">
      <label for="noAlarm" class="radio"/>
      <div class="radio-label">No Alarm</div>
      <input type="radio" id="bells" name="alarm" value="bells" v-model="alarm">
      <label for="bells" class="radio"/>
      <div class="radio-label">Bells</div>
    </div>
  </div>`,
  data: function() {
    return {
      pomodoroMinutes: null,
      shortBreakMinutes: null,
      longBreakMinutes: null,
      ticking: null,
      alarm: null
    }
  },
  watch: {
    pomodoroMinutes: function(m) {
      store.mutatePomodoroMinutes(m)
    },
    shortBreakMinutes: function(m) {
      store.mutateLongBreakMinutes(m)
    },
    longBreakMinutes: function(m) {
      store.mutateShortBreakMinutes(m)
    },
    ticking: function(s) {
      store.mutateTicking(s)
    },
    alarm: function(s) {
      store.mutateAlarm(s)
    }
  },
  created: function() {
    this.pomodoroMinutes = store.mutable.pomodoroSeconds / immutable.secondsInMinute
    this.shortBreakMinutes = store.mutable.shortBreakSeconds / immutable.secondsInMinute
    this.longBreakMinutes = store.mutable.longBreakSeconds / immutable.secondsInMinute
    this.ticking = 'slowTicking'
    this.alarm = 'bells'
  }
})

const About = Vue.component('About', {
  template: `
  <div class="centered">
    <div class="header">About</div>
    <div class="subheader">Overview</div>
    <p>This is a productivity web app which hosts a pomodoro timer, a tasks page with a progress bar, and a settings page.</p>
    <div class="subheader">Pomodoro Technique</div>
    <p>The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. The technique uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks. These intervals are named pomodoros, the plural in English of the Italian word pomodoro (tomato), after the tomato-shaped kitchen timer that Cirillo used as a university student.</p>
    <div class="subheader">Timer</div>
    <p>The timer adheres to the Pomdoro Technique. Whenever the timer hits 0 seconds, it plays a sound notification and moves onto its next phase automatically. The phases are as follows - after every pomodoro there is either a short break or, if you hit your fourth consecutive pomodoro, a long break. After every break, there is a pomodoro. The timer holds the number of pomodoros completed and the current state. You may start, stop, and reset the timer.</p>
    <div class="subheader">Tasks</div>
    <p>The tasks page allows you to create tasks with specified points. You may create, remove, edit, and move tasks by dragging them. A point is a discretionary unit of measure that allows you to estimate the effort of a task relative to other tasks on your list. With this information you may mark tasks as completed and the progress bar will gauge your estimated completion for the session.</p>
    <div class="subheader">Settings</div>
    <p>The settings page allows you to customize the minutes of a pomodoro, short break, or long break.</p>
    <div class="subheader">Session</div>
    <p>Unfortunately, the web app does not support persistent storage. If you refresh the web application, your saved tasks and settings will be lost.</p>
    <div class="subheader">Author</div>
    <p>This web app was created by Javon Negahban.</p>
  </div>`
})

const routes = [
  { path: '/', component: Timer },
  { path: '/tasks', component: Tasks },
  { path: '/settings', component: Settings },
  { path: '/about', component: About }
]

const router = new VueRouter({
  routes: routes
})

const app = new Vue({
  router: router
}).$mount('#app')
