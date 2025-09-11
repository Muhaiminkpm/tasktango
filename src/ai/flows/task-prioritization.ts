// src/ai/flows/task-prioritization.ts
'use server';

/**
 * @fileOverview A task prioritization AI agent.
 *
 * - prioritizeTask - A function that handles the task prioritization process.
 * - PrioritizeTaskInput - The input type for the prioritizeTask function.
 * - PrioritizeTaskOutput - The return type for the prioritizeTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTaskInputSchema = z.object({
  title: z.string().describe('The title of the task.'),
  description: z.string().describe('The description of the task.'),
  dueDate: z.string().describe('The due date of the task in ISO format.'),
});
export type PrioritizeTaskInput = z.infer<typeof PrioritizeTaskInputSchema>;

const PrioritizeTaskOutputSchema = z.object({
  priority: z
    .enum(['low', 'medium', 'high'])
    .describe('The priority of the task.'),
});
export type PrioritizeTaskOutput = z.infer<typeof PrioritizeTaskOutputSchema>;

export async function prioritizeTask(input: PrioritizeTaskInput): Promise<PrioritizeTaskOutput> {
  return prioritizeTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTaskPrompt',
  input: {schema: PrioritizeTaskInputSchema},
  output: {schema: PrioritizeTaskOutputSchema},
  prompt: `You are a task prioritization expert. Given the task title, description, and due date, determine the priority of the task. The priority should be one of: low, medium, or high.

Task Title: {{{title}}}
Task Description: {{{description}}}
Task Due Date: {{{dueDate}}}

Respond with only the priority.`,
});

const prioritizeTaskFlow = ai.defineFlow(
  {
    name: 'prioritizeTaskFlow',
    inputSchema: PrioritizeTaskInputSchema,
    outputSchema: PrioritizeTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
