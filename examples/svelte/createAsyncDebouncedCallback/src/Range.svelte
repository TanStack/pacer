<script lang="ts">
  import { createAsyncDebouncedCallback } from '@tanstack/svelte-pacer/async-debouncer'
  let email = $state('')

  let validationResult = $state<{
    isValid: boolean
    message: string
  } | null>(null)

  let isValidating = $state(false)

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
      message: isValid
        ? 'Email is valid!'
        : 'Please enter a valid email address',
    }
  }

  const debouncedValidateEmail = createAsyncDebouncedCallback(
    async (emailAddress: string) => {
      if (!emailAddress.trim()) {
        validationResult = null
        return null
      }
      isValidating = true
      try {
        const result = await validateEmail(emailAddress)
        validationResult = result
        return result
      } finally {
        isValidating = false
      }
    },
    () => ({
      wait: 750,
      leading: false,
    }),
  )

  function handleEmailChange(e: Event) {
    const newEmail = (e.target as HTMLInputElement).value
    email = newEmail
    debouncedValidateEmail(newEmail)
  }
</script>

<div>
  <h1>TanStack Pacer createAsyncDebouncedCallback Example 3</h1>
  <div style="margin-bottom: 20px">
    <label
      >Email Address:<input
        type="email"
        value={email}
        oninput={handleEmailChange}
        placeholder="Enter your email..."
        style={`width: 100%; margin-top: 5px; padding: 8px; border-color: ${
          validationResult?.isValid === false
            ? 'red'
            : validationResult?.isValid === true
              ? 'green'
              : 'initial'
        }`}
      /></label
    >
  </div>
  {#if isValidating}<p style="color: blue">
      Validating email...
    </p>{/if}{#if validationResult}<p
      style={`color: ${validationResult.isValid ? 'green' : 'red'}; font-weight: bold`}
    >
      {validationResult.message}
    </p>{/if}
  <p style="font-size: 0.9em; color: #666">
    Email validation is debounced to 750ms after you stop typing
  </p>
</div>
