Vue.component('Pomodoro', {
  template: `
  <div>
    <h1>Pomodoro</h1>
    <h2>{{pomodoros}} Pomodoros</h2>
    <h2>{{stateStr}}</h2>
    <h2>{{time}}</h2>
    <button v-if="running" @click="stop">Stop</button>
    <button v-else @click="start">Start</button>
    <button @click="reset">Reset</button>
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
  }
});

Vue.component('Tasks', {
  template: `
  <div>
    <h1>Tasks</h1>
    <div>{{progress}}%</div>
    Name <input type="text" v-model="addName"/>
    Points <input type="number" value="1" v-model.number="addPoints" min=1 oninput="validity.valid||(value=1)"/>
    <button @click="addTask(addName, addPoints)">Add</button>
    <div v-for="(task, index) in tasks">
      <input type="checkbox" v-model="task.completed"/>
      <input type="number" v-model.number="task.points" min=1 oninput="validity.valid||(value=1)"/>
      <input type="text" v-model="task.name"/>
      <button @click="deleteTask(index)">Delete</button>
    </div>
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

Vue.component('Settings', {
  template: `
  <div>
    <h1>Settings</h1>
    <div>
      Pomodoro Minutes
      <input type="text"/>
    </div>
    <div>
      Short Break Minutes
      <input type="text"/>
    </div>
    <div>
      Long Break Minutes
      <input type="text"/>
    </div>
  </div>`
})

Vue.component('About', {
  template: `
  <div>
    <h1>About</h1>
    <p>This is a productivity web app which hosts a pomodoro timer, a tasks page with a progress bar, and a settings page.</p>
    <p>The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. The technique uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks. These intervals are named pomodoros, the plural in English of the Italian word pomodoro (tomato), after the tomato-shaped kitchen timer that Cirillo used as a university student.</p>
    <p>The pomodoro timer allows you to start, stop, and reset. Whenever the timer hits 0, it rings and moves onto its next phase automatically. After every pomodoro there is either a short break or, if you hit your fourth consecutive pomodoro, a long break.</p>
    <p>The tasks page allows you to create tasks with specified points. A point is merely a unit of measure that allows you to estimate the relative effort of a task to other tasks on your list. As you mark tasks as completed, the progress bar will show your estimated completion for the session.</p>
    <p>The settings page allows you to customize the minutes of a pomodoro, short break, or long break.</p>
    <p>Note that currently there is no way to save a session. If you refresh the web application, your saved tasks and settings will be lost.</p>
  </div>`
})

new Vue({
  el: '#Mount',
  template: `<div>
    <Pomodoro/>
    <Tasks/>
    <Settings/>
    <About/>
  </div>`
});
