import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'quiz',
  title: 'Quiz',
  type: 'document',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subjectId',
      title: 'Subject',
      type: 'reference',
      to: [{ type: 'subject' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'noteIds',
      title: 'Notes Used',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'note' }] }],
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string', title: 'Question ID' },
            { name: 'question', type: 'text', title: 'Question' },
            {
              name: 'options',
              type: 'array',
              title: 'Options',
              of: [{ type: 'string' }],
              validation: (Rule) => Rule.length(4),
            },
            {
              name: 'correctAnswer',
              type: 'number',
              title: 'Correct Answer Index',
              validation: (Rule) => Rule.min(0).max(3),
            },
            { name: 'explanation', type: 'text', title: 'Explanation' },
            { name: 'userAnswer', type: 'number', title: 'User Answer' },
          ],
        },
      ],
    }),
    defineField({
      name: 'settings',
      title: 'Quiz Settings',
      type: 'object',
      fields: [
        { name: 'questionCount', type: 'number', title: 'Question Count' },
        { name: 'timeLimit', type: 'number', title: 'Time Limit (minutes)' },
        { name: 'showInstantFeedback', type: 'boolean', title: 'Show Instant Feedback' },
      ],
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime',
    }),
    defineField({
      name: 'score',
      title: 'Score (%)',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'timeTaken',
      title: 'Time Taken (seconds)',
      type: 'number',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
