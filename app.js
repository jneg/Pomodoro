const ee = new EventEmitter()
const frontDeskBells = new Audio('front-desk-bells.mp3')

const Timer = Vue.component('Timer', {
  template: `
  <div class="centered">
      <h1>Timer</h1>
      <h4>{{pomodoros}} Pomodoros</h4>
      <h4>{{stateStr}}</h4>
      <h1 class="timer">{{time}}</h1>
      <button v-if="running" @click="stop" class="button-primary wide-button">Stop</button>
      <button v-else @click="start" class="button-primary wide-button">Start</button>
      <button @click="reset" class="button-primary wide-button">Reset</button>
  </div>`,
  data: function() {
    return {
      pomodoroMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      interval: null,
      running: false,
      pomodoros: 0,
      state: 0,
      seconds: 0
    }
  },
  computed: {
    states: function() {
      return {
        pomodoro: 0,
        shortBreak: 1,
        longBreak: 2
      }
    },
    secondsInMinute: function() {
      return 60
    },
    pomodoroSeconds: function() {
      return this.pomodoroMinutes * this.secondsInMinute
    },
    shortBreakSeconds: function() {
      return this.shortBreakMinutes * this.secondsInMinute
    },
    longBreakSeconds: function() {
      return this.longBreakMinutes * this.secondsInMinute
    },
    stateStr: function() {
      if (this.state === this.states.pomodoro) return 'Pomodoro'
      if (this.state === this.states.shortBreak) return 'Short Break'
      if (this.state === this.states.longBreak) return 'Long Break'
    },
    time: function() {
      let minute = Math.floor(this.seconds / 60)
      let second = this.seconds % 60
      let m = minute > 9 ? minute : '0' + minute
      let s = second > 9 ? second : '0' + second
      return m + ':' + s
    }
  },
  watch: {
    seconds: function(s) {
      if (s === 0) {
        frontDeskBells.play();
        if (this.state === this.states.pomodoro) {
          this.pomodoros += 1
          if (this.pomodoros % 4 === 0) {
            this.state = this.states.longBreak
            this.seconds = this.longBreakSeconds
          } else {
            this.state = this.states.shortBreak
            this.seconds = this.shortBreakSeconds
          }
        } else if (this.state === this.states.shortBreak) {
          this.state = this.states.pomodoro
          this.seconds = this.pomodoroSeconds
        } else if (this.state === this.states.longBreak) {
          this.state = this.states.pomodoro
          this.seconds = this.pomodoroSeconds
        }
      }
    }
  },
  methods: {
    start: function() {
      this.running = true
      clearInterval(this.interval)
      this.interval = setInterval(function() {
        this.seconds -= 1
      }.bind(this), 1000)
    },
    stop: function() {
      this.running = false
      clearInterval(this.interval)
    },
    reset: function() {
      this.stop()
      if (this.state === this.states.pomodoro) this.seconds = this.pomodoroSeconds
      else if (this.state === this.states.shortBreak) this.seconds = this.shortBreakSeconds
      else if (this.state === this.states.longBreak) this.seconds = this.longBreakSeconds
    }
  },
  created: function() {
    this.state = this.states.pomodoro
    this.seconds = this.pomodoroSeconds
    ee.on('modifyPomodoroMinutes', function(m) {
      this.pomodoroMinutes = m
    }.bind(this))
    ee.on('modifyShortBreakMinutes', function(m) {
      this.shortBreakMinutes = m
    }.bind(this))
    ee.on('modifyLongBreakMinutes', function(m) {
      this.longBreakMinutes = m
    }.bind(this))
  }
})

const Tasks = Vue.component('Tasks', {
  template: `
  <div class="centered">
    <h1>Tasks</h1>
    <div>{{progress}}%</div>
    <draggable v-model="tasks">
      <div v-for="(task, index) in tasks">
        <input type="checkbox" v-model="task.completed"/>
        <input type="number" v-model.number="task.points" min="1" oninput="validity.valid||(value=1)"/>
        <input type="text" v-model="task.name"/>
        <button @click="deleteTask(index)" class="button-primary tight-button">Remove</button>
      </div>
    </draggable>
    Points <input type="number" value="1" v-model.number="addPoints" min="1" oninput="validity.valid||(value=1)"/>
    Name <input type="text" v-model="addName"/>
    <button @click="addTask(addName, addPoints)" class="button-primary tight-button">Add</button>
  </div>`,
  data: function() {
    return {
      tasks: [],
      addName: '',
      addPoints: 1
    }
  },
  computed: {
    completedTasks: function() {
      return this.tasks.filter(function(v) {
        return v.completed === true
      })
    },
    totalPointsArray: function() {
      return this.tasks.map(function(v) {
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
    validatePoints: function(e) {
      console.log(e)
      return false
    },
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
    <h1>Settings</h1>
    <div>
      <label>Pomodoro Minutes</label>
      <input type="number" v-model.number="pomodoroMinutes" min="1" oninput="validity.valid||(value=1)"/>
    </div>
    <div>
      <label>Short Break Minutes</label>
      <input type="number" v-model.number="shortBreakMinutes" min="1" oninput="validity.valid||(value=1)"/>
    </div>
    <div>
      <label>Long Break Minutes</label>
      <input type="number" v-model.number="longBreakMinutes" min="1" oninput="validity.valid||(value=1)"/>
    </div>
  </div>`,
  data: function() {
    return {
      pomodoroMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15
    }
  },
  watch: {
    pomodoroMinutes: function(m) {
      ee.emit('modifyPomodoroMinutes', m)
    },
    shortBreakMinutes: function(m) {
      ee.emit('modifyShortBreakMinutes', m)
    },
    longBreakMinutes: function(m) {
      ee.emit('modifyLongBreakMinutes', m)
    }
  }
})

const About = Vue.component('About', {
  template: `
  <div class="centered">
    <h1>About</h1>
    <h4>Overview</h4>
    <p>This is a productivity web app which hosts a pomodoro timer, a tasks page with a progress bar, and a settings page.</p>
    <h4>Pomodoro Technique</h4>
    <p>The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. The technique uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks. These intervals are named pomodoros, the plural in English of the Italian word pomodoro (tomato), after the tomato-shaped kitchen timer that Cirillo used as a university student.</p>
    <h4>Timer</h4>
    <p>The timer adheres to the Pomdoro Technique. Whenever the timer hits 0 seconds, it plays a sound notification and moves onto its next phase automatically. The phases are as follows - after every pomodoro there is either a short break or, if you hit your fourth consecutive pomodoro, a long break. After every break, there is a pomodoro. You may start, stop, and reset the timer.</p>
    <h4>Tasks</h4>
    <p>The tasks page allows you to create tasks with specified points. A point is a discretionary unit of measure that allows you to estimate the effort of a task relative to other tasks on your list. With this information you may mark tasks as completed and the progress bar will gauge your estimated completion for the session.</p>
    <h4>Settings</h4>
    <p>The settings page allows you to customize the minutes of a pomodoro, short break, or long break.</p>
    <h4>Session</h4>
    <p>Unfortunately, the web app does not support persistent storage. If you refresh the web application, your saved tasks and settings will be lost.</p>
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
