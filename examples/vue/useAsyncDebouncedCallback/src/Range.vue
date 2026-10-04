<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncDebouncedCallback } from '@tanstack/vue-pacer/async-debouncer'
const email = ref('')

const validationResult = ref<{
  isValid: boolean
  message: string
} | null>(null)

const isValidating = ref(false)

// Simulate email validation API
const validateEmail = async (
  emailAddress: string,
): Promise<{
  isValid: boolean
  message: string
}> => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(emailAddress)
  return {
    isValid,
    message: isValid ? 'Email is valid!' : 'Please enter a valid email address',
  }
}

const debouncedValidateEmail = useAsyncDebouncedCallback(
  async (emailAddress: string) => {
    if (!emailAddress.trim()) {
      validationResult.value = null
      return null
    }
    isValidating.value = true
    try {
      const result = await validateEmail(emailAddress)
      validationResult.value = result
      return result
    } finally {
      isValidating.value = false
    }
  },
  () => ({
    wait: 750,
    leading: false,
  }),
)

function handleEmailChange(e: Event) {
  const newEmail = (e.target as HTMLInputElement).value
  email.value = newEmail
  debouncedValidateEmail(newEmail)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useAsyncDebouncedCallback Example 3</h1>
    <div :style="{ marginBottom: '20px' }">
      <label
        >Email Address:<input
          type="email"
          :value="email"
          @input="handleEmailChange"
          placeholder="Enter your email..."
          :style="{
            width: '100%',
            marginTop: '5px',
            padding: '8px',
            borderColor:
              validationResult?.isValid === false
                ? 'red'
                : validationResult?.isValid === true
                  ? 'green'
                  : 'initial',
          }"
      /></label>
    </div>
    <template v-if="isValidating"
      ><p :style="{ color: 'blue' }">Validating email...</p></template
    ><template v-if="validationResult"
      ><p
        :style="{
          color: validationResult.isValid ? 'green' : 'red',
          fontWeight: 'bold',
        }"
      >
        {{ validationResult.message }}
      </p></template
    >
    <p :style="{ fontSize: '0.9em', color: '#666' }">
      Email validation is debounced to 750ms after you stop typing
    </p>
  </div>
</template>
