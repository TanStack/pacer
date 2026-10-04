<script lang="ts">
  import { createAsyncBatcher } from '@tanstack/svelte-pacer/async-batcher'
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
  let emailRequests = $state<Array<EmailValidationRequest>>([])

  let validationResults = $state<Array<EmailValidationResult>>([])

  let isValidating = $state(false)

  let batchesProcessed = $state(0)

  const batchedValidateEmail = createAsyncBatcher(
    async (requests: Array<EmailValidationRequest>) => {
      isValidating = true
      try {
        const results = await batchValidateEmails(requests)
        validationResults = [...validationResults, ...results]
        batchesProcessed = batchesProcessed + 1
        return results
      } finally {
        isValidating = false
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
    emailRequests = [...emailRequests, request]
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

<div>
  <h1>TanStack Pacer createAsyncBatcher Example 2</h1>
  <div style="margin-bottom: 20px">
    {#each sampleEmails as email, index (index)}<button
        onclick={() => validateEmail(email)}
        style="margin-right: 10px; margin-bottom: 5px"
      >
        Validate "{email}"
      </button>{/each}
  </div>
  {#if isValidating}<p style="color: blue">Validating email batch...</p>{/if}
  <table>
    <tbody
      ><tr
        ><td>Total Validations Requested:</td><td>{emailRequests.length}</td
        ></tr
      ><tr
        ><td>Validations Completed:</td><td>{validationResults.length}</td></tr
      ><tr><td>Batches Processed:</td><td>{batchesProcessed}</td></tr></tbody
    >
  </table>
  <div style="margin-top: 20px">
    <h3>Validation Results:</h3>
    <div
      style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
    >
      {#if validationResults.length === 0}<p style="color: #666">
          No validations completed yet...
        </p>{:else}{#each validationResults as result, index (index)}<div
            style={`margin-bottom: 5px; font-size: 0.9em; color: ${result.isValid ? 'green' : 'red'}`}
          >
            <strong>{result.email}</strong>: {result.message}
          </div>{/each}{/if}
    </div>
  </div>
  <p style="font-size: 0.9em; color: #666">
    Email validations are batched - max 4 emails or 1.5 second wait time
  </p>
</div>
