<script setup lang="ts">
import { ref } from 'vue'
import { useQueuer } from '@tanstack/vue-pacer/queuer'

interface Task {
  id: number
  name: string
}

const processedItems = ref<Array<Task>>([])
const taskCounter = ref(0)
const taskInput = ref('')

const queuer = useQueuer<Task>(
  (task) => {
    processedItems.value = [...processedItems.value, task]
  },
  {
    wait: 1000,
    maxSize: 5,
    started: false,
  },
)

function addTask() {
  const name = taskInput.value.trim() || `Task ${taskCounter.value + 1}`
  taskCounter.value++
  queuer.addItem({ id: taskCounter.value, name })
  taskInput.value = ''
}

function addMultipleTasks() {
  for (let i = 0; i < 3; i++) {
    taskCounter.value++
    queuer.addItem({
      id: taskCounter.value,
      name: `Batch Task ${taskCounter.value}`,
    })
  }
}

function clearProcessed() {
  processedItems.value = []
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useQueuer Example</h1>

    <div style="margin-bottom: 20px">
      <input
        v-model="taskInput"
        type="text"
        placeholder="Task name (optional)"
        @keyup.enter="addTask"
        style="margin-right: 10px; padding: 5px"
      />
      <button @click="addTask">Add Task</button>
      <button @click="addMultipleTasks" style="margin-left: 10px">
        Add 3 Tasks
      </button>
    </div>

    <div style="margin-bottom: 20px">
      <queuer.Subscribe
        :selector="(state) => state.isRunning"
        v-slot="isRunning"
      >
        <button @click="queuer.start" :disabled="isRunning">Start</button>
        <button
          @click="queuer.stop"
          :disabled="!isRunning"
          style="margin-left: 10px"
        >
          Stop
        </button>
      </queuer.Subscribe>
      <button @click="queuer.flush()" style="margin-left: 10px">
        Flush All
      </button>
      <button @click="queuer.clear()" style="margin-left: 10px">
        Clear Queue
      </button>
      <button @click="clearProcessed" style="margin-left: 10px">
        Clear Processed
      </button>
    </div>

    <table>
      <tbody>
        <queuer.Subscribe
          :selector="
            (state) => ({
              size: state.size,
              isEmpty: state.isEmpty,
              isFull: state.isFull,
              isRunning: state.isRunning,
              status: state.status,
              executionCount: state.executionCount,
              rejectionCount: state.rejectionCount,
            })
          "
          v-slot="{
            size,
            isEmpty,
            isFull,
            isRunning,
            status,
            executionCount,
            rejectionCount,
          }"
        >
          <tr>
            <td>Status:</td>
            <td>{{ status }}</td>
          </tr>
          <tr>
            <td>Queue Size:</td>
            <td>{{ size }} / 5</td>
          </tr>
          <tr>
            <td>Is Empty:</td>
            <td>{{ isEmpty }}</td>
          </tr>
          <tr>
            <td>Is Full:</td>
            <td>{{ isFull }}</td>
          </tr>
          <tr>
            <td>Is Running:</td>
            <td>{{ isRunning }}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>{{ executionCount }}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{{ rejectionCount }}</td>
          </tr>
        </queuer.Subscribe>
      </tbody>
    </table>

    <div style="margin-top: 20px; display: flex; gap: 40px">
      <div>
        <h3>Queue Items (pending)</h3>
        <queuer.Subscribe :selector="(state) => state.items" v-slot="items">
          <ul v-if="items.length > 0">
            <li v-for="item in items" :key="item.id">
              #{{ item.id }}: {{ item.name }}
            </li>
          </ul>
          <p v-else style="color: #666">Queue is empty</p>
        </queuer.Subscribe>
      </div>

      <div>
        <h3>Processed Items</h3>
        <ul v-if="processedItems.length > 0">
          <li v-for="item in processedItems" :key="item.id">
            #{{ item.id }}: {{ item.name }}
          </li>
        </ul>
        <p v-else style="color: #666">No items processed yet</p>
      </div>
    </div>

    <queuer.Subscribe :selector="(state) => state" v-slot="state">
      <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
    </queuer.Subscribe>
  </div>
</template>
