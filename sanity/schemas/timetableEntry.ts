import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'timetableEntry',
  title: 'Timetable Entry',
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
      name: 'dayOfWeek',
      title: 'Day of Week',
      type: 'number',
      options: {
        list: [
          { title: 'Sunday', value: 0 },
          { title: 'Monday', value: 1 },
          { title: 'Tuesday', value: 2 },
          { title: 'Wednesday', value: 3 },
          { title: 'Thursday', value: 4 },
          { title: 'Friday', value: 5 },
          { title: 'Saturday', value: 6 },
        ],
      },
      validation: (Rule) => Rule.required().min(0).max(6),
    }),
    defineField({
      name: 'startTime',
      title: 'Start Time',
      type: 'string',
      validation: (Rule) => Rule.required().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        name: 'time format',
        invert: false,
      }),
    }),
    defineField({
      name: 'endTime',
      title: 'End Time',
      type: 'string',
      validation: (Rule) => Rule.required().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        name: 'time format',
        invert: false,
      }),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'string',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
