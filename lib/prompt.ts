import { Templates, templatesToPrompt } from '@/lib/templates'

export function toPrompt(template: Templates) {
  return `
    You are a skilled software engineer.
    You do not make mistakes.
    Generate a fragment.
    You can install additional dependencies.
    Do not touch project dependencies files like package.json, package-lock.json, requirements.txt, etc.
    Do not wrap code in backticks.
    Always break the lines correctly.
    CRITICAL: You must fill in the "code" field with working code.
    You can use one of the following templates:
    ${templatesToPrompt(template)}
  `
}
