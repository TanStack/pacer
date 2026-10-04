<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncBatcher } from '@tanstack/vue-pacer/async-batcher'
interface EmailValidationRequest {
  email: string
  timestamp: Date
}
interface EmailValidationResult {
  email: string
  isValid: boolean
  message: string
}
// Simulate batched email validation API
const batchValidateEmails = async (
  requests: Array<EmailValidationRequest>,
): Promise<Array<EmailValidationResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return requests.map((request) => ({
    email: request.email,
    isValid: emailRegex.test(request.email),
    message: emailRegex.test(request.email)
      ? 'Email is valid!'
      : 'Invalid email format',
  }))
}
const emailRequests = ref<Array<EmailValidationRequest>>([])

const validationResults = ref<Array<EmailValidationResult>>([])

const isValidating = ref(false)

const batchesProcessed = ref(0)

const batchedValidateEmail = useAsyncBatcher(
  async (requests: Array<EmailValidationRequest>) => {
    isValidating.value = true
    try {
      const results = await batchValidateEmails(requests)
      validationResults.value = [...validationResults.value, ...results]
      batchesProcessed.value = batchesProcessed.value + 1
      return results
    } finally {
      isValidating.value = false
    }
  },
  () => ({
    maxSize: 4, // Process when 4 emails collected
    wait: 1500, // Or after 1.5 seconds
  }),
).addItem

function validateEmail(email: string) {
  if (!email.trim()) return
  const request: EmailValidationRequest = {
    email,
    timestamp: new Date(),
  }
  emailRequests.value = [...emailRequests.value, request]
  batchedValidateEmail(request)
}

const sampleEmails = [
  'user@example.com',
  'invalid-email',
  'test@domain.org',
  'bad@email',
  'good@test.com',
]
</script>
<template>
  <div>
    <h1>TanStack Pacer useAsyncBatcher Example 2</h1>
    <div :style="{ marginBottom: '20px' }">
      <template v-for="(email, index) in sampleEmails" :key="index"
        ><button
          @click="() => validateEmail(email)"
          :style="{ marginRight: '10px', marginBottom: '5px' }"
        >
          Validate "{{ email }}"
        </button></template
      >
    </div>
    <template v-if="isValidating"
      ><p :style="{ color: 'blue' }">Validating email batch...</p></template
    >
    <table>
      <tbody>
        <tr>
          <td>Total Validations Requested:</td>
          <td>{{ emailRequests.length }}</td>
        </tr>
        <tr>
          <td>Validations Completed:</td>
          <td>{{ validationResults.length }}</td>
        </tr>
        <tr>
          <td>Batches Processed:</td>
          <td>{{ batchesProcessed }}</td>
        </tr>
      </tbody>
    </table>
    <div :style="{ marginTop: '20px' }">
      <h3>Validation Results:</h3>
      <div
        :style="{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
        }"
      >
        <template v-if="validationResults.length === 0"
          ><p :style="{ color: '#666' }">
            No validations completed yet...
          </p></template
        ><template v-else
          ><template v-for="(result, index) in validationResults" :key="index"
            ><div
              :style="{
                marginBottom: '5px',
                fontSize: '0.9em',
                color: result.isValid ? 'green' : 'red',
              }"
            >
              <strong>{{ result.email }}</strong
              >: {{ result.message }}
            </div></template
          ></template
        >
      </div>
    </div>
    <p :style="{ fontSize: '0.9em', color: '#666' }">
      Email validations are batched - max 4 emails or 1.5 second wait time
    </p>
  </div>
</template>
