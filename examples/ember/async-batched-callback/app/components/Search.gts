import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncBatcher } from '@tanstack/ember-pacer'
import { htmlSafe } from '@ember/template'
interface EmailValidationRequest {
  email: string
  timestamp: Date
}
interface EmailValidationResult {
  email: string
  isValid: boolean
  message: string
}
type Execute = Search['execute']
type Utility = (item: Parameters<Execute>[0][number]) => unknown
const eq = (a: unknown, b: unknown) => a === b
export default class Search extends Component {
  batchValidateEmails = async (
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
  @tracked emailRequests: Array<EmailValidationRequest> = []
  @tracked validationResults: Array<EmailValidationResult> = []
  @tracked isValidating = false
  @tracked batchesProcessed = 0
  validateEmail = (utility: Utility, email: string) => {
    if (!email.trim()) return
    const request: EmailValidationRequest = {
      email,
      timestamp: new Date(),
    }
    this.emailRequests = [...this.emailRequests, request]
    utility(request)
  }
  sampleEmails = [
    'user@example.com',
    'invalid-email',
    'test@domain.org',
    'bad@email',
    'good@test.com',
  ]
  execute = async (requests: Array<EmailValidationRequest>) => {
    this.isValidating = true
    try {
      const results = await this.batchValidateEmails(requests)
      this.validationResults = [...this.validationResults, ...results]
      this.batchesProcessed = this.batchesProcessed + 1
      return results
    } finally {
      this.isValidating = false
    }
  }
  validationStyle = (result: EmailValidationResult) => {
    const styles = {
      marginBottom: '5px',
      fontSize: '0.9em',
      color: result.isValid ? 'green' : 'red',
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  <template>
    {{#let
      (useAsyncBatcher this.execute maxSize=4 wait=1500)
      as |batchedValidateEmail|
    }}<div><h1>TanStack Pacer useAsyncBatcher Example 2</h1><div
          style='margin-bottom: 20px'
        >{{#each this.sampleEmails as |email index|}}<button
              {{on
                'click'
                (fn this.validateEmail batchedValidateEmail.addItem email)
              }}
              style='margin-right: 10px; margin-bottom: 5px'
            > Validate "{{email}}" </button>{{/each}}</div>{{#if
          this.isValidating
        }}<p style='color: blue'>Validating email batch...</p>{{/if}}<table
        ><tbody><tr><td>Total Validations Requested:</td><td
              >{{this.emailRequests.length}}</td></tr><tr><td>Validations
                Completed:</td><td
              >{{this.validationResults.length}}</td></tr><tr><td>Batches
                Processed:</td><td
              >{{this.batchesProcessed}}</td></tr></tbody></table><div
          style='margin-top: 20px'
        ><h3>Validation Results:</h3><div
            style='max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
          >{{#if (eq this.validationResults.length 0)}}<p style='color: #666'>
                No validations completed yet...
              </p>{{else}}{{#each this.validationResults as |result index|}}<div
                  style={{this.validationStyle result}}
                ><strong>{{result.email}}</strong>:
                  {{result.message}}</div>{{/each}}{{/if}}</div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Email validations are batched - max 4 emails or 1.5 second wait time
        </p></div>{{/let}}
  </template>
}
